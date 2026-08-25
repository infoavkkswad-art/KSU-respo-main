import {
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Plus,
  Check,
  ChevronDown,
  Zap,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

import type {
  ProductFamily,
} from '@/data/products';

import {
  PACK_LABELS,
} from '@/data/products';

import {
  ProductImage,
} from '@/components/ProductImage';

import {
  useCart,
  formatPrice,
} from '@/context/CartContext';

import {
  StarRating,
} from '@/components/StarRating';

import {
  ReviewService,
} from '@/services/review-service';

import type {
  ReviewSummary,
} from '@/types/reviews';

import {
  ProductService,
} from '@/services/product-service';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL 3D PRODUCT CARD

   BEHAVIOR:

   NOTICE
      ↓
   SEE PRODUCT
      ↓
   UNDERSTAND
      ↓
   TRUST
      ↓
   CHOOSE PACK
      ↓
   BUY

   DESIGN SYSTEM:

   - Product artwork remains completely visible.
   - No object-cover on product artwork.
   - Product sits inside a dimensional stage.
   - Card uses layered depth rather than excessive shadows.
   - Hover lift is subtle and premium.
   - Mobile remains stable and touch-friendly.
   - Website selling price is the ONLY displayed product price.
   - MRP / discount presentation is intentionally removed.
   - Buy Now is the primary conversion CTA.
   ========================================================================== */


/* ==========================================================================
   PROPS
   ========================================================================== */

interface ProductCardProps {
  product: ProductFamily;
  className?: string;
}


/* ==========================================================================
   PRODUCT CARD
   ========================================================================== */

export function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { t } = useTranslation();

  const { addItem } = useCart();

  const navigate = useNavigate();

  const selectId = useId();


  /* ==========================================================================
     STATE
     ======================================================================== */

  const [
    selectedSkuIndex,
    setSelectedSkuIndex,
  ] = useState(0);

  const [
    added,
    setAdded,
  ] = useState(false);

  const [
    reviewSummary,
    setReviewSummary,
  ] = useState<ReviewSummary | null>(null);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);


  /* ==========================================================================
     CENTRAL PRODUCT RESOLUTION
     ======================================================================== */

  const purchasableSkus = useMemo(
    () =>
      ProductService.getAvailableSkus(
        product,
      ),
    [product],
  );


  /* ==========================================================================
     SELECTED SKU
     ======================================================================== */

  const selectedSku =
    purchasableSkus[
      selectedSkuIndex
    ] ??
    purchasableSkus[0];


  /* ==========================================================================
     KEEP SKU SELECTION VALID
     ======================================================================== */

  useEffect(() => {

    if (
      purchasableSkus.length === 0
    ) {
      setSelectedSkuIndex(0);
      return;
    }

    if (
      selectedSkuIndex >=
      purchasableSkus.length
    ) {
      setSelectedSkuIndex(0);
    }

  }, [
    purchasableSkus.length,
    selectedSkuIndex,
  ]);


  /* ==========================================================================
     REVIEW SUMMARY
     ======================================================================== */

  useEffect(() => {

    let cancelled = false;

    async function loadReviewSummary() {

      setReviewsLoading(true);

      try {

        const summary =
          await ReviewService.getSummary(
            product.id,
          );

        if (!cancelled) {
          setReviewSummary(summary);
        }

      } catch {

        if (!cancelled) {

          setReviewSummary({
            productId: product.id,
            averageRating: 0,
            reviewCount: 0,
          });

        }

      } finally {

        if (!cancelled) {
          setReviewsLoading(false);
        }

      }

    }

    void loadReviewSummary();

    return () => {
      cancelled = true;
    };

  }, [product.id]);


  /* ==========================================================================
     NO PURCHASABLE SKU
     ======================================================================== */

  if (!selectedSku) {
    return null;
  }


  /* ==========================================================================
     DISPLAY VALUES
     ======================================================================== */

  const packLabel =
    PACK_LABELS[
      selectedSku.packSize
    ] ??
    `${selectedSku.packSize}g`;


  const hasReviews =
    reviewSummary !== null &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;


  /* ==========================================================================
     ADD TO CART
     ======================================================================== */

  const handleAdd = () => {

    addItem(
      selectedSku.sku,
      1,
    );

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);

  };


  /* ==========================================================================
     BUY NOW
     ======================================================================== */

  const handleBuyNow = () => {

    addItem(
      selectedSku.sku,
      1,
    );

    navigate('/checkout');

  };


  /* ==========================================================================
     PACK SELECTION
     ======================================================================== */

  const handlePackChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {

    const nextIndex =
      Number(
        event.target.value,
      );

    if (
      Number.isInteger(
        nextIndex,
      ) &&
      nextIndex >= 0 &&
      nextIndex <
        purchasableSkus.length
    ) {

      setSelectedSkuIndex(
        nextIndex,
      );

    }

  };


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <article
      className={`
        product-card
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-brand-green/10
        bg-white
        shadow-card
        transition-all
        duration-500
        ease-ks-standard
        hover:-translate-y-1
        hover:border-brand-green/15
        hover:shadow-lift
        ${className}
      `}
      data-product-id={product.id}
      data-product-category={product.category}
    >

      {/* ======================================================================
          TOP EDGE LIGHT
          =================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-4
          top-0
          z-50
          h-px
          bg-gradient-to-r
          from-transparent
          via-brand-saffron/35
          to-transparent
          opacity-70
        "
        aria-hidden="true"
      />


      {/* ======================================================================
          PRODUCT VISUAL
          =================================================================== */}

      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="
          product-card-media
          group/image
          relative
          block
          aspect-[4/3]
          w-full
          overflow-hidden
          bg-brand-cream-dark
          sm:aspect-square
          [perspective:1200px]
        "
      >

        {/* ==================================================================
            OUTER IMAGE STAGE
            ================================================================== */}

        <div
          className="
            absolute
            inset-2.5
            overflow-hidden
            rounded-[1.35rem]
            border
            border-white/70
            bg-gradient-to-br
            from-white
            via-brand-cream
            to-brand-cream-dark
            shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_35px_rgba(62,39,35,0.07)]
            transition-all
            duration-500
            ease-ks-standard
            group-hover/image:inset-2
            group-hover/image:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-22px_40px_rgba(62,39,35,0.09)]
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            BACKGROUND GLOW
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[38%]
            z-0
            h-[58%]
            w-[58%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-brand-saffron/5
            blur-3xl
            transition-all
            duration-500
            group-hover/image:scale-110
            group-hover/image:bg-brand-saffron/8
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            GROUNDING SHADOW
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-[8%]
            left-1/2
            z-10
            h-[8%]
            w-[42%]
            -translate-x-1/2
            rounded-[50%]
            bg-brand-brown/18
            blur-[10px]
            transition-all
            duration-500
            ease-ks-standard
            group-hover/image:w-[50%]
            group-hover/image:bg-brand-brown/22
            group-hover/image:blur-[12px]
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            PRODUCT VISUAL
            ================================================================== */}

        <div
          className="
            product-visual
            relative
            z-20
            flex
            h-full
            w-full
            items-center
            justify-center
            overflow-hidden
            px-[8%]
            py-[7%]
            [transform-style:preserve-3d]
            [&_img]:h-full
            [&_img]:w-full
            [&_img]:max-h-full
            [&_img]:max-w-full
            [&_img]:object-contain
            [&_img]:object-center
          "
        >

          <div
            className="
              relative
              flex
              h-full
              w-full
              items-center
              justify-center
              [transform:translateZ(20px)]
              transition-transform
              duration-500
              ease-ks-standard
              group-hover/image:-translate-y-1
              group-hover/image:[transform:translateZ(28px)_scale(1.015)]
            "
          >

            <ProductImage
              productId={product.id}
              product={product}
              variant="card"
              className="
                product-shadow
                h-full
                w-full
                object-contain
                object-center
                drop-shadow-[0_12px_10px_rgba(62,39,35,0.13)]
                transition-all
                duration-500
                ease-ks-standard
                group-hover/image:drop-shadow-[0_18px_14px_rgba(62,39,35,0.18)]
              "
            />

          </div>

        </div>


        {/* ==================================================================
            SOFT 3D LIGHT
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-2.5
            z-30
            rounded-[1.35rem]
            bg-gradient-to-br
            from-white/30
            via-transparent
            to-brand-brown/5
            opacity-70
            transition-all
            duration-500
            ease-ks-standard
            group-hover/image:inset-2
            group-hover/image:opacity-100
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            GLASS HIGHLIGHT
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-[10%]
            top-[7%]
            z-40
            h-[34%]
            w-[18%]
            rotate-[18deg]
            rounded-full
            bg-white/25
            blur-xl
            opacity-40
            transition-all
            duration-500
            group-hover/image:translate-x-2
            group-hover/image:opacity-60
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            PHYSICAL FRAME
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-2.5
            z-40
            rounded-[1.35rem]
            border
            border-white/55
            transition-all
            duration-500
            ease-ks-standard
            group-hover/image:inset-2
            group-hover/image:border-white/70
          "
          aria-hidden="true"
        />


        {/* ==================================================================
            CATEGORY CHIP
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-4
            top-4
            z-50
            rounded-full
            border
            border-white/60
            bg-white/80
            px-2.5
            py-1
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-brand-green
            shadow-soft
            backdrop-blur-sm
          "
        >
          {product.category}
        </div>


        {/* ==================================================================
            DISCOVERY HINT
            ================================================================== */}

        <span
          className="
            pointer-events-none
            absolute
            bottom-4
            left-1/2
            z-50
            hidden
            -translate-x-1/2
            rounded-full
            border
            border-white/60
            bg-white/90
            px-3
            py-1.5
            text-[9px]
            font-semibold
            text-brand-green
            opacity-0
            shadow-soft
            backdrop-blur-sm
            transition-all
            duration-300
            ease-ks-standard
            sm:block
            group-hover/image:-translate-x-1/2
            group-hover/image:-translate-y-0.5
            group-hover/image:opacity-100
          "
        >
          View product
        </span>

      </Link>


      {/* ======================================================================
          PRODUCT INFORMATION
          =================================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          justify-between
          p-3.5
          sm:p-4
        "
      >

        <div className="min-w-0">

          {/* ==================================================================
              PRODUCT IDENTITY
              ================================================================== */}

          <Link
            to={`/product/${product.slug}`}
            className="
              block
              truncate
              font-serif
              text-sm
              font-semibold
              leading-tight
              text-brand-brown
              transition-colors
              duration-200
              ease-ks-standard
              hover:text-brand-green
              sm:text-base
            "
            title={product.name}
          >
            {product.name}
          </Link>


          <p
            className="
              mt-1
              truncate
              text-[10px]
              text-brand-brown/55
              sm:text-xs
            "
            title={product.variant}
          >
            {product.variant}
          </p>


          {/* ==================================================================
              SOCIAL PROOF
              ================================================================== */}

          <Link
            to={`/product/${product.slug}#reviews`}
            className="
              mb-2.5
              mt-2
              inline-flex
              min-h-[28px]
              max-w-full
              items-center
              rounded-md
              transition-opacity
              duration-200
              hover:opacity-80
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-saffron/40
              sm:mb-3
            "
            aria-label={
              reviewsLoading
                ? `Loading reviews for ${product.name}`
                : hasReviews
                  ? `${reviewSummary.averageRating.toFixed(1)} out of 5 stars from ${reviewSummary.reviewCount} reviews`
                  : `No reviews yet for ${product.name}`
            }
          >

            {reviewsLoading ? (

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-[9px]
                  text-brand-brown/40
                  sm:text-xs
                "
              >

                <span
                  className="
                    inline-block
                    h-2.5
                    w-2.5
                    animate-spin
                    rounded-full
                    border-2
                    border-brand-brown/15
                    border-t-brand-saffron
                    sm:h-3
                    sm:w-3
                  "
                  aria-hidden="true"
                />

                Loading reviews...

              </span>

            ) : hasReviews ? (

              <StarRating
                rating={
                  reviewSummary.averageRating
                }
                reviewCount={
                  reviewSummary.reviewCount
                }
                size="sm"
                showValue
                showCount
              />

            ) : (

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[9px]
                  text-brand-brown/45
                  sm:gap-1.5
                  sm:text-xs
                "
              >

                <span
                  className="
                    shrink-0
                    tracking-[1px]
                    text-brand-brown/25
                  "
                  aria-hidden="true"
                >
                  ☆☆☆☆☆
                </span>

                <span>
                  No reviews yet
                </span>

              </span>

            )}

          </Link>


          {/* ==================================================================
              PACK SELECTION
              ================================================================== */}

          <div className="mb-2.5 sm:mb-3">

            {product.category ===
            'combo' ? (

              <div
                className="
                  inline-flex
                  max-w-full
                  items-center
                  gap-1.5
                  rounded-xl
                  border
                  border-brand-brown/10
                  bg-brand-cream
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-semibold
                  text-brand-brown
                  shadow-soft
                  sm:text-xs
                "
              >

                <ShoppingBag
                  className="
                    h-3
                    w-3
                    shrink-0
                  "
                  aria-hidden="true"
                />

                <span className="truncate">
                  {packLabel}
                </span>

              </div>

            ) : (

              <div className="space-y-1">

                <label
                  htmlFor={`pack-size-${selectId}`}
                  className="
                    block
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.13em]
                    text-brand-brown/55
                    sm:text-2xs
                  "
                >
                  Choose your pack
                </label>


                <div className="relative w-full">

                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={
                      handlePackChange
                    }
                    className="
                      min-h-[40px]
                      w-full
                      appearance-none
                      cursor-pointer
                      rounded-xl
                      border
                      border-brand-brown/15
                      bg-brand-cream
                      px-3
                      py-2
                      pr-9
                      text-[10px]
                      font-semibold
                      text-brand-brown
                      outline-none
                      transition-all
                      duration-200
                      ease-ks-standard
                      hover:border-brand-brown/25
                      focus:border-brand-green
                      focus:ring-2
                      focus:ring-brand-green/10
                      sm:text-xs
                    "
                    aria-label={`Select pack size for ${product.name}`}
                  >

                    {purchasableSkus.map(
                      (
                        sku,
                        index,
                      ) => (

                        <option
                          key={sku.sku}
                          value={index}
                        >
                          {PACK_LABELS[
                            sku.packSize
                          ] ??
                            `${sku.packSize}g`}
                        </option>

                      ),
                    )}

                  </select>


                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-2.5
                      top-1/2
                      h-3.5
                      w-3.5
                      -translate-y-1/2
                      text-brand-brown/45
                    "
                    aria-hidden="true"
                  />

                </div>

              </div>

            )}

          </div>


          {/* ==================================================================
              WEBSITE SELLING PRICE

              ONLY THE CURRENT WEBSITE PRICE IS DISPLAYED.
              MRP AND DISCOUNT PRESENTATION ARE REMOVED.
              ================================================================== */}

          <div
            className="
              mb-0.5
              flex
              items-baseline
            "
          >

            <span
              className="
                price-emphasis
                text-lg
                sm:text-xl
              "
            >
              {formatPrice(
                selectedSku.websitePrice,
              )}
            </span>

          </div>


          {/* ==================================================================
              SHIPPING TRUST
              ================================================================== */}

          <p
            className="
              mb-3
              flex
              items-center
              gap-1.5
              text-[9px]
              leading-relaxed
              text-brand-brown/55
              sm:mb-3.5
              sm:text-2xs
            "
          >

            <Check
              className="
                h-3
                w-3
                shrink-0
                text-brand-green
              "
              aria-hidden="true"
            />

            <strong
              className="
                font-semibold
                text-brand-green
              "
            >
              Free shipping
            </strong>

          </p>


        </div>


        {/* ====================================================================
            ACTION AREA
            ================================================================= */}

        <div
          className="
            mt-auto
            grid
            grid-cols-2
            gap-2
          "
        >

          {/* ==================================================================
              ADD TO CART
              ================================================================== */}

          <button
            type="button"
            onClick={handleAdd}
            aria-live="polite"
            className={`
              relative
              flex
              min-h-[46px]
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-xl
              border
              px-2
              py-2
              text-[10px]
              font-semibold
              transition-all
              duration-200
              ease-ks-standard
              active:translate-y-[1px]
              sm:text-xs

              ${
                added
                  ? `
                    border-brand-green
                    bg-brand-green
                    text-white
                    shadow-green-glow
                  `
                  : `
                    border-brand-green/15
                    bg-white
                    text-brand-green
                    shadow-soft
                    hover:-translate-y-0.5
                    hover:border-brand-green/30
                    hover:bg-brand-green/5
                  `
              }
            `}
          >

            {added ? (

              <>
                <Check
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                <span>
                  Added
                </span>
              </>

            ) : (

              <>
                <Plus
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                <span>
                  Cart
                </span>
              </>

            )}

          </button>


          {/* ==================================================================
              PRIMARY BUY NOW CTA
              ================================================================== */}

          <button
            type="button"
            onClick={handleBuyNow}
            className="
              group/buy
              relative
              flex
              min-h-[46px]
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-xl
              border
              border-brand-saffron-dark/70
              bg-brand-saffron
              px-2.5
              py-2
              text-[10px]
              font-bold
              tracking-[0.01em]
              text-white
              shadow-[0_5px_0_rgba(169,111,24,0.65),0_9px_18px_rgba(200,138,42,0.20)]
              transition-all
              duration-200
              ease-ks-standard
              hover:-translate-y-0.5
              hover:bg-brand-saffron-light
              hover:shadow-[0_6px_0_rgba(169,111,24,0.55),0_13px_24px_rgba(200,138,42,0.28)]
              active:translate-y-[3px]
              active:shadow-[0_2px_0_rgba(169,111,24,0.65),0_5px_10px_rgba(200,138,42,0.18)]
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-saffron
              focus-visible:ring-offset-2
              focus-visible:ring-offset-white
              sm:text-xs
            "
          >

            {/* ================================================================
                SOFT GLASS HIGHLIGHT
                ================================================================ */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-1/2
                bg-gradient-to-b
                from-white/20
                to-transparent
                opacity-80
              "
            />


            {/* ================================================================
                HOVER SHINE
                ================================================================ */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -left-10
                top-0
                h-full
                w-8
                rotate-[18deg]
                bg-white/25
                blur-sm
                transition-transform
                duration-500
                ease-ks-standard
                group-hover/buy:translate-x-[150px]
              "
            />


            {/* ================================================================
                ICON
                ================================================================ */}

            <Zap
              className="
                relative
                z-10
                h-3.5
                w-3.5
                fill-current
                transition-transform
                duration-200
                group-hover/buy:scale-110
                group-hover/buy:-rotate-3
              "
              aria-hidden="true"
            />


            {/* ================================================================
                LABEL
                ================================================================ */}

            <span
              className="
                relative
                z-10
              "
            >
              Buy Now
            </span>


            {/* ================================================================
                ARROW
                ================================================================ */}

            <ArrowRight
              className="
                relative
                z-10
                h-3.5
                w-3.5
                transition-transform
                duration-200
                group-hover/buy:translate-x-1
              "
              aria-hidden="true"
            />

          </button>

        </div>

      </div>


      {/* ======================================================================
          BOTTOM DEPTH LINE
          =================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-6
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-brand-green/10
          to-transparent
        "
        aria-hidden="true"
      />

    </article>
  );
}
