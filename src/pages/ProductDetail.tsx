import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

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

import {
  SEO,
  breadcrumbSchema,
} from '@/components/SEO';

import {
  ProductCard,
} from '@/components/ProductCard';

import {
  ProductImage,
} from '@/components/ProductImage';

import {
  ProductService,
} from '@/services/product-service';

import type {
  ProductFamily,
  Sku,
} from '@/data/products';

import {
  PACK_LABELS,
} from '@/data/products';

import {
  useCart,
  formatPrice,
} from '@/context/CartContext';

import {
  ReviewSection,
} from '@/components/ReviewSection';

type PurchasableSku = Sku & {
  mrp: number;
  websitePrice: number;
};

function isPurchasableSku(
  sku: Sku | undefined,
): sku is PurchasableSku {
  return (
    !!sku &&
    sku.available === true &&
    typeof sku.websitePrice === 'number' &&
    Number.isFinite(
      sku.websitePrice,
    ) &&
    sku.websitePrice >= 0 &&
    typeof sku.mrp === 'number' &&
    Number.isFinite(sku.mrp) &&
    sku.mrp >= 0 &&
    sku.websitePrice <= sku.mrp
  );
}

export default function ProductDetail() {
  const {
    slug,
  } = useParams<{
    slug: string;
  }>();

  const navigate =
    useNavigate();

  const {
    addItem,
  } = useCart();

  const product:
    | ProductFamily
    | undefined =
    slug
      ? ProductService.getProductBySlug(
          slug,
        )
      : undefined;

  const [
    selectedSkuIndex,
    setSelectedSkuIndex,
  ] = useState(0);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    added,
    setAdded,
  ] = useState(false);

  /*
   * Only available SKUs with valid customer
   * pricing are exposed.
   */
  const purchasableSkus =
    useMemo<PurchasableSku[]>(
      () => {
        if (!product) {
          return [];
        }

        return ProductService
          .getAvailableSkus(
            product,
          )
          .filter(
            isPurchasableSku,
          );
      },
      [product],
    );

  /*
   * Related products must also have at least
   * one purchasable SKU.
   */
  const relatedProducts =
    useMemo(() => {
      if (!product) {
        return [];
      }

      return ProductService
        .getRelatedProducts(
          product,
          4,
        )
        .filter(
          (item) =>
            ProductService
              .getAvailableSkus(
                item,
              )
              .some(
                isPurchasableSku,
              ),
        )
        .slice(0, 4);
    }, [product]);

  /*
   * Keep selected SKU valid whenever
   * the available catalog changes.
   */
  useEffect(() => {
    if (
      purchasableSkus.length ===
      0
    ) {
      setSelectedSkuIndex(0);
      setQuantity(1);
      setAdded(false);
      return;
    }

    if (
      selectedSkuIndex >=
      purchasableSkus.length
    ) {
      setSelectedSkuIndex(0);
    }
  }, [
    selectedSkuIndex,
    purchasableSkus.length,
  ]);

  if (!product) {
    return (
      <>
        <SEO
          title="Product Not Found"
          description="The requested Kawad Swad product could not be found."
          path="/product/not-found"
          indexable={false}
        />

        <section className="container-max container-px py-20 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-brand-brown">
            Product not found
          </h1>

          <p className="mx-auto mb-8 max-w-md text-sm text-brand-brown/60">
            The product you are looking for may have
            moved or is no longer available.
          </p>

          <Link
            to="/products"
            className="btn-primary"
          >
            Browse All Products
          </Link>
        </section>
      </>
    );
  }

  /*
   * No purchasable SKU means the product exists
   * in the catalog but is not currently for sale.
   */
  if (
    purchasableSkus.length ===
    0
  ) {
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

        <section className="container-max container-px py-16 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-4xl border border-brand-brown/5 bg-brand-cream-dark shadow-soft">
              <ProductImage
                productId={product.id}
                product={product}
                variant="detail"
                className="h-full w-full"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-red">
                {product.category}
              </p>

              <h1 className="mt-2 font-serif text-4xl font-bold text-brand-brown">
                {product.name}
              </h1>

              <p className="mt-2 text-sm text-brand-brown/55">
                {product.variant}
              </p>

              <p className="mt-5 text-lg leading-relaxed text-brand-brown/70">
                {product.description}
              </p>

              <div className="mt-8 rounded-2xl border border-brand-brown/10 bg-brand-cream p-5">
                <p className="font-semibold text-brand-brown">
                  Currently unavailable
                </p>

                <p className="mt-1 text-sm text-brand-brown/60">
                  This product is not currently available
                  for online purchase.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/shop"
                  className="btn-outline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const selectedSku =
    purchasableSkus[
      selectedSkuIndex
    ] ??
    purchasableSkus[0];

  const packLabel =
    PACK_LABELS[
      selectedSku.packSize
    ] ??
    `${selectedSku.packSize}g`;

  const discount =
    selectedSku.mrp > 0
      ? Math.max(
          0,
          Math.round(
            (
              (
                selectedSku.mrp -
                selectedSku.websitePrice
              ) /
              selectedSku.mrp
            ) *
              100,
          ),
        )
      : 0;

  const handleAddToCart =
    () => {
      addItem(
        selectedSku.sku,
        quantity,
      );

      setAdded(true);

      window.setTimeout(
        () => {
          setAdded(false);
        },
        2000,
      );
    };

  const handleBuyNow =
    () => {
      addItem(
        selectedSku.sku,
        quantity,
      );

      navigate(
        '/checkout',
      );
    };

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

      <section className="container-max container-px py-10 sm:py-12 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ============================================================
              PRODUCT IMAGE
          ============================================================ */}

          <div className="lg:sticky lg:top-28">
            <div
              className="
                overflow-hidden
                rounded-4xl
                border
                border-brand-brown/5
                bg-brand-cream-dark
                shadow-soft
              "
            >
              <ProductImage
                productId={product.id}
                product={product}
                variant="detail"
                className="aspect-square h-full w-full"
              />
            </div>
          </div>

          {/* ============================================================
              BUY BOX
          ============================================================ */}

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-red">
              {product.category}
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm font-medium text-brand-brown/55">
              {product.variant}
            </p>

            <p className="mt-5 text-base leading-relaxed text-brand-brown/70 sm:text-lg">
              {product.description}
            </p>

            {/* Pack Size */}

            <div className="mt-7">
              <label
                htmlFor="product-pack-size"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-brand-brown/60
                "
              >
                Pack Size
              </label>

              <select
                id="product-pack-size"
                value={
                  selectedSkuIndex
                }
                onChange={(
                  event,
                ) => {
                  setSelectedSkuIndex(
                    Number(
                      event.target.value,
                    ),
                  );
                  setQuantity(1);
                }}
                className="
                  min-h-[48px]
                  w-full
                  rounded-xl
                  border
                  border-brand-brown/15
                  bg-brand-cream
                  px-4
                  py-3
                  font-semibold
                  text-brand-brown
                  outline-none
                  transition
                  focus:border-brand-red
                  focus:ring-2
                  focus:ring-brand-red/10
                "
              >
                {purchasableSkus.map(
                  (
                    sku,
                    index,
                  ) => (
                    <option
                      key={
                        sku.sku
                      }
                      value={index}
                    >
                      {PACK_LABELS[
                        sku.packSize
                      ] ??
                        `${sku.packSize}g`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Price */}

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-brand-red">
                {formatPrice(
                  selectedSku.websitePrice,
                )}
              </span>

              {selectedSku.mrp >
                selectedSku.websitePrice && (
                <span className="text-base text-brand-brown/40 line-through">
                  {formatPrice(
                    selectedSku.mrp,
                  )}
                </span>
              )}

              {discount > 0 && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  {discount}% below MRP
                </span>
              )}
            </div>

            {/* Shipping */}

            <div className="mt-3 flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-green-700" />

              <span className="font-semibold text-green-700">
                Free shipping
              </span>
            </div>

            {/* Quantity + Cart */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div
                className="
                  inline-flex
                  h-[52px]
                  shrink-0
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-brand-brown/15
                  bg-white
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                  className="flex h-full w-12 items-center justify-center text-brand-brown/70 transition hover:text-brand-red"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-10 text-center font-bold text-brand-brown">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="flex h-full w-12 items-center justify-center text-brand-brown/70 transition hover:text-brand-red"
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
                className="
                  flex
                  min-h-[52px]
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-brand-brown/15
                  bg-white
                  px-5
                  py-3
                  font-semibold
                  text-brand-brown
                  shadow-soft
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-brand-cream
                "
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5 text-green-700" />
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
                onClick={
                  handleBuyNow
                }
                className="
                  flex
                  min-h-[52px]
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-brand-red
                  px-5
                  py-3
                  font-bold
                  text-white
                  shadow-[0_5px_0_#b9230a]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-brand-red-dark
                  active:translate-y-[2px]
                  active:shadow-none
                "
              >
                <Zap className="h-5 w-5" />
                Buy Now
              </button>
            </div>

            {/* Trust Features */}

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-brand-brown/10 py-6 sm:gap-5">
              {[
                {
                  icon: Leaf,
                  label: '100% Vegetarian',
                },
                {
                  icon: ShieldCheck,
                  label: 'FSSAI Licensed',
                },
                {
                  icon: Truck,
                  label: 'Delivery available',
                },
              ].map(
                (
                  feature,
                ) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={
                        feature.label
                      }
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <Icon className="h-6 w-6 text-brand-brown/35" />

                      <span className="text-[10px] font-medium leading-tight text-brand-brown/70 sm:text-xs">
                        {feature.label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          PRODUCT INFORMATION
      ================================================================ */}

      <section className="bg-brand-cream-dark py-16 lg:py-20">
        <div className="container-max container-px">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Ingredients */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Ingredients
              </h2>

              <ul className="mt-5 space-y-2">
                {product.ingredients.map(
                  (
                    ingredient,
                  ) => (
                    <li
                      key={
                        ingredient
                      }
                      className="flex gap-3 text-sm text-brand-brown/70"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                      <span>
                        {ingredient}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Taste */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Taste Profile
              </h2>

              <p className="mt-5 text-sm leading-7 text-brand-brown/70">
                {product.tasteProfile}
              </p>
            </div>

            {/* Storage */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Storage
              </h2>

              <p className="mt-5 text-sm leading-7 text-brand-brown/70">
                {product.storage}
              </p>
            </div>

            {/* Serving */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Serving Information
              </h2>

              <p className="mt-5 text-sm leading-7 text-brand-brown/70">
                {product.serving}
              </p>
            </div>

            {/* Nutrition */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Nutrition
              </h2>

              <p className="mt-5 text-sm leading-7 text-brand-brown/70">
                {product.nutritionNote}
              </p>
            </div>

            {/* FSSAI */}

            <div className="card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-brown">
                Food Safety Information
              </h2>

              <div className="mt-5 space-y-3 text-sm text-brand-brown/70">
                <p>
                  <span className="font-semibold text-brand-brown">
                    FSSAI Licence:
                  </span>{' '}
                  21425890001224
                </p>

                <p className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-700" />
                  100% Vegetarian
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          REVIEWS
      ================================================================ */}

      <section
        id="reviews"
        className="container-max container-px py-16 lg:py-20"
      >
        <div className="mb-8 flex items-center gap-3">
          <Star className="h-6 w-6 fill-current text-brand-red" />

          <div>
            <h2 className="font-serif text-3xl font-bold text-brand-brown">
              Customer Reviews
            </h2>

            <p className="mt-1 text-sm text-brand-brown/55">
              Genuine customer feedback for this product.
            </p>
          </div>
        </div>

        <ReviewSection
          productId={product.id}
          productName={product.name}
          sku={selectedSku.sku}
        />
      </section>

      {/* ================================================================
          RELATED PRODUCTS
      ================================================================ */}

      {relatedProducts.length >
        0 && (
        <section className="bg-brand-cream-dark py-16 lg:py-20">
          <div className="container-max container-px">
            <div className="mb-10 text-center">
              <p className="section-eyebrow">
                Explore More
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-brand-brown">
                More from{' '}
                {product.category}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map(
                (
                  relatedProduct,
                ) => (
                  <ProductCard
                    key={
                      relatedProduct.id
                    }
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
