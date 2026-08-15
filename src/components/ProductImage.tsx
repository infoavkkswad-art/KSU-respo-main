import { getProductFamilyImage } from '@/data/product-images';
import type { ProductFamily } from '@/data/products';
import { CATEGORY_LABELS } from '@/data/products';

interface ProductImageProps {
  productId?: string;
  product?: ProductFamily;
  variant?: 'card' | 'detail' | 'hero';
  className?: string;
}

export function ProductImage({
  productId,
  product,
  variant = 'card',
  className = '',
}: ProductImageProps) {
  const resolvedId =
    productId || product?.id || '';

  const imageConfig =
    getProductFamilyImage(resolvedId);

  const targetProduct = product;

  const categoryLabel =
    targetProduct
      ? CATEGORY_LABELS[
          targetProduct.category
        ]
      : 'Papad';

  const isAvailable =
    imageConfig.status === 'available' &&
    Boolean(imageConfig.primary);

  /*
   * Hero and detail images are immediately
   * visible above the fold on their respective
   * pages. Card images remain lazy-loaded.
   */
  const isEager =
    variant === 'hero' ||
    variant === 'detail';

  const placeholderIconSize =
    variant === 'hero'
      ? 'text-7xl sm:text-8xl lg:text-9xl'
      : variant === 'detail'
        ? 'text-6xl sm:text-7xl lg:text-8xl'
        : 'text-5xl sm:text-6xl';

  const placeholderPadding =
    variant === 'hero'
      ? 'p-6 sm:p-8 lg:p-10'
      : 'p-4 sm:p-6';

  return (
    <div
      className={`
        relative
        flex
        h-full
        w-full
        min-h-0
        items-center
        justify-center
        overflow-hidden
        ${className}
      `}
      role="img"
      aria-label={imageConfig.alt}
    >
      {isAvailable ? (
        <>
          {/* Product image */}
          <img
            src={imageConfig.primary}
            alt={imageConfig.alt}
            loading={
              isEager
                ? 'eager'
                : 'lazy'
            }
            decoding={
              isEager
                ? 'sync'
                : 'async'
            }
            {...(isEager
              ? {
                  fetchPriority:
                    'high' as const,
                }
              : {})}
            className="
              block
              h-full
              w-full
              object-contain
              p-2
              transition-transform
              duration-500
              sm:p-3
            "
          />

          {/* Soft image overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-brown/[0.03]
              via-transparent
              to-white/[0.04]
            "
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          {/* ==============================================================
              CONTROLLED IMAGE PLACEHOLDER
          ============================================================== */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-brand-cream-dark
              via-brand-cream
              to-brand-yellow/10
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-dots
              opacity-40
            "
            aria-hidden="true"
          />

          {/* Center content */}
          <div
            className={`
              relative
              z-10
              flex
              max-w-full
              flex-col
              items-center
              justify-center
              gap-2
              text-center
              ${placeholderPadding}
              sm:gap-3
            `}
          >
            <div
              className={`
                font-serif
                font-bold
                leading-none
                text-brand-red/20
                ${placeholderIconSize}
              `}
              aria-hidden="true"
            >
              ◯
            </div>

            <div className="min-w-0 max-w-[90%]">
              <p
                className="
                  truncate
                  font-serif
                  text-sm
                  font-semibold
                  text-brand-brown
                  sm:text-base
                "
              >
                {imageConfig.alt}
              </p>

              <p
                className="
                  mt-1
                  text-[8px]
                  font-sans
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-brand-brown/45
                  sm:text-2xs
                  sm:tracking-wider
                "
              >
                Product image coming soon
              </p>
            </div>
          </div>

          {/* Category */}
          {targetProduct && (
            <div
              className="
                absolute
                left-2
                top-2
                z-10
                sm:left-3
                sm:top-3
              "
            >
              <span
                className="
                  badge-brown
                  px-2
                  py-1
                  text-[8px]
                  sm:text-2xs
                "
              >
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Asset status */}
          <div
            className="
              absolute
              bottom-2
              right-2
              z-10
              sm:bottom-3
              sm:right-3
            "
          >
            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-brand-brown/30
                sm:text-2xs
                sm:tracking-wider
              "
            >
              Pending Asset
            </span>
          </div>
        </>
      )}
    </div>
  );
}
