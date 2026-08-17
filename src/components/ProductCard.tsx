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
} from 'lucide-react';

import type { ProductFamily, Sku } from '@/data/products';
import { PACK_LABELS } from '@/data/products';
import { ProductImage } from '@/components/ProductImage';
import {
  useCart,
  formatPrice,
} from '@/context/CartContext';
import { StarRating } from '@/components/StarRating';
import { ReviewService } from '@/services/review-service';

import type { ReviewSummary } from '@/types/reviews';

interface ProductCardProps {
  product: ProductFamily;
  className?: string;
}

function isPurchasableSku(
  sku: Sku | undefined,
): sku is Sku & {
  websitePrice: number;
  mrp: number;
} {
  return (
    !!sku &&
    sku.available === true &&
    sku.websitePrice !== null &&
    Number.isFinite(sku.websitePrice) &&
    sku.mrp !== null &&
    Number.isFinite(sku.mrp)
  );
}

export function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [selectedSkuIndex, setSelectedSkuIndex] =
    useState(0);

  const [added, setAdded] = useState(false);

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const selectId = useId();

  const purchasableSkus = useMemo(
    () =>
      product.skus.filter((sku) =>
        isPurchasableSku(sku),
      ),
    [product.skus],
  );

  const selectedSku =
    purchasableSkus[selectedSkuIndex] ??
    purchasableSkus[0];

  useEffect(() => {
    if (
      selectedSkuIndex >= purchasableSkus.length
    ) {
      setSelectedSkuIndex(0);
    }
  }, [
    selectedSkuIndex,
    purchasableSkus.length,
  ]);

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

  if (!selectedSku) {
    return null;
  }

  const packLabel =
    PACK_LABELS[selectedSku.packSize] ||
    `${selectedSku.packSize}g`;

  const isPurchasable =
    isPurchasableSku(selectedSku);

  const hasReviews =
    !!reviewSummary &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;

  const handleAdd = () => {
    if (!isPurchasable) {
      return;
    }

    addItem(selectedSku.sku, 1);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!isPurchasable) {
      return;
    }

    addItem(selectedSku.sku, 1);
    navigate('/checkout');
  };

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-brand-brown/10
        bg-white
        shadow-[0_5px_0_rgba(62,39,35,0.06),0_14px_30px_rgba(62,39,35,0.10)]
        transition-all
        duration-500
        ease-out
        [transform-style:preserve-3d]
        hover:-translate-y-2
        hover:shadow-[0_8px_0_rgba(62,39,35,0.07),0_22px_42px_rgba(62,39,35,0.15)]
        ${className}
      `}
    >
      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="
          group/image
          relative
          block
          aspect-square
          overflow-hidden
          bg-brand-cream-dark
          [perspective:1200px]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-2
            z-0
            rounded-2xl
            bg-gradient-to-br
            from-white
            via-brand-cream
            to-brand-brown/5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-10px_25px_rgba(62,39,35,0.05)]
            transition-all
            duration-500
            group-hover/image:inset-1.5
            group-hover/image:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-14px_30px_rgba(62,39,35,0.08)]
          "
          aria-hidden="true"
        />

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
            group-hover/image:blur-[11px]
          "
          aria-hidden="true"
        />

        <div
          className="
            relative
            z-10
            h-full
            w-full
            transition-transform
            duration-500
            ease-out
            [transform-style:preserve-3d]
            group-hover/image:[transform:translateY(-5px)_rotateX(3deg)_rotateY(-2deg)_scale(1.015)]
          "
        >
          <ProductImage
            productId={product.id}
            product={product}
            variant="card"
            className="h-full w-full"
          />
        </div>

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
      </Link>

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

          <Link
            to={`/product/${product.slug}#reviews`}
            className="
              mb-3
              inline-flex
              min-h-[30px]
              max-w-full
              items-center
              rounded-md
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-red/40
              sm:mb-4
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
              <span className="inline-flex items-center gap-1.5 text-[9px] text-brand-brown/40 sm:text-xs">
                <span
                  className="
                    inline-block
                    h-2.5
                    w-2.5
                    animate-spin
                    rounded-full
                    border-2
                    border-brand-brown/15
                    border-t-brand-red
                    sm:h-3
                    sm:w-3
                  "
                />
                Loading reviews...
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

                <span>No reviews yet</span>
              </span>
            )}
          </Link>

          <div className="mb-3 sm:mb-4">
            {product.category === 'combo' ? (
              <div
                className="
                  inline-flex
                  max-w-full
                  items-center
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
                  Pack Size
                </label>

                <div className="relative w-full">
                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={(event) =>
                      setSelectedSkuIndex(
                        Number(
                          event.target.value,
                        ),
                      )
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
                      pr-8
                      text-[10px]
                      font-semibold
                      text-brand-brown
                      outline-none
                      transition-all
                      focus:border-brand-red
                      focus:ring-2
                      focus:ring-brand-red/10
                      hover:border-brand-brown/25
                      sm:text-xs
                    "
                    aria-label={`Select pack size for ${product.name}`}
                  >
                    {purchasableSkus.map(
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
                      text-brand-brown/45
                    "
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-1 flex flex-wrap items-baseline">
            <span
              className="
                text-lg
                font-bold
                text-brand-brown
                sm:text-xl
              "
            >
              {isPurchasable
                ? formatPrice(
                    selectedSku.websitePrice,
                  )
                : 'Price Coming Soon'}
            </span>
          </div>

          <p
            className="
              mb-4
              text-[9px]
              leading-relaxed
              text-brand-brown/55
              sm:text-2xs
            "
          >
            <span className="font-semibold text-green-700">
              Free shipping
            </span>
          </p>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!isPurchasable}
            className={`
              group/cart
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
              active:translate-y-[2px]
              active:shadow-none
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:text-xs
              md:text-sm

              ${
                added
                  ? `
                    bg-green-700
                    text-white
                    shadow-[0_4px_0_#14532d]
                  `
                  : `
                    border
                    border-brand-brown/15
                    bg-white
                    text-brand-brown
                    shadow-[0_4px_0_rgba(78,52,46,0.10)]
                    hover:-translate-y-0.5
                    hover:border-brand-brown/25
                    hover:bg-brand-cream
                    hover:shadow-[0_6px_0_rgba(78,52,46,0.12)]
                  `
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
                />
                <span>Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isPurchasable}
            className="
              relative
              flex
              min-h-[44px]
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-xl
              bg-brand-red
              px-2
              py-2
              text-[10px]
              font-bold
              text-white
              shadow-[0_4px_0_#b9230a]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-brand-red-dark
              hover:shadow-[0_6px_0_#a51f08]
              active:translate-y-[2px]
              active:shadow-none
              disabled:cursor-not-allowed
              disabled:opacity-50
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
            />

            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}
