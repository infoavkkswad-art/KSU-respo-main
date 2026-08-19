import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lock,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Leaf,
  PackageCheck,
  MapPin,
  CreditCard,
} from 'lucide-react';

import { SEO } from '@/components/SEO';

import {
  FormContainer,
  FormField,
  FormStatusMessage,
  useFormState,
  validators,
} from '@/components/Form';

import {
  formatPrice,
  useCart,
} from '@/context/CartContext';

import {
  useOrder,
  type CustomerInfo,
} from '@/context/OrderContext';

import { ProductService } from '@/services/product-service';

import { PACK_LABELS } from '@/data/products';

import { apiClient } from '@/services/api-client';


/* ==========================================================================
   KAWAD SWAD 2.0
   CHECKOUT

   FLOW:

   CART
     ↓
   DELIVERY DETAILS
     ↓
   ORDER REVIEW
     ↓
   SECURE RAZORPAY PAYMENT
     ↓
   PAYMENT VERIFICATION
     ↓
   ORDER SUCCESS

   IMPORTANT:

   Existing business/payment logic is preserved.

   ProductService:
   - product/SKU authority

   CartContext:
   - cart authority
   - subtotal
   - shipping
   - total

   API:
   - order creation
   - payment verification

   OrderContext:
   - completed-order handoff
   ========================================================================== */


/* ==========================================================================
   CUSTOMER FORM
   ========================================================================== */

const initialCustomer: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};


/* ==========================================================================
   INDIAN STATES / UNION TERRITORIES
   ========================================================================== */

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;


/* ==========================================================================
   RAZORPAY TYPES
   ========================================================================== */

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}


interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill: {
    name: string;
    email: string;
    contact: string;
  };

  theme: {
    color: string;
  };

  handler: (
    response: RazorpayPaymentResponse,
  ) => void | Promise<void>;

  modal: {
    ondismiss: () => void;
  };
}


interface RazorpayInstance {
  open: () => void;
}


interface RazorpayConstructor {
  new (
    options: RazorpayOptions,
  ): RazorpayInstance;
}


declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}


/* ==========================================================================
   RAZORPAY SCRIPT
   ========================================================================== */

const RAZORPAY_SCRIPT =
  'https://checkout.razorpay.com/v1/checkout.js';


function loadRazorpayScript(): Promise<boolean> {

  return new Promise(
    (resolve) => {

      if (window.Razorpay) {
        resolve(true);
        return;
      }


      const existingScript =
        document.querySelector(
          `script[src="${RAZORPAY_SCRIPT}"]`,
        );


      if (existingScript) {

        const handleLoad =
          () => {
            cleanup();
            resolve(true);
          };


        const handleError =
          () => {
            cleanup();
            resolve(false);
          };


        const cleanup =
          () => {

            existingScript.removeEventListener(
              'load',
              handleLoad,
            );

            existingScript.removeEventListener(
              'error',
              handleError,
            );
          };


        existingScript.addEventListener(
          'load',
          handleLoad,
        );

        existingScript.addEventListener(
          'error',
          handleError,
        );

        return;
      }


      const script =
        document.createElement(
          'script',
        );


      script.src =
        RAZORPAY_SCRIPT;

      script.async = true;


      script.onload =
        () => resolve(true);

      script.onerror =
        () => resolve(false);


      document.body.appendChild(
        script,
      );

    },
  );
}


/* ==========================================================================
   VALIDATION
   ========================================================================== */

function validateCustomer(
  customer: CustomerInfo,
): string[] {

  const errors: string[] = [];


  const fullName =
    customer.fullName.trim();

  const phone =
    customer.phone.trim();

  const email =
    customer.email.trim();

  const address =
    customer.address.trim();

  const city =
    customer.city.trim();

  const state =
    customer.state.trim();

  const pincode =
    customer.pincode.trim();


  if (!fullName) {

    errors.push(
      'Please enter your full name.',
    );

  } else if (
    fullName.length < 4
  ) {

    errors.push(
      'Full name must contain at least 4 characters.',
    );

  }


  if (!phone) {

    errors.push(
      'Please enter your mobile number.',
    );

  } else if (
    !/^[6-9]\d{9}$/.test(
      phone,
    )
  ) {

    errors.push(
      'Please enter a valid 10-digit Indian mobile number.',
    );

  }


  if (!email) {

    errors.push(
      'Please enter your email address.',
    );

  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      email,
    )
  ) {

    errors.push(
      'Please enter a valid email address.',
    );

  }


  if (!address) {

    errors.push(
      'Please enter your delivery address.',
    );

  } else if (
    address.length < 10
  ) {

    errors.push(
      'Delivery address must contain at least 10 characters.',
    );

  }


  if (!city) {

    errors.push(
      'Please enter your city.',
    );

  }


  if (!state) {

    errors.push(
      'Please select your state.',
    );

  }


  if (!pincode) {

    errors.push(
      'Please enter your PIN code.',
    );

  } else if (
    !/^[1-9][0-9]{5}$/.test(
      pincode,
    )
  ) {

    errors.push(
      'Please enter a valid 6-digit Indian PIN code.',
    );

  }


  return errors;
}


/* ==========================================================================
   IDEMPOTENCY
   ========================================================================== */

function createIdempotencyKey(): string {

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {

    return `ks-${crypto.randomUUID()}`;
  }


  return `ks-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}


/* ==========================================================================
   CHECKOUT TRUST ITEM
   ========================================================================== */

interface CheckoutTrustProps {
  icon: ReactNode;
  title: string;
  description: string;
}


function CheckoutTrust({
  icon,
  title,
  description,
}: CheckoutTrustProps) {

  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-xl
        border
        border-brand-green/10
        bg-brand-ivory
        px-3
        py-2.5
      "
    >

      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-brand-green/5
          text-brand-green
        "
        aria-hidden="true"
      >
        {icon}
      </span>


      <div className="min-w-0">

        <p
          className="
            text-[10px]
            font-bold
            leading-tight
            text-brand-green
            sm:text-xs
          "
        >
          {title}
        </p>


        <p
          className="
            mt-0.5
            truncate
            text-[9px]
            text-brand-brown/45
            sm:text-[10px]
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}


/* ==========================================================================
   SECTION HEADING
   ========================================================================== */

interface SectionHeadingProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}


function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {

  return (
    <div
      className="
        mb-5
        flex
        items-start
        gap-3
      "
    >

      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-brand-green/5
          text-brand-green
        "
        aria-hidden="true"
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-brand-saffron
          "
        >
          {eyebrow}
        </p>


        <h1
          className="
            mt-0.5
            font-serif
            text-2xl
            font-bold
            leading-tight
            text-brand-green
            sm:text-3xl
          "
        >
          {title}
        </h1>


        {description && (
          <p
            className="
              mt-1
              max-w-xl
              text-xs
              leading-relaxed
              text-brand-brown/50
              sm:text-sm
            "
          >
            {description}
          </p>
        )}

      </div>

    </div>
  );
}


/* ==========================================================================
   CHECKOUT PAGE
   ========================================================================== */

export default function Checkout() {

  const {
    items,
    subtotal,
    shippingTotal,
    total,
    clearCart,
  } = useCart();


  const {
    setCompletedOrder,
  } = useOrder();


  const navigate =
    useNavigate();


  const form =
    useFormState(
      initialCustomer,
    );


  const [
    error,
    setError,
  ] = useState('');


  const [
    paymentOpening,
    setPaymentOpening,
  ] = useState(false);


  /* ==========================================================================
     PRELOAD RAZORPAY
     ======================================================================== */

  useEffect(() => {

    void loadRazorpayScript();

  }, []);


  /* ==========================================================================
     PRODUCT DISPLAY DATA
     ======================================================================== */

  const resolvedItems =
    items.map(
      (item) => {

        const result =
          ProductService.getProductBySku(
            item.sku,
          );


        return {
          ...item,
          family:
            result?.family,
          skuData:
            result?.skuObj,
        };

      },
    );


  /* ==========================================================================
     SUBMIT ORDER
     ======================================================================== */

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {

    event.preventDefault();


    if (
      items.length === 0 ||
      paymentOpening ||
      form.status === 'submitting'
    ) {

      return;
    }


    setError('');


    const sharedValid =
      form.validate({

        fullName:
          validators.required(),

        phone:
          validators.phone(),

        email:
          validators.email(),

        address:
          validators.required(),

        city:
          validators.required(),

        state:
          validators.required(),

        pincode:
          validators.pincode(),

      });


    const validationErrors =
      validateCustomer(
        form.values,
      );


    if (
      !sharedValid ||
      validationErrors.length > 0
    ) {

      setError(
        validationErrors[0] ??
          'Please correct the highlighted fields.',
      );

      form.setStatus(
        'error',
      );

      return;
    }


    form.setStatus(
      'submitting',
    );

    setPaymentOpening(
      true,
    );


    try {

      /* ================================================================
         CREATE SERVER ORDER
      ================================================================= */

      const orderResponse =
        await apiClient.createOrder({

          customer: {

            ...form.values,

            fullName:
              form.values.fullName.trim(),

            phone:
              form.values.phone.trim(),

            email:
              form.values.email.trim(),

            address:
              form.values.address.trim(),

            city:
              form.values.city.trim(),

            state:
              form.values.state.trim(),

            pincode:
              form.values.pincode.trim(),

          },

          items,

          idempotencyKey:
            createIdempotencyKey(),

        });


      if (
        !orderResponse.razorpayOrderId
      ) {

        throw new Error(
          'The payment order could not be created. Please try again.',
        );

      }


      if (
        !orderResponse.razorpayKeyId
      ) {

        throw new Error(
          'Payment gateway configuration is incomplete. Please try again later.',
        );

      }


      if (
        typeof orderResponse.amount !==
          'number' ||
        !Number.isFinite(
          orderResponse.amount,
        ) ||
        orderResponse.amount <= 0
      ) {

        throw new Error(
          'Invalid payment amount received from the server.',
        );

      }


      /* ================================================================
         LOAD RAZORPAY
      ================================================================= */

      const loaded =
        await loadRazorpayScript();


      if (
        !loaded ||
        !window.Razorpay
      ) {

        throw new Error(
          'Razorpay payment gateway could not be loaded. Please try again.',
        );

      }


      /* ================================================================
         RAZORPAY
      ================================================================= */

      const options:
        RazorpayOptions = {

        key:
          orderResponse.razorpayKeyId,

        amount:
          orderResponse.amount,

        currency:
          orderResponse.currency ||
          'INR',

        name:
          'Kawad Swad Udhyog',

        description:
          'Authentic Traditional Papad Order',

        order_id:
          orderResponse.razorpayOrderId,

        prefill: {

          name:
            form.values.fullName.trim(),

          email:
            form.values.email.trim(),

          contact:
            form.values.phone.trim(),

        },

        /*
         * Keep Razorpay's own theme configuration
         * separate from our site's CSS tokens.
         */
        theme: {
          color: '#C88A2A',
        },


        /* ==============================================================
           PAYMENT SUCCESS
        ============================================================== */

        handler:
          async (
            paymentResponse,
          ) => {

            try {

              const verification =
                await apiClient.verifyPayment({

                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                });


              if (
                verification.success !==
                true
              ) {

                throw new Error(
                  verification.message ||
                    'Payment verification failed.',
                );

              }


              /* ========================================================
                 SAVE COMPLETED ORDER
              ======================================================== */

              setCompletedOrder({

                orderId:
                  verification.orderId ||
                  orderResponse.orderId,

                customer:
                  orderResponse.customer,

                items:
                  orderResponse.items,

                subtotal:
                  orderResponse.subtotal,

                totalShipping:
                  orderResponse.shipping,

                total:
                  orderResponse.total,

                timestamp:
                  orderResponse.createdAt,

                status:
                  'confirmed',

              });


              /* ========================================================
                 CLEAR CART ONLY AFTER VERIFICATION
              ======================================================== */

              clearCart();


              form.setStatus(
                'success',
              );

              setPaymentOpening(
                false,
              );


              navigate(
                '/order-success',
                {
                  replace: true,
                },
              );

            } catch (
              verificationError: unknown
            ) {

              console.error(
                'PAYMENT VERIFICATION ERROR:',
                verificationError,
              );


              const message =
                verificationError instanceof
                  Error &&
                verificationError.message
                  ? verificationError.message
                  : 'Payment verification failed. Please contact Kawad Swad support if money was deducted.';


              setError(
                message,
              );

              form.setStatus(
                'error',
              );

              setPaymentOpening(
                false,
              );

            }

          },


        /* ==============================================================
           PAYMENT DISMISSED
        ============================================================== */

        modal: {

          ondismiss: () => {

            form.setStatus(
              'idle',
            );

            setPaymentOpening(
              false,
            );

            setError(
              'Payment was cancelled or dismissed. You can retry anytime.',
            );

          },

        },

      };


      const razorpay =
        new window.Razorpay(
          options,
        );


      razorpay.open();

    } catch (
      checkoutError: unknown
    ) {

      console.error(
        'CHECKOUT ERROR:',
        checkoutError,
      );


      const message =
        checkoutError instanceof
          Error &&
        checkoutError.message
          ? checkoutError.message
          : 'We could not submit your order right now. Please try again.';


      setError(
        message,
      );

      form.setStatus(
        'error',
      );

      setPaymentOpening(
        false,
      );

    }

  };


  /* ==========================================================================
     EMPTY CART
     ======================================================================== */

  if (
    items.length === 0
  ) {

    return (
      <>

        <SEO
          title="Checkout"
          description="Complete your Kawad Swad order."
          path="/checkout"
          indexable={false}
        />


        <section
          className="
            min-h-[55vh]
            bg-brand-ivory
            px-4
            py-14
            sm:px-6
            sm:py-20
          "
        >

          <div
            className="
              mx-auto
              max-w-xl
              rounded-3xl
              border
              border-brand-green/10
              bg-white
              p-7
              text-center
              shadow-card
              sm:p-10
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-brand-green/5
                text-brand-green
              "
            >

              <ShoppingBag
                className="h-7 w-7"
                aria-hidden="true"
              />

            </div>


            <h1
              className="
                mt-5
                font-serif
                text-2xl
                font-bold
                text-brand-green
                sm:text-3xl
              "
            >
              Your cart is empty
            </h1>


            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-brand-brown/55
              "
            >
              Add your favourite Kawad Swad
              papads before continuing
              to checkout.
            </p>


            <Link
              to="/shop"
              className="
                btn-primary
                mt-6
                min-h-[48px]
                px-6
              "
            >

              Shop Papads

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />

            </Link>

          </div>

        </section>

      </>
    );
  }


  /* ==========================================================================
     PAGE
     ======================================================================== */

  return (
    <>

      <SEO
        title="Checkout"
        description="Complete your Kawad Swad order securely."
        path="/checkout"
        indexable={false}
      />


      {/* ======================================================================
          CHECKOUT HERO
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-7
          sm:py-9
          lg:py-10
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-dots
            opacity-[0.035]
          "
          aria-hidden="true"
        />


        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-52
            w-52
            rounded-full
            border
            border-brand-saffron/15
            sm:h-64
            sm:w-64
          "
          aria-hidden="true"
        />


        <div
          className="
            container-max
            container-px
            relative
          "
        >

          {/* BREADCRUMB */}

          <nav
            aria-label="Checkout breadcrumb"
            className="
              mb-4
              flex
              items-center
              gap-2
              text-[10px]
              text-brand-ivory/55
              sm:text-xs
            "
          >

            <Link
              to="/cart"
              className="
                transition-colors
                hover:text-white
              "
            >
              Cart
            </Link>


            <ArrowRight
              className="h-3 w-3"
              aria-hidden="true"
            />


            <span
              className="text-brand-ivory/80"
            >
              Checkout
            </span>

          </nav>


          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-brand-saffron
                "
              >
                Kawad Swad
              </p>


              <h1
                className="
                  mt-1
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Secure Checkout
              </h1>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-ivory/65
                  sm:text-base
                "
              >
                Tell us where to send your
                papads, then complete your
                secure payment.
              </p>

            </div>


            <div
              className="
                flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                px-3.5
                py-2
                text-[10px]
                font-semibold
                text-white/75
                sm:text-xs
              "
            >

              <Lock
                className="
                  h-3.5
                  w-3.5
                  text-brand-saffron
                "
                aria-hidden="true"
              />

              Secure Payment

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          CHECKOUT CONTENT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-6
          sm:py-8
          lg:py-10
        "
      >

        <div
          className="
            container-max
            container-px
          "
        >

          <div
            className="
              grid
              items-start
              gap-5
              lg:grid-cols-[minmax(0,1fr)_390px]
              lg:gap-7
              xl:grid-cols-[minmax(0,1fr)_410px]
            "
          >

            {/* ==================================================================
                LEFT: CUSTOMER FORM
                =================================================================== */}

            <div className="min-w-0">

              <form
                onSubmit={submit}
                noValidate
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-white
                  shadow-card
                "
              >

                {/* ==============================================================
                    FORM HEADER
                    =========================================================== */}

                <div
                  className="
                    border-b
                    border-brand-green/10
                    bg-brand-ivory
                    p-4
                    sm:p-5
                    lg:p-6
                  "
                >

                  <SectionHeading
                    icon={
                      <MapPin
                        className="h-5 w-5"
                      />
                    }
                    eyebrow="Delivery"
                    title="Delivery Details"
                    description="Enter the details we need to deliver your order."
                  />

                </div>


                {/* ==============================================================
                    FORM FIELDS
                    =========================================================== */}

                <div
                  className="
                    p-4
                    sm:p-5
                    lg:p-6
                  "
                >

                  <FormContainer>

                    <FormField
                      label="Full Name"
                      name="fullName"
                      value={
                        form.values.fullName
                      }
                      onChange={(value) =>
                        form.setValue(
                          'fullName',
                          value,
                        )
                      }
                      error={
                        form.errors.fullName
                      }
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                    />


                    <div
                      className="
                        grid
                        gap-3
                        sm:grid-cols-2
                      "
                    >

                      <FormField
                        label="Mobile Number"
                        name="phone"
                        type="tel"
                        value={
                          form.values.phone
                        }
                        onChange={(value) =>
                          form.setValue(
                            'phone',
                            value,
                          )
                        }
                        error={
                          form.errors.phone
                        }
                        required
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                      />


                      <FormField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={
                          form.values.email
                        }
                        onChange={(value) =>
                          form.setValue(
                            'email',
                            value,
                          )
                        }
                        error={
                          form.errors.email
                        }
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                      />

                    </div>


                    <FormField
                      label="Delivery Address"
                      name="address"
                      type="textarea"
                      value={
                        form.values.address
                      }
                      onChange={(value) =>
                        form.setValue(
                          'address',
                          value,
                        )
                      }
                      error={
                        form.errors.address
                      }
                      required
                      autoComplete="street-address"
                      placeholder="House / flat number, street, area"
                      rows={4}
                    />


                    <div
                      className="
                        grid
                        gap-3
                        sm:grid-cols-2
                      "
                    >

                      <FormField
                        label="City"
                        name="city"
                        value={
                          form.values.city
                        }
                        onChange={(value) =>
                          form.setValue(
                            'city',
                            value,
                          )
                        }
                        error={
                          form.errors.city
                        }
                        required
                        autoComplete="address-level2"
                        placeholder="Enter city"
                      />


                      <FormField
                        label="State / Union Territory"
                        name="state"
                        type="select"
                        value={
                          form.values.state
                        }
                        onChange={(value) =>
                          form.setValue(
                            'state',
                            value,
                          )
                        }
                        error={
                          form.errors.state
                        }
                        required
                        options={[
                          ...INDIAN_STATES_AND_UTS,
                        ]}
                      />

                    </div>


                    <FormField
                      label="PIN Code"
                      name="pincode"
                      type="tel"
                      value={
                        form.values.pincode
                      }
                      onChange={(value) =>
                        form.setValue(
                          'pincode',
                          value
                            .replace(
                              /\D/g,
                              '',
                            )
                            .slice(
                              0,
                              6,
                            ),
                        )
                      }
                      error={
                        form.errors.pincode
                      }
                      required
                      autoComplete="postal-code"
                      placeholder="6-digit PIN code"
                    />

                  </FormContainer>


                  {/* ============================================================
                      ERROR
                  ============================================================= */}

                  {error && (
                    <div
                      className="
                        mt-4
                      "
                    >

                      <FormStatusMessage
                        status="error"
                        errorMsg={error}
                      />

                    </div>
                  )}


                  {/* ============================================================
                      PAYMENT CTA
                  ============================================================= */}

                  <div
                    className="
                      mt-6
                      border-t
                      border-brand-green/10
                      pt-5
                    "
                  >

                    <button
                      type="submit"
                      disabled={
                        paymentOpening ||
                        form.status ===
                          'submitting'
                      }
                      className="
                        group/payment
                        flex
                        min-h-[54px]
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-brand-saffron
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-soft
                        transition-all
                        duration-200
                        ease-ks-standard
                        hover:-translate-y-0.5
                        hover:bg-brand-saffron-dark
                        hover:shadow-glow
                        active:translate-y-0
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {paymentOpening ? (

                        <>
                          <span
                            className="
                              h-5
                              w-5
                              animate-spin
                              rounded-full
                              border-2
                              border-white/30
                              border-t-white
                            "
                            aria-hidden="true"
                          />

                          Creating Secure Payment...

                        </>

                      ) : (

                        <>
                          <CreditCard
                            className="
                              h-4
                              w-4
                            "
                            aria-hidden="true"
                          />

                          Proceed to Secure Payment

                          <ArrowRight
                            className="
                              h-4
                              w-4
                              transition-transform
                              duration-200
                              group-hover/payment:translate-x-1
                            "
                            aria-hidden="true"
                          />

                        </>
                      )}

                    </button>


                    <p
                      className="
                        mt-2.5
                        text-center
                        text-[9px]
                        leading-relaxed
                        text-brand-brown/40
                        sm:text-[10px]
                      "
                    >
                      You will be redirected to
                      Razorpay's secure payment window.
                    </p>

                  </div>

                </div>

              </form>


              {/* ==================================================================
                  TRUST ROW
                  =================================================================== */}

              <div
                className="
                  mt-3
                  grid
                  gap-2
                  sm:grid-cols-3
                "
              >

                <CheckoutTrust
                  icon={
                    <ShieldCheck
                      className="h-4 w-4"
                    />
                  }
                  title="Secure Payment"
                  description="Protected checkout"
                />


                <CheckoutTrust
                  icon={
                    <Truck
                      className="h-4 w-4"
                    />
                  }
                  title="Free Shipping"
                  description="Shipping included"
                />


                <CheckoutTrust
                  icon={
                    <Leaf
                      className="h-4 w-4"
                    />
                  }
                  title="100% Vegetarian"
                  description="Kawad Swad quality"
                />

              </div>

            </div>


            {/* ==================================================================
                RIGHT: ORDER SUMMARY
                =================================================================== */}

            <aside
              className="
                min-w-0
                lg:sticky
                lg:top-24
              "
            >

              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-white
                  shadow-card
                "
              >

                {/* ==============================================================
                    SUMMARY HEADER
                    =========================================================== */}

                <div
                  className="
                    bg-brand-green
                    px-5
                    py-5
                    sm:px-6
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          text-brand-saffron
                        "
                      >
                        Your Order
                      </p>


                      <h2
                        className="
                          mt-1
                          font-serif
                          text-xl
                          font-bold
                          text-white
                          sm:text-2xl
                        "
                      >
                        Order Summary
                      </h2>

                    </div>


                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/10
                        text-white
                      "
                    >

                      <ShoppingBag
                        className="h-5 w-5"
                        aria-hidden="true"
                      />

                    </div>

                  </div>


                  <p
                    className="
                      mt-2
                      text-xs
                      text-brand-ivory/60
                    "
                  >
                    {items.length}{' '}
                    {items.length === 1
                      ? 'product'
                      : 'products'}{' '}
                    in your order
                  </p>

                </div>


                {/* ==============================================================
                    PRODUCTS
                    =========================================================== */}

                <div
                  className="
                    max-h-[380px]
                    overflow-y-auto
                    p-4
                    sm:p-5
                  "
                >

                  <div
                    className="
                      space-y-3
                    "
                  >

                    {resolvedItems.map(
                      (item) => {

                        const product =
                          item.family;

                        const skuData =
                          item.skuData;


                        const packLabel =
                          skuData
                            ? PACK_LABELS[
                                skuData.packSize
                              ] ??
                              `${skuData.packSize}g`
                            : '';


                        const unitPrice =
                          skuData &&
                          typeof skuData.websitePrice ===
                            'number'
                            ? skuData.websitePrice
                            : 0;


                        const lineTotal =
                          unitPrice *
                          item.quantity;


                        return (
                          <div
                            key={
                              item.sku
                            }
                            className="
                              flex
                              gap-3
                              border-b
                              border-brand-green/10
                              pb-3
                              last:border-0
                              last:pb-0
                            "
                          >

                            {/* PRODUCT IMAGE */}

                            <div
                              className="
                                relative
                                flex
                                h-16
                                w-16
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                border
                                border-brand-green/10
                                bg-gradient-to-br
                                from-white
                                via-brand-cream
                                to-brand-cream-dark
                              "
                            >

                              <div
                                className="
                                  h-full
                                  w-full
                                  p-1.5
                                "
                              >

                                {product && (
                                  <ProductImage
                                    productId={
                                      product.id
                                    }
                                    product={
                                      product
                                    }
                                    variant="card"
                                    className="
                                      h-full
                                      w-full
                                      object-contain
                                    "
                                  />
                                )}

                              </div>

                            </div>


                            {/* PRODUCT INFO */}

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >

                              <p
                                className="
                                  truncate
                                  text-xs
                                  font-bold
                                  text-brand-green
                                "
                              >
                                {product?.name ??
                                  item.sku}
                              </p>


                              <p
                                className="
                                  mt-0.5
                                  truncate
                                  text-[9px]
                                  text-brand-brown/45
                                "
                              >
                                {packLabel
                                  ? `${packLabel} × ${item.quantity}`
                                  : `Qty: ${item.quantity}`}
                              </p>

                            </div>


                            {/* PRICE */}

                            <span
                              className="
                                shrink-0
                                self-center
                                text-xs
                                font-bold
                                text-brand-green
                              "
                            >
                              {formatPrice(
                                lineTotal,
                              )}
                            </span>

                          </div>
                        );

                      },
                    )}

                  </div>

                </div>


                {/* ==============================================================
                    TOTALS
                    =========================================================== */}

                <div
                  className="
                    border-t
                    border-brand-green/10
                    bg-brand-ivory
                    p-4
                    sm:p-5
                  "
                >

                  <div
                    className="
                      space-y-2.5
                      text-sm
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                        text-brand-brown/60
                      "
                    >

                      <span>
                        Subtotal
                      </span>


                      <span
                        className="
                          font-semibold
                          text-brand-brown
                        "
                      >
                        {formatPrice(
                          subtotal,
                        )}
                      </span>

                    </div>


                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                        text-brand-brown/60
                      "
                    >

                      <span>
                        Shipping
                      </span>


                      <span
                        className="
                          font-semibold
                          text-brand-green
                        "
                      >
                        {shippingTotal ===
                        0
                          ? 'Free'
                          : formatPrice(
                              shippingTotal,
                            )}
                      </span>

                    </div>


                    <div
                      className="
                        border-t
                        border-brand-green/10
                        pt-3
                      "
                    >

                      <div
                        className="
                          flex
                          items-end
                          justify-between
                          gap-4
                        "
                      >

                        <div>

                          <p
                            className="
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-brand-brown/40
                            "
                          >
                            Order Total
                          </p>


                          <p
                            className="
                              mt-0.5
                              font-serif
                              text-2xl
                              font-bold
                              text-brand-green
                              sm:text-3xl
                            "
                          >
                            {formatPrice(
                              total,
                            )}
                          </p>

                        </div>


                        <span
                          className="
                            rounded-full
                            bg-brand-saffron/10
                            px-2.5
                            py-1
                            text-[9px]
                            font-bold
                            text-brand-saffron-dark
                          "
                        >
                          INR
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* SHIPPING MESSAGE */}

                  <div
                    className="
                      mt-4
                      flex
                      items-start
                      gap-2
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-white
                      px-3
                      py-2.5
                    "
                  >

                    <Truck
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-brand-green
                      "
                      aria-hidden="true"
                    />


                    <p
                      className="
                        text-[10px]
                        leading-relaxed
                        text-brand-brown/55
                      "
                    >
                      <strong
                        className="
                          font-semibold
                          text-brand-green
                        "
                      >
                        Free shipping included.
                      </strong>{' '}
                      Your displayed total is the
                      amount sent for secure payment.
                    </p>

                  </div>


                  {/* BACK TO CART */}

                  <Link
                    to="/cart"
                    className="
                      mt-3
                      flex
                      min-h-[42px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-white
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-brand-green
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-brand-green/20
                      hover:bg-brand-green/5
                    "
                  >

                    <ArrowLeft
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    Back to Cart

                  </Link>

                </div>

              </div>


              {/* ================================================================
                  PAYMENT TRUST
                  ============================================================= */}

              <div
                className="
                  mt-3
                  rounded-2xl
                  border
                  border-brand-green/10
                  bg-white
                  p-3.5
                  shadow-soft
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-brand-saffron/10
                      text-brand-saffron-dark
                    "
                  >

                    <Lock
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        text-brand-green
                      "
                    >
                      Secure Razorpay Checkout
                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        leading-relaxed
                        text-brand-brown/45
                        sm:text-[10px]
                      "
                    >
                      Payment is processed securely
                      through Razorpay.
                    </p>

                  </div>

                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>

    </>
  );
}
