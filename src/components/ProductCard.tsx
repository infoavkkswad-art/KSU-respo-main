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

import type { ProductFamily } from '@/data/products';
import { PACK_LABELS } from '@/data/products';
import { ProductImage } from '@/components/ProductImage';
import { useCart, formatPrice } from '@/context/CartContext';
import { StarRating } from '@/components/StarRating';
import { ReviewService } from '@/services/review-service';

import type { ReviewSummary } from '@/types/reviews';

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

  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const selectId = useId();

  const selectedSku =
    product.skus[selectedSkuIndex] || product.skus[0];

  useEffect(() => {
    let cancelled = false;

    const loadReviewSummary = async () => {
      setReviewsLoading(true);

      try {
        const summary = await ReviewService.getSummary(product.id);

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

  const discount =
    selectedSku.mrp > 0
      ? Math.max(
          0,
          Math.round(
            ((selectedSku.mrp - selectedSku.websitePrice) /
              selectedSku.mrp) *
              100,
          ),
        )
      : 0;

  const packLabel =
    PACK_LABELS[selectedSku.packSize] ||
    `${selectedSku.packSize}g`;

  const isCombo = product.category === 'combo';

  const hasReviews =
    !!reviewSummary &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;

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

  return (
    <article
      className={`
        group flex h-full min-w-0 flex-col overflow-hidden
        rounded-2xl border border-brand-green/10
        bg-white shadow-soft
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lift
        ${className}
      `}
    >
      {/* Product image */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="
          relative block aspect-square overflow-hidden
          bg-brand-ivory-dark
        "
      >
        <ProductImage
          productId={product.id}
          product={product}
          variant="card"
          className="
            h-full w-full
            transition-transform duration-700 ease-out
            group-hover:scale-[1.025]
          "
        />

        {discount > 0 && (
          <span
            className="
              absolute right-2 top-2 z-10
              rounded-full bg-brand-saffron px-2 py-1
              text-[9px] font-bold uppercase tracking-wide text-white
              sm:right-3 sm:top-3 sm:text-[10px]
            "
          >
            {discount}% OFF
          </span>
        )}
      </Link>

      {/* Information */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 md:p-5">
        <div className="min-w-0">
          <Link
            to={`/product/${product.slug}`}
            className="
              block truncate font-serif
              text-sm font-semibold leading-tight
              text-brand-green transition-colors
              hover:text-brand-saffron
              sm:text-base
            "
            title={product.name}
          >
            {product.name}
          </Link>

          <p
            className="
              mb-2 mt-1 truncate text-[10px]
              text-brand-brown/55 sm:mb-3 sm:text-xs
            "
            title={product.variant}
          >
            {product.variant}
          </p>

          {/* Reviews */}
          <Link
            to={`/product/${product.slug}#reviews`}
            className="
              mb-2.5 inline-flex min-h-[30px] max-w-full
              items-center rounded-md
              focus:outline-none focus-visible:ring-2
              focus-visible:ring-brand-saffron/40
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
              <span className="inline-flex items-center gap-1.5 text-[9px] text-brand-brown/40 sm:text-xs">
                <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-brand-green/15 border-t-brand-saffron sm:h-3 sm:w-3" />
                Loading reviews...
              </span>
            ) : hasReviews ? (
              <StarRating
                rating={reviewSummary!.averageRating}
                reviewCount={reviewSummary!.reviewCount}
                size="sm"
                showValue
                showCount
              />
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] text-brand-brown/45 sm:gap-1.5 sm:text-xs">
                <span
                  className="shrink-0 tracking-[1px] text-brand-brown/25"
                  aria-hidden="true"
                >
                  ☆☆☆☆☆
                </span>
                <span>No reviews yet</span>
              </span>
            )}
          </Link>

          {/* Pack */}
          <div className="mb-3 sm:mb-4">
            {isCombo ? (
              <div className="inline-flex max-w-full items-center rounded-lg border border-brand-green/10 bg-brand-ivory px-2.5 py-1 text-[9px] font-semibold text-brand-green sm:px-3 sm:text-xs">
                <span className="truncate">
                  {packLabel} Combo
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor={`pack-size-${selectId}`}
                  className="
                    block text-[9px] font-bold uppercase
                    tracking-wider text-brand-brown/60 sm:text-2xs
                  "
                >
                  Pack Size
                </label>

                <div className="relative w-full">
                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={(event) =>
                      setSelectedSkuIndex(Number(event.target.value))
                    }
                    className="
                      min-h-[38px] w-full appearance-none
                      cursor-pointer rounded-xl
                      border border-brand-green/15
                      bg-brand-ivory-light px-2.5 py-2 pr-8
                      text-[10px] font-semibold text-brand-green
                      outline-none transition-colors
                      focus:border-brand-green
                      focus:ring-2 focus:ring-brand-saffron/15
                      sm:min-h-[40px] sm:px-3 sm:text-xs
                    "
                    aria-label={`Select pack size for ${product.name}`}
                  >
                    {product.skus.map((skuObj, index) => (
                      <option key={skuObj.sku} value={index}>
                        {PACK_LABELS[skuObj.packSize] ||
                          `${skuObj.packSize}g`}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none absolute right-2.5 top-1/2
                      h-3.5 w-3.5 -translate-y-1/2 text-brand-green/45
                    "
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-bold text-brand-green sm:text-lg">
              {formatPrice(selectedSku.websitePrice)}
            </span>

            {selectedSku.mrp > selectedSku.websitePrice && (
              <span className="text-[10px] text-brand-brown/35 line-through sm:text-sm">
                {formatPrice(selectedSku.mrp)}
              </span>
            )}
          </div>

          {/* Shipping */}
          <p className="mb-3 text-[9px] leading-relaxed text-brand-brown/55 sm:mb-4 sm:text-2xs">
            {selectedSku.freeShipping ? (
              <span className="font-semibold text-brand-green">
                Free shipping
              </span>
            ) : (
              <>
                + {formatPrice(selectedSku.shipping)} shipping
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-1 grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className={`
              flex min-h-[40px] items-center justify-center gap-1
              rounded-xl px-1.5 py-2 text-[10px] font-semibold
              transition-all active:scale-[0.98]
              sm:min-h-[42px] sm:gap-1.5 sm:px-3 sm:text-xs md:text-sm
              ${
                added
                  ? 'bg-brand-green text-white'
                  : 'border border-brand-green/20 text-brand-green hover:bg-brand-green/5'
              }
            `}
            aria-label={`Add ${product.name} (${packLabel}) to cart`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="
              flex min-h-[40px] items-center justify-center gap-1
              rounded-xl bg-brand-saffron px-1.5 py-2
              text-[10px] font-semibold text-white
              transition-all hover:bg-brand-saffron-dark
              active:scale-[0.98]
              sm:min-h-[42px] sm:gap-1.5 sm:px-3 sm:text-xs md:text-sm
            "
            aria-label={`Buy ${product.name} (${packLabel}) now`}
          >
            <Zap className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}
