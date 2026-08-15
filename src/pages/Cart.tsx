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
    shippingTotal,
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
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-serif
              font-bold
              text-brand-brown
              mb-3
              sm:mb-4
            "
          >
            Your Shopping Cart
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              text-brand-brown/70
              max-w-lg
              mx-auto
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
              max-w-xl
              mx-auto
              p-8
              sm:p-12
              text-center
              bg-white
              border
              border-brand-brown/5
              shadow-soft
            "
          >
            <ShoppingBag className="w-12 h-12 text-brand-brown/20 mx-auto mb-4" />

            <h2
              className="
                text-xl
                sm:text-2xl
                font-serif
                font-bold
                text-brand-brown
                mb-2
              "
            >
              Your cart is empty
            </h2>

            <p className="text-sm text-brand-brown/60 mb-6">
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
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              lg:grid-cols-[1fr_400px]
              gap-6
              lg:gap-12
              items-start
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
                    PACK_LABELS[
                      skuObj.packSize
                    ] ||
                    `${skuObj.packSize}g`;

                  return (
                    <div
                      key={sku}
                      className="
                        card
                        p-3
                        sm:p-5
                        lg:p-6
                        bg-white
                        border
                        border-brand-brown/5
                        shadow-soft
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          sm:flex-row
                          gap-4
                          sm:gap-5
                          items-stretch
                          sm:items-center
                          justify-between
                        "
                      >
                        {/* =================================================
                            PRODUCT INFORMATION
                        ================================================== */}

                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Product Image */}

                          <Link
                            to={`/product/${product.slug}`}
                            aria-label={`View ${product.name}`}
                            className="
                              w-20
                              h-20
                              sm:w-24
                              sm:h-24
                              rounded-xl
                              sm:rounded-2xl
                              bg-brand-cream-dark
                              flex
                              items-center
                              justify-center
                              shrink-0
                              overflow-hidden
                              border
                              border-brand-brown/5
                            "
                          >
                            <ProductImage
                              productId={product.id}
                              product={product}
                              variant="card"
                              className="
                                w-full
                                h-full
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
                                font-semibold
                                text-brand-brown
                                hover:text-brand-red
                                text-base
                                sm:text-lg
                                leading-tight
                                transition-colors
                              "
                            >
                              {product.name}
                            </Link>

                            <p
                              className="
                                text-[10px]
                                sm:text-xs
                                text-brand-brown/60
                                mt-1
                                uppercase
                                tracking-wider
                              "
                            >
                              {product.variant} ·{' '}
                              {packLabel}
                            </p>

                            <p className="text-sm font-bold text-brand-red mt-1.5 sm:mt-2">
                              {formatPrice(
                                skuObj.websitePrice,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* =================================================
                            QUANTITY + REMOVE
                        ================================================== */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            sm:justify-end
                            gap-4
                            sm:gap-6
                            w-full
                            sm:w-auto
                            border-t
                            sm:border-t-0
                            pt-3
                            sm:pt-0
                            border-brand-brown/5
                          "
                        >
                          {/* Quantity */}

                          <div
                            className="
                              flex
                              items-center
                              border
                              border-brand-brown/15
                              rounded-full
                              overflow-hidden
                              bg-brand-cream/30
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  sku,
                                  quantity - 1,
                                )
                              }
                              className="
                                min-w-[42px]
                                min-h-[42px]
                                p-2.5
                                flex
                                items-center
                                justify-center
                                hover:bg-brand-brown/5
                                active:bg-brand-brown/10
                                transition-colors
                              "
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
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
                              className="
                                min-w-[42px]
                                min-h-[42px]
                                p-2.5
                                flex
                                items-center
                                justify-center
                                hover:bg-brand-brown/5
                                active:bg-brand-brown/10
                                transition-colors
                              "
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(sku)
                            }
                            className="
                              min-w-[42px]
                              min-h-[42px]
                              p-2.5
                              rounded-full
                              flex
                              items-center
                              justify-center
                              text-brand-brown/40
                              hover:text-brand-red
                              hover:bg-brand-red/5
                              transition-colors
                            "
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            <Trash2 className="w-5 h-5" />
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
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-brand-brown
                    hover:text-brand-red
                    transition-colors
                    min-h-[44px]
                  "
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
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
                p-5
                sm:p-6
                lg:p-8
                bg-white
                border
                border-brand-brown/5
                lg:sticky
                lg:top-28
                shadow-soft
              "
            >
              <h2
                className="
                  text-lg
                  sm:text-xl
                  font-serif
                  font-bold
                  text-brand-brown
                  mb-5
                  sm:mb-6
                "
              >
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 text-sm">
                <div className="flex justify-between gap-4 text-brand-brown/70">
                  <span>Subtotal</span>

                  <span className="font-medium text-brand-brown whitespace-nowrap">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-brand-brown/70">
                  <span>Shipping</span>

                  <span className="font-medium text-brand-brown whitespace-nowrap">
                    {shippingTotal
                      ? formatPrice(
                          shippingTotal,
                        )
                      : 'Free'}
                  </span>
                </div>

                <div
                  className="
                    border-t
                    border-brand-brown/10
                    pt-4
                    flex
                    justify-between
                    gap-4
                    text-lg
                    font-bold
                    text-brand-brown
                  "
                >
                  <span>Total</span>

                  <span className="text-brand-red whitespace-nowrap">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="
                  btn-primary
                  w-full
                  mt-6
                  sm:mt-8
                  min-h-[48px]
                  py-3
                  sm:py-4
                  justify-center
                  items-center
                  gap-2
                  inline-flex
                "
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-2xs text-brand-brown/50 text-center mt-4">
                Secure order request processing.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
