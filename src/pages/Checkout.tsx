import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

import {
  SEO,
} from '@/components/SEO';

import {
  FormField,
  FormStatusMessage,
  FormContainer,
  useFormState,
  validators,
} from '@/components/Form';

import {
  useCart,
  formatPrice,
} from '@/context/CartContext';

import {
  useOrder,
  type CustomerInfo,
} from '@/context/OrderContext';

import {
  ProductService,
} from '@/services/product-service';

import {
  PACK_LABELS,
} from '@/data/products';

import {
  apiClient,
} from '@/services/api-client';

/* ============================================================================
 * CUSTOMER FORM
 * ========================================================================== */

const initialCustomer: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

/* ============================================================================
 * INDIAN STATES / UNION TERRITORIES
 * ========================================================================== */

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

/* ============================================================================
 * RAZORPAY TYPES
 * ========================================================================== */

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

/* ============================================================================
 * RAZORPAY SCRIPT LOADER
 * ========================================================================== */

const RAZORPAY_SCRIPT =
  'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        `script[src="${RAZORPAY_SCRIPT}"]`,
      );

    if (existingScript) {
      const handleLoad = () => {
        cleanup();
        resolve(true);
      };

      const handleError = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
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

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(
      script,
    );
  });
}

/* ============================================================================
 * CUSTOMER VALIDATION
 * ========================================================================== */

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
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(
      fullName,
    )
  ) {
    errors.push(
      'Please enter a valid full name.',
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
  } else if (
    city.length < 3
  ) {
    errors.push(
      'Please enter a valid city.',
    );
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(
      city,
    )
  ) {
    errors.push(
      'Please enter a valid city.',
    );
  }

  if (!state) {
    errors.push(
      'Please select your state.',
    );
  } else if (
    !INDIAN_STATES_AND_UTS.includes(
      state as (typeof INDIAN_STATES_AND_UTS)[number],
    )
  ) {
    errors.push(
      'Please select a valid Indian state or union territory.',
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

/* ============================================================================
 * IDEMPOTENCY KEY
 * ========================================================================== */

function createIdempotencyKey(): string {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return `ks-${crypto.randomUUID()}`;
  }

  return `ks-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

/* ============================================================================
 * CHECKOUT
 * ========================================================================== */

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

  const [error, setError] =
    useState('');

  const [
    paymentOpening,
    setPaymentOpening,
  ] = useState(false);

  /*
   * Preload Razorpay while the checkout page
   * is visible.
   */
  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  /*
   * Resolve catalog snapshots for display only.
   *
   * Backend remains authoritative for final
   * price, availability and order totals.
   */
  const resolvedItems =
    items.map((item) => {
      const result =
        ProductService.getProductBySku(
          item.sku,
        );

      return {
        ...item,
        family: result?.family,
        sku: result?.skuObj,
      };
    });

  /* ==========================================================================
   * SUBMIT
   * ======================================================================== */

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      items.length === 0 ||
      paymentOpening ||
      form.status ===
        'submitting'
    ) {
      return;
    }

    setError('');

    /*
     * Shared project validation.
     */
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

    /*
     * Checkout-specific validation.
     */
    const validationErrors =
      validateCustomer(
        form.values,
      );

    if (
      !sharedValid ||
      validationErrors.length >
        0
    ) {
      setError(
        validationErrors[0] ??
          'Please correct the highlighted fields.',
      );

      form.setStatus('error');

      return;
    }

    form.setStatus(
      'submitting',
    );

    setPaymentOpening(true);

    try {
      /* ================================================================
       * 1. CREATE SERVER-SIDE ORDER
       * ================================================================ */

      const orderResponse =
        await apiClient.createOrder(
          {
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
          },
        );

      /* ================================================================
       * 2. VALIDATE PAYMENT DATA FROM BACKEND
       * ================================================================ */

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
        orderResponse.amount <=
          0
      ) {
        throw new Error(
          'Invalid payment amount received from the server.',
        );
      }

      /* ================================================================
       * 3. LOAD RAZORPAY
       * ================================================================ */

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
       * 4. OPEN RAZORPAY
       * ================================================================ */

      const options: RazorpayOptions =
        {
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

          theme: {
            color:
              '#D97706',
          },

          handler:
            async (
              paymentResponse,
            ) => {
              try {
                /*
                 * 5. SERVER-SIDE PAYMENT
                 *    VERIFICATION
                 */
                const verification =
                  await apiClient.verifyPayment(
                    {
                      razorpay_order_id:
                        paymentResponse.razorpay_order_id,

                      razorpay_payment_id:
                        paymentResponse.razorpay_payment_id,

                      razorpay_signature:
                        paymentResponse.razorpay_signature,
                    },
                  );

                if (
                  verification.success !==
                    true
                ) {
                  throw new Error(
                    verification.message ||
                      'Payment verification failed.',
                  );
                }

                /*
                 * 6. SAVE VERIFIED ORDER
                 *
                 * Use backend-confirmed order
                 * data only.
                 */
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

                  /*
                   * Shipping is always free on
                   * the customer-facing website.
                   */
                  totalShipping: 0,

                  total:
                    orderResponse.total,

                  timestamp:
                    orderResponse.createdAt,

                  status:
                    'confirmed',
                });

                /*
                 * 7. CLEAR CART
                 */
                clearCart();

                form.setStatus(
                  'success',
                );

                setPaymentOpening(
                  false,
                );

                /*
                 * 8. SUCCESS PAGE
                 */
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
    } catch (checkoutError: unknown) {
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

      setError(message);

      form.setStatus(
        'error',
      );

      setPaymentOpening(
        false,
      );
    }
  };

  /* ==========================================================================
   * EMPTY CART
   * ======================================================================== */

  if (items.length === 0) {
    return (
      <>
        <SEO
          title="Checkout"
          description="Complete your Kawad Swad order."
          path="/checkout"
          indexable={false}
        />

        <section className="container-max container-px py-16 text-center sm:py-20">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-brown/20" />

          <h1 className="mt-4 font-serif text-2xl font-bold text-brand-brown sm:text-3xl">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-brand-brown/55">
            Add some Kawad Swad
            papads before continuing
            to checkout.
          </p>

          <Link
            to="/shop"
            className="btn-primary mt-6 inline-flex"
          >
            Shop Papads
          </Link>
        </section>
      </>
    );
  }

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <>
      <SEO
        title="Checkout"
        description="Complete your Kawad Swad order securely."
        path="/checkout"
        indexable={false}
      />

      <section className="bg-brand-cream py-6 sm:py-8 lg:py-12">
        <div className="container-max container-px">

          {/* Breadcrumb */}

          <div className="mb-5 flex items-center gap-2 text-xs text-brand-brown/50 sm:mb-6">
            <Link
              to="/cart"
              className="transition-colors hover:text-brand-red"
            >
              Cart
            </Link>

            <ArrowRight className="h-3 w-3" />

            <span>Checkout</span>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">

            {/* ================================================================
                CUSTOMER FORM
            ================================================================ */}

            <form
              onSubmit={submit}
              noValidate
              className="
                card
                border
                border-brand-brown/5
                bg-white
                p-4
                shadow-soft
                sm:p-6
                lg:p-8
              "
            >
              <div className="mb-7 flex items-center gap-4 border-b border-brand-brown/10 pb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-red/10">
                  <Lock className="h-6 w-6 text-brand-red" />
                </div>

                <div>
                  <h1 className="font-serif text-2xl font-bold text-brand-brown">
                    Delivery Details
                  </h1>

                  <p className="mt-1 text-sm text-brand-brown/55">
                    Enter your details
                    for delivery and
                    secure payment.
                  </p>
                </div>
              </div>

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
                  placeholder="Your full name"
                />

                <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
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
                    placeholder="City"
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
                      value.replace(
                        /\D/g,
                        '',
                      ).slice(0, 6),
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

              {error && (
                <div className="mt-5">
                  <FormStatusMessage
                    status="error"
                    errorMsg={error}
                  />
                </div>
              )}

              <div className="mt-7 border-t border-brand-brown/10 pt-6">
                <button
                  type="submit"
                  disabled={
                    paymentOpening ||
                    form.status ===
                      'submitting'
                  }
                  className="
                    flex
                    min-h-[54px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-brand-red
                    px-5
                    py-3
                    font-bold
                    text-white
                    shadow-[0_5px_0_#b9230a]
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-brand-red-dark
                    active:translate-y-[2px]
                    active:shadow-none
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
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
                      />

                      Creating Secure Payment...
                    </>
                  ) : (
                    <>
                      Proceed to Secure Payment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-brand-brown/10 pt-5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <ShieldCheck className="h-5 w-5 text-green-700" />

                  <span className="text-[10px] font-medium text-brand-brown/60">
                    Secure payment
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <Truck className="h-5 w-5 text-brand-brown/45" />

                  <span className="text-[10px] font-medium text-brand-brown/60">
                    Free shipping
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <CheckCircle className="h-5 w-5 text-green-700" />

                  <span className="text-[10px] font-medium text-brand-brown/60">
                    Verified order
                  </span>
                </div>
              </div>
            </form>

            {/* ================================================================
                ORDER SUMMARY
            ================================================================ */}

            <aside className="lg:sticky lg:top-24">
              <div className="card overflow-hidden border border-brand-brown/5 bg-white shadow-soft">

                <div className="border-b border-brand-brown/10 bg-brand-cream px-5 py-4">
                  <h2 className="font-serif text-xl font-bold text-brand-brown">
                    Order Summary
                  </h2>

                  <p className="mt-1 text-xs text-brand-brown/50">
                    {items.length}{' '}
                    {items.length ===
                    1
                      ? 'product'
                      : 'products'}{' '}
                    in your order
                  </p>
                </div>

                <div className="max-h-[420px] overflow-y-auto p-5">
                  <div className="space-y-4">
                    {resolvedItems.map(
                      (item) => {
                        const product =
                          item.family;

                        const sku =
                          item.sku;

                        const packLabel =
                          sku
                            ? PACK_LABELS[
                                sku.packSize
                              ] ??
                              `${sku.packSize}g`
                            : '';

                        const unitPrice =
                          sku &&
                          typeof sku.websitePrice ===
                            'number'
                            ? sku.websitePrice
                            : 0;

                        const lineTotal =
                          unitPrice *
                          item.quantity;

                        return (
                          <div
                            key={
                              item.sku
                            }
                            className="flex gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-brand-brown">
                                {product?.name ??
                                  item.sku}
                              </p>

                              <p className="mt-1 text-xs text-brand-brown/50">
                                {packLabel
                                  ? `${packLabel} × ${item.quantity}`
                                  : `Qty: ${item.quantity}`}
                              </p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-brand-brown">
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

                <div className="border-t border-brand-brown/10 p-5">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4 text-brand-brown/65">
                      <span>
                        Subtotal
                      </span>

                      <span>
                        {formatPrice(
                          subtotal,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-brand-brown/65">
                      <span>
                        Shipping
                      </span>

                      <span className="font-semibold text-green-700">
                        {shippingTotal ===
                        0
                          ? 'Free'
                          : formatPrice(
                              shippingTotal,
                            )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-brand-brown/10 pt-4">
                      <span className="font-semibold text-brand-brown">
                        Order Total
                      </span>

                      <span className="text-lg font-bold text-brand-red">
                        {formatPrice(
                          total,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-xs leading-relaxed text-green-800">
                    <strong>
                      Free shipping included.
                    </strong>{' '}
                    The displayed product
                    price is the final
                    customer-facing price.
                  </div>
                </div>
              </div>

              <Link
                to="/cart"
                className="
                  mt-4
                  inline-flex
                  min-h-[44px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-brand-brown/10
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-brand-brown
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-brand-cream
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
