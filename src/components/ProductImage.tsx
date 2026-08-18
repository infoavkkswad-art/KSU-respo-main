import { getProductFamilyImage } from '@/data/product-images';
import type { ProductFamily } from '@/data/products';
import { CATEGORY_LABELS } from '@/data/products';

interface ProductImageProps {
  productId?: string;
  product?: ProductFamily;
  variant?: 'card' | 'detail' | 'hero';
  className?: string;
}

/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL PRODUCT IMAGE SYSTEM

   This component owns the visual treatment of product photography.

   Design rules:
   - Product image remains the source of truth.
   - Background adapts around the product without competing with packaging.
   - Product receives consistent grounding and depth.
   - Card / detail / hero use different visual breathing room.
   - Missing assets receive a deliberate branded fallback.
   - No product-specific visual rules belong in ProductCard.
   ========================================================================== */

const variantConfig = {
  card: {
    padding: 'p-2 sm:p-3',
    stageClass: 'product-image-stage-card',
    productClass: 'product-image-object-card',
  },

  detail: {
    padding: 'p-3 sm:p-5 lg:p-6',
    stageClass: 'product-image-stage-detail',
    productClass: 'product-image-object-detail',
  },

  hero: {
    padding: 'p-4 sm:p-6 lg:p-8',
    stageClass: 'product-image-stage-hero',
    productClass: 'product-image-object-hero',
  },
} as const;

export function ProductImage({
  productId,
  product,
  variant = 'card',
  className = '',
}: ProductImageProps) {
  const resolvedId =
    productId ||
    product?.id ||
    '';

  const imageConfig =
    getProductFamilyImage(resolvedId);

  const categoryLabel =
    product
      ? CATEGORY_LABELS[product.category]
      : 'Papad';

  const isAvailable =
    imageConfig.status === 'available' &&
    Boolean(imageConfig.primary);

  const isEager =
    variant === 'hero' ||
    variant === 'detail';

  const config =
    variantConfig[variant];


  /* ==========================================================================
     ACCESSIBLE LABEL
     ======================================================================== */

  const accessibleLabel =
    imageConfig.alt ||
    product?.name ||
    `${categoryLabel} product image`;


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
        [perspective:1400px]
        [transform-style:preserve-3d]
        ${config.stageClass}
        ${className}
      `}
      role="img"
      aria-label={accessibleLabel}
    >

      {/* ======================================================================
          ADAPTIVE PRODUCT SURFACE
          =================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
          bg-gradient-to-br
          from-white
          via-brand-cream
          to-brand-brown/5
        "
        aria-hidden="true"
      />

      {/* Soft central light */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          z-0
          h-[72%]
          w-[72%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white/75
          blur-3xl
        "
        aria-hidden="true"
      />

      {/* Warm peripheral atmosphere */}

      <div
        className="
          pointer-events-none
          absolute
          -right-[18%]
          -top-[18%]
          z-0
          h-[55%]
          w-[55%]
          rounded-full
          bg-brand-saffron/5
          blur-3xl
        "
        aria-hidden="true"
      />


      {/* ======================================================================
          AVAILABLE PRODUCT
          =================================================================== */}

      {isAvailable ? (
        <>
          {/* ------------------------------------------------------------------
              Grounding shadow
              ---------------------------------------------------------------- */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-[6%]
              left-1/2
              z-10
              h-[7%]
              w-[56%]
              -translate-x-1/2
              rounded-[50%]
              bg-brand-brown/14
              blur-md
              transition-all
              duration-500
              ease-out
              group-hover:w-[50%]
              group-hover:bg-brand-brown/20
            "
            aria-hidden="true"
          />

          {/* ------------------------------------------------------------------
              Product physical layer
              ---------------------------------------------------------------- */}

          <div
            className={`
              product-image-object
              ${config.productClass}
              relative
              z-20
              h-full
              w-full
              [transform-style:preserve-3d]
              transition-transform
              duration-500
              ease-out
              group-hover:-translate-y-1
              group-hover:scale-[1.015]
            `}
          >
            <img
              src={imageConfig.primary}
              alt={accessibleLabel}
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
              {...(
                isEager
                  ? {
                      fetchPriority:
                        'high' as const,
                    }
                  : {}
              )}
              className={`
                block
                h-full
                w-full
                object-contain
                ${config.padding}
                drop-shadow-[0_14px_14px_rgba(78,52,46,0.14)]
                transition-all
                duration-500
                ease-out
                group-hover:drop-shadow-[0_20px_18px_rgba(78,52,46,0.19)]
              `}
            />
          </div>

          {/* ------------------------------------------------------------------
              Controlled product highlight
              ---------------------------------------------------------------- */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-30
              bg-gradient-to-br
              from-white/[0.14]
              via-transparent
              to-brand-brown/[0.025]
              opacity-80
              transition-opacity
              duration-500
              group-hover:opacity-100
            "
            aria-hidden="true"
          />

          {/* ------------------------------------------------------------------
              Fine glass edge
              ---------------------------------------------------------------- */}

          <div
            className="
              pointer-events-none
              absolute
              inset-1.5
              z-40
              rounded-[1.4rem]
              border
              border-white/45
              opacity-70
              transition-all
              duration-500
              group-hover:inset-1
              group-hover:border-white/60
            "
            aria-hidden="true"
          />
        </>
      ) : (
        /* ====================================================================
           MISSING PRODUCT ASSET
           ================================================================= */

        <>
          {/* Placeholder surface */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              bg-gradient-to-br
              from-brand-cream-dark
              via-brand-cream
              to-brand-saffron/10
            "
            aria-hidden="true"
          />

          {/* Placeholder texture */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              bg-dots
              opacity-40
            "
            aria-hidden="true"
          />

          {/* Placeholder depth object */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-10
              h-[46%]
              w-[46%]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-brand-saffron/15
              bg-white/35
              shadow-[0_18px_30px_rgba(78,52,46,0.08)]
            "
            aria-hidden="true"
          />

          {/* Inner placeholder ring */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-10
              h-[32%]
              w-[32%]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-brand-saffron/10
            "
            aria-hidden="true"
          />

          {/* Placeholder content */}

          <div
            className="
              relative
              z-20
              flex
              max-w-full
              flex-col
              items-center
              justify-center
              gap-2
              p-4
              text-center
              sm:gap-3
              sm:p-6
            "
          >
            <div
              className="
                font-serif
                text-5xl
                font-bold
                leading-none
                text-brand-red/20
                sm:text-6xl
                lg:text-7xl
              "
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
                {accessibleLabel}
              </p>

              <p
                className="
                  mt-1
                  font-sans
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-brand-brown/40
                  sm:text-2xs
                  sm:tracking-wider
                "
              >
                Product image coming soon
              </p>
            </div>
          </div>

          {/* Category context */}

          {product && (
            <div
              className="
                absolute
                left-2
                top-2
                z-30
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

          {/* Asset state */}

          <div
            className="
              absolute
              bottom-2
              right-2
              z-30
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
