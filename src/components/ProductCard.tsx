import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Check, ChevronDown, Zap, Star } from 'lucide-react';
import type { ProductFamily } from '../data/products';
import { PACK_LABELS } from '../data/products';
import { ProductImage } from '../components/ProductImage';
import { useCart, formatPrice } from '../context/CartContext';

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

  const selectId = useId();

  const selectedSku =
    product.skus[selectedSkuIndex] || product.skus[0];

  const discount = Math.round(
    ((selectedSku.mrp - selectedSku.websitePrice) /
      selectedSku.mrp) *
      100,
  );

  const packLabel =
    PACK_LABELS[selectedSku.packSize] ||
    `${selectedSku.packSize}g`;

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
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSkuIndex(Number(e.target.value));
  };

  const isCombo =
    product.category === 'combo' ||
    product.skus.length === 1;

  /*
   * Rating support
   *
   * These values are optional and are intentionally not given
   * fake/default numbers. The real review system will be connected
   * later to product-specific reviews.
   */
  const productWithRating = product as ProductFamily & {
    rating?: number;
    reviewCount?: number;
  };

  const rating = productWithRating.rating;
  const reviewCount = productWithRating.reviewCount;

  const hasRating =
    typeof rating === 'number' &&
    rating > 0 &&
    typeof reviewCount === 'number' &&
    reviewCount > 0;

  return (
    <div
      className={`
        card
        overflow-hidden
        bg-white
        border
        border-brand-brown/5
        flex
        flex-col
        h-full
        hover:shadow-lift
        transition-all
        duration-300
        ${className}
      `}
    >
      {/* Product Image */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="
          relative
          aspect-square
          overflow-hidden
          bg-brand-cream-dark
          block
          group
        "
      >
        <ProductImage
          productId={product.id}
          product={product}
          variant="card"
          className="
            w-full
            h-full
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {discount > 0 && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
            <span className="badge-red text-[10px] sm:text-xs">
              {discount}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* Information */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="
              font-serif
              font-semibold
              text-brand-brown
              text-sm
              sm:text-base
              leading-tight
              mb-1
              hover:text-brand-red
              transition-colors
              block
            "
          >
            {product.name}
          </Link>

          {/* Variant */}
          <p className="text-[11px] sm:text-xs text-brand-brown/60 mb-2.5 sm:mb-3">
            {product.variant}
          </p>

          {/* Rating */}
          {hasRating && (
            <Link
              to={`/product/${product.slug}#reviews`}
              className="
                inline-flex
                items-center
                gap-1
                mb-3
                group/rating
                rounded-md
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-red/40
              "
              aria-label={`${rating.toFixed(1)} out of 5 stars from ${reviewCount} reviews`}
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-md
                  bg-emerald-600
                  text-white
                  px-1.5
                  py-0.5
                  text-[10px]
                  sm:text-xs
                  font-bold
                "
              >
                {rating.toFixed(1)}
                <Star
                  className="w-2.5 h-2.5 fill-current"
                />
              </span>

              <span
                className="
                  text-[10px]
                  sm:text-xs
                  text-brand-brown/55
                  group-hover/rating:text-brand-red
                  transition-colors
                "
              >
                {reviewCount}{' '}
                {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </Link>
          )}

          {/* Pack Size */}
          <div className="mb-3 sm:mb-4">
            {isCombo ? (
              <div
                className="
                  inline-block
                  px-2.5
                  sm:px-3
                  py-1
                  bg-brand-cream
                  text-brand-brown
                  rounded-lg
                  text-[10px]
                  sm:text-xs
                  font-semibold
                  border
                  border-brand-brown/10
                "
              >
                {packLabel} Combo
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor={`pack-size-${selectId}`}
                  className="
                    block
                    text-2xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-brand-brown/70
                  "
                >
                  Pack Size
                </label>

                <div className="relative w-full">
                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={handleSelectChange}
                    className="
                      w-full
                      appearance-none
                      bg-brand-cream/50
                      border
                      border-brand-brown/15
                      rounded-xl
                      px-2.5
                      sm:px-3
                      py-2
                      pr-8
                      text-[11px]
                      sm:text-xs
                      font-semibold
                      text-brand-brown
                      focus:outline-none
                      focus:border-brand-red
                      cursor-pointer
                      transition-colors
                    "
                  >
                    {product.skus.map(
                      (skuObj, idx) => (
                        <option
                          key={skuObj.sku}
                          value={idx}
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
                      absolute
                      right-2.5
                      top-1/2
                      -translate-y-1/2
                      w-3.5
                      h-3.5
                      text-brand-brown/50
                      pointer-events-none
                    "
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2.5 mb-1 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-brand-red">
              {formatPrice(selectedSku.websitePrice)}
            </span>

            <span
              className="
                text-xs
                sm:text-sm
                text-brand-brown/40
                line-through
              "
            >
              {formatPrice(selectedSku.mrp)}
            </span>
          </div>

          {/* Shipping */}
          <p className="text-[10px] sm:text-2xs text-brand-brown/60 mb-3 sm:mb-4">
            {selectedSku.freeShipping ? (
              <span className="text-green-600 font-medium">
                Free shipping
              </span>
            ) : (
              `+ ${formatPrice(selectedSku.shipping)} shipping`
            )}
          </p>
        </div>

        {/* Buy Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2">
          <button
            type="button"
            onClick={handleAdd}
            className={`
              min-h-[42px]
              sm:min-h-0
              py-2
              sm:py-2.5
              px-2
              sm:px-3
              rounded-xl
              font-semibold
              text-xs
              sm:text-sm
              flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              transition-all
              active:scale-[0.98]
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
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="
              min-h-[42px]
              sm:min-h-0
              py-2
              sm:py-2.5
              px-2
              sm:px-3
              rounded-xl
              font-semibold
              text-xs
              sm:text-sm
              flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              bg-brand-red
              text-white
              hover:opacity-90
              transition-opacity
              active:scale-[0.98]
            "
            aria-label={`Buy ${product.name} (${packLabel}) now`}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
