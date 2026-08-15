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

const sizeClasses = {
  sm: {
    star: 'w-3.5 h-3.5',
    gap: 'gap-0.5',
    text: 'text-xs',
  },
  md: {
    star: 'w-4 h-4',
    gap: 'gap-0.5',
    text: 'text-sm',
  },
  lg: {
    star: 'w-5 h-5',
    gap: 'gap-1',
    text: 'text-base',
  },
};

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
  const safeRating = Math.min(
    5,
    Math.max(0, rating),
  );

  const classes = sizeClasses[size];

  const handleRatingChange = (
    value: number,
  ) => {
    if (!interactive || !onChange) {
      return;
    }

    onChange(value);
  };

  return (
    <div
      className={`flex items-center ${classes.gap}`}
      aria-label={
        ariaLabel ||
        `${safeRating.toFixed(1)} out of 5 stars${
          reviewCount !== undefined
            ? `, ${reviewCount} reviews`
            : ''
        }`
      }
    >
      <div
        className={`flex items-center ${classes.gap}`}
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
            const starNumber = index + 1;
            const filled =
              safeRating >= starNumber;

            const partiallyFilled =
              safeRating > index &&
              safeRating < starNumber;

            if (!interactive) {
              return (
                <Star
                  key={starNumber}
                  className={`
                    ${classes.star}
                    ${
                      filled
                        ? 'fill-brand-red text-brand-red'
                        : 'text-brand-brown/20'
                    }
                  `}
                  aria-hidden="true"
                />
              );
            }

            return (
              <button
                key={starNumber}
                type="button"
                onClick={() =>
                  handleRatingChange(
                    starNumber,
                  )
                }
                className="
                  rounded-sm
                  p-0.5
                  hover:scale-110
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-red/40
                  transition-transform
                "
                role="radio"
                aria-checked={
                  starNumber ===
                  Math.round(safeRating)
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
                      filled
                        ? 'fill-brand-red text-brand-red'
                        : partiallyFilled
                          ? 'fill-brand-red/50 text-brand-red'
                          : 'text-brand-brown/20'
                    }
                  `}
                  aria-hidden="true"
                />
              </button>
            );
          },
        )}
      </div>

      {showValue && (
        <span
          className={`
            ${classes.text}
            font-semibold
            text-brand-brown
            ml-1
          `}
        >
          {safeRating.toFixed(1)}
        </span>
      )}

      {showCount &&
        reviewCount !== undefined && (
          <span
            className={`
              ${classes.text}
              text-brand-brown/50
              ml-0.5
            `}
          >
            ({reviewCount})
          </span>
        )}
    </div>
  );
}
