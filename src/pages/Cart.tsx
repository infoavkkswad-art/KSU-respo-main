import { Link } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

import { SEO } from '../components/SEO';
import {
  useCart,
  formatPrice,
} from '../context/CartContext';

import { ProductService } from '../services/product-service';
import { PACK_LABELS } from '../data/products';
import { ProductImage } from '../components/ProductImage';

export default function Cart() {
  const {
    items,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    addItem,
  } = useCart();

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

  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review your Kawad Swad papad order before checkout."
        path="/cart"
        indexable={false}
      />

      {/* ================================================================
          CART HERO
      ================================================================= */}

      <div className="bg-brand-cream py-10 sm:py-12 lg:py-16">
        <div className="container-max container-px text-center">
          <h1
            className="
              mb-3
              font-serif
              text-3xl
              font-bold
              text-brand-brown
              sm:mb-4
              sm:text-4xl
              lg:text-5xl
            "
          >
            Your Shopping Cart
          </h1>

          <p
            className="
              mx-auto
              max-w-lg
              text-sm
              text-brand-brown/70
              sm:text-base
            "
          >
            Review your selected papads and proceed
            to checkout when you are ready.
          </p>
        </div>
      </div>

      {/* ================================================================
          CART CONTENT
      ================================================================= */}

      <section className="container-max container-px py-8 sm:py-10 lg:py-12">
        {items.length === 0 ? (
          /* ==============================================================
             EMPTY CART
          =============================================================== */

          <div
            className="
              card
              mx-auto
              max-w-xl
              border
              border-brand-brown/5
              bg-white
              p-8
              text-center
              shadow-soft
              sm:p-12
            "
          >
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-brand-brown/20" />

            <h2
              className="
                mb-2
                font-serif
                text-xl
                font-bold
                text-brand-brown
                sm:text-2xl
              "
            >
              Your cart is empty
            </h2>

            <p className="mb-6 text-sm text-brand-brown/60">
              Explore our authentic papads and find
              your next favourite flavour.
            </p>

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
              Browse Papads
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              items-start
              gap-6
              lg:grid-cols-[1fr_400px]
              lg:gap-12
            "
          >
            {/* ==========================================================
                CART ITEMS
            =========================================================== */}

            <div className="space-y-3 sm:space-y-4">
              {resolvedItems.map(
                ({
                  sku,
                  quantity,
                  product,
                  skuObj,
                }) => {
                  if (!product || !skuObj) {
                    return null;
                  }

                  const packLabel =
                    PACK_LABELS[skuObj.packSize] ||
                    `${skuObj.packSize}g`;

                  /*
                   * A cart item is purchasable only when it is available
                   * and has a real website selling price.
                   *
                   * This protects the cart from an unavailable SKU such
                   * as the undecided Combo Pack.
                   */
                  const isPurchasable =
                    skuObj.available &&
                    skuObj.websitePrice !== null;

                  return (
                    <div
                      key={sku}
                      className="
                        card
                        border
                        border-brand-brown/5
                        bg-white
                        p-3
                        shadow-soft
                        sm:p-5
                        lg:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          items-stretch
                          justify-between
                          gap-4
                          sm:flex-row
                          sm:items-center
                          sm:gap-5
                        "
                      >
                        {/* =================================================
                            PRODUCT INFORMATION
                        ================================================== */}

                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                          {/* Product Image */}

                          <Link
                            to={`/product/${product.slug}`}
                            aria-label={`View ${product.name}`}
                            className="
                              flex
                              h-20
                              w-20
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-brand-brown/5
                              bg-brand-cream-dark
                              sm:h-24
                              sm:w-24
                              sm:rounded-2xl
                            "
                          >
                            <ProductImage
                              productId={product.id}
                              product={product}
                              variant="card"
                              className="
                                h-full
                                w-full
                                object-contain
                              "
                            />
                          </Link>

                          {/* Product Details */}

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${product.slug}`}
                              className="
                                block
                                font-serif
                                text-base
                                font-semibold
                                leading-tight
                                text-brand-brown
                                transition-colors
                                hover:text-brand-red
                                sm:text-lg
                              "
                            >
                              {product.name}
                            </Link>

                            <p
                              className="
                                mt-1
                                text-[10px]
                                uppercase
                                tracking-wider
                                text-brand-brown/60
                                sm:text-xs
                              "
                            >
                              {product.variant} ·{' '}
                              {packLabel}
                            </p>

                            <p
                              className={`
                                mt-1.5
                                text-sm
                                font-bold
                                sm:mt-2
                                ${
                                  isPurchasable
                                    ? 'text-brand-red'
                                    : 'text-brand-brown/60'
                                }
                              `}
                            >
                              {isPurchasable
                                ? formatPrice(
                                    skuObj.websitePrice!,
                                  )
                                : 'Price Coming Soon'}
                            </p>

                            {!isPurchasable && (
                              <p className="mt-1 text-[10px] font-medium text-brand-brown/50">
                                This item is currently unavailable.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* =================================================
                            QUANTITY + REMOVE
                        ================================================== */}

                        <div
                          className="
                            flex
                            w-full
                            items-center
                            justify-between
                            gap-4
                            border-t
                            border-brand-brown/5
                            pt-3
                            sm:w-auto
                            sm:justify-end
                            sm:gap-6
                            sm:border-t-0
                            sm:pt-0
                          "
                        >
                          {/* Quantity */}

                          <div
                            className={`
                              flex
                              items-center
                              overflow-hidden
                              rounded-full
                              border
                              border-brand-brown/15
                              bg-brand-cream/30
                              ${
                                !isPurchasable
                                  ? 'opacity-50'
                                  : ''
                              }
                            `}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  sku,
                                  quantity - 1,
                                )
                              }
                              disabled={!isPurchasable}
                              className="
                                flex
                                min-h-[42px]
                                min-w-[42px]
                                items-center
                                justify-center
                                p-2.5
                                transition-colors
                                hover:bg-brand-brown/5
                                active:bg-brand-brown/10
                                disabled:cursor-not-allowed
                              "
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span
                              className="
                                w-8
                                text-center
                                text-sm
                                font-semibold
                                text-brand-brown
                              "
                              aria-label={`Quantity ${quantity}`}
                            >
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                addItem(sku, 1)
                              }
                              disabled={!isPurchasable}
                              className="
                                flex
                                min-h-[42px]
                                min-w-[42px]
                                items-center
                                justify-center
                                p-2.5
                                transition-colors
                                hover:bg-brand-brown/5
                                active:bg-brand-brown/10
                                disabled:cursor-not-allowed
                              "
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Remove */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(sku)
                            }
                            className="
                              flex
                              min-h-[42px]
                              min-w-[42px]
                              items-center
                              justify-center
                              rounded-full
                              p-2.5
                              text-brand-brown/40
                              transition-colors
                              hover:bg-brand-red/5
                              hover:text-brand-red
                            "
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}

              {/* Continue Shopping */}

              <div className="pt-2 sm:pt-4">
                <Link
                  to="/shop"
                  className="
                    inline-flex
                    min-h-[44px]
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-brand-brown
                    transition-colors
                    hover:text-brand-red
                  "
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* ============================================================
                ORDER SUMMARY
            ============================================================= */}

            <aside
              className="
                card
                border
                border-brand-brown/5
                bg-white
                p-5
                shadow-soft
                sm:p-6
                lg:sticky
                lg:top-28
                lg:p-8
              "
            >
              <h2
                className="
                  mb-5
                  font-serif
                  text-lg
                  font-bold
                  text-brand-brown
                  sm:mb-6
                  sm:text-xl
                "
              >
                Order Summary
              </h2>

              <div className="space-y-3 text-sm sm:space-y-4">
                <div className="flex justify-between gap-4 text-brand-brown/70">
                  <span>Subtotal</span>

                  <span className="whitespace-nowrap font-medium text-brand-brown">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping is always free and is not shown as a charge. */}
                <div className="flex justify-between gap-4 text-brand-brown/70">
                  <span>Shipping</span>

                  <span className="whitespace-nowrap font-semibold text-green-700">
                    Free
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
                    text-lg
                    font-bold
                    text-brand-brown
                  "
                >
                  <span>Total</span>

                  <span className="whitespace-nowrap text-brand-red">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="
                  btn-primary
                  mt-6
                  inline-flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  sm:mt-8
                  sm:py-4
                "
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-center text-2xs text-brand-brown/50">
                Secure order request processing.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
