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

   Design rules:
   - Product artwork is never intentionally cropped.
   - Product image always uses object-contain.
   - Natural image proportions are preserved.
   - Square and portrait assets receive balanced visual breathing room.
   - Card / detail / hero variants have independent visual scaling.
   - Product receives consistent grounding and depth.
   - Missing assets receive a deliberate branded fallback.
   ========================================================================== */


/* ==========================================================================
   VARIANT CONFIGURATION
   ========================================================================== */

const variantConfig = {
  card: {
    stageClass:
      'product-image-stage-card',

    productClass:
      'product-image-object-card',

    /*
     * Slightly more conservative padding for cards.
     * This keeps portrait packs from becoming too small while
     * still protecting the artwork from the card edges.
     */
    imageClass:
      'p-[3%] sm:p-[4%] md:p-[5%]',
  },

  detail: {
    stageClass:
      'product-image-stage-detail',

    productClass:
      'product-image-object-detail',

    imageClass:
      'p-[2%] sm:p-[3%] lg:p-[4%]',
  },

  hero: {
    stageClass:
      'product-image-stage-hero',

    productClass:
      'product-image-object-hero',

    imageClass:
      'p-[1%] sm:p-[2%] lg:p-[3%]',
  },
} as const;


/* ==========================================================================
   PRODUCT IMAGE
   ========================================================================== */

export function ProductImage({
  productId,
  product,
  variant = 'card',
  className = '',
}: ProductImageProps) {

  /* ------------------------------------------------------------------------
     RESOLVE PRODUCT
     ------------------------------------------------------------------------ */

  const resolvedId =
    productId ||
    product?.id ||
    '';


  /* ------------------------------------------------------------------------
     RESOLVE IMAGE CONFIGURATION
     ------------------------------------------------------------------------ */

  const imageConfig =
    getProductFamilyImage(
      resolvedId,
    );


  /* ------------------------------------------------------------------------
     CATEGORY LABEL
     ------------------------------------------------------------------------ */

  const categoryLabel =
    product
      ? CATEGORY_LABELS[
          product.category
        ]
      : 'Papad';


  /* ------------------------------------------------------------------------
     ASSET AVAILABILITY
     ------------------------------------------------------------------------ */

  const isAvailable =
    imageConfig.status ===
      'available' &&
    Boolean(
      imageConfig.primary,
    );


  /* ------------------------------------------------------------------------
     LOADING PRIORITY
     ------------------------------------------------------------------------ */

  const isEager =
    variant === 'hero' ||
    variant === 'detail';


  /* ------------------------------------------------------------------------
     VARIANT CONFIGURATION
     ------------------------------------------------------------------------ */

  const config =
    variantConfig[variant];


  /* ------------------------------------------------------------------------
     ACCESSIBLE IMAGE LABEL
     ------------------------------------------------------------------------ */

  const accessibleLabel =
    imageConfig.alt ||
    product?.name ||
    `${categoryLabel} product image`;


  return (
    <div
      className={`
        group
        relative
        flex
        h-full
        w-full
        min-h-0
        min-w-0
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


      {/* ======================================================================
          SOFT CENTRAL LIGHT
          =================================================================== */}

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


      {/* ======================================================================
          WARM PERIPHERAL ATMOSPHERE
          =================================================================== */}

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

          {/* ==================================================================
              GROUNDING SHADOW
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-[5%]
              left-1/2
              z-10
              h-[5%]
              w-[44%]
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


          {/* ==================================================================
              PRODUCT PHYSICAL LAYER
              ================================================================== */}

          <div
            className={`
              ${config.productClass}
              relative
              z-20
              flex
              h-full
              w-full
              min-h-0
              min-w-0
              items-center
              justify-center
              [transform-style:preserve-3d]
              transition-transform
              duration-500
              ease-out
              group-hover:-translate-y-1
            `}
          >

            {/* ================================================================
                ACTUAL PRODUCT IMAGE

                IMPORTANT:
                object-contain is retained.

                We intentionally do NOT use object-cover.
                This preserves the complete packaging artwork.

                The image is allowed to use more of the available stage
                than before so portrait product packs do not look
                unnecessarily tiny.
                ================================================================ */}

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
                min-h-0
                min-w-0
                max-h-full
                max-w-full
                object-contain
                object-center
                ${config.imageClass}
                drop-shadow-[0_14px_14px_rgba(78,52,46,0.14)]
                transition-all
                duration-500
                ease-out
                group-hover:drop-shadow-[0_20px_18px_rgba(78,52,46,0.19)]
              `}
              draggable={false}
            />

          </div>


          {/* ==================================================================
              CONTROLLED PRODUCT HIGHLIGHT
              ================================================================== */}

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


          {/* ==================================================================
              FINE GLASS EDGE
              ================================================================== */}

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

          {/* ==================================================================
              PLACEHOLDER SURFACE
              ================================================================== */}

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


          {/* ==================================================================
              PLACEHOLDER TEXTURE
              ================================================================== */}

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


          {/* ==================================================================
              PLACEHOLDER DEPTH OBJECT
              ================================================================== */}

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


          {/* ==================================================================
              INNER PLACEHOLDER RING
              ================================================================== */}

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


          {/* ==================================================================
              PLACEHOLDER CONTENT
              ================================================================== */}

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


            <div
              className="
                min-w-0
                max-w-[90%]
              "
            >

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


          {/* ==================================================================
              CATEGORY CONTEXT
              ================================================================== */}

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


          {/* ==================================================================
              ASSET STATE
              ================================================================== */}

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
