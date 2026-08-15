import {
  useEffect,
  useId,
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
} from 'lucide-react';

import type { ProductFamily } from '../data/products';

import {
  PACK_LABELS,
} from '../data/products';

import { ProductImage } from '../components/ProductImage';

import {
  useCart,
  formatPrice,
} from '../context/CartContext';

import { StarRating } from '../components/StarRating';

import { ReviewService } from '../services/review-service';

import type {
  ReviewSummary,
} from '../types/reviews';

interface ProductCardProps {
  product: ProductFamily;
  className?: string;
}

export function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [selectedSkuIndex, setSelectedSkuIndex] =
    useState(0);

  const [added, setAdded] =
    useState(false);

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const selectId = useId();

  const selectedSku =
    product.skus[selectedSkuIndex] ||
    product.skus[0];

  /*
   * Product data should always contain at least one SKU.
   * Keep the card defensive if malformed data reaches
   * the UI.
   */
  if (!selectedSku) {
    return null;
  }

  const discount =
    selectedSku.mrp > 0
      ? Math.max(
          0,
          Math.round(
            ((selectedSku.mrp -
              selectedSku.websitePrice) /
              selectedSku.mrp) *
              100,
          ),
        )
      : 0;

  const packLabel =
    PACK_LABELS[selectedSku.packSize] ||
    `${selectedSku.packSize}g`;

  /*
   * Load the real approved-review summary.
   * No fake rating is ever displayed.
   */
  useEffect(() => {
    let cancelled = false;

    const loadReviewSummary = async () => {
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
    };

    loadReviewSummary();

    return () => {
      cancelled = true;
    };
  }, [product.id]);

  /*
   * Cart actions
   */
  const handleAdd = () => {
    addItem(selectedSku.sku, 1);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    addItem(selectedSku.sku, 1);
    navigate('/checkout');
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSkuIndex(
      Number(event.target.value),
    );
  };

  /*
   * Only the actual combo category gets the
   * combo presentation.
   */
  const isCombo =
    product.category === 'combo';

  const hasReviews =
    !!reviewSummary &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;

  return (
    <article
      className={`
        card
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        border
        border-brand-brown/5
        bg-white
        transition-all
        duration-300
        hover:shadow-lift
        ${className}
      `}
    >
      {/* ================================================================
          PRODUCT IMAGE
      ================================================================= */}

      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="
          group
          relative
          block
          aspect-square
          min-h-0
          overflow-hidden
          bg-brand-cream-dark
        "
      >
        <ProductImage
          productId={product.id}
          product={product}
          variant="card"
          className="
            h-full
            w-full
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {discount > 0 && (
          <div
            className="
              absolute
              right-2
              top-2
              z-10
              sm:right-3
              sm:top-3
            "
          >
            <span
              className="
                badge-red
                px-2
                py-1
                text-[9px]
                sm:text-[10px]
                md:text-xs
              "
            >
              {discount}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* ================================================================
          PRODUCT INFORMATION
      ================================================================= */}

      <div
        className="
          flex
          flex-1
          flex-col
          justify-between
          p-2.5
          sm:p-4
          md:p-5
        "
      >
        <div className="min-w-0">
          {/* Product name */}

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
              hover:text-brand-red
              sm:text-base
            "
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Variant */}

          <p
            className="
              mt-1
              mb-2
              truncate
              text-[10px]
              text-brand-brown/60
              sm:mb-3
              sm:text-xs
            "
            title={product.variant}
          >
            {product.variant}
          </p>

          {/* ============================================================
              RATING
          ============================================================= */}

          <Link
            to={`/product/${product.slug}#reviews`}
            className="
              mb-2.5
              inline-flex
              min-h-[30px]
              max-w-full
              items-center
              rounded-md
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-red/40
              sm:mb-3
            "
            aria-label={
              reviewsLoading
                ? `Loading reviews for ${product.name}`
                : hasReviews
                  ? `${reviewSummary!.averageRating.toFixed(1)} out of 5 stars from ${reviewSummary!.reviewCount} reviews`
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
                    rounded-full
                    border-2
                    border-brand-brown/20
                    border-t-brand-red
                    animate-spin
                    sm:h-3
                    sm:w-3
                  "
                />

                <span className="truncate">
                  Loading reviews...
                </span>
              </span>
            ) : hasReviews ? (
              <StarRating
                rating={
                  reviewSummary!.averageRating
                }
                reviewCount={
                  reviewSummary!.reviewCount
                }
                size="sm"
                showValue
                showCount
              />
            ) : (
              <span
                className="
                  inline-flex
                  min-w-0
                  items-center
                  gap-1
                  text-[9px]
                  text-brand-brown/50
                  transition-colors
                  hover:text-brand-red
                  sm:gap-1.5
                  sm:text-xs
                "
              >
                <span
                  className="
                    shrink-0
                    leading-none
                    tracking-[1px]
                    text-brand-brown/35
                  "
                  aria-hidden="true"
                >
                  ☆☆☆☆☆
                </span>

                <span className="truncate">
                  No reviews yet
                </span>
              </span>
            )}
          </Link>

          {/* ============================================================
              PACK SIZE
          ============================================================= */}

          <div className="mb-3 sm:mb-4">
            {isCombo ? (
              <div
                className="
                  inline-flex
                  max-w-full
                  items-center
                  rounded-lg
                  border
                  border-brand-brown/10
                  bg-brand-cream
                  px-2.5
                  py-1
                  text-[9px]
                  font-semibold
                  text-brand-brown
                  sm:px-3
                  sm:text-xs
                "
              >
                <span className="truncate">
                  {packLabel} Combo
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
                    text-brand-brown/70
                    sm:text-2xs
                  "
                >
                  Pack Size
                </label>

                <div className="relative w-full">
                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={
                      handleSelectChange
                    }
                    className="
                      min-h-[38px]
                      w-full
                      cursor-pointer
                      appearance-none
                      rounded-xl
                      border
                      border-brand-brown/15
                      bg-brand-cream/50
                      px-2.5
                      py-2
                      pr-8
                      text-[10px]
                      font-semibold
                      text-brand-brown
                      outline-none
                      transition-colors
                      focus:border-brand-red
                      focus:ring-2
                      focus:ring-brand-red/10
                      sm:min-h-[40px]
                      sm:px-3
                      sm:text-xs
                    "
                    aria-label={`Select pack size for ${product.name}`}
                  >
                    {product.skus.map(
                      (skuObj, index) => (
                        <option
                          key={skuObj.sku}
                          value={index}
                        >
                          {PACK_LABELS[
                            skuObj.packSize
                          ] ||
                            `${skuObj.packSize}g`}
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
                      text-brand-brown/50
                    "
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              PRICE
          ============================================================= */}

          <div
            className="
              mb-1
              flex
              flex-wrap
              items-baseline
              gap-x-1.5
              gap-y-0.5
              sm:gap-x-2.5
            "
          >
            <span
              className="
                text-base
                font-bold
                text-brand-red
                sm:text-lg
              "
            >
              {formatPrice(
                selectedSku.websitePrice,
              )}
            </span>

            <span
              className="
                text-[10px]
                text-brand-brown/40
                line-through
                sm:text-sm
              "
            >
              {formatPrice(
                selectedSku.mrp,
              )}
            </span>
          </div>

          {/* ============================================================
              SHIPPING
          ============================================================= */}

          <p
            className="
              mb-3
              text-[9px]
              leading-relaxed
              text-brand-brown/60
              sm:mb-4
              sm:text-2xs
            "
          >
            {selectedSku.freeShipping ? (
              <span className="font-medium text-green-600">
                Free shipping
              </span>
            ) : (
              <>
                +{' '}
                {formatPrice(
                  selectedSku.shipping,
                )}{' '}
                shipping
              </>
            )}
          </p>
        </div>

        {/* ================================================================
            ACTION BUTTONS
        ================================================================= */}

        <div
          className="
            mt-1
            grid
            grid-cols-2
            gap-1.5
            sm:gap-2
          "
        >
          {/* Add to cart */}

          <button
            type="button"
            onClick={handleAdd}
            className={`
              flex
              min-h-[40px]
              items-center
              justify-center
              gap-1
              rounded-xl
              px-1.5
              py-2
              text-[10px]
              font-semibold
              transition-all
              active:scale-[0.98]
              sm:min-h-[42px]
              sm:gap-1.5
              sm:px-3
              sm:text-xs
              md:text-sm
              ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'border border-brand-brown/20 text-brand-brown hover:bg-brand-brown/5'
              }
            `}
            aria-label={`Add ${product.name} (${packLabel}) to cart`}
          >
            {added ? (
              <>
                <Check
                  className="
                    h-3.5
                    w-3.5
                    shrink-0
                    sm:h-4
                    sm:w-4
                  "
                  aria-hidden="true"
                />

                <span>Added</span>
              </>
            ) : (
              <>
                <Plus
                  className="
                    h-3.5
                    w-3.5
                    shrink-0
                    sm:h-4
                    sm:w-4
                  "
                  aria-hidden="true"
                />

                <span>Cart</span>
              </>
            )}
          </button>

          {/* Buy now */}

          <button
            type="button"
            onClick={handleBuyNow}
            className="
              flex
              min-h-[40px]
              items-center
              justify-center
              gap-1
              rounded-xl
              bg-brand-red
              px-1.5
              py-2
              text-[10px]
              font-semibold
              text-white
              transition-all
              hover:bg-brand-red-dark
              active:scale-[0.98]
              sm:min-h-[42px]
              sm:gap-1.5
              sm:px-3
              sm:text-xs
              md:text-sm
            "
            aria-label={`Buy ${product.name} (${packLabel}) now`}
          >
            <Zap
              className="
                h-3.5
                w-3.5
                shrink-0
                sm:h-4
                sm:w-4
              "
              aria-hidden="true"
            />

            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}
