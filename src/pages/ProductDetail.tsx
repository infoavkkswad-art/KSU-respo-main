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

  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return ProductService.getProductsByCategory(product.category)
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  useEffect(() => {
    if (!product) return;

    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(false);

      try {
        const [summary, reviewList] = await Promise.all([
          ReviewService.getSummary(product.id),
          ReviewService.getReviews(product.id, 20, 0),
        ]);

        if (cancelled) return;

        setReviewSummary(summary);

        setReviews(
          reviewList.filter(
            (review) => review.status === 'approved',
          ),
        );
      } catch {
        if (cancelled) return;

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

        <Link to="/products" className="btn-primary">
          Browse All
        </Link>
      </div>
    );
  }

  const selectedSku =
    product.skus[selectedSkuIndex] || product.skus[0];

  const discount = Math.round(
    ((selectedSku.mrp - selectedSku.websitePrice) /
      selectedSku.mrp) *
      100,
  );

  const averageRating =
    reviewSummary && reviewSummary.reviewCount > 0
      ? reviewSummary.averageRating
      : 0;

  const reviewCount =
    reviewSummary?.reviewCount ?? reviews.length;

  const handleAddToCart = () => {
    addItem(selectedSku.sku, quantity);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    addItem(selectedSku.sku, quantity);
    navigate('/checkout');
  };

  const renderStars = (
    rating: number,
    size = 'w-4 h-4',
  ) => {
    return (
      <div
        className="flex items-center gap-0.5"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.round(rating)
                ? 'fill-brand-red text-brand-red'
                : 'text-brand-brown/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          {
            name: product.name,
            path: `/product/${product.slug}`,
          },
        ])}
      />

      <div className="container-max container-px py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Product Image */}
          <div className="sticky top-28">
            <div
              className="
                aspect-square
                rounded-4xl
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
                  text-4xl
                  font-serif
                  font-bold
                  text-brand-brown
                  mt-2
                "
              >
                {product.name}
              </h1>

              <p
                className="
                  mt-4
                  text-brand-brown/70
                  leading-relaxed
                  text-lg
                "
              >
                {product.description}
              </p>

              {/* Live Rating Summary */}
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                {reviewsLoading ? (
                  <span className="text-sm text-brand-brown/50">
                    Loading reviews...
                  </span>
                ) : reviewCount > 0 ? (
                  <>
                    {renderStars(averageRating)}

                    <span className="text-sm font-semibold text-brand-brown">
                      {averageRating.toFixed(1)}
                    </span>

                    <span className="text-sm text-brand-brown/50">
                      ({reviewCount}{' '}
                      {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="text-lg tracking-wide text-brand-brown/30"
                      aria-label="No reviews yet"
                    >
                      ☆☆☆☆☆
                    </span>

                    <span className="text-sm text-brand-brown/50">
                      No reviews yet
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Pack Size + Price */}
            <div
              className="
                py-8
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
                  {product.skus.map((sku, index) => (
                    <button
                      key={sku.sku}
                      type="button"
                      onClick={() =>
                        setSelectedSkuIndex(index)
                      }
                      className={`
                        px-6
                        py-3
                        rounded-full
                        text-sm
                        font-medium
                        border
                        transition-all
                        ${
                          selectedSkuIndex === index
                            ? 'bg-brand-brown text-white border-brand-brown'
                            : 'bg-white border-brand-brown/10 hover:border-brand-brown/30'
                        }
                      `}
                    >
                      {PACK_LABELS[sku.packSize] ||
                        `${sku.packSize}g`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-4 flex-wrap">
                <span
                  className="
                    text-4xl
                    font-bold
                    text-brand-brown
                  "
                >
                  ₹{selectedSku.websitePrice}
                </span>

                <span
                  className="
                    text-lg
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
                py-8
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
                    setQuantity((q) => q + 1)
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
                gap-4
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
              ].map((feature, index) => {
                const Icon = feature.icon;

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
                        w-6
                        h-6
                        text-brand-brown/30
                      "
                    />

                    <span
                      className="
                        text-xs
                        font-medium
                        text-brand-brown/70
                      "
                    >
                      {feature.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="container-max container-px py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-2">
                Customer Reviews
              </p>

              <h2 className="text-3xl font-serif font-bold text-brand-brown">
                What customers say
              </h2>
            </div>

            {!reviewsLoading && reviewCount > 0 && (
              <div className="flex items-center gap-3">
                {renderStars(averageRating, 'w-5 h-5')}

                <span className="text-lg font-bold text-brand-brown">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-sm text-brand-brown/50">
                  {reviewCount}{' '}
                  {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="card p-8 text-center bg-white border border-brand-brown/5">
              <p className="text-sm text-brand-brown/50">
                Loading customer reviews...
              </p>
            </div>
          ) : reviewsError ? (
            <div className="card p-8 text-center bg-white border border-brand-brown/5">
              <p className="text-sm text-brand-brown/60">
                Reviews are temporarily unavailable.
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-brand-brown/5">
              <div className="text-2xl tracking-widest text-brand-brown/25 mb-3">
                ☆☆☆☆☆
              </div>

              <p className="font-medium text-brand-brown">
                No reviews yet
              </p>

              <p className="text-sm text-brand-brown/50 mt-1">
                Be the first customer to share your experience.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {reviews.map((review) => (
                <article
                  key={review.reviewId}
                  className="
                    card
                    p-6
                    bg-white
                    border
                    border-brand-brown/5
                    shadow-soft
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    {renderStars(review.rating)}

                    {review.verifiedPurchase && (
                      <span className="text-2xs font-semibold text-emerald-600 whitespace-nowrap">
                        Verified purchase
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <h3 className="font-serif font-semibold text-brand-brown mt-4">
                      {review.title}
                    </h3>
                  )}

                  <p className="text-sm leading-relaxed text-brand-brown/70 mt-2">
                    {review.comment}
                  </p>

                  <div className="mt-5 pt-4 border-t border-brand-brown/10">
                    <p className="text-xs font-semibold text-brand-brown">
                      {review.customerName}
                    </p>

                    <p className="text-2xs text-brand-brown/40 mt-1">
                      {new Date(review.createdAt).toLocaleDateString(
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="bg-brand-cream-dark py-20">
        <div className="container-max container-px">
          <h2
            className="
              text-3xl
              font-serif
              font-bold
              text-brand-brown
              mb-12
              text-center
            "
          >
            More from {product.category}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
