import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingBag,
} from 'lucide-react';

import { SEO } from '../components/SEO';
import {
  FormField,
  FormStatusMessage,
  SubmitButton,
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

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () =>
        resolve(true),
      );

      existingScript.addEventListener('error', () =>
        resolve(false),
      );

      return;
    }

    const script = document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

/* ============================================================================
 * CHECKOUT VALIDATION
 * ========================================================================== */

function validateCheckoutCustomer(
  customer: CustomerInfo,
): string[] {
  const errors: string[] = [];

  const fullName = customer.fullName.trim();
  const phone = customer.phone.trim();
  const email = customer.email.trim();
  const address = customer.address.trim();
  const city = customer.city.trim();
  const state = customer.state.trim();
  const pincode = customer.pincode.trim();

  /* Full name */

  if (!fullName) {
    errors.push('Please enter your full name.');
  } else if (fullName.length < 4) {
    errors.push(
      'Full name must contain at least 4 characters.',
    );
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(fullName)
  ) {
    errors.push(
      'Please enter a valid name using letters only.',
    );
  }

  /* Phone */

  if (!phone) {
    errors.push('Please enter your mobile number.');
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.push(
      'Please enter a valid 10-digit Indian mobile number.',
    );
  }

  /* Email */

  if (!email) {
    errors.push('Please enter your email address.');
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    errors.push(
      'Please enter a valid email address.',
    );
  }

  /* Address */

  if (!address) {
    errors.push('Please enter your delivery address.');
  } else if (address.length < 10) {
    errors.push(
      'Delivery address must contain at least 10 characters.',
    );
  }

  /* City */

  if (!city) {
    errors.push('Please enter your city.');
  } else if (city.length < 4) {
    errors.push(
      'City name must contain at least 4 characters.',
    );
  } else if (
    !/^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(city)
  ) {
    errors.push(
      'Please enter a valid city name.',
    );
  }

  /* State */

  if (!state) {
    errors.push('Please select your state.');
  } else if (
    !INDIAN_STATES_AND_UTS.includes(state)
  ) {
    errors.push(
      'Please select a valid Indian state or union territory.',
    );
  }

  /* PIN */

  if (!pincode) {
    errors.push('Please enter your PIN code.');
  } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    errors.push(
      'Please enter a valid 6-digit Indian PIN code.',
    );
  }

  return errors;
}

/* ============================================================================
 * CHECKOUT PAGE
 * ========================================================================== */

export default function Checkout() {
  const {
    items,
    subtotal,
    shippingTotal,
    total,
    clearCart,
  } = useCart();

  const orderContext = useOrder();

  const navigate = useNavigate();

  const form = useFormState(initial);

  const [error, setError] = useState('');

  /* ==========================================================================
   * RESOLVE PRODUCTS
   * ======================================================================== */

  const resolvedItems = items.map((item) => {
    const res = ProductService.getProductBySku(
      item.sku,
    );

    return {
      ...item,
      product: res?.family,
      skuObj: res?.skuObj,
    };
  });

  /* ==========================================================================
   * SUBMIT
   * ======================================================================== */

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (
      items.length === 0 ||
      form.status === 'submitting'
    ) {
      return;
    }

    setError('');

    const sharedValid = form.validate({
      fullName: validators.required(),
      phone: validators.phone(),
      email: validators.email(),
      address: validators.required(),
      city: validators.required(),
      state: validators.required(),
      pincode: validators.pincode(),
    });

    const validationErrors =
      validateCheckoutCustomer(form.values);

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

      return;
    }

    form.setStatus('submitting');

    try {
      /* 1. CREATE BACKEND ORDER */

      const idempotencyKey =
        `idemp-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      const orderResponse =
        await apiClient.createOrder({
          customer: form.values,
          items,
          idempotencyKey,
        });

      /* 2. LOAD RAZORPAY */

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

      /* 3. OPEN RAZORPAY */

      const options = {
        key: orderResponse.razorpayKeyId,

        amount: orderResponse.amount,

        currency:
          orderResponse.currency || 'INR',

        name: 'Kawad Swad Udhyog',

        description:
          'Authentic Traditional Papad Order',

        order_id:
          orderResponse.razorpayOrderId,

        prefill: {
          name: form.values.fullName,

          email:
            form.values.email ||
            'kswadu2025@gmail.com',

          contact: form.values.phone,
        },

        theme: {
          color: '#D97706',
        },

        /* PAYMENT SUCCESS */

        handler: async (
          response: any,
        ) => {
          try {
            console.log(
              'Razorpay payment response received:',
              response,
            );

            /* 4. VERIFY PAYMENT */

            const verifyRes =
              await apiClient.verifyPayment({
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              });

            console.log(
              'Razorpay payment verified:',
              verifyRes,
            );

            /* 5. BUILD COMPLETED ORDER */

            const completedOrder = {
              orderId:
                verifyRes?.orderId ||
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
                orderResponse.createdAt ||
                new Date().toISOString(),

              status:
                'confirmed' as const,
            };

            /* 6. SAVE COMPLETED ORDER */

            orderContext.setCompletedOrder(
              completedOrder,
            );

            /* 7. CLEAR CART */

            if (
              typeof clearCart === 'function'
            ) {
              clearCart();
            }

            /* 8. SUCCESS */

            form.setStatus('success');

            navigate(
              '/order-success',
              {
                replace: true,
              },
            );
          } catch (err: unknown) {
            console.error(
              'PAYMENT SUCCESS HANDLER ERROR:',
              err,
            );

            let msg =
              'Payment verification failed.';

            if (
              err instanceof Error &&
              err.message
            ) {
              msg = err.message;
            }

            setError(msg);

            form.setStatus('error');
          }
        },

        /* PAYMENT WINDOW CLOSED */

        modal: {
          ondismiss: () => {
            form.setStatus('idle');

            setError(
              'Payment was cancelled or dismissed. You can retry anytime.',
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();
    } catch (err: unknown) {
      console.error(
        'CHECKOUT ERROR:',
        err,
      );

      let msg =
        'We could not submit your order right now. Please try again.';

      if (
        err instanceof Error &&
        err.message
      ) {
        msg = err.message;
      }

      setError(msg);

      form.setStatus('error');
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

        <div className="container-max container-px py-20 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-brand-brown/20" />

          <h1 className="text-3xl font-serif font-bold mt-4">
            Your cart is empty
          </h1>

          <Link
            to="/shop"
            className="btn-primary mt-6"
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

      <div className="bg-brand-cream py-12">
        <div className="container-max container-px">

          {/* Breadcrumb */}

          <div className="flex items-center gap-2 text-xs text-brand-brown/50 mb-6">
            <Link
              to="/cart"
              className="hover:text-brand-red"
            >
              Cart
            </Link>

            <ArrowRight className="w-3 h-3" />

            <span>Checkout</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">

            {/* =================================================================
                CHECKOUT FORM
            ================================================================== */}

            <form
              onSubmit={submit}
              noValidate
              className="card p-8 bg-white border border-brand-brown/5 shadow-soft"
            >

              {/* Header */}

              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-brown/10">

                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-brand-red" />
                </div>

                <div>
                  <h1 className="text-2xl font-serif font-bold text-brand-brown">
                    Delivery Details & Payment
                  </h1>

                  <p className="text-sm text-brand-brown/60">
                    Provide your shipping information and complete secure payment.
                  </p>
                </div>

              </div>

              <FormContainer>

                {/* Full Name */}

                <FormField
                  label="Full Name"
                  name="fullName"
                  value={
                    form.values.fullName
                  }
                  onChange={(v) =>
                    form.setValue(
                      'fullName',
                      v,
                    )
                  }
                  error={
                    form.errors.fullName
                  }
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />

                {/* Phone + Email */}

                <div className="grid sm:grid-cols-2 gap-4">

                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={
                      form.values.phone
                    }
                    onChange={(v) =>
                      form.setValue(
                        'phone',
                        v,
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
                    onChange={(v) =>
                      form.setValue(
                        'email',
                        v,
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

                {/* Address */}

                <FormField
                  label="Address"
                  name="address"
                  type="textarea"
                  value={
                    form.values.address
                  }
                  onChange={(v) =>
                    form.setValue(
                      'address',
                      v,
                    )
                  }
                  error={
                    form.errors.address
                  }
                  required
                  placeholder="House number, street, landmark"
                  rows={3}
                />

                {/* City / State / PIN */}

                <div className="grid sm:grid-cols-3 gap-4">

                  {/* City */}

                  <FormField
                    label="City"
                    name="city"
                    value={
                      form.values.city
                    }
                    onChange={(v) =>
                      form.setValue(
                        'city',
                        v,
                      )
                    }
                    error={
                      form.errors.city
                    }
                    required
                    placeholder="City"
                  />

                  {/* State Dropdown */}

                  <div className="space-y-2">

                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-brand-brown"
                    >
                      State
                      <span className="text-brand-red ml-1">
                        *
                      </span>
                    </label>

                    <select
                      id="state"
                      name="state"
                      value={
                        form.values.state
                      }
                      onChange={(e) => {
                        form.setValue(
                          'state',
                          e.target.value,
                        );

                        setError('');
                      }}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-brand-brown outline-none transition focus:ring-2 focus:ring-brand-red/20 ${
                        form.errors.state
                          ? 'border-brand-red'
                          : 'border-brand-brown/15'
                      }`}
                      aria-invalid={
                        Boolean(
                          form.errors.state,
                        )
                      }
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
                        {form.errors.state}
                      </p>
                    )}

                  </div>

                  {/* PIN */}

                  <FormField
                    label="PIN Code"
                    name="pincode"
                    type="text"
                    value={
                      form.values.pincode
                    }
                    onChange={(v) =>
                      form.setValue(
                        'pincode',
                        v,
                      )
                    }
                    error={
                      form.errors.pincode
                    }
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6 digits"
                  />

                </div>

              </FormContainer>

              {/* Error */}

              {error && (
                <div className="mt-6">
                  <FormStatusMessage
                    status="error"
                    successMsg=""
                    errorMsg={error}
                  />
                </div>
              )}

              {/* Bottom controls */}

              <div className="mt-8 pt-6 border-t border-brand-brown/10 flex flex-col sm:flex-row gap-4 items-center justify-between">

                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 text-sm text-brand-brown/70 hover:text-brand-red font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />

                  Back to cart
                </Link>

                <SubmitButton
                  status={form.status}
                  label="Proceed to Pay"
                />

              </div>

              <p className="mt-6 text-2xs text-brand-brown/50 text-center">
                Secure Razorpay payment gateway integration.
              </p>

            </form>

            {/* =================================================================
                ORDER SUMMARY
            ================================================================== */}

            <aside className="card p-8 bg-white border border-brand-brown/5 lg:sticky lg:top-28 shadow-soft">

              <h2 className="text-xl font-serif font-bold text-brand-brown mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">

                {resolvedItems.map(
                  ({
                    sku,
                    quantity,
                    product,
                    skuObj,
                  }) => {

                    if (
                      !product ||
                      !skuObj
                    ) {
                      return null;
                    }

                    const packLabel =
                      PACK_LABELS[
                        skuObj.packSize
                      ] ||
                      `${skuObj.packSize}g`;

                    return (
                      <div
                        key={sku}
                        className="flex justify-between gap-4 text-sm pb-3 border-b border-brand-brown/5"
                      >

                        <span className="text-brand-brown/70">
                          {product.name} (
                          {packLabel}
                          ) × {quantity}
                        </span>

                        <span className="font-semibold text-brand-brown whitespace-nowrap">
                          {formatPrice(
                            skuObj.websitePrice *
                              quantity,
                          )}
                        </span>

                      </div>
                    );
                  },
                )}

              </div>

              <div className="space-y-3 text-sm pt-2">

                <div className="flex justify-between text-brand-brown/70">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(
                      subtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-brand-brown/70">
                  <span>
                    Shipping
                  </span>

                  <span>
                    {shippingTotal
                      ? formatPrice(
                          shippingTotal,
                        )
                      : 'Free'}
                  </span>
                </div>

                <div className="border-t border-brand-brown/10 pt-4 flex justify-between text-lg font-bold text-brand-brown">

                  <span>
                    Total
                  </span>

                  <span className="text-brand-red">
                    {formatPrice(total)}
                  </span>

                </div>

              </div>

            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
