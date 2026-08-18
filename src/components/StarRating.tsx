import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  ariaLabel?: string;
}

/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL REVIEW / TRUST SIGNAL SYSTEM

   Behavioral role:
   REVIEW → TRUST → CONFIDENCE

   Rules:
   - Never exaggerate a rating.
   - Rating is always clamped to 0–5.
   - Partial ratings are visually represented.
   - Interactive mode remains keyboard accessible.
   - Review count remains optional.
   ========================================================================== */

const sizeClasses = {
  sm: {
    star: 'h-3.5 w-3.5',
    button: 'min-h-[28px] min-w-[28px]',
    gap: 'gap-0.5',
    text: 'text-xs',
  },

  md: {
    star: 'h-4 w-4',
    button: 'min-h-[32px] min-w-[32px]',
    gap: 'gap-0.5',
    text: 'text-sm',
  },

  lg: {
    star: 'h-5 w-5',
    button: 'min-h-[36px] min-w-[36px]',
    gap: 'gap-1',
    text: 'text-base',
  },
} as const;


export function StarRating({
  rating,
  reviewCount,
  size = 'md',
  showValue = true,
  showCount = false,
  interactive = false,
  onChange,
  ariaLabel,
}: StarRatingProps) {

  /* ==========================================================================
     SAFE RATING
     ======================================================================== */

  const safeRating = Math.min(
    5,
    Math.max(0, Number.isFinite(rating) ? rating : 0),
  );

  const classes =
    sizeClasses[size];


  /* ==========================================================================
     ACCESSIBILITY LABEL
     ======================================================================== */

  const accessibleLabel =
    ariaLabel ||
    `${safeRating.toFixed(1)} out of 5 stars${
      reviewCount !== undefined
        ? `, ${reviewCount} reviews`
        : ''
    }`;


  /* ==========================================================================
     INTERACTION
     ======================================================================== */

  const handleRatingChange = (
    value: number,
  ) => {
    if (
      !interactive ||
      !onChange
    ) {
      return;
    }

    onChange(value);
  };


  /* ==========================================================================
     STAR STATE
     ======================================================================== */

  const getStarState = (
    index: number,
  ) => {
    const starNumber =
      index + 1;

    if (
      safeRating >= starNumber
    ) {
      return 'full';
    }

    if (
      safeRating > index &&
      safeRating < starNumber
    ) {
      return 'partial';
    }

    return 'empty';
  };


  return (
    <div
      className="
        inline-flex
        min-w-0
        items-center
      "
      aria-label={
        interactive
          ? undefined
          : accessibleLabel
      }
    >

      {/* ======================================================================
          STAR GROUP
          =================================================================== */}

      <div
        className={`
          flex
          items-center
          ${classes.gap}
        `}
        role={
          interactive
            ? 'radiogroup'
            : undefined
        }
        aria-label={
          interactive
            ? 'Select rating'
            : undefined
        }
      >

        {Array.from(
          { length: 5 },
          (_, index) => {
            const starNumber =
              index + 1;

            const state =
              getStarState(index);


            /* ================================================================
               STATIC STAR
               ============================================================= */

            if (!interactive) {
              return (
                <span
                  key={starNumber}
                  className="
                    relative
                    inline-flex
                    shrink-0
                  "
                >
                  <Star
                    className={`
                      ${classes.star}
                      ${
                        state === 'full'
                          ? `
                            fill-brand-saffron
                            text-brand-saffron
                          `
                          : state === 'partial'
                            ? `
                              fill-brand-saffron/45
                              text-brand-saffron
                            `
                            : `
                              fill-transparent
                              text-brand-brown/20
                            `
                      }
                    `}
                    aria-hidden="true"
                  />
                </span>
              );
            }


            /* ================================================================
               INTERACTIVE STAR
               ============================================================= */

            return (
              <button
                key={starNumber}
                type="button"
                onClick={() =>
                  handleRatingChange(
                    starNumber,
                  )
                }
                className={`
                  ${classes.button}
                  inline-flex
                  items-center
                  justify-center
                  rounded-md
                  transition-all
                  duration-150
                  ease-ks-standard
                  hover:scale-110
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                  focus-visible:ring-offset-1
                  active:scale-95
                `}
                role="radio"
                aria-checked={
                  starNumber ===
                  Math.round(
                    safeRating,
                  )
                }
                aria-label={`${starNumber} star${
                  starNumber === 1
                    ? ''
                    : 's'
                }`}
              >
                <Star
                  className={`
                    ${classes.star}
                    ${
                      state === 'full'
                        ? `
                          fill-brand-saffron
                          text-brand-saffron
                        `
                        : state === 'partial'
                          ? `
                            fill-brand-saffron/50
                            text-brand-saffron
                          `
                          : `
                            fill-transparent
                            text-brand-brown/20
                            hover:fill-brand-saffron/20
                            hover:text-brand-saffron
                          `
                    }
                  `}
                  aria-hidden="true"
                />
              </button>
            );
          },
        )}

      </div>


      {/* ======================================================================
          RATING VALUE
          =================================================================== */}

      {showValue && (
        <span
          className={`
            ml-1.5
            whitespace-nowrap
            ${classes.text}
            font-semibold
            leading-none
            text-brand-brown
          `}
        >
          {safeRating.toFixed(1)}
        </span>
      )}


      {/* ======================================================================
          REVIEW COUNT
          =================================================================== */}

      {showCount &&
        reviewCount !== undefined && (
          <span
            className={`
              ml-1
              whitespace-nowrap
              ${classes.text}
              leading-none
              text-brand-brown/50
            `}
          >
            ({reviewCount})
          </span>
        )}

    </div>
  );
}
