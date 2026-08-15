import { useMemo, useState } from 'react';
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
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { ReviewSection } from '../components/ReviewSection';
import { ProductService } from '../services/product-service';
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

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return ProductService.getProductsByCategory(product.category)
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO
          title="Product Not Found"
          description="Product not found"
          path="/product/not-found"
        />

        <h1 className="mb-4 font-serif text-3xl font-bold text-brand-brown">
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

  const discount =
    selectedSku.mrp > 0
      ? Math.round(
          ((selectedSku.mrp - selectedSku.websitePrice) /
            selectedSku.mrp) *
            100,
        )
      : 0;

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

      <main>
        {/* Product Overview */}
        <div className="container-max container-px py-8 sm:py-10 lg:py-12">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">

            {/* Product Image */}
            <div className="lg:sticky lg:top-28">
              <div
                className="
                  aspect-square
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-brown/5
                  bg-brand-cream-dark
                  shadow-soft
                  sm:rounded-4xl
                "
              >
                <ProductImage
                  productId={product.id}
                  product={product}
                  variant="detail"
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Product Information */}
            <div>
              <div className="mb-6">
                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-brand-red
                  "
                >
                  {product.category}
                </span>

                <h1
                  className="
                    mt-2
                    font-serif
                    text-3xl
                    font-bold
                    leading-tight
                    text-brand-brown
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  {product.name}
                </h1>

                <p
                  className="
                    mt-4
                    max-w-2xl
                    text-base
                    leading-relaxed
                    text-brand-brown/70
                    sm:text-lg
                  "
                >
                  {product.description}
                </p>
              </div>

              {/* Pack Size + Price */}
              <div
                className="
                  border-y
                  border-brand-brown/10
                  py-6
                  sm:py-8
                "
              >
                <div className="mb-6">
                  <label
                    className="
                      mb-3
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-brand-brown
                      sm:text-sm
                    "
                  >
                    Pack Size
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {product.skus.map((sku, index) => (
                      <button
                        key={sku.sku}
                        type="button"
                        onClick={() =>
                          setSelectedSkuIndex(index)
                        }
                        aria-pressed={
                          selectedSkuIndex === index
                        }
                        className={`
                          min-h-[44px]
                          rounded-full
                          border
                          px-5
                          py-2.5
                          text-sm
                          font-medium
                          transition-all
                          sm:px-6
                          ${
                            selectedSkuIndex === index
                              ? 'border-brand-brown bg-brand-brown text-white'
                              : 'border-brand-brown/10 bg-white text-brand-brown hover:border-brand-brown/30'
                          }
                        `}
                      >
                        {PACK_LABELS[sku.packSize] ||
                          `${sku.packSize}g`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                  <span
                    className="
                      text-3xl
                      font-bold
                      text-brand-brown
                      sm:text-4xl
                    "
                  >
                    ₹{selectedSku.websitePrice}
                  </span>

                  <span
                    className="
                      text-base
                      text-brand-brown/40
                      line-through
                      sm:text-lg
                    "
                  >
                    ₹{selectedSku.mrp}
                  </span>

                  {discount > 0 && (
                    <span className="badge-red mb-1">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-brand-brown/60">
                  {selectedSku.freeShipping ? (
                    <span className="font-medium text-green-600">
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
                  gap-3
                  py-6
                  sm:py-8
                  lg:flex-row
                "
              >
                {/* Quantity */}
                <div
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-brand-brown/10
                    bg-white
                    p-1
                    lg:shrink-0
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(1, q - 1),
                      )
                    }
                    className="
                      rounded-full
                      p-3
                      transition-colors
                      hover:bg-brand-brown/5
                    "
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-12 text-center font-bold text-brand-brown">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => q + 1)
                    }
                    className="
                      rounded-full
                      p-3
                      transition-colors
                      hover:bg-brand-brown/5
                    "
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="
                      btn-outline
                      min-h-[52px]
                      w-full
                      justify-center
                      py-3.5
                    "
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="
                      btn-primary
                      min-h-[52px]
                      w-full
                      justify-center
                      py-3.5
                    "
                  >
                    <Zap className="h-5 w-5" />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Trust Features */}
              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                  border-t
                  border-brand-brown/10
                  py-6
                  sm:gap-4
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
                ].map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.label}
                      className="
                        flex
                        flex-col
                        items-center
                        gap-2
                        text-center
                      "
                    >
                      <Icon
                        className="
                          h-5
                          w-5
                          text-brand-brown/30
                          sm:h-6
                          sm:w-6
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-medium
                          leading-tight
                          text-brand-brown/70
                          sm:text-xs
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
        <div className="container-max container-px pb-12 pt-4 sm:pb-16">
          <ReviewSection
            productId={product.id}
            productName={product.name}
            sku={selectedSku.sku}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="bg-brand-cream-dark py-14 sm:py-20">
            <div className="container-max container-px">
              <h2
                className="
                  mb-8
                  text-center
                  font-serif
                  text-2xl
                  font-bold
                  text-brand-brown
                  sm:mb-12
                  sm:text-3xl
                "
              >
                More from {product.category}
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
