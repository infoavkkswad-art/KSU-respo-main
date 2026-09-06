import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Star,
} from 'lucide-react';

import { ReviewService } from '../services/review-service';

import type {
  CreateReviewPayload,
  ReviewResponse,
  ReviewSummary,
} from '../types/reviews';

import { StarRating } from './StarRating';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL REVIEW / SOCIAL PROOF SYSTEM

   Design authority:
   - index.css
   - StarRating
   - ReviewService

   ReviewSection owns:
   - Review loading
   - Review submission
   - Rating selection
   - Customer feedback display
   - Verified-purchase signalling

   It does NOT own:
   - Global colours
   - Global typography
   - Global button geometry
   - Product pricing
   ========================================================================== */


interface ReviewSectionProps {
  productId: string;
  productName: string;
  sku: string;
  orderId?: string;
  className?: string;
}

const EMPTY_SUMMARY: ReviewSummary = {
  productId: '',
  averageRating: 0,
  reviewCount: 0,
};


export function ReviewSection({
  productId,
  productName,
  sku,
  orderId,
  className = '',
}: ReviewSectionProps) {
  const [summary, setSummary] = useState<ReviewSummary>({
    ...EMPTY_SUMMARY,
    productId,
  });

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);


  /* ==========================================================================
     LOAD REVIEWS
     ======================================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const [summaryResponse, reviewsResponse] =
          await Promise.all([
            ReviewService.getSummary(productId),
            ReviewService.getReviews(productId, 20, 0),
          ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryResponse);

        setReviews(
          reviewsResponse.filter(
            (review) => review.status === 'approved',
          ),
        );
      } catch {
        if (!cancelled) {
          setLoadError(true);

          setSummary({
            ...EMPTY_SUMMARY,
            productId,
          });

          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);


  /* ==========================================================================
     DERIVED STATE
     ======================================================================== */

  const displayedRating =
    hoverRating || rating;

  const ratingLabel = useMemo(() => {
    if (rating === 0) {
      return 'Select a rating';
    }

    return `${rating} out of 5 stars`;
  }, [rating]);

  const hasReviews =
    summary.reviewCount > 0 &&
    summary.averageRating > 0;


  /* ==========================================================================
     FORM RESET
     ======================================================================== */

  const resetForm = () => {
    setCustomerName('');
    setRating(0);
    setTitle('');
    setComment('');
    setHoverRating(0);
    setSubmitError('');
  };


  /* ==========================================================================
     REFRESH
     ======================================================================== */

  const refreshReviews = async () => {
    try {
      const [freshSummary, freshReviews] =
        await Promise.all([
          ReviewService.getSummary(productId),
          ReviewService.getReviews(productId, 20, 0),
        ]);

      setSummary(freshSummary);

      setReviews(
        freshReviews.filter(
          (review) => review.status === 'approved',
        ),
      );
    } catch {
      /*
       * A newly submitted review may still be
       * waiting for approval.
       */
    }
  };


  /* ==========================================================================
     SUBMIT
     ======================================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSubmitError('');

    const trimmedName =
      customerName.trim();

    const trimmedComment =
      comment.trim();

    const trimmedTitle =
      title.trim();

    if (!trimmedName) {
      setSubmitError(
        'Please enter your name.',
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setSubmitError(
        'Please select a rating.',
      );
      return;
    }

    if (!trimmedComment) {
      setSubmitError(
        'Please write a review.',
      );
      return;
    }

    const payload: CreateReviewPayload = {
      productId,
      sku,
      rating,
      title:
        trimmedTitle || undefined,
      comment: trimmedComment,
      customerName: trimmedName,
      orderId:
        orderId?.trim() || undefined,
    };

    setSubmitting(true);

    try {
      await ReviewService.createReview(
        payload,
      );

      setSubmitted(true);
      setShowForm(false);

      resetForm();

      await refreshReviews();

      window.setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to submit your review.',
      );
    } finally {
      setSubmitting(false);
    }
  };


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <section
      id="reviews"
      className={`
        section
        scroll-mt-24
        ${className}
      `}
      aria-labelledby="reviews-heading"
    >

      {/* ======================================================================
          HEADER
          =================================================================== */}

      <div
        className="
          mb-7
          flex
          flex-col
          gap-4
          sm:mb-8
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <p className="type-eyebrow mb-2">
            Customer Reviews
          </p>

          <h2
            id="reviews-heading"
            className="
              type-h3
              text-brand-brown
            "
          >
            What customers say
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(
              (current) => !current,
            );
            setSubmitError('');
          }}
          className="
            btn-primary
            min-h-[44px]
            w-full
            px-5
            sm:w-auto
          "
          aria-expanded={showForm}
          aria-controls="review-form"
        >
          <MessageSquareText
            className="h-4 w-4"
            aria-hidden="true"
          />

          {showForm
            ? 'Close Review Form'
            : 'Write a Review'}
        </button>
      </div>


      {/* ======================================================================
          SUMMARY
          =================================================================== */}

      <div
        className="
          mb-6
          grid
          overflow-hidden
          rounded-2xl
          border
          border-brand-brown/10
          bg-white
          shadow-card
          sm:grid-cols-[minmax(180px,0.8fr)_1.2fr]
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            border-b
            border-brand-brown/10
            px-5
            py-6
            text-center
            sm:border-b-0
            sm:border-r
            sm:px-8
          "
        >
          {!loading && hasReviews ? (
            <>
              <span
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-none
                  text-brand-brown
                  sm:text-5xl
                "
              >
                {summary.averageRating.toFixed(
                  1,
                )}
              </span>

              <div className="mt-3">
                <StarRating
                  rating={
                    summary.averageRating
                  }
                  size="md"
                  showValue={false}
                  showCount={false}
                  ariaLabel={`${summary.averageRating.toFixed(
                    1,
                  )} out of 5 stars`}
                />
              </div>

              <span
                className="
                  mt-2
                  text-xs
                  text-brand-brown/50
                "
              >
                {summary.reviewCount}{' '}
                {summary.reviewCount === 1
                  ? 'review'
                  : 'reviews'}
              </span>
            </>
          ) : (
            <>
              <div
                className="
                  flex
                  gap-0.5
                "
                aria-hidden="true"
              >
                {Array.from(
                  { length: 5 },
                  (_, index) => (
                    <Star
                      key={index}
                      className="
                        h-4
                        w-4
                        text-brand-brown/20
                      "
                    />
                  ),
                )}
              </div>

              <span
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-brand-brown/60
                "
              >
                {loading
                  ? 'Loading reviews...'
                  : 'No reviews yet'}
              </span>
            </>
          )}
        </div>

        <div
          className="
            flex
            items-center
            px-5
            py-6
            sm:px-8
          "
        >
          <p
            className="
              type-body
              max-w-2xl
              text-brand-brown/60
            "
          >
            {hasReviews
              ? `Real customer feedback for ${productName}.`
              : `Be the first to share your experience with ${productName}.`}
          </p>
        </div>
      </div>


      {/* ======================================================================
          SUCCESS
          =================================================================== */}

      {submitted && (
        <div
          className="
            mb-6
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-green-200
            bg-green-50
            p-4
            text-sm
            text-green-800
            shadow-soft
          "
          role="status"
        >
          <CheckCircle2
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-green-600
            "
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              Review submitted
            </p>

            <p className="mt-0.5 text-green-700/80">
              Thank you. Your review has been
              submitted for approval.
            </p>
          </div>
        </div>
      )}


      {/* ======================================================================
          REVIEW FORM
          =================================================================== */}

      {showForm && (
        <div
          id="review-form"
          className="
            mb-8
            card-soft
            p-4
            sm:p-6
          "
        >
          <div className="mb-5">
            <h3
              className="
                type-h4
                text-brand-brown
              "
            >
              Write your review
            </h3>

            <p
              className="
                type-body-sm
                mt-1
                text-brand-brown/50
              "
            >
              Share your honest experience with
              this product.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}

            <div>
              <label
                htmlFor={`review-name-${productId}`}
                className="label-field"
              >
                Your Name
              </label>

              <input
                id={`review-name-${productId}`}
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value,
                  )
                }
                maxLength={100}
                autoComplete="name"
                placeholder="Enter your name"
                className="input-field"
              />
            </div>


            {/* Rating */}

            <div>
              <span
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-brand-brown
                "
              >
                Your Rating
              </span>

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label="Select your rating"
                  onMouseLeave={() =>
                    setHoverRating(0)
                  }
                >
                  {Array.from(
                    { length: 5 },
                    (_, index) => {
                      const value =
                        index + 1;

                      const active =
                        displayedRating >=
                        value;

                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={
                            rating === value
                          }
                          aria-label={`${value} star${
                            value === 1
                              ? ''
                              : 's'
                          }`}
                          onMouseEnter={() =>
                            setHoverRating(
                              value,
                            )
                          }
                          onFocus={() =>
                            setHoverRating(
                              value,
                            )
                          }
                          onBlur={() =>
                            setHoverRating(0)
                          }
                          onClick={() => {
                            setRating(value);
                            setHoverRating(0);
                          }}
                          className="
                            rounded-md
                            p-1
                            transition-transform
                            duration-200
                            hover:scale-110
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-brand-red/40
                          "
                        >
                          <Star
                            className={`
                              h-7
                              w-7
                              sm:h-8
                              sm:w-8
                              ${
                                active
                                  ? 'fill-brand-red text-brand-red'
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

                <span
                  className="
                    text-xs
                    font-medium
                    text-brand-brown/60
                  "
                  aria-live="polite"
                >
                  {ratingLabel}
                </span>
              </div>
            </div>


            {/* Title */}

            <div>
              <label
                htmlFor={`review-title-${productId}`}
                className="label-field"
              >
                Review Title
                <span
                  className="
                    ml-1
                    font-normal
                    text-brand-brown/40
                  "
                >
                  Optional
                </span>
              </label>

              <input
                id={`review-title-${productId}`}
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                maxLength={120}
                placeholder="Give your review a short title"
                className="input-field"
              />
            </div>


            {/* Comment */}

            <div>
              <label
                htmlFor={`review-comment-${productId}`}
                className="label-field"
              >
                Your Review
              </label>

              <textarea
                id={`review-comment-${productId}`}
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value,
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="Tell us about the taste, crunch, quality or your overall experience..."
                className="
                  input-field
                  min-h-[130px]
                  resize-y
                "
              />

              <p
                className="
                  mt-1
                  text-right
                  text-[10px]
                  text-brand-brown/40
                "
              >
                {comment.length}/1000
              </p>
            </div>


            {/* Error */}

            {submitError && (
              <div
                className="
                  error-text
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                "
                role="alert"
              >
                {submitError}
              </div>
            )}


            {/* Actions */}

            <div
              className="
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting}
                className="
                  min-h-[46px]
                  rounded-xl
                  px-5
                  text-sm
                  font-semibold
                  text-brand-brown/70
                  transition-colors
                  duration-200
                  hover:bg-brand-brown/5
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  btn-primary
                  min-h-[46px]
                  px-6
                "
              >
                {submitting ? (
                  <>
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                      aria-hidden="true"
                    />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* ======================================================================
          LOAD ERROR
          =================================================================== */}

      {loadError && (
        <div
          className="
            mb-6
            card-soft
            px-4
            py-3
            text-sm
            text-brand-brown/60
          "
          role="status"
        >
          Reviews are temporarily unavailable.
          Please try again later.
        </div>
      )}


      {/* ======================================================================
          REVIEWS
          =================================================================== */}

      {!loading &&
        reviews.length > 0 && (
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >
            {reviews.map(
              (review) => (
                <article
                  key={review.reviewId}
                  className="
                    card-flat
                    p-4
                    transition-all
                    duration-300
                    ease-ks-standard
                    hover:-translate-y-1
                    hover:shadow-card
                    sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-semibold
                            text-brand-brown
                          "
                        >
                          {review.customerName}
                        </span>

                        {review.verifiedPurchase && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              bg-green-50
                              px-2
                              py-0.5
                              text-[9px]
                              font-semibold
                              text-green-700
                            "
                          >
                            <CheckCircle2
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        <StarRating
                          rating={
                            review.rating
                          }
                          size="sm"
                          showValue={false}
                        />
                      </div>
                    </div>

                    <time
                      dateTime={
                        review.createdAt
                      }
                      className="
                        shrink-0
                        text-[10px]
                        text-brand-brown/40
                      "
                    >
                      {new Date(
                        review.createdAt,
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </time>
                  </div>

                  {review.title && (
                    <h3
                      className="
                        mt-4
                        font-serif
                        font-semibold
                        text-brand-brown
                      "
                    >
                      {review.title}
                    </h3>
                  )}

                  <p
                    className="
                      mt-2
                      type-body
                      text-brand-brown/70
                    "
                  >
                    {review.comment}
                  </p>
                </article>
              ),
            )}
          </div>
        )}


      {/* ======================================================================
          EMPTY STATE
          =================================================================== */}

      {!loading &&
        !loadError &&
        reviews.length === 0 && (
          <div
            className="
              card-flat
              p-8
              text-center
              sm:p-10
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-brand-cream
              "
            >
              <MessageSquareText
                className="
                  h-5
                  w-5
                  text-brand-brown/35
                "
                aria-hidden="true"
              />
            </div>

            <p
              className="
                mt-4
                type-h4
                text-brand-brown
              "
            >
              No reviews yet
            </p>

            <p
              className="
                mx-auto
                mt-1
                max-w-sm
                type-body-sm
                text-brand-brown/50
              "
            >
              Be the first customer to share
              your experience with this product.
            </p>

            {!showForm && (
              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="
                  btn-outline
                  mt-5
                  min-h-[44px]
                  px-5
                "
              >
                Write the First Review
              </button>
            )}
          </div>
        )}
    </section>
  );
}
