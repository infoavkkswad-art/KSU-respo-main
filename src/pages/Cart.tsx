import { Link } from 'react-router-dom';

import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Leaf,
  PackageCheck,
} from 'lucide-react';

import { SEO } from '../components/SEO';

import {
  useCart,
  formatPrice,
} from '../context/CartContext';

import { ProductService } from '../services/product-service';

import { PACK_LABELS } from '../data/products';

import { ProductImage } from '../components/ProductImage';


/* ==========================================================================
   KAWAD SWAD 2.0
   CART PAGE

   VISUAL FLOW:

   CART HERO
       ↓
   CART ITEMS
       ↓
   PRODUCT → PACK → QUANTITY → PRICE
       ↓
   ORDER SUMMARY
       ↓
   CHECKOUT

   IMPORTANT:

   CartContext remains the cart authority.

   ProductService remains the commercial authority for:
   - SKU availability
   - MRP
   - website selling price
   - purchasable SKU resolution

   No shipping calculation is recreated here.
   ========================================================================== */


/* ==========================================================================
   TRUST ITEM
   ========================================================================== */

interface TrustItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}


function TrustItem({
  icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-brand-green/10
        bg-white
        p-3.5
        shadow-soft
        sm:p-4
      "
    >
      <span
        className="
          flex
          h-9
          w-9
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
      </span>

      <div className="min-w-0">
        <p
          className="
            text-xs
            font-bold
            text-brand-green
            sm:text-sm
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            leading-relaxed
            text-brand-brown/50
            sm:text-xs
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}


/* ==========================================================================
   CART PAGE
   ========================================================================== */

export default function Cart() {

  const {
    items,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    addItem,
  } = useCart();


  /* ==========================================================================
     RESOLVE CART ITEMS

     ProductService remains the single source of truth.
     ======================================================================== */

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
        ...item,
        product: result.family,
        skuObj: result.skuObj,
      };

    })
    .filter(
      (
        item,
      ): item is NonNullable<typeof item> =>
        item !== null,
    );


  /* ==========================================================================
     EMPTY CART
     ======================================================================== */

  if (
    resolvedItems.length === 0
  ) {

    return (
      <>
        <SEO
          title="Shopping Cart"
          description="Review your Kawad Swad papad order before checkout."
          path="/cart"
          indexable={false}
        />


        {/* ================================================================
            EMPTY CART HERO
        ================================================================= */}

        <section
          className="
            relative
            overflow-hidden
            bg-brand-green
            py-10
            sm:py-12
            lg:py-14
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
              text-center
            "
          >

            <span
              className="
                section-eyebrow
                text-brand-saffron
              "
            >
              Kawad Swad
            </span>


            <h1
              className="
                mt-2
                font-serif
                text-3xl
                font-bold
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Your Shopping Cart
            </h1>


            <p
              className="
                mx-auto
                mt-2.5
                max-w-lg
                text-sm
                leading-relaxed
                text-brand-ivory/70
                sm:text-base
              "
            >
              Your next crunchy craving is waiting.
            </p>

          </div>

        </section>


        {/* ================================================================
            EMPTY CART CONTENT
        ================================================================= */}

        <section
          className="
            min-h-[48vh]
            bg-brand-ivory
            px-4
            py-10
            sm:px-6
            sm:py-14
          "
        >

          <div
            className="
              container-max
              mx-auto
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


              <h2
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
              </h2>


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
                Explore our authentic papads and
                discover your next favourite flavour.
              </p>


              <Link
                to="/shop"
                className="
                  btn-primary
                  mt-6
                  min-h-[48px]
                  px-6
                  shadow-soft
                "
              >
                Browse Papads

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

            </div>


            {/* EMPTY CART TRUST */}

            <div
              className="
                mx-auto
                mt-6
                grid
                max-w-3xl
                gap-2.5
                sm:grid-cols-3
                sm:gap-3
              "
            >

              <TrustItem
                icon={
                  <Leaf
                    className="h-4 w-4"
                  />
                }
                title="100% Vegetarian"
                description="Made with care."
              />


              <TrustItem
                icon={
                  <Truck
                    className="h-4 w-4"
                  />
                }
                title="Free Shipping"
                description="Shipping included."
              />


              <TrustItem
                icon={
                  <ShieldCheck
                    className="h-4 w-4"
                  />
                }
                title="Trusted Quality"
                description="Made by Kawad Swad."
              />

            </div>

          </div>

        </section>
      </>
    );
  }


  /* ==========================================================================
     NON-EMPTY CART
     ======================================================================== */

  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review your Kawad Swad papad order before checkout."
        path="/cart"
        indexable={false}
      />


      {/* ======================================================================
          CART HERO
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-8
          sm:py-10
          lg:py-12
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
            h-48
            w-48
            rounded-full
            border
            border-brand-saffron/15
            sm:h-60
            sm:w-60
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

          <div
            className="
              flex
              flex-col
              gap-1
              sm:flex-row
              sm:items-end
              sm:justify-between
              sm:gap-4
            "
          >

            <div>

              <span
                className="
                  section-eyebrow
                  text-brand-saffron
                "
              >
                Kawad Swad
              </span>


              <h1
                className="
                  mt-1.5
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Your Shopping Cart
              </h1>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-ivory/70
                  sm:text-base
                "
              >
                Review your selected papads and
                continue when you're ready.
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
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-white/65
                sm:text-xs
              "
            >

              <ShoppingBag
                className="
                  h-3.5
                  w-3.5
                  text-brand-saffron
                "
                aria-hidden="true"
              />

              {resolvedItems.length}{' '}
              {resolvedItems.length === 1
                ? 'Item'
                : 'Items'}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          CART CONTENT
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
              lg:grid-cols-[minmax(0,1fr)_360px]
              lg:gap-7
              xl:grid-cols-[minmax(0,1fr)_390px]
            "
          >

            {/* ==================================================================
                CART ITEMS
                =================================================================== */}

            <div className="min-w-0">

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  gap-3
                  sm:mb-4
                "
              >

                <div>

                  <span
                    className="
                      section-eyebrow
                    "
                  >
                    Selected Products
                  </span>


                  <h2
                    className="
                      mt-0.5
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                      sm:text-2xl
                    "
                  >
                    Your Items
                  </h2>

                </div>


                <Link
                  to="/shop"
                  className="
                    hidden
                    items-center
                    gap-1
                    text-xs
                    font-semibold
                    text-brand-green
                    transition-all
                    hover:gap-1.5
                    sm:inline-flex
                  "
                >
                  Add more

                  <Plus
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                </Link>

              </div>


              <div className="space-y-3">

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


                    const unitPrice =
                      skuObj.websitePrice;


                    const lineTotal =
                      unitPrice *
                      quantity;


                    return (
                      <article
                        key={sku}
                        className="
                          group
                          overflow-hidden
                          rounded-3xl
                          border
                          border-brand-green/10
                          bg-white
                          p-3
                          shadow-soft
                          transition-all
                          duration-300
                          ease-ks-standard
                          hover:border-brand-green/15
                          hover:shadow-card
                          sm:p-4
                          lg:p-5
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                            sm:items-center
                            sm:gap-4
                          "
                        >

                          {/* ====================================================
                              PRODUCT IMAGE
                          ===================================================== */}

                          <Link
                            to={`/product/${product.slug}`}
                            aria-label={`View ${product.name}`}
                            className="
                              group/image
                              relative
                              flex
                              h-24
                              w-full
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-2xl
                              border
                              border-brand-green/10
                              bg-gradient-to-br
                              from-white
                              via-brand-cream
                              to-brand-cream-dark
                              shadow-inner-soft
                              sm:h-28
                              sm:w-28
                            "
                          >

                            {/* Grounding */}

                            <span
                              className="
                                pointer-events-none
                                absolute
                                bottom-[10%]
                                left-1/2
                                h-[8%]
                                w-[45%]
                                -translate-x-1/2
                                rounded-[50%]
                                bg-brand-brown/12
                                blur-[7px]
                                transition-all
                                duration-300
                                group-hover/image:w-[52%]
                              "
                              aria-hidden="true"
                            />


                            <span
                              className="
                                relative
                                z-10
                                flex
                                h-full
                                w-full
                                items-center
                                justify-center
                                p-2
                                transition-transform
                                duration-300
                                ease-ks-standard
                                group-hover/image:-translate-y-0.5
                                group-hover/image:scale-[1.025]
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
                                className="
                                  h-full
                                  w-full
                                  object-contain
                                  drop-shadow-[0_8px_7px_rgba(62,39,35,0.12)]
                                "
                              />

                            </span>


                            {/* Frame */}

                            <span
                              className="
                                pointer-events-none
                                absolute
                                inset-1.5
                                rounded-[1rem]
                                border
                                border-white/60
                              "
                              aria-hidden="true"
                            />

                          </Link>


                          {/* ====================================================
                              PRODUCT INFORMATION
                          ===================================================== */}

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >

                              <div className="min-w-0">

                                <Link
                                  to={`/product/${product.slug}`}
                                  className="
                                    block
                                    truncate
                                    font-serif
                                    text-base
                                    font-bold
                                    leading-tight
                                    text-brand-green
                                    transition-colors
                                    hover:text-brand-saffron-dark
                                    sm:text-lg
                                  "
                                >
                                  {product.name}
                                </Link>


                                <p
                                  className="
                                    mt-1
                                    truncate
                                    text-[10px]
                                    font-medium
                                    text-brand-brown/50
                                    sm:text-xs
                                  "
                                >
                                  {product.variant}
                                </p>

                              </div>


                              {/* REMOVE */}

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    sku,
                                  )
                                }
                                className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  text-brand-brown/30
                                  transition-all
                                  duration-200
                                  hover:bg-brand-red/5
                                  hover:text-brand-red
                                  active:scale-95
                                "
                                aria-label={`Remove ${product.name} from cart`}
                              >
                                <Trash2
                                  className="h-4 w-4"
                                />
                              </button>

                            </div>


                            {/* PACK */}

                            <div
                              className="
                                mt-2
                                inline-flex
                                max-w-full
                                items-center
                                gap-1.5
                                rounded-full
                                bg-brand-cream
                                px-2.5
                                py-1
                                text-[9px]
                                font-semibold
                                text-brand-brown/65
                                sm:text-[10px]
                              "
                            >

                              <PackageCheck
                                className="
                                  h-3
                                  w-3
                                  text-brand-green
                                "
                                aria-hidden="true"
                              />

                              <span className="truncate">
                                {packLabel}
                              </span>

                            </div>


                            {/* PRICE */}

                            <div
                              className="
                                mt-2.5
                                flex
                                flex-wrap
                                items-baseline
                                gap-x-2
                                gap-y-1
                              "
                            >

                              <span
                                className="
                                  text-base
                                  font-bold
                                  text-brand-green
                                  sm:text-lg
                                "
                              >
                                {formatPrice(
                                  unitPrice,
                                )}
                              </span>


                              {quantity > 1 && (
                                <span
                                  className="
                                    text-[10px]
                                    text-brand-brown/40
                                  "
                                >
                                  × {quantity}
                                </span>
                              )}

                            </div>


                            {/* SHIPPING */}

                            <div
                              className="
                                mt-1.5
                                flex
                                items-center
                                gap-1.5
                                text-[9px]
                                font-semibold
                                text-brand-green
                                sm:text-[10px]
                              "
                            >

                              <Truck
                                className="
                                  h-3
                                  w-3
                                "
                                aria-hidden="true"
                              />

                              Free shipping included

                            </div>

                          </div>


                          {/* ====================================================
                              CONTROLS
                          ===================================================== */}

                          <div
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-3
                              border-t
                              border-brand-green/10
                              pt-3
                              sm:w-auto
                              sm:min-w-[170px]
                              sm:flex-col
                              sm:items-end
                              sm:justify-center
                              sm:border-t-0
                              sm:pt-0
                            "
                          >

                            {/* QUANTITY */}

                            <div
                              className="
                                flex
                                items-center
                                overflow-hidden
                                rounded-full
                                border
                                border-brand-green/10
                                bg-brand-ivory
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
                                  flex
                                  min-h-[40px]
                                  min-w-[40px]
                                  items-center
                                  justify-center
                                  text-brand-green/60
                                  transition-colors
                                  hover:bg-brand-green/5
                                  hover:text-brand-green
                                  active:bg-brand-green/10
                                "
                                aria-label={`Decrease quantity of ${product.name}`}
                              >
                                <Minus
                                  className="h-3.5 w-3.5"
                                />
                              </button>


                              <span
                                className="
                                  min-w-[34px]
                                  text-center
                                  text-xs
                                  font-bold
                                  text-brand-green
                                "
                                aria-label={`Quantity ${quantity}`}
                              >
                                {quantity}
                              </span>


                              <button
                                type="button"
                                onClick={() =>
                                  addItem(
                                    sku,
                                    1,
                                  )
                                }
                                className="
                                  flex
                                  min-h-[40px]
                                  min-w-[40px]
                                  items-center
                                  justify-center
                                  text-brand-green/60
                                  transition-colors
                                  hover:bg-brand-green/5
                                  hover:text-brand-green
                                  active:bg-brand-green/10
                                "
                                aria-label={`Increase quantity of ${product.name}`}
                              >
                                <Plus
                                  className="h-3.5 w-3.5"
                                />
                              </button>

                            </div>


                            {/* LINE TOTAL */}

                            <div
                              className="
                                text-right
                              "
                            >

                              <p
                                className="
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.12em]
                                  text-brand-brown/35
                                "
                              >
                                Item Total
                              </p>


                              <p
                                className="
                                  mt-0.5
                                  text-lg
                                  font-bold
                                  text-brand-green
                                "
                              >
                                {formatPrice(
                                  lineTotal,
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                      </article>
                    );
                  },
                )}

              </div>


              {/* CONTINUE SHOPPING */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >

                <Link
                  to="/shop"
                  className="
                    inline-flex
                    min-h-[44px]
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-brand-green
                    transition-all
                    hover:gap-2.5
                    sm:text-sm
                  "
                >

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      rotate-180
                    "
                    aria-hidden="true"
                  />

                  Continue Shopping

                </Link>


                <Link
                  to="/shop"
                  className="
                    inline-flex
                    min-h-[40px]
                    items-center
                    gap-1
                    rounded-full
                    bg-brand-green/5
                    px-3
                    text-[10px]
                    font-semibold
                    text-brand-green
                    sm:hidden
                  "
                >

                  <Plus
                    className="h-3 w-3"
                    aria-hidden="true"
                  />

                  Add More

                </Link>

              </div>

            </div>


            {/* ==================================================================
                ORDER SUMMARY
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

                  <span
                    className="
                      section-eyebrow
                      text-brand-saffron
                    "
                  >
                    Your Order
                  </span>


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


                {/* ==============================================================
                    SUMMARY CONTENT
                    =========================================================== */}

                <div
                  className="
                    p-5
                    sm:p-6
                  "
                >

                  <div className="space-y-3">

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                        text-sm
                        text-brand-brown/60
                      "
                    >

                      <span>
                        Subtotal
                      </span>


                      <span
                        className="
                          whitespace-nowrap
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
                        items-center
                        gap-2
                        rounded-xl
                        bg-brand-green/5
                        px-3
                        py-2.5
                        text-brand-green
                      "
                    >

                      <Truck
                        className="
                          h-4
                          w-4
                          shrink-0
                        "
                        aria-hidden="true"
                      />


                      <span
                        className="
                          text-xs
                          font-semibold
                        "
                      >
                        Free shipping included
                      </span>

                    </div>


                    <div
                      className="
                        border-t
                        border-brand-green/10
                        pt-4
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
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.13em]
                              text-brand-brown/40
                            "
                          >
                            Total
                          </p>


                          <p
                            className="
                              mt-1
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
                          Shipping Included
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* ============================================================
                      CHECKOUT CTA
                      ============================================================
                      
                      The total is repeated inside the button intentionally.
                      This makes the primary action immediately clear on mobile.
                  ============================================================= */}

                  <Link
                    to="/checkout"
                    aria-label={`Proceed to checkout for ${formatPrice(total)}`}
                    className="
                      group/checkout
                      mt-5
                      flex
                      min-h-[58px]
                      w-full
                      items-center
                      justify-between
                      gap-3
                      rounded-2xl
                      bg-brand-green
                      px-4
                      py-3
                      text-white
                      shadow-[0_10px_24px_rgba(22,67,54,0.18)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:bg-brand-green/95
                      hover:shadow-[0_14px_30px_rgba(22,67,54,0.24)]
                      active:translate-y-0
                      active:scale-[0.99]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-brand-green
                      focus:ring-offset-2
                      sm:min-h-[60px]
                      sm:px-5
                    "
                  >

                    <span
                      className="
                        flex
                        min-w-0
                        flex-col
                        items-start
                        leading-none
                      "
                    >

                      <span
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.11em]
                          text-white/65
                        "
                      >
                        Your Total
                      </span>


                      <span
                        className="
                          mt-1
                          font-serif
                          text-lg
                          font-bold
                          text-white
                          sm:text-xl
                        "
                      >
                        {formatPrice(total)}
                      </span>

                    </span>


                    <span
                      className="
                        flex
                        items-center
                        gap-2
                        whitespace-nowrap
                        text-sm
                        font-bold
                        sm:text-base
                      "
                    >

                      Proceed to Checkout

                      <ArrowRight
                        className="
                          h-5
                          w-5
                          shrink-0
                          transition-transform
                          duration-200
                          group-hover/checkout:translate-x-1
                        "
                        aria-hidden="true"
                      />

                    </span>

                  </Link>


                  <p
                    className="
                      mt-3
                      text-center
                      text-[9px]
                      leading-relaxed
                      text-brand-brown/40
                    "
                  >
                    Your order will be securely processed
                    through the Kawad Swad checkout flow.
                  </p>

                </div>

              </div>


              {/* ================================================================
                  DESKTOP TRUST
                  ============================================================= */}

              <div
                className="
                  mt-3
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                <TrustItem
                  icon={
                    <Leaf
                      className="h-4 w-4"
                    />
                  }
                  title="100% Veg"
                  description="Pure vegetarian"
                />


                <TrustItem
                  icon={
                    <ShieldCheck
                      className="h-4 w-4"
                    />
                  }
                  title="FSSAI"
                  description="Licensed quality"
                />


                <TrustItem
                  icon={
                    <PackageCheck
                      className="h-4 w-4"
                    />
                  }
                  title="Packed"
                  description="Carefully prepared"
                />

              </div>

            </aside>

          </div>

        </div>

      </section>
    </>
  );
}
