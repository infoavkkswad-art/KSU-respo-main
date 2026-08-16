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
  const resolvedId = productId || product?.id || '';
  const imageConfig = getProductFamilyImage(resolvedId);

  const categoryLabel = product
    ? CATEGORY_LABELS[product.category]
    : 'Papad';

  const isAvailable =
    imageConfig.status === 'available' &&
    Boolean(imageConfig.primary);

  const isEager =
    variant === 'hero' ||
    variant === 'detail';

  const imagePadding =
    variant === 'card'
      ? 'p-2 sm:p-3'
      : variant === 'detail'
        ? 'p-3 sm:p-5 lg:p-6'
        : 'p-4 sm:p-6 lg:p-8';

  const placeholderIconSize =
    variant === 'hero'
      ? 'text-7xl sm:text-8xl lg:text-9xl'
      : variant === 'detail'
        ? 'text-6xl sm:text-7xl lg:text-8xl'
        : 'text-5xl sm:text-6xl';

  return (
    <div
      className={`
        relative flex h-full w-full min-h-0
        items-center justify-center
        overflow-hidden
        [perspective:1000px]
        ${className}
      `}
      role="img"
      aria-label={imageConfig.alt}
    >
      {/* Adaptive premium background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-br
          from-white
          via-brand-cream
          to-brand-brown/5
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-[68%] w-[68%]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-white/70
          blur-2xl
        "
        aria-hidden="true"
      />

      {isAvailable ? (
        <>
          {/* Product grounding shadow */}
          <div
            className="
              pointer-events-none absolute
              bottom-[7%] left-1/2
              h-[7%] w-[58%]
              -translate-x-1/2
              rounded-[50%]
              bg-brand-brown/15
              blur-md
              transition-all duration-500
              group-hover:w-[52%]
              group-hover:bg-brand-brown/20
            "
            aria-hidden="true"
          />

          {/* Product */}
          <div
            className="
              relative z-10
              h-full w-full
              transition-transform duration-500 ease-out
              group-hover:-translate-y-1
              group-hover:scale-[1.015]
            "
          >
            <img
              src={imageConfig.primary}
              alt={imageConfig.alt}
              loading={isEager ? 'eager' : 'lazy'}
              decoding={isEager ? 'sync' : 'async'}
              {...(isEager
                ? { fetchPriority: 'high' as const }
                : {})}
              className={`
                block h-full w-full
                object-contain
                ${imagePadding}
                drop-shadow-[0_10px_10px_rgba(78,52,46,0.12)]
                transition-all duration-500
                group-hover:drop-shadow-[0_16px_14px_rgba(78,52,46,0.18)]
              `}
            />
          </div>

          {/* Controlled highlight */}
          <div
            className="
              pointer-events-none absolute inset-0 z-20
              bg-gradient-to-br
              from-white/[0.12]
              via-transparent
              to-brand-brown/[0.025]
            "
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          {/* Placeholder background */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-br
              from-brand-cream-dark
              via-brand-cream
              to-brand-yellow/10
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none absolute inset-0
              bg-dots opacity-40
            "
            aria-hidden="true"
          />

          {/* Placeholder object */}
          <div
            className="
              pointer-events-none absolute
              left-1/2 top-1/2
              h-[48%] w-[48%]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-brand-red/10
              bg-white/30
              shadow-[0_12px_24px_rgba(78,52,46,0.06)]
            "
            aria-hidden="true"
          />

          <div
            className="
              relative z-10
              flex max-w-full
              flex-col items-center justify-center
              gap-2 p-4 text-center
              sm:gap-3 sm:p-6
            "
          >
            <div
              className={`
                font-serif font-bold leading-none
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
                  truncate font-serif
                  text-sm font-semibold
                  text-brand-brown
                  sm:text-base
                "
              >
                {imageConfig.alt}
              </p>

              <p
                className="
                  mt-1 font-sans text-[8px]
                  font-medium uppercase
                  tracking-[0.12em]
                  text-brand-brown/40
                  sm:text-2xs sm:tracking-wider
                "
              >
                Product image coming soon
              </p>
            </div>
          </div>

          {product && (
            <div className="absolute left-2 top-2 z-20 sm:left-3 sm:top-3">
              <span className="badge-brown px-2 py-1 text-[8px] sm:text-2xs">
                {categoryLabel}
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3">
            <span
              className="
                text-[7px] font-bold uppercase
                tracking-[0.12em] text-brand-brown/30
                sm:text-2xs sm:tracking-wider
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
