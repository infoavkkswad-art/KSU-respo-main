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
  Loader2,
} from 'lucide-react';

import { SEO } from '../components/SEO';

import {
  FormField,
  FormStatusMessage,
  useFormState,
  validators,
  FormContainer,
} from '../components/Form';

import {
  useCart,
  formatPrice,
} from '../context/CartContext';

import {
  useOrder,
  type CustomerInfo,
} from '../context/OrderContext';

import { ProductService } from '../services/product-service';
import { PACK_LABELS } from '../data/products';
import { apiClient } from '../services/api-client';
import { ProductImage } from '../components/ProductImage';

const initial: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

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
];

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/* ============================================================================
 * RAZORPAY SCRIPT LOADER
 * ========================================================================== */

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
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
      document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(script);
  });
}

/* ============================================================================
 * CHECKOUT VALIDATION
 * ========================================================================== */

function validateCheckoutCustomer(
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
  } else if (fullName.length < 4) {
    errors.push(
      'Full name must contain at least 4 characters.',
    );
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(
      fullName,
    )
  ) {
    errors.push(
      'Please enter a valid name using letters only.',
    );
  }

  if (!phone) {
    errors.push(
      'Please enter your mobile number.',
    );
  } else if (
    !/^[6-9]\d{9}$/.test(phone)
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
  } else if (address.length < 10) {
    errors.push(
      'Delivery address must contain at least 10 characters.',
    );
  }

  if (!city) {
    errors.push(
      'Please enter your city.',
    );
  } else if (city.length < 4) {
    errors.push(
      'City name must contain at least 4 characters.',
    );
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(
      city,
    )
  ) {
    errors.push(
      'Please enter a valid city name.',
    );
  }

  if (!state) {
    errors.push(
      'Please select your state.',
    );
  } else if (
    !INDIAN_STATES_AND_UTS.includes(
      state,
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
 * PAYMENT STAGE
 * ========================================================================== */

type PaymentStage =
  | 'idle'
  | 'creating-order'
  | 'opening-payment';

/* ============================================================================
 * CHECKOUT PAGE
 * ========================================================================== */

export default function Checkout() {
  const {
    items,
    subtotal,
    total,
    clearCart,
  } = useCart();

  const orderContext = useOrder();

  const navigate = useNavigate();

  const form =
    useFormState(initial);

  const [error, setError] =
    useState('');

  const [
    paymentStage,
    setPaymentStage,
  ] =
    useState<PaymentStage>('idle');

  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  /* ==========================================================================
   * RESOLVE CURRENT CART
   * ======================================================================== */

  const resolvedItems = items
    .map((item) => {
      const result =
        ProductService.getPurchasableProductBySku(
          item.sku,
        );

      if (!result) {
        return null;
      }

      return {
        sku: result.skuObj.sku,
        quantity: item.quantity,
        product: result.family,
        skuObj: result.skuObj,
      };
    })
    .filter(
      (
        item,
      ): item is NonNullable<
        typeof item
      > => item !== null,
    );

  /*
   * The cart can contain an SKU that became unavailable
   * after it was added.
   *
   * Never submit such an SKU to the order API.
   */
  const hasInvalidCartItems =
    resolvedItems.length !==
    items.length;

  /*
   * Recalculate the customer-facing total from the
   * central ProductService instead of trusting stale
   * localStorage/cart pricing.
   *
   * Shipping is always zero because the final website
   * selling price already includes shipping.
   */
  const resolvedSubtotal =
    resolvedItems.reduce(
      (sum, item) =>
        sum +
        item.skuObj.websitePrice *
          item.quantity,
      0,
    );

  const resolvedTotal =
    resolvedSubtotal;

  /* ==========================================================================
   * SUBMIT
   * ======================================================================== */

  const submit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (
      items.length === 0 ||
      form.status === 'submitting'
    ) {
      return;
    }

    setError('');

    if (hasInvalidCartItems) {
      setError(
        'One or more products in your cart are no longer available. Please return to your cart and review the items.',
      );

      form.setStatus('error');
      setPaymentStage('idle');

      return;
    }

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
      validateCheckoutCustomer(
        form.values,
      );

    if (
      !sharedValid ||
      validationErrors.length > 0
    ) {
      const message =
        validationErrors.length > 0
          ? validationErrors[0]
          : 'Please correct the highlighted fields before continuing.';

      setError(message);

      form.setStatus('error');

      setPaymentStage('idle');

      return;
    }

    form.setStatus('submitting');

    setPaymentStage(
      'creating-order',
    );

    try {
      const idempotencyKey =
        `idemp-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      /*
       * The backend must remain the final authority
       * for order/payment validation.
       *
       * The frontend sends SKU + quantity only.
       * It does not send costing, margin, or shipping
       * charges.
       */
      const orderResponse =
        await apiClient.createOrder({
          customer: form.values,

          items: resolvedItems.map(
            (item) => ({
              sku: item.sku,
              quantity:
                item.quantity,
            }),
          ),

          idempotencyKey,
        });

      /*
       * Guard against a backend/frontend total mismatch.
       *
       * This protects the checkout UI from silently
       * displaying a different customer total than the
       * central website pricing configuration.
       */
      if (
        typeof orderResponse.total ===
          'number' &&
        Number.isFinite(
          orderResponse.total,
        ) &&
        orderResponse.total !==
          resolvedTotal
      ) {
        throw new Error(
          'The order total has changed. Please return to your cart and review the latest prices before paying.',
        );
      }

      setPaymentStage(
        'opening-payment',
      );

      const scriptLoaded =
        await loadRazorpayScript();

      if (
        !scriptLoaded ||
        !window.Razorpay
      ) {
        throw new Error(
          'Razorpay payment gateway could not be loaded. Please try again.',
        );
      }

      const options = {
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
            form.values.fullName,

          email:
            form.values.email,

          contact:
            form.values.phone,
        },

        theme: {
          color: '#D97706',
        },

        handler: async (
          response: any,
        ) => {
          try {
            const verifyRes =
              await apiClient.verifyPayment(
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                },
              );

            /*
             * Customer-facing shipping is always
             * FREE and already included in product prices.
             */
            const completedOrder = {
              orderId:
                verifyRes?.orderId ||
                orderResponse.orderId,

              customer:
                orderResponse.customer,

              items:
                orderResponse.items,

              subtotal:
                orderResponse.subtotal ??
                resolvedSubtotal,

              totalShipping: 0,

              total:
                orderResponse.total ??
                resolvedTotal,

              timestamp:
                orderResponse.timestamp,

              status:
                'confirmed' as const,
            };

            orderContext.setCompletedOrder(
              completedOrder,
            );

            clearCart();

            form.setStatus(
              'success',
            );

            setPaymentStage(
              'idle',
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
              'PAYMENT SUCCESS HANDLER ERROR:',
              verificationError,
            );

            const message =
              verificationError instanceof
                Error &&
              verificationError.message
                ? verificationError.message
                : 'Payment verification failed.';

            setError(message);

            form.setStatus(
              'error',
            );

            setPaymentStage(
              'idle',
            );
          }
        },

        modal: {
          ondismiss: () => {
            form.setStatus(
              'idle',
            );

            setPaymentStage(
              'idle',
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
    } catch (err: unknown) {
      console.error(
        'CHECKOUT ERROR:',
        err,
      );

      const message =
        err instanceof Error &&
        err.message
          ? err.message
          : 'We could not submit your order right now. Please try again.';

      setError(message);

      form.setStatus(
        'error',
      );

      setPaymentStage(
        'idle',
      );
    }
  };

  /* ==========================================================================
   * PAYMENT BUTTON
   * ======================================================================== */

  const getPaymentButtonLabel =
    () => {
      if (
        paymentStage ===
        'creating-order'
      ) {
        return 'Creating Secure Order...';
      }

      if (
        paymentStage ===
        'opening-payment'
      ) {
        return 'Opening Secure Payment...';
      }

      return 'Proceed to Pay';
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

        <div className="container-max container-px py-16 text-center sm:py-20">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-brown/20" />

          <h1 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">
            Your cart is empty
          </h1>

          <Link
            to="/shop"
            className="btn-primary mt-6 inline-flex"
          >
            Shop Papads
          </Link>
        </div>
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
        description="Complete your Kawad Swad order."
        path="/checkout"
        indexable={false}
      />

      <div className="bg-brand-cream py-6 sm:py-8 lg:py-12">
        <div className="container-max container-px">
          {/* Breadcrumb */}

          <div className="mb-4 flex items-center gap-2 text-[11px] text-brand-brown/50 sm:mb-6 sm:text-xs">
            <Link
              to="/cart"
              className="hover:text-brand-red"
            >
              Cart
            </Link>

            <ArrowRight className="h-3 w-3" />

            <span>
              Checkout
            </span>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[1fr_400px] lg:gap-12">
            {/* ==============================================================
                CHECKOUT FORM
            =============================================================== */}

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
              {/* Header */}

              <div className="mb-6 flex items-start gap-3 border-b border-brand-brown/10 pb-5 sm:mb-8 sm:gap-4 sm:pb-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-red/10 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Lock className="h-5 w-5 text-brand-red sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="font-serif text-xl font-bold text-brand-brown sm:text-2xl">
                    Delivery Details & Payment
                  </h1>

                  <p className="mt-1 text-xs text-brand-brown/60 sm:text-sm">
                    Provide your delivery information and complete secure payment.
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Phone"
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
                    label="Email"
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
                  label="Address"
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
                  placeholder="House number, street, landmark"
                  rows={3}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    placeholder="City"
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-brand-brown"
                    >
                      State
                      <span className="ml-1 text-brand-red">
                        *
                      </span>
                    </label>

                    <select
                      id="state"
                      name="state"
                      value={
                        form.values.state
                      }
                      onChange={(event) => {
                        form.setValue(
                          'state',
                          event.target
                            .value,
                        );

                        setError('');
                      }}
                      className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-brand-brown outline-none transition focus:ring-2 focus:ring-brand-red/20 ${
                        form.errors.state
                          ? 'border-brand-red'
                          : 'border-brand-brown/15'
                      }`}
                      aria-invalid={Boolean(
                        form.errors.state,
                      )}
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select State
                      </option>

                      {INDIAN_STATES_AND_UTS.map(
                        (state) => (
                          <option
                            key={state}
                            value={state}
                          >
                            {state}
                          </option>
                        ),
                      )}
                    </select>

                    {form.errors.state && (
                      <p className="text-xs text-brand-red">
                        {
                          form.errors.state
                        }
                      </p>
                    )}
                  </div>

                  <FormField
                    label="PIN Code"
                    name="pincode"
                    type="text"
                    value={
                      form.values.pincode
                    }
                    onChange={(value) =>
                      form.setValue(
                        'pincode',
                        value,
                      )
                    }
                    error={
                      form.errors.pincode
                    }
                    required
                    placeholder="6 digits"
                  />
                </div>
              </FormContainer>

              {error && (
                <div className="mt-5 sm:mt-6">
                  <FormStatusMessage
                    status="error"
                    successMsg=""
                    errorMsg={error}
                  />
                </div>
              )}

              {/* Bottom controls */}

              <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-brand-brown/10 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:pt-6">
                <Link
                  to="/cart"
                  className="
                    inline-flex
                    min-h-[44px]
                    items-center
                    justify-center
                    gap-2
                    text-sm
                    font-medium
                    text-brand-brown/70
                    hover:text-brand-red
                    sm:justify-start
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to cart
                </Link>

                <button
                  type="submit"
                  disabled={
                    form.status ===
                    'submitting'
                  }
                  aria-busy={
                    form.status ===
                    'submitting'
                  }
                  className="
                    btn-primary
                    inline-flex
                    min-h-[48px]
                    w-full
                    min-w-0
                    items-center
                    justify-center
                    gap-2
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                    sm:w-auto
                    sm:min-w-[210px]
                  "
                >
                  {form.status ===
                  'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      <span className="text-sm">
                        {getPaymentButtonLabel()}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />

                      <span>
                        Proceed to Pay
                      </span>

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-5 text-center text-2xs text-brand-brown/50 sm:mt-6">
                Secure Razorpay payment gateway integration.
              </p>
            </form>

            {/* ==============================================================
                ORDER SUMMARY
            =============================================================== */}

            <aside
              className="
                card
                border
                border-brand-brown/5
                bg-white
                p-4
                shadow-soft
                sm:p-6
                lg:sticky
                lg:top-28
                lg:p-8
              "
            >
              <h2 className="mb-5 font-serif text-lg font-bold text-brand-brown sm:mb-6 sm:text-xl">
                Order Summary
              </h2>

              <div className="mb-5 space-y-3 sm:mb-6 sm:space-y-4">
                {resolvedItems.map(
                  ({
                    sku,
                    quantity,
                    product,
                    skuObj,
                  }) => {
                    const packLabel =
                      PACK_LABELS[
                        skuObj.packSize
                      ] ||
                      `${skuObj.packSize}g`;

                    const lineTotal =
                      skuObj.websitePrice *
                      quantity;

                    return (
                      <div
                        key={sku}
                        className="
                          flex
                          items-center
                          gap-3
                          border-b
                          border-brand-brown/5
                          pb-3
                          sm:gap-4
                          sm:pb-4
                        "
                      >
                        <Link
                          to={`/product/${product.slug}`}
                          aria-label={`View ${product.name}`}
                          className="
                            block
                            h-16
                            w-16
                            flex-shrink-0
                            overflow-hidden
                            rounded-xl
                            border
                            border-brand-brown/5
                            bg-brand-cream-dark
                            sm:h-20
                            sm:w-20
                          "
                        >
                          <ProductImage
                            productId={
                              product.id
                            }
                            product={
                              product
                            }
                            variant="card"
                            className="h-full w-full object-contain"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/product/${product.slug}`}
                            className="
                              block
                              text-sm
                              font-semibold
                              leading-snug
                              text-brand-brown
                              transition-colors
                              hover:text-brand-red
                            "
                          >
                            {product.name}
                          </Link>

                          <p className="mt-0.5 text-[11px] text-brand-brown/55 sm:text-xs">
                            {packLabel} ×{' '}
                            {quantity}
                          </p>

                          <p className="mt-1 text-sm font-bold text-brand-red">
                            {formatPrice(
                              lineTotal,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Price summary */}

              <div className="space-y-3 pt-1 text-sm">
                <div className="flex justify-between gap-4 text-brand-brown/70">
                  <span>
                    Items
                  </span>

                  <span className="text-right font-medium">
                    {formatPrice(
                      resolvedSubtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 font-medium text-brand-green">
                  <span>
                    Shipping
                  </span>

                  <span className="text-right">
                    Free
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-brand-brown/10 pt-4 text-lg font-bold text-brand-brown">
                  <span>
                    Total
                  </span>

                  <span className="whitespace-nowrap text-brand-red">
                    {formatPrice(
                      resolvedTotal,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-brand-brown/5 pt-4 text-[10px] font-medium text-brand-green sm:text-xs">
                <ShoppingBag className="h-3.5 w-3.5" />

                <span>
                  Free shipping included
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-brand-brown/50 sm:text-xs">
                <Lock className="h-3.5 w-3.5" />

                <span>
                  Secure payment powered by Razorpay
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
