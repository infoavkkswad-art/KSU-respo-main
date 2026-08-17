import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  Leaf,
  Zap,
  Star,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { ProductService } from '@/services/product-service';
import { ReviewService } from '@/services/review-service';
import type {
  ReviewResponse,
  ReviewSummary,
} from '@/types/reviews';
import { PACK_LABELS } from '@/data/products';
import { useCart } from '@/context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = slug
    ? ProductService.getProductBySlug(slug)
    : undefined;

  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  /*
   * IMPORTANT:
   * Never use product.skus directly for customer-facing
   * pricing or availability.
   *
   * ProductService resolves the SKU through the central
   * sales configuration.
   */
  const purchasableSkus = useMemo(() => {
    if (!product) {
      return [];
    }

    return ProductService.getAvailableSkus(product);
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return ProductService.getProductsByCategory(
      product.category,
    )
      .filter(
        (item) => item.id !== product.id,
      )
      .filter(
        (item) =>
          ProductService.getAvailableSkus(item).length > 0,
      )
      .slice(0, 4);
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(false);

      try {
        const [summary, reviewList] =
          await Promise.all([
            ReviewService.getSummary(product.id),
            ReviewService.getReviews(
              product.id,
              20,
              0,
            ),
          ]);

        if (cancelled) {
          return;
        }

        setReviewSummary(summary);

        setReviews(
          reviewList.filter(
            (review) =>
              review.status === 'approved',
          ),
        );
      } catch {
        if (cancelled) {
          return;
        }

        setReviewSummary(null);
        setReviews([]);
        setReviewsError(true);
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
  }, [product]);

  useEffect(() => {
    if (
      selectedSkuIndex >=
      purchasableSkus.length
    ) {
      setSelectedSkuIndex(0);
      setQuantity(1);
      setAdded(false);
    }
  }, [
    selectedSkuIndex,
    purchasableSkus.length,
  ]);

  if (!product) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO
          title="Product Not Found"
          description="Product not found"
          path="/product/not-found"
        />

        <h1 className="font-serif text-3xl font-bold text-brand-green">
          Product not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-brand-brown/60">
          The product you are looking for may have moved
          or is no longer available.
        </p>

        <Link
          to="/shop"
          className="btn-primary mt-7"
        >
          Browse Papads
        </Link>
      </div>
    );
  }

  const selectedSku =
    purchasableSkus[selectedSkuIndex] ??
    purchasableSkus[0];

  const isPurchasable =
    !!selectedSku &&
    selectedSku.available === true &&
    Number.isFinite(
      selectedSku.websitePrice,
    ) &&
    Number.isFinite(selectedSku.mrp);

  const averageRating =
    reviewSummary &&
    reviewSummary.reviewCount > 0
      ? reviewSummary.averageRating
      : 0;

  const reviewCount =
    reviewSummary?.reviewCount ??
    reviews.length;

  const handleAddToCart = () => {
    if (
      !isPurchasable ||
      !selectedSku
    ) {
      return;
    }

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
    if (
      !isPurchasable ||
      !selectedSku
    ) {
      return;
    }

    addItem(
      selectedSku.sku,
      quantity,
    );

    navigate('/checkout');
  };

  const renderStars = (
    rating: number,
    size = 'h-4 w-4',
  ) => (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating.toFixed(
        1,
      )} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            className={`${size} ${
              star <=
              Math.round(rating)
                ? 'fill-brand-saffron text-brand-saffron'
                : 'text-brand-brown/15'
            }`}
          />
        ),
      )}
    </div>
  );

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

      {/* ================================================================
          PRODUCT
      ================================================================= */}
      <main className="container-max container-px py-8 sm:py-12 lg:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Product image */}
          <div className="lg:sticky lg:top-28">
            <div
              className="
                relative aspect-square overflow-hidden
                rounded-[2rem]
                border border-brand-green/10
                bg-brand-ivory-dark
                shadow-[0_8px_0_rgba(62,39,35,0.05),0_20px_45px_rgba(62,39,35,0.10)]
                [perspective:1000px]
                sm:rounded-[2.5rem]
              "
            >
              <ProductImage
                productId={product.id}
                product={product}
                variant="detail"
                className="h-full w-full"
              />

              <div
                className="
                  pointer-events-none absolute inset-4
                  rounded-[1.5rem]
                  border border-white/60
                  shadow-[inset_0_0_30px_rgba(62,39,35,0.04)]
                  sm:inset-6
                "
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Product information */}
          <div className="min-w-0">
            <div>
              <span className="section-eyebrow">
                {product.category}
              </span>

              <h1
                className="
                  mt-2 font-serif font-bold
                  text-3xl leading-tight text-brand-green
                  sm:text-4xl lg:text-5xl
                "
              >
                {product.name}
              </h1>

              <p
                className="
                  mt-4 max-w-2xl text-base leading-relaxed
                  text-brand-brown/65 sm:text-lg
                "
              >
                {product.description}
              </p>

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {reviewsLoading ? (
                  <span className="text-sm text-brand-brown/45">
                    Loading reviews...
                  </span>
                ) : reviewCount > 0 ? (
                  <>
                    {renderStars(
                      averageRating,
                    )}

                    <span className="text-sm font-bold text-brand-green">
                      {averageRating.toFixed(
                        1,
                      )}
                    </span>

                    <a
                      href="#reviews"
                      className="
                        text-sm text-brand-brown/50
                        underline-offset-2
                        hover:text-brand-green
                        hover:underline
                      "
                    >
                      ({reviewCount}{' '}
                      {reviewCount === 1
                        ? 'review'
                        : 'reviews'}
                      )
                    </a>
                  </>
                ) : (
                  <>
                    <span
                      className="
                        text-lg tracking-wide
                        text-brand-brown/25
                      "
                      aria-hidden="true"
                    >
                      ☆☆☆☆☆
                    </span>

                    <span className="text-sm text-brand-brown/45">
                      No reviews yet
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Purchase configuration */}
            <div
              className="
                mt-8 border-y border-brand-green/10
                py-7 sm:mt-9 sm:py-8
              "
            >
              <div>
                <label
                  className="
                    mb-3 block text-xs font-bold uppercase
                    tracking-[0.16em] text-brand-green
                    sm:text-sm
                  "
                >
                  Choose Pack Size
                </label>

                {purchasableSkus.length >
                0 ? (
                  <div className="flex flex-wrap gap-2">
                    {purchasableSkus.map(
                      (
                        sku,
                        index,
                      ) => {
                        const selected =
                          selectedSkuIndex ===
                          index;

                        return (
                          <button
                            key={sku.sku}
                            type="button"
                            onClick={() => {
                              setSelectedSkuIndex(
                                index,
                              );
                              setQuantity(1);
                              setAdded(
                                false,
                              );
                            }}
                            className={`
                              min-h-[44px]
                              rounded-xl
                              border
                              px-5
                              py-2.5
                              text-sm
                              font-semibold
                              transition-all
                              duration-200
                              ${
                                selected
                                  ? `
                                    -translate-y-0.5
                                    border-brand-green
                                    bg-brand-green
                                    text-white
                                    shadow-[0_4px_0_#315238,0_8px_16px_rgba(62,39,35,0.10)]
                                  `
                                  : `
                                    border-brand-green/15
                                    bg-white
                                    text-brand-green
                                    shadow-[0_3px_0_rgba(62,39,35,0.05)]
                                    hover:-translate-y-0.5
                                    hover:border-brand-green/35
                                    hover:bg-brand-green/5
                                  `
                              }
                              active:translate-y-[1px]
                            `}
                            aria-pressed={
                              selected
                            }
                          >
                            {PACK_LABELS[
                              sku.packSize
                            ] ||
                              `${sku.packSize}g`}
                          </button>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      rounded-xl
                      border border-brand-brown/10
                      bg-brand-cream
                      px-4 py-3
                      text-sm
                      text-brand-brown/60
                    "
                  >
                    This product is currently
                    unavailable.
                  </div>
                )}
              </div>

              {/* Final customer price only */}
              <div className="mt-7">
                {isPurchasable &&
                selectedSku ? (
                  <span className="font-bold text-3xl text-brand-green sm:text-4xl">
                    ₹
                    {selectedSku.websitePrice.toLocaleString(
                      'en-IN',
                    )}
                  </span>
                ) : (
                  <span className="font-bold text-2xl text-brand-brown/55 sm:text-3xl">
                    Price Coming Soon
                  </span>
                )}
              </div>

              {/* Shipping is already included in website price */}
              <div className="mt-2 flex items-center gap-2">
                <Truck
                  className="h-4 w-4 text-green-700"
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold text-green-700">
                  Free shipping
                </span>
              </div>
            </div>

            {/* Purchase controls */}
            <div className="flex flex-col gap-3 py-7 sm:flex-row sm:items-stretch sm:py-8">
              {/* Quantity */}
              <div
                className="
                  flex min-h-[52px] shrink-0 items-center
                  justify-center rounded-xl border
                  border-brand-green/15 bg-white p-1
                  shadow-[0_4px_0_rgba(62,39,35,0.05)]
                  sm:w-[132px]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (value) =>
                        Math.max(
                          1,
                          value - 1,
                        ),
                    )
                  }
                  disabled={!isPurchasable}
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-lg text-brand-green
                    transition-all
                    hover:bg-brand-green/5
                    active:scale-90
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-10 text-center font-bold text-brand-green">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (value) =>
                        value + 1,
                    )
                  }
                  disabled={!isPurchasable}
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-lg text-brand-green
                    transition-all
                    hover:bg-brand-green/5
                    active:scale-90
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={!isPurchasable}
                className={`
                  relative min-h-[52px] flex-1
                  rounded-xl px-4 sm:px-6
                  font-semibold
                  transition-all duration-200
                  active:translate-y-[2px]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    added
                      ? `
                        bg-green-700 text-white
                        shadow-[0_5px_0_#14532d]
                      `
                      : `
                        border-2 border-brand-green
                        bg-white text-brand-green
                        shadow-[0_5px_0_rgba(62,39,35,0.10)]
                        hover:-translate-y-0.5
                        hover:bg-brand-green
                        hover:text-white
                        hover:shadow-[0_7px_0_rgba(49,82,56,0.30)]
                      `
                  }
                `}
              >
                {added ? (
                  <>
                    <Check className="mr-2 inline h-5 w-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 inline h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={!isPurchasable}
                className="
                  min-h-[52px] flex-1
                  rounded-xl
                  bg-brand-red
                  px-4 sm:px-6
                  font-bold text-white
                  shadow-[0_5px_0_#b9230a,0_10px_20px_rgba(254,51,14,0.15)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-brand-red-dark
                  hover:shadow-[0_7px_0_#a51f08,0_14px_24px_rgba(254,51,14,0.18)]
                  active:translate-y-[2px]
                  active:shadow-none
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Zap className="mr-2 inline h-5 w-5" />
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div
              className="
                grid grid-cols-3 gap-2
                border-t border-brand-green/10 pt-6
                sm:gap-4
              "
            >
              {[
                {
                  icon: Leaf,
                  label: '100% Vegetarian',
                },
                {
                  icon: ShieldCheck,
                  label: 'FSSAI Registered',
                },
                {
                  icon: Truck,
                  label: 'Free Shipping',
                },
              ].map(
                ({
                  icon: Icon,
                  label,
                }) => (
                  <div
                    key={label}
                    className="
                      flex flex-col items-center gap-2
                      rounded-xl bg-brand-ivory-dark
                      px-2 py-4 text-center
                      shadow-[0_3px_0_rgba(62,39,35,0.04)]
                      transition-transform
                      hover:-translate-y-1
                    "
                  >
                    <Icon
                      className="h-5 w-5 text-brand-green sm:h-6 sm:w-6"
                      aria-hidden="true"
                    />

                    <span className="text-[9px] font-semibold leading-tight text-brand-brown/65 sm:text-xs">
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================
          REVIEWS
      ================================================================= */}
      <section
        id="reviews"
        className="bg-brand-ivory-light py-16 sm:py-20"
      >
        <div className="container-max container-px">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-eyebrow mb-2">
                  Customer Reviews
                </p>

                <h2 className="font-serif text-3xl font-bold text-brand-green">
                  What customers say
                </h2>
              </div>

              {!reviewsLoading &&
                reviewCount > 0 && (
                  <div className="flex items-center gap-3">
                    {renderStars(
                      averageRating,
                      'h-5 w-5',
                    )}

                    <span className="text-lg font-bold text-brand-green">
                      {averageRating.toFixed(
                        1,
                      )}
                    </span>

                    <span className="text-sm text-brand-brown/50">
                      {reviewCount}{' '}
                      {reviewCount === 1
                        ? 'review'
                        : 'reviews'}
                    </span>
                  </div>
                )}
            </div>

            {reviewsLoading ? (
              <div className="card border border-brand-green/10 bg-white p-8 text-center">
                <p className="text-sm text-brand-brown/50">
                  Loading customer reviews...
                </p>
              </div>
            ) : reviewsError ? (
              <div className="card border border-brand-green/10 bg-white p-8 text-center">
                <p className="text-sm text-brand-brown/60">
                  Reviews are temporarily unavailable.
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="card border border-brand-green/10 bg-white p-10 text-center">
                <div className="mb-3 text-2xl tracking-widest text-brand-brown/20">
                  ☆☆☆☆☆
                </div>

                <p className="font-medium text-brand-green">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm text-brand-brown/50">
                  Be the first customer to
                  share your experience.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {reviews.map(
                  (review) => (
                    <article
                      key={
                        review.reviewId
                      }
                      className="
                        card border border-brand-green/10
                        bg-white p-5 shadow-soft
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:shadow-lift
                        sm:p-6
                      "
                    >
                      <div className="flex items-start justify-between gap-4">
                        {renderStars(
                          review.rating,
                        )}

                        {review.verifiedPurchase && (
                          <span className="whitespace-nowrap text-2xs font-semibold text-emerald-600">
                            Verified purchase
                          </span>
                        )}
                      </div>

                      {review.title && (
                        <h3 className="mt-4 font-serif font-semibold text-brand-green">
                          {review.title}
                        </h3>
                      )}

                      <p className="mt-2 text-sm leading-relaxed text-brand-brown/70">
                        {review.comment}
                      </p>

                      <div className="mt-5 border-t border-brand-green/10 pt-4">
                        <p className="text-xs font-semibold text-brand-brown">
                          {review.customerName}
                        </p>

                        <p className="mt-1 text-2xs text-brand-brown/40">
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
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          RELATED PRODUCTS
      ================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="bg-brand-ivory-dark py-16 sm:py-20">
          <div className="container-max container-px">
            <div className="mb-8 text-center sm:mb-10">
              <p className="section-eyebrow mb-2">
                You May Also Like
              </p>

              <h2 className="font-serif text-3xl font-bold text-brand-green">
                More from {product.category}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={
                      relatedProduct
                    }
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
