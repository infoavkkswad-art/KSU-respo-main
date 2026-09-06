import { useState, type FormEvent } from 'react';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { SEO } from '../components/SEO';
import {
  apiClient,
  type TrackedOrder,
} from '../services/api-client';
import { formatPrice } from '../context/CartContext';
import { PACK_LABELS } from '../data/products';

const STATUS_STEPS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
] as const;

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    desc: string;
  }
> = {
  pending: {
    label: 'Order Request Received',
    desc: 'Your order request has been securely recorded and is awaiting review.',
  },
  confirmed: {
    label: 'Order Confirmed',
    desc: 'Your order has been verified and confirmed for preparation.',
  },
  processing: {
    label: 'Processing & Packing',
    desc: 'Your papads are being carefully packed in airtight packaging.',
  },
  shipped: {
    label: 'Shipped',
    desc: 'Your order is on its way with our logistics partner.',
  },
  delivered: {
    label: 'Delivered',
    desc: 'Your order has been successfully delivered.',
  },
  cancelled: {
    label: 'Cancelled',
    desc: 'This order has been cancelled.',
  },
};

function formatOrderDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

export default function TrackOrder() {
  const [orderIdInput, setOrderIdInput] =
    useState('');

  const [phoneInput, setPhoneInput] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [orderData, setOrderData] =
    useState<TrackedOrder | null>(null);

  const handleTrack = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const orderId =
      orderIdInput.trim();

    const phone =
      phoneInput.trim();

    setError('');

    if (!orderId) {
      setError(
        'Please enter your Order ID.',
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      setError(
        'Please enter a valid 10-digit Indian phone number.',
      );
      return;
    }

    setLoading(true);
    setOrderData(null);

    try {
      const result =
        await apiClient.trackOrder(
          orderId,
          phone,
        );

      setOrderData(result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to retrieve order details. Please verify your details and try again.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus =
    orderData?.status;

  const currentIndex =
    currentStatus &&
    currentStatus !== 'cancelled'
      ? STATUS_STEPS.indexOf(
          currentStatus as
            (typeof STATUS_STEPS)[number],
        )
      : -1;

  const displayedSubtotal =
    orderData &&
    Number.isFinite(
      orderData.subtotal,
    )
      ? orderData.subtotal
      : 0;

  const displayedTotal =
    orderData &&
    Number.isFinite(
      orderData.total,
    )
      ? orderData.total
      : displayedSubtotal;

  return (
    <>
      <SEO
        title="Track Order"
        description="Check the live status of your Kawad Swad papad order."
        path="/track-order"
      />

      <div className="container-max container-px py-10 lg:py-14">
        <div className="mx-auto max-w-2xl">
          {/* ==============================================================
              PAGE HEADER
          =============================================================== */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10">
              <Package className="h-6 w-6 text-brand-red" />
            </div>

            <h1 className="font-serif text-3xl font-bold text-brand-brown">
              Track Your Order
            </h1>

            <p className="mt-1 text-sm text-brand-brown/60">
              Enter your Order ID and registered
              phone number to view your order
              status and order details.
            </p>
          </div>

          {/* ==============================================================
              TRACK FORM
          =============================================================== */}

          <form
            onSubmit={handleTrack}
            noValidate
            className="card mb-8 space-y-4 border border-brand-brown/5 bg-white p-5 shadow-soft sm:p-8"
          >
            <div>
              <label
                htmlFor="orderId"
                className="mb-1 block text-sm font-medium text-brand-brown/80"
              >
                Order ID{' '}
                <span className="text-brand-red">
                  *
                </span>
              </label>

              <input
                id="orderId"
                type="text"
                value={orderIdInput}
                onChange={(e) => {
                  setOrderIdInput(
                    e.target.value,
                  );
                  setError('');
                }}
                placeholder="e.g. KS-123456ABC"
                autoComplete="off"
                spellCheck={false}
                className="
                  w-full
                  rounded-lg
                  border
                  border-brand-brown/20
                  px-4
                  py-2.5
                  text-sm
                  font-mono
                  uppercase
                  text-brand-brown
                  outline-none
                  transition
                  focus:border-brand-red/40
                  focus:ring-2
                  focus:ring-brand-red/20
                "
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-brand-brown/80"
              >
                Registered Phone Number{' '}
                <span className="text-brand-red">
                  *
                </span>
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(
                    e.target.value.replace(
                      /\D/g,
                      '',
                    ),
                  );
                  setError('');
                }}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                className="
                  w-full
                  rounded-lg
                  border
                  border-brand-brown/20
                  px-4
                  py-2.5
                  text-sm
                  text-brand-brown
                  outline-none
                  transition
                  focus:border-brand-red/40
                  focus:ring-2
                  focus:ring-brand-red/20
                "
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="
                  flex
                  items-start
                  gap-2
                  rounded-lg
                  bg-red-50
                  p-3
                  text-sm
                  text-red-700
                "
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                btn-primary
                flex
                w-full
                items-center
                justify-center
                gap-2
                py-3
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  <span>
                    Searching...
                  </span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />

                  <span>
                    Track Order
                  </span>
                </>
              )}
            </button>
          </form>

          {/* ==============================================================
              ORDER RESULT
          =============================================================== */}

          {orderData && (
            <div className="card animate-fade-in space-y-6 border border-brand-brown/5 bg-white p-5 shadow-soft sm:p-8">
              {/* ----------------------------------------------------------
                  ORDER HEADER
              ----------------------------------------------------------- */}

              <div className="flex flex-col items-start justify-between gap-3 border-b border-brand-brown/10 pb-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs uppercase tracking-wider text-brand-brown/50">
                    Order Reference
                  </span>

                  <h2 className="break-all font-mono text-xl font-bold text-brand-brown">
                    {orderData.orderId}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs uppercase tracking-wider text-brand-brown/50">
                    Placed On
                  </span>

                  <p className="text-sm font-medium text-brand-brown/80">
                    {formatOrderDate(
                      orderData.createdAt,
                    )}
                  </p>
                </div>
              </div>

              {/* ----------------------------------------------------------
                  STATUS BANNER
              ----------------------------------------------------------- */}

              <div className="flex items-start gap-3 rounded-xl border border-brand-brown/10 bg-brand-sand/50 p-4">
                {orderData.status ===
                'cancelled' ? (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                ) : (
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                )}

                <div>
                  <h3 className="font-semibold text-brand-brown">
                    {STATUS_LABELS[
                      orderData.status
                    ]?.label ||
                      orderData.status}
                  </h3>

                  <p className="mt-0.5 text-xs text-brand-brown/70">
                    {STATUS_LABELS[
                      orderData.status
                    ]?.desc ||
                      'Your order is being processed.'}
                  </p>
                </div>
              </div>

              {/* ----------------------------------------------------------
                  STATUS TIMELINE
              ----------------------------------------------------------- */}

              {orderData.status !==
                'cancelled' && (
                <div className="py-2">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-brown/50">
                    Progress Timeline
                  </h4>

                  <div className="grid grid-cols-5 gap-1 text-center">
                    {STATUS_STEPS.map(
                      (
                        status,
                        index,
                      ) => {
                        const isCompleted =
                          currentIndex >=
                          index;

                        return (
                          <div
                            key={status}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                text-xs
                                font-bold
                                ${
                                  isCompleted
                                    ? 'bg-brand-red text-white'
                                    : 'bg-brand-brown/10 text-brand-brown/40'
                                }
                              `}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>

                            <span className="mt-1 hidden text-2xs capitalize text-brand-brown/70 sm:block">
                              {status}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------
                  CANCELLED STATE
              ----------------------------------------------------------- */}

              {orderData.status ===
                'cancelled' && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  This order is currently
                  marked as cancelled. Please
                  contact Kawad Swad if you
                  believe this is incorrect.
                </div>
              )}

              {/* ----------------------------------------------------------
                  CUSTOMER SUMMARY
              ----------------------------------------------------------- */}

              <div className="flex flex-col gap-2 rounded-lg bg-brand-brown/5 p-3 text-xs text-brand-brown/60 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Customer:{' '}
                  <strong className="text-brand-brown">
                    {
                      orderData
                        .customer
                        .fullName
                    }
                  </strong>{' '}
                  (
                  {
                    orderData
                      .customer
                      .phoneMasked
                  }
                  )
                </span>

                <span>
                  {
                    orderData
                      .customer
                      .city
                  }
                  ,{' '}
                  {
                    orderData
                      .customer
                      .state
                  }
                </span>
              </div>

              {/* ----------------------------------------------------------
                  ITEMS SNAPSHOT
              ----------------------------------------------------------- */}

              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-brown/50">
                  Ordered Items
                </h4>

                <div className="space-y-3">
                  {orderData.items.map(
                    (
                      item,
                      index,
                    ) => {
                      const packLabel =
                        PACK_LABELS[
                          item
                            .packSizeSnapshot
                        ] ||
                        `${item.packSizeSnapshot}g`;

                      const unitPrice =
                        Number.isFinite(
                          item.unitPrice,
                        ) &&
                        item.unitPrice >=
                          0
                          ? item.unitPrice
                          : 0;

                      const lineTotal =
                        unitPrice *
                        item.quantity;

                      return (
                        <div
                          key={`${item.sku}-${index}`}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            border-b
                            border-brand-brown/10
                            pb-2
                            text-sm
                            last:border-0
                          "
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-brand-brown">
                              {item.productNameSnapshot ||
                                item.sku}
                            </p>

                            <p className="text-xs text-brand-brown/50">
                              {packLabel} ×{' '}
                              {
                                item.quantity
                              }
                            </p>
                          </div>

                          <span className="shrink-0 whitespace-nowrap font-medium text-brand-brown">
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

              {/* ----------------------------------------------------------
                  TOTALS
              ----------------------------------------------------------- */}

              <div className="space-y-2 border-t border-brand-brown/10 pt-4 text-sm">
                <div className="flex justify-between gap-4 text-brand-brown/65">
                  <span>
                    Product total
                  </span>

                  <span className="whitespace-nowrap">
                    {formatPrice(
                      displayedSubtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-green-700">
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping
                  </span>

                  <span className="font-semibold">
                    Free
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-brand-brown/10 pt-3 text-lg font-bold">
                  <span>
                    Total
                  </span>

                  <span className="whitespace-nowrap text-brand-red">
                    {formatPrice(
                      displayedTotal,
                    )}
                  </span>
                </div>
              </div>

              {/* ----------------------------------------------------------
                  CUSTOMER-FACING SHIPPING NOTICE
              ----------------------------------------------------------- */}

              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-green-700">
                  Free shipping is included
                  in your displayed product
                  prices.
                </p>
              </div>

              {/* ----------------------------------------------------------
                  SECURITY + SHOPPING
              ----------------------------------------------------------- */}

              <div className="flex flex-col items-start justify-between gap-3 border-t border-brand-brown/10 pt-4 text-xs text-brand-brown/50 sm:flex-row sm:items-center">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified Secure Order Record
                </span>

                <Link
                  to="/shop"
                  className="text-brand-red hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {/* ==============================================================
              BACK HOME
          =============================================================== */}

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-brand-brown/65 hover:text-brand-red"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}