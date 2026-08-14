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
