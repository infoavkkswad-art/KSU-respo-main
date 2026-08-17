import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { SEO } from '../components/SEO';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../context/CartContext';
import { PACK_LABELS } from '../data/products';

export default function OrderSuccess() {
  const { lastOrder } = useOrder();

  if (!lastOrder) {
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
            We could not find your recent order details,
            or the session has expired.
          </p>

          <div className="mt-8">
            <Link
              to="/shop"
              className="
                btn-primary
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

  const totalUnits =
    lastOrder.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

  /*
   * Customer-facing pricing rule:
   *
   * The website selling price is already the final
   * price paid by the customer and includes shipping.
   *
   * Therefore OrderSuccess must NEVER add or display
   * a separate shipping charge.
   */
  const customerTotal =
    Number.isFinite(lastOrder.total)
      ? lastOrder.total
      : 0;

  const customerSubtotal =
    Number.isFinite(lastOrder.subtotal)
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
          {/* ============================================================
              SUCCESS ICON
          ============================================================ */}

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
              {lastOrder.customer.phone}
            </strong>{' '}
            regarding the next steps.
          </p>

          {/* ============================================================
              ORDER SUMMARY
          ============================================================ */}

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
            {/* Order ID */}

            <div className="flex justify-between gap-4 border-b border-brand-brown/10 pb-4">
              <span className="text-sm text-brand-brown/60">
                Order ID
              </span>

              <span className="break-all text-right font-mono text-sm font-semibold text-brand-brown">
                {lastOrder.orderId}
              </span>
            </div>

            {/* Total Units */}

            <div className="flex justify-between gap-4 border-b border-brand-brown/10 py-4">
              <span className="text-sm text-brand-brown/60">
                Total Units
              </span>

              <span className="font-semibold text-brand-brown">
                {totalUnits} item
                {totalUnits !== 1
                  ? 's'
                  : ''}
              </span>
            </div>

            {/* ==========================================================
                ORDERED ITEMS
            =========================================================== */}

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
                {lastOrder.items.map(
                  (item, index) => {
                    const name =
                      item.productNameSnapshot ||
                      `SKU: ${item.sku}`;

                    const packLabel =
                      item.packSizeSnapshot
                        ? PACK_LABELS[
                            item
                              .packSizeSnapshot
                          ] ||
                          `${item.packSizeSnapshot}g`
                        : '';

                    const lineTotal =
                      typeof item.unitPrice ===
                        'number' &&
                      Number.isFinite(
                        item.unitPrice,
                      )
                        ? item.unitPrice *
                          item.quantity
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
                            {packLabel &&
                              `${packLabel} · `}
                            Qty: {item.quantity}
                          </p>
                        </div>

                        {lineTotal !==
                          undefined && (
                          <span className="shrink-0 whitespace-nowrap font-medium text-brand-brown">
                            {formatPrice(
                              lineTotal,
                            )}
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* ==========================================================
                CUSTOMER-FACING PRICE BREAKDOWN
            =========================================================== */}

            <div className="space-y-3 pt-4 text-sm">
              <div className="flex justify-between gap-4 text-brand-brown/65">
                <span>
                  Product total
                </span>

                <span className="whitespace-nowrap">
                  {formatPrice(
                    customerSubtotal,
                  )}
                </span>
              </div>

              {/* Shipping is intentionally FREE and not calculated separately. */}

              <div className="flex items-center justify-between gap-4 text-green-700">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping
                </span>

                <span className="font-semibold">
                  Free
                </span>
              </div>

              {/* Final amount */}

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
                  {formatPrice(
                    customerTotal,
                  )}
                </span>
              </div>
            </div>

            {/* ==========================================================
                PRICE / SHIPPING NOTICE
            =========================================================== */}

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
                Free shipping included in your
                displayed product prices.
              </p>
            </div>
          </div>

          {/* ============================================================
              ACTIONS
          ============================================================ */}

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

          {/* ============================================================
              CUSTOMER INFORMATION
          ============================================================ */}

          <p className="mx-auto mt-6 max-w-xl text-2xs leading-relaxed text-brand-brown/45">
            Please keep your order ID for future
            communication regarding your order.
          </p>
        </div>
      </section>
    </>
  );
}
