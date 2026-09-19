import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { SEO } from '../components/SEO';
import { formatPrice } from '../context/CartContext';
import { PACK_LABELS } from '../data/products';
import {
  apiClient,
  type TrackedOrder,
} from '../services/api-client';
import {
  normalizeOrderId,
  normalizePhone,
  readPhoneForOrderId,
  saveOrderLookup,
} from '../utils/order-lookup';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = normalizeOrderId(
    searchParams.get('orderId') ?? '',
  );

  const [phoneDraft, setPhoneDraft] = useState('');
  const [phone, setPhone] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(
    null,
  );
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setPhone(null);
      setOrder(null);
      setLoading(false);
      setError('');
      return;
    }

    const stored = readPhoneForOrderId(orderId);
    setPhone(stored);
    setOrder(null);
    setError('');
    setLoading(Boolean(stored));
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !phone) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    apiClient
      .trackOrder(orderId, phone)
      .then((tracked) => {
        if (cancelled) {
          return;
        }

        setOrder(tracked);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }

        setOrder(null);
        setLoading(false);
        setError(
          caught instanceof Error && caught.message
            ? caught.message
            : 'We could not load your order from the server.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, phone]);

  const submitPhone = (event: FormEvent) => {
    event.preventDefault();

    const nextPhone = normalizePhone(phoneDraft);

    if (!/^[6-9]\d{9}$/.test(nextPhone)) {
      setError(
        'Please enter the 10-digit mobile number used at checkout.',
      );
      return;
    }

    saveOrderLookup({
      orderId,
      phone: nextPhone,
    });
    setError('');
    setPhone(nextPhone);
  };

  if (!orderId) {
    return (
      <UnavailableState
        detail="We could not find your recent order details, or the session has expired."
      />
    );
  }

  if (!phone) {
    return (
      <>
        <SEO
          title="Confirm Order"
          description="Enter the mobile number used at checkout to view your order."
          path="/order-success"
          indexable={false}
        />

        <section className="container-max container-px py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <ShoppingBag className="h-10 w-10 text-brand-brown/30" />
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold text-brand-brown">
            Confirm your order
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-brand-brown/60">
            Enter the 10-digit mobile number used at
            checkout to load this order from our records.
          </p>

          <form
            id="order-success-lookup-form"
            onSubmit={submitPhone}
            className="mx-auto mt-8 max-w-sm text-left"
          >
            <label
              htmlFor="order-success-phone"
              className="text-sm font-medium text-brand-brown"
            >
              Mobile number
            </label>
            <input
              id="order-success-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phoneDraft}
              onChange={(event) =>
                setPhoneDraft(event.target.value)
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-brand-brown/15
                px-4
                py-3
                text-sm
                text-brand-brown
                outline-none
                focus:border-brand-brown/40
              "
            />

            {error && (
              <p className="mt-2 text-sm text-brand-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="
                btn-primary
                mt-6
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
              "
            >
              View order
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SEO
          title="Order Received"
          description="Loading your Kawad Swad order."
          path="/order-success"
          indexable={false}
        />

        <section className="container-max container-px py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-10 w-10 text-green-600/40" />
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold text-brand-brown">
            Loading your order
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-brand-brown/60">
            Fetching confirmation from our records.
          </p>
        </section>
      </>
    );
  }

  if (!order) {
    return (
      <UnavailableState
        detail={
          error ||
          'We could not load this order from our records. If money was deducted, keep your Order ID and contact support.'
        }
        onRetryPhone={() => {
          setPhone(null);
          setError('');
          setPhoneDraft('');
        }}
      />
    );
  }

  const lastOrder = order;
  const contactPhone = phone;
  const totalUnits = lastOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  /*
   * Totals come from GET /api/orders/{orderId}?phone=.
   * Shipping is the server charge (₹0 on free PINs).
   */
  const customerTotal = Number.isFinite(lastOrder.total)
    ? lastOrder.total
    : 0;

  const shippingTotal = Number.isFinite(lastOrder.shipping)
    ? lastOrder.shipping
    : 0;

  const customerSubtotal = Number.isFinite(
    lastOrder.subtotal,
  )
    ? lastOrder.subtotal
    : customerTotal;

  return (
    <>
      <SEO
        title="Order Received"
        description="Your Kawad Swad order has been successfully received."
        path="/order-success"
        indexable={false}
      />

      <section className="container-max container-px py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-soft">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <p className="section-eyebrow mt-6">
            Thank You
          </p>

          <h1
            className="
              mt-2
              font-serif
              text-4xl
              font-bold
              text-brand-brown
              sm:text-5xl
            "
          >
            Order received
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-brand-brown/65 sm:text-base">
            Your order has been successfully recorded.
            We will contact you on{' '}
            <strong className="font-semibold text-brand-brown">
              {contactPhone}
            </strong>{' '}
            regarding the next steps.
          </p>

          <div
            className="
              card
              mt-8
              border
              border-brand-brown/5
              bg-white
              p-5
              text-left
              shadow-soft
              sm:p-6
            "
          >
            <div className="flex justify-between gap-4 border-b border-brand-brown/10 pb-4">
              <span className="text-sm text-brand-brown/60">
                Order ID
              </span>

              <span className="break-all text-right font-mono text-sm font-semibold text-brand-brown">
                {lastOrder.orderId}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-brand-brown/10 py-4">
              <span className="text-sm text-brand-brown/60">
                Total Units
              </span>

              <span className="font-semibold text-brand-brown">
                {totalUnits} item
                {totalUnits !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="border-b border-brand-brown/10 py-4">
              <p
                className="
                  mb-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-brand-brown/50
                "
              >
                Ordered Items
              </p>

              <div className="space-y-3">
                {lastOrder.items.map((item, index) => {
                  const name =
                    item.productNameSnapshot ||
                    `SKU: ${item.sku}`;

                  const packLabel = item.packSizeSnapshot
                    ? PACK_LABELS[item.packSizeSnapshot] ||
                      `${item.packSizeSnapshot}g`
                    : '';

                  const lineTotal =
                    typeof item.unitPrice === 'number' &&
                    Number.isFinite(item.unitPrice)
                      ? item.unitPrice * item.quantity
                      : undefined;

                  return (
                    <div
                      key={`${item.sku}-${index}`}
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        text-sm
                      "
                    >
                      <div className="min-w-0">
                        <p className="leading-relaxed text-brand-brown/75">
                          {name}
                        </p>

                        <p className="mt-0.5 text-xs text-brand-brown/45">
                          {packLabel && `${packLabel} · `}
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {lineTotal !== undefined && (
                        <span className="shrink-0 whitespace-nowrap font-medium text-brand-brown">
                          {formatPrice(lineTotal)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-4 text-sm">
              <div className="flex justify-between gap-4 text-brand-brown/65">
                <span>Product total</span>

                <span className="whitespace-nowrap">
                  {formatPrice(customerSubtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-green-700">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping
                </span>

                <span className="font-semibold">
                  {shippingTotal > 0
                    ? formatPrice(shippingTotal)
                    : 'Free'}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                  border-t
                  border-brand-brown/10
                  pt-4
                "
              >
                <span className="text-sm font-semibold text-brand-brown">
                  Order Total
                </span>

                <span className="whitespace-nowrap text-lg font-bold text-brand-red">
                  {formatPrice(customerTotal)}
                </span>
              </div>
            </div>

            <div
              className="
                mt-5
                rounded-xl
                border
                border-green-100
                bg-green-50
                px-4
                py-3
                text-center
              "
            >
              <p className="text-xs font-semibold text-green-700">
                {shippingTotal > 0
                  ? 'Payable amount charged at payment.'
                  : 'No shipping charge for this order.'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/track-order"
              className="
                btn-primary
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
              "
            >
              <Truck className="h-4 w-4" />
              Track Order Status
            </Link>

            <Link
              to="/shop"
              className="
                btn-outline
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
              "
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-2xs leading-relaxed text-brand-brown/45">
            Please keep your order ID for future
            communication regarding your order.
          </p>
        </div>
      </section>
    </>
  );
}

function UnavailableState({
  detail,
  onRetryPhone,
}: {
  detail: string;
  onRetryPhone?: () => void;
}) {
  return (
    <>
      <SEO
        title="Order Unavailable"
        description="Order information is currently unavailable."
        path="/order-success"
        indexable={false}
      />

      <section className="container-max container-px py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <ShoppingBag className="h-10 w-10 text-brand-brown/30" />
        </div>

        <h1 className="mt-4 font-serif text-3xl font-bold text-brand-brown">
          Order information unavailable
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-brand-brown/60">
          {detail}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetryPhone && (
            <button
              type="button"
              onClick={onRetryPhone}
              className="
                btn-primary
                inline-flex
                items-center
                justify-center
                gap-2
              "
            >
              Try another number
            </button>
          )}

          <Link
            to="/track-order"
            className={`
              ${onRetryPhone ? 'btn-outline' : 'btn-primary'}
              inline-flex
              items-center
              justify-center
              gap-2
            `}
          >
            Track Order
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/shop"
            className="
              btn-outline
              inline-flex
              items-center
              justify-center
              gap-2
            "
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
