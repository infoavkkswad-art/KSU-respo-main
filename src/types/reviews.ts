import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Truck,
  Shield,
  Leaf,
  Zap,
  Star,
  Loader2,
  Send,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { ProductService } from '../services/product-service';
import { ReviewService } from '../services/review-service';
import type {
  ReviewResponse,
  ReviewSummary,
} from '../types/reviews';
import { PACK_LABELS } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addItem } = useCart();

  const product = slug
    ? ProductService.getProductBySlug(slug)
    : undefined;

  const [selectedSkuIndex, setSelectedSkuIndex] =
    useState(0);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  /* ============================================================
   * REVIEWS
   * ========================================================== */

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);

  const [reviews, setReviews] =
    useState<ReviewResponse[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [reviewsError, setReviewsError] =
    useState('');

  const [reviewName, setReviewName] =
    useState('');

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState('');

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewSuccess, setReviewSuccess] =
    useState('');

  const [reviewSubmitError, setReviewSubmitError] =
    useState('');

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return ProductService.getProductsByCategory(
      product.category,
    )
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  /* ============================================================
   * LOAD REVIEWS FROM API
   * ========================================================== */

  useEffect(() => {
    if (!product) return;

    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError('');

      try {
        const [summary, reviewList] =
          await Promise.all([
            ReviewService.getSummary(product.id),
            ReviewService.getReviews(product.id),
          ]);

        if (cancelled) return;

        setReviewSummary(summary);

        /*
         * The public review API should return approved
         * reviews. We still protect the UI from displaying
         * anything that is not approved.
         */
        setReviews(
          reviewList.filter(
            (review) =>
              review.status === 'approved',
          ),
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          'Failed to load product reviews:',
          error,
        );

        setReviewsError(
          'Reviews are temporarily unavailable.',
        );

        setReviewSummary(null);
        setReviews([]);
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  /* ============================================================
   * PRODUCT NOT FOUND
   * ========================================================== */

  if (!product) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO
          title="Product Not Found"
          description="Product not found"
          path="/product/not-found"
        />

        <h1 className="text-3xl font-serif font-bold text-brand-brown mb-4">
          Product not found
        </h1>

        <Link
          to="/products"
          className="btn-primary"
        >
          Browse All
        </Link>
      </div>
    );
  }

  /* ============================================================
   * SELECTED SKU
   * ========================================================== */

  const selectedSku =
    product.skus[selectedSkuIndex] ||
    product.skus[0];

  const discount =
    selectedSku.mrp > 0
      ? Math.round(
          ((selectedSku.mrp -
            selectedSku.websitePrice) /
            selectedSku.mrp) *
            100,
        )
      : 0;

  /* ============================================================
   * CART ACTIONS
   * ========================================================== */

  const handleAddToCart = () => {
    addItem(
      selectedSku.sku,
      quantity,
    );

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    addItem(
      selectedSku.sku,
      quantity,
    );

    navigate('/checkout');
  };

  /* ============================================================
   * REVIEW SUBMISSION
   * ========================================================== */

  const handleReviewSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setReviewSuccess('');
    setReviewSubmitError('');

    const name = reviewName.trim();
    const comment = reviewComment.trim();

    if (!name) {
      setReviewSubmitError(
        'Please enter your name.',
      );
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewSubmitError(
        'Please select a rating from 1 to 5 stars.',
      );
      return;
    }

    if (!comment) {
      setReviewSubmitError(
        'Please write your review.',
      );
      return;
    }

    if (comment.length < 5) {
      setReviewSubmitError(
        'Please write a little more about your experience.',
      );
      return;
    }

    setReviewSubmitting(true);

    try {
      await ReviewService.createReview({
        productId: product.id,
        sku: selectedSku.sku,
        rating: reviewRating,
        comment,
        customerName: name,
      });

      /*
       * Reviews require approval before appearing publicly.
       * Do not add the submitted review directly to the
       * visible review list.
       */
      setReviewName('');
      setReviewRating(0);
      setReviewComment('');

      setReviewSuccess(
        'Thank you for your review. It has been submitted for approval.',
      );

      /*
       * Refresh the API data in case the backend has already
       * approved/processed the review.
       */
      try {
        const [summary, reviewList] =
          await Promise.all([
            ReviewService.getSummary(product.id),
            ReviewService.getReviews(product.id),
          ]);

        setReviewSummary(summary);

        setReviews(
          reviewList.filter(
            (review) =>
              review.status === 'approved',
          ),
        );
      } catch {
        /*
         * Submission succeeded, so don't turn the success
         * message into an error just because refreshing
         * the public list failed.
         */
      }
    } catch (error) {
      console.error(
        'Review submission failed:',
        error,
      );

      setReviewSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to submit your review. Please try again.',
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  /* ============================================================
   * REVIEW DISPLAY HELPERS
   * ========================================================== */

  const hasApprovedReviews =
    reviews.length > 0;

  const hasApiRating =
    reviewSummary !== null &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating > 0;

  const displayedReviewCount =
    reviewSummary?.reviewCount ??
    reviews.length;

  const displayedAverageRating =
    reviewSummary?.averageRating ?? 0;

  const renderStars = (
    rating: number,
    size = 'w-4 h-4',
  ) => {
    const roundedRating = Math.round(rating);

    return (
      <span
        className="inline-flex items-center gap-0.5"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= roundedRating
                ? 'fill-current text-amber-500'
                : 'text-brand-brown/20'
            }`}
          />
        ))}
      </span>
    );
  };

  /* ============================================================
   * RENDER
   * ========================================================== */

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Shop',
            path: '/shop',
          },
          {
            name: product.name,
            path: `/product/${product.slug}`,
          },
        ])}
      />

      {/* ==========================================================
          PRODUCT HERO
      =========================================================== */}

      <div className="container-max container-px py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Product Image */}
          <div className="lg:sticky lg:top-28">
            <div
              className="
                aspect-square
                rounded-3xl
                lg:rounded-4xl
                overflow-hidden
                bg-brand-cream-dark
                border
                border-brand-brown/5
                shadow-soft
              "
            >
              <ProductImage
                productId={product.id}
                product={product}
                variant="detail"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Product Information */}
          <div>
            <div className="mb-6">
              <span
                className="
                  text-brand-red
                  font-semibold
                  uppercase
                  tracking-widest
                  text-xs
                "
              >
                {product.category}
              </span>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-serif
                  font-bold
                  text-brand-brown
                  mt-2
                "
              >
                {product.name}
              </h1>

              {/* API Rating */}
              <div className="mt-3">
                {reviewsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-brand-brown/50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading reviews...
                  </div>
                ) : hasApiRating ? (
                  <a
                    href="#reviews"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      hover:bg-brand-brown/5
                      px-1.5
                      py-1
                      -ml-1.5
                      transition-colors
                    "
                  >
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-md
                        bg-emerald-600
                        text-white
                        px-2
                        py-1
                        text-xs
                        font-bold
                      "
                    >
                      {displayedAverageRating.toFixed(
                        1,
                      )}
                      <Star className="w-3 h-3 fill-current" />
                    </span>

                    <span className="text-xs sm:text-sm text-brand-brown/60">
                      {displayedReviewCount}{' '}
                      {displayedReviewCount === 1
                        ? 'review'
                        : 'reviews'}
                    </span>
                  </a>
                ) : (
                  <a
                    href="#reviews"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      text-brand-brown/55
                      hover:text-brand-red
                      transition-colors
                    "
                  >
                    <span className="tracking-[2px] text-base">
                      ☆☆☆☆☆
                    </span>
                    <span>
                      No reviews yet
                    </span>
                  </a>
                )}
              </div>

              <p
                className="
                  mt-4
                  text-brand-brown/70
                  leading-relaxed
                  text-base
                  sm:text-lg
                "
              >
                {product.description}
              </p>
            </div>

            {/* Pack Size + Price */}
            <div
              className="
                py-6
                sm:py-8
                border-y
                border-brand-brown/10
              "
            >
              <div className="mb-6">
                <label
                  className="
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-brand-brown
                    mb-3
                    block
                  "
                >
                  Pack Size
                </label>

                <div className="flex gap-2 flex-wrap">
                  {product.skus.map(
                    (sku, index) => (
                      <button
                        key={sku.sku}
                        type="button"
                        onClick={() =>
                          setSelectedSkuIndex(
                            index,
                          )
                        }
                        className={`
                          px-4
                          sm:px-6
                          py-2.5
                          sm:py-3
                          rounded-full
                          text-sm
                          font-medium
                          border
                          transition-all
                          ${
                            selectedSkuIndex ===
                            index
                              ? 'bg-brand-brown text-white border-brand-brown'
                              : 'bg-white border-brand-brown/10 hover:border-brand-brown/30'
                          }
                        `}
                      >
                        {PACK_LABELS[
                          sku.packSize
                        ] ||
                          `${sku.packSize}g`}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                <span
                  className="
                    text-3xl
                    sm:text-4xl
                    font-bold
                    text-brand-brown
                  "
                >
                  ₹{selectedSku.websitePrice}
                </span>

                <span
                  className="
                    text-base
                    sm:text-lg
                    text-brand-brown/40
                    line-through
                  "
                >
                  ₹{selectedSku.mrp}
                </span>

                {discount > 0 && (
                  <span className="badge-red mb-1.5">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <p className="text-xs text-brand-brown/60 mt-2">
                {selectedSku.freeShipping ? (
                  <span className="text-green-600 font-medium">
                    Free shipping
                  </span>
                ) : (
                  `+ ₹${selectedSku.shipping} shipping`
                )}
              </p>
            </div>

            {/* Quantity + Buy Buttons */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-stretch
                gap-3
                py-6
                sm:py-8
              "
            >
              {/* Quantity */}
              <div
                className="
                  flex
                  items-center
                  justify-center
                  bg-white
                  border
                  border-brand-brown/10
                  rounded-full
                  p-1
                  shrink-0
                  self-center
                  sm:self-auto
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1),
                    )
                  }
                  className="p-3"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-12 text-center font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(100, q + 1),
                    )
                  }
                  className="p-3"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="
                  flex-1
                  btn-outline
                  py-4
                  justify-center
                "
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="
                  flex-1
                  btn-primary
                  py-4
                  justify-center
                "
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            {/* Trust Features */}
            <div
              className="
                grid
                grid-cols-3
                gap-2
                sm:gap-4
                py-6
                border-t
                border-brand-brown/10
              "
            >
              {[
                {
                  icon: Leaf,
                  label: 'Pure Veg',
                },
                {
                  icon: Shield,
                  label: 'FSSAI Licence',
                },
                {
                  icon: Truck,
                  label: 'Delivery available',
                },
              ].map(
                (feature, index) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={index}
                      className="
                        text-center
                        flex
                        flex-col
                        items-center
                        gap-2
                      "
                    >
                      <Icon
                        className="
                          w-5
                          h-5
                          sm:w-6
                          sm:h-6
                          text-brand-brown/30
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          sm:text-xs
                          font-medium
                          text-brand-brown/70
                        "
                      >
                        {feature.label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          REVIEWS
      =========================================================== */}

      <section
        id="reviews"
        className="
          bg-brand-cream
          border-y
          border-brand-brown/5
          py-14
          sm:py-20
          scroll-mt-24
        "
      >
        <div className="container-max container-px">

          <div className="max-w-6xl mx-auto">

            {/* Review Header */}
            <div className="text-center mb-10">
              <span
                className="
                  text-brand-red
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                "
              >
                Customer Reviews
              </span>

              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  font-serif
                  font-bold
                  text-brand-brown
                  mt-2
                "
              >
                What Customers Say
              </h2>

              <p className="text-sm text-brand-brown/60 mt-3 max-w-xl mx-auto">
                Real feedback from customers who have
                experienced Kawad Swad.
              </p>
            </div>

            {/* Rating Summary */}
            {hasApiRating && (
              <div
                className="
                  max-w-md
                  mx-auto
                  mb-10
                  bg-white
                  border
                  border-brand-brown/5
                  rounded-2xl
                  p-5
                  shadow-soft
                "
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-brown">
                      {displayedAverageRating.toFixed(
                        1,
                      )}
                    </div>

                    <div className="mt-1">
                      {renderStars(
                        displayedAverageRating,
                        'w-4 h-4',
                      )}
                    </div>
                  </div>

                  <div className="h-12 w-px bg-brand-brown/10" />

                  <div className="text-sm text-brand-brown/60">
                    Based on{' '}
                    <strong className="text-brand-brown">
                      {displayedReviewCount}
                    </strong>{' '}
                    approved{' '}
                    {displayedReviewCount === 1
                      ? 'review'
                      : 'reviews'}
                  </div>
                </div>
              </div>
            )}

            {/* Review Error */}
            {reviewsError && (
              <div
                className="
                  max-w-2xl
                  mx-auto
                  mb-8
                  rounded-xl
                  border
                  border-brand-brown/10
                  bg-white
                  px-4
                  py-3
                  text-center
                  text-sm
                  text-brand-brown/60
                "
              >
                {reviewsError}
              </div>
            )}

            {/* Reviews + Form */}
            <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">

              {/* Review List */}
              <div>
                {reviewsLoading ? (
                  <div
                    className="
                      bg-white
                      rounded-2xl
                      border
                      border-brand-brown/5
                      p-10
                      text-center
                    "
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-brand-red mx-auto mb-3" />

                    <p className="text-sm text-brand-brown/60">
                      Loading customer reviews...
                    </p>
                  </div>
                ) : !hasApprovedReviews ? (
                  <div
                    className="
                      bg-white
                      rounded-2xl
                      border
                      border-brand-brown/5
                      p-10
                      text-center
                      shadow-soft
                    "
                  >
                    <div className="text-2xl tracking-[3px] text-brand-brown/25 mb-3">
                      ☆☆☆☆☆
                    </div>

                    <h3 className="font-serif font-bold text-xl text-brand-brown">
                      No reviews yet
                    </h3>

                    <p className="text-sm text-brand-brown/60 mt-2">
                      Be the first to share your
                      experience with this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <article
                        key={review.reviewId}
                        className="
                          bg-white
                          rounded-2xl
                          border
                          border-brand-brown/5
                          p-5
                          sm:p-6
                          shadow-soft
                        "
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-brand-brown">
                                {review.customerName}
                              </h3>

                              {review.verifiedPurchase && (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    font-semibold
                                    text-emerald-700
                                    bg-emerald-50
                                    px-2
                                    py-1
                                    rounded-full
                                  "
                                >
                                  <Check className="w-3 h-3" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>

                            <div className="mt-1">
                              {renderStars(
                                review.rating,
                                'w-3.5 h-3.5',
                              )}
                            </div>
                          </div>

                          <time
                            dateTime={
                              review.createdAt
                            }
                            className="
                              text-xs
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
                          <h4 className="font-semibold text-brand-brown mt-4">
                            {review.title}
                          </h4>
                        )}

                        <p className="text-sm leading-relaxed text-brand-brown/70 mt-2 whitespace-pre-line">
                          {review.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-brand-brown/5
                  p-5
                  sm:p-6
                  shadow-soft
                  lg:sticky
                  lg:top-28
                "
              >
                <div className="mb-5">
                  <h3 className="text-xl font-serif font-bold text-brand-brown">
                    Write a Review
                  </h3>

                  <p className="text-xs text-brand-brown/55 mt-1">
                    Your review will appear after approval.
                  </p>
                </div>

                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="review-name"
                      className="label-field"
                    >
                      Your Name
                    </label>

                    <input
                      id="review-name"
                      type="text"
                      value={reviewName}
                      onChange={(event) =>
                        setReviewName(
                          event.target.value,
                        )
                      }
                      maxLength={100}
                      placeholder="Enter your name"
                      className="input-field"
                      disabled={reviewSubmitting}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <span className="label-field">
                      Your Rating
                    </span>

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        mt-2
                      "
                      role="radiogroup"
                      aria-label="Choose your rating"
                    >
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={star}
                            type="button"
                            role="radio"
                            aria-checked={
                              reviewRating ===
                              star
                            }
                            aria-label={`${star} star${star === 1 ? '' : 's'}`}
                            onClick={() =>
                              setReviewRating(
                                star,
                              )
                            }
                            disabled={
                              reviewSubmitting
                            }
                            className="
                              p-1
                              rounded-md
                              hover:bg-brand-cream
                              focus:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-brand-red/40
                              transition-colors
                            "
                          >
                            <Star
                              className={`
                                w-7
                                h-7
                                transition-colors
                                ${
                                  star <=
                                  reviewRating
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'text-brand-brown/20'
                                }
                              `}
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label
                      htmlFor="review-comment"
                      className="label-field"
                    >
                      Your Review
                    </label>

                    <textarea
                      id="review-comment"
                      value={reviewComment}
                      onChange={(event) =>
                        setReviewComment(
                          event.target.value,
                        )
                      }
                      rows={5}
                      maxLength={1000}
                      placeholder="Tell us about your experience..."
                      className="input-field resize-none"
                      disabled={reviewSubmitting}
                    />

                    <p className="text-[10px] text-brand-brown/40 text-right mt-1">
                      {reviewComment.length}/1000
                    </p>
                  </div>

                  {/* Success */}
                  {reviewSuccess && (
                    <div
                      className="
                        rounded-xl
                        bg-emerald-50
                        border
                        border-emerald-200
                        text-emerald-800
                        text-sm
                        px-4
                        py-3
                      "
                      role="status"
                    >
                      {reviewSuccess}
                    </div>
                  )}

                  {/* Error */}
                  {reviewSubmitError && (
                    <div
                      className="
                        rounded-xl
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        text-sm
                        px-4
                        py-3
                      "
                      role="alert"
                    >
                      {reviewSubmitError}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="
                      btn-primary
                      w-full
                      justify-center
                      py-3.5
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting Review...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          RELATED PRODUCTS
      =========================================================== */}

      {relatedProducts.length > 0 && (
        <section className="bg-brand-cream-dark py-14 sm:py-20">
          <div className="container-max container-px">
            <h2
              className="
                text-3xl
                font-serif
                font-bold
                text-brand-brown
                mb-10
                sm:mb-12
                text-center
              "
            >
              More from {product.category}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
