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


/* ============================================================================
 * KAWAD SWAD 2.0
 * CENTRAL PRODUCT CARD
 *
 * Responsibilities:
 * - Product presentation
 * - Product discovery
 * - Pack-size selection
 * - Review proof
 * - Cart action
 * - Buy-now action
 *
 * Commercial authority:
 *
 * sales-config.ts
 *       ↓
 * ProductService
 *       ↓
 * ProductCard
 *
 * This component MUST NOT invent:
 * - prices
 * - discounts
 * - availability
 * - SKU rules
 *
 * Behavioral goal:
 *
 * NOTICE → UNDERSTAND → TRUST → CHOOSE → BUY
 * ========================================================================== */


/* ============================================================================
 * PROPS
 * ========================================================================== */

interface ProductCardProps {
  product: ProductFamily;
  className?: string;
}


/* ============================================================================
 * PRODUCT CARD
 * ========================================================================== */

export function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const {
    addItem,
  } = useCart();

  const navigate = useNavigate();

  const selectId = useId();

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
   * CENTRAL PRODUCT RESOLUTION
   * ======================================================================== */

  const purchasableSkus = useMemo(() => {
    return ProductService.getAvailableSkus(
      product,
    );
  }, [product]);


  /* ==========================================================================
   * SELECTED SKU
   * ======================================================================== */

  const selectedSku =
    purchasableSkus[selectedSkuIndex] ??
    purchasableSkus[0];


  /* ==========================================================================
   * KEEP SKU SELECTION VALID
   * ======================================================================== */

  useEffect(() => {
    if (purchasableSkus.length === 0) {
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
   * REVIEW SUMMARY
   *
   * Reviews are proof, not decoration.
   * ======================================================================== */

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
   * NO PURCHASABLE SKU
   * ======================================================================== */

  if (!selectedSku) {
    return null;
  }


  /* ==========================================================================
   * DISPLAY VALUES
   * ======================================================================== */

  const packLabel =
    PACK_LABELS[selectedSku.packSize] ??
    `${selectedSku.packSize}g`;

  const hasReviews =
    reviewSummary !== null &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;


  /* ==========================================================================
   * ADD TO CART
   * ======================================================================== */

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
   * BUY NOW
   * ======================================================================== */

  const handleBuyNow = () => {
    addItem(
      selectedSku.sku,
      1,
    );

    navigate('/checkout');
  };


  /* ==========================================================================
   * RENDER
   * ======================================================================== */

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
        ${className}
      `}
      data-product-id={product.id}
      data-product-category={product.category}
    >

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
          aspect-square
          w-full
          bg-brand-cream-dark
        "
      >

        {/* Adaptive product surface */}

        <div
          className="
            image-adaptive-surface
            absolute
            inset-2
            rounded-2xl
            shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-10px_25px_rgba(62,39,35,0.05)]
            transition-all
            duration-500
            group-hover/image:inset-1.5
          "
          aria-hidden="true"
        />

        {/* Grounding shadow */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-[9%]
            left-1/2
            z-0
            h-[8%]
            w-[48%]
            -translate-x-1/2
            rounded-[50%]
            bg-brand-brown/15
            blur-[9px]
            transition-all
            duration-500
            group-hover/image:w-[54%]
            group-hover/image:bg-brand-brown/20
          "
          aria-hidden="true"
        />

        {/* Product */}

        <div
          className="
            product-visual
            relative
            z-10
            h-full
            w-full
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
            "
          />
        </div>

        {/* Soft lighting layer */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            bg-gradient-to-br
            from-white/25
            via-transparent
            to-brand-brown/5
            opacity-70
            transition-opacity
            duration-500
            group-hover/image:opacity-100
          "
          aria-hidden="true"
        />

        {/* Inner physical frame */}

        <div
          className="
            pointer-events-none
            absolute
            inset-2
            z-30
            rounded-2xl
            border
            border-white/50
            transition-all
            duration-500
            group-hover/image:inset-1.5
          "
          aria-hidden="true"
        />

        {/* Product discovery hint */}

        <span
          className="
            pointer-events-none
            absolute
            bottom-3
            left-3
            z-40
            hidden
            rounded-full
            bg-white/90
            px-2.5
            py-1
            text-[9px]
            font-semibold
            text-brand-green
            opacity-0
            shadow-sm
            backdrop-blur-sm
            transition-opacity
            duration-300
            sm:block
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
          p-4
          sm:p-5
        "
      >

        <div className="min-w-0">

          {/* ================================================================
              PRODUCT IDENTITY
              ============================================================= */}

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
              hover:text-brand-green
              sm:text-base
            "
            title={product.name}
          >
            {product.name}
          </Link>

          <p
            className="
              mb-2
              mt-1
              truncate
              text-[10px]
              text-brand-brown/55
              sm:mb-3
              sm:text-xs
            "
            title={product.variant}
          >
            {product.variant}
          </p>


          {/* ================================================================
              SOCIAL PROOF
              ============================================================= */}

          <Link
            to={`/product/${product.slug}#reviews`}
            className="
              mb-3
              inline-flex
              min-h-[30px]
              max-w-full
              items-center
              rounded-md
              transition-opacity
              hover:opacity-80
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-saffron/40
              sm:mb-4
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


          {/* ================================================================
              PACK SELECTION
              ============================================================= */}

          <div className="mb-3 sm:mb-4">

            {product.category === 'combo' ? (

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
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  text-brand-brown
                  shadow-soft
                  sm:text-xs
                "
              >
                <ShoppingBag
                  className="h-3 w-3 shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate">
                  {packLabel}
                </span>
              </div>

            ) : (

              <div className="space-y-1.5">

                <label
                  htmlFor={`pack-size-${selectId}`}
                  className="
                    block
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-brand-brown/60
                    sm:text-2xs
                  "
                >
                  Choose your pack
                </label>

                <div className="relative w-full">

                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={(event) => {
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
                    }}
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
                      pr-8
                      text-[10px]
                      font-semibold
                      text-brand-brown
                      outline-none
                      transition-all
                      focus:border-brand-green
                      focus:ring-2
                      focus:ring-brand-green/10
                      sm:text-xs
                    "
                    aria-label={`Select pack size for ${product.name}`}
                  >
                    {purchasableSkus.map(
                      (sku, index) => (
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


          {/* ================================================================
              PRICE
              ============================================================= */}

          <div className="mb-1 flex flex-wrap items-baseline gap-2">

            <span className="price-emphasis text-lg sm:text-xl">
              {formatPrice(
                selectedSku.websitePrice,
              )}
            </span>

            {selectedSku.mrp >
              selectedSku.websitePrice && (
              <span className="price-secondary">
                {formatPrice(
                  selectedSku.mrp,
                )}
              </span>
            )}

          </div>


          {/* ================================================================
              TRUST / SHIPPING
              ============================================================= */}

          <p
            className="
              mb-4
              flex
              items-center
              gap-1.5
              text-[9px]
              leading-relaxed
              text-brand-brown/55
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

            <span>
              <strong className="font-semibold text-brand-green">
                Free shipping
              </strong>
            </span>
          </p>

        </div>


        {/* ====================================================================
            PRIMARY ACTION AREA

            Behavioral hierarchy:
            Cart = secondary commitment
            Buy Now = primary conversion
            ================================================================= */}

        <div className="mt-1 grid grid-cols-2 gap-2">

          {/* Add to Cart */}

          <button
            type="button"
            onClick={handleAdd}
            aria-live="polite"
            className={`
              relative
              flex
              min-h-[44px]
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-xl
              px-2
              py-2
              text-[10px]
              font-semibold
              transition-all
              duration-200
              active:translate-y-[1px]
              sm:text-xs
              md:text-sm
              ${
                added
                  ? `
                    bg-brand-green
                    text-white
                    shadow-[0_4px_0_#14532d]
                  `
                  : `
                    border
                    border-brand-green/15
                    bg-white
                    text-brand-green
                    shadow-[0_4px_0_rgba(23,60,50,0.08)]
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


          {/* Buy Now */}

          <button
            type="button"
            onClick={handleBuyNow}
            className="
              btn-buy
              min-h-[44px]
              rounded-xl
              px-2
              py-2
              text-[10px]
              sm:text-xs
              md:text-sm
            "
          >
            <Zap
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span>
              Buy Now
            </span>
          </button>

        </div>

      </div>
    </article>
  );
}
