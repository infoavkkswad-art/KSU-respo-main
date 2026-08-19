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
  PackageCheck,
  ArrowRight,
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


/* ==========================================================================
   KAWAD SWAD 2.0
   PRODUCT DETAIL

   VISUAL FLOW:

   PRODUCT VISUAL
        ↓
   PRODUCT IDENTITY
        ↓
   PACK SIZE
        ↓
   PRICE
        ↓
   TRUST
        ↓
   QUANTITY
        ↓
   CART / BUY NOW
        ↓
   PRODUCT INFORMATION
        ↓
   REVIEWS
        ↓
   RELATED PRODUCTS

   IMPORTANT:

   ProductService remains the commercial authority.

   ProductDetail does NOT create:
   - pricing rules
   - SKU availability rules
   - discount rules
   - shipping calculations

   It only presents the authoritative values.
   ========================================================================== */


/* ==========================================================================
   FSSAI
   ========================================================================== */

const FSSAI_LICENSE =
  '21425890001224';


/* ==========================================================================
   PRODUCT DETAIL
   ========================================================================== */

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


  /* ==========================================================================
     PRODUCT
     ======================================================================== */

  const product =
    slug
      ? ProductService.getProductBySlug(
          slug,
        )
      : undefined;


  /* ==========================================================================
     LOCAL STATE
     ======================================================================== */

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


  /* ==========================================================================
     AUTHORITATIVE PURCHASABLE SKUS
     ======================================================================== */

  const purchasableSkus =
    useMemo(() => {

      if (!product) {
        return [];
      }

      return ProductService.getAvailableSkus(
        product,
      );

    }, [product]);


  /* ==========================================================================
     RELATED PRODUCTS
     ======================================================================== */

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
        .slice(0, 4);

    }, [product]);


  /* ==========================================================================
     KEEP SELECTED SKU VALID
     ======================================================================== */

  useEffect(() => {

    if (
      purchasableSkus.length === 0
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
    purchasableSkus.length,
    selectedSkuIndex,
  ]);


  /* ==========================================================================
     PRODUCT NOT FOUND
     ======================================================================== */

  if (!product) {

    return (
      <>
        <SEO
          title="Product Not Found"
          description="The requested Kawad Swad product could not be found."
          path="/product/not-found"
          indexable={false}
        />


        <section
          className="
            min-h-[60vh]
            bg-brand-ivory
            py-16
            sm:py-20
            lg:py-24
          "
        >

          <div
            className="
              container-max
              container-px
            "
          >

            <div
              className="
                mx-auto
                max-w-xl
                rounded-3xl
                border
                border-brand-green/10
                bg-white
                p-7
                text-center
                shadow-card
                sm:p-10
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-green/5
                  text-brand-green
                "
              >
                <ShoppingBag
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>


              <h1
                className="
                  mt-5
                  font-serif
                  text-2xl
                  font-bold
                  text-brand-green
                  sm:text-3xl
                "
              >
                Product not found
              </h1>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-relaxed
                  text-brand-brown/60
                "
              >
                The product you are looking for may
                have moved or is no longer available.
              </p>


              <Link
                to="/shop"
                className="
                  btn-primary
                  mt-6
                  min-h-[46px]
                  px-6
                  shadow-soft
                "
              >
                Browse Shop

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

            </div>

          </div>

        </section>
      </>
    );
  }


  /* ==========================================================================
     PRODUCT EXISTS BUT NO PURCHASABLE SKU
     ======================================================================== */

  if (
    purchasableSkus.length === 0
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


        <section
          className="
            bg-brand-ivory
            py-8
            sm:py-10
            lg:py-14
          "
        >

          <div
            className="
              container-max
              container-px
            "
          >

            <div
              className="
                grid
                items-center
                gap-6
                lg:grid-cols-2
                lg:gap-10
              "
            >

              {/* IMAGE */}

              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-brand-cream-dark
                  shadow-card
                "
              >

                <ProductImage
                  productId={
                    product.id
                  }
                  product={
                    product
                  }
                  variant="detail"
                  className="
                    aspect-square
                    h-full
                    w-full
                  "
                />

              </div>


              {/* INFORMATION */}

              <div>

                <span
                  className="
                    section-eyebrow
                    text-brand-saffron
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
                    text-brand-green
                    sm:text-4xl
                  "
                >
                  {product.name}
                </h1>


                <p
                  className="
                    mt-1.5
                    text-sm
                    font-medium
                    text-brand-brown/55
                  "
                >
                  {product.variant}
                </p>


                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-brand-brown/65
                    sm:text-base
                  "
                >
                  {product.description}
                </p>


                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-brand-saffron/20
                    bg-brand-saffron/5
                    p-4
                  "
                >

                  <p
                    className="
                      font-semibold
                      text-brand-brown
                    "
                  >
                    Currently unavailable
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                    "
                  >
                    This product is not currently
                    available for online purchase.
                  </p>

                </div>


                <Link
                  to="/shop"
                  className="
                    btn-outline
                    mt-5
                    min-h-[46px]
                  "
                >
                  Continue Shopping

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>

              </div>

            </div>

          </div>

        </section>
      </>
    );
  }


  /* ==========================================================================
     SELECTED SKU
     ======================================================================== */

  const selectedSku =
    purchasableSkus[
      selectedSkuIndex
    ] ??
    purchasableSkus[0];


  /* ==========================================================================
     DISPLAY VALUES
     ======================================================================== */

  const packLabel =
    PACK_LABELS[
      selectedSku.packSize
    ] ??
    `${selectedSku.packSize}g`;


  const discount =
    selectedSku.mrp >
      selectedSku.websitePrice &&
    selectedSku.mrp > 0
      ? Math.round(
          (
            (
              selectedSku.mrp -
              selectedSku.websitePrice
            ) /
            selectedSku.mrp
          ) *
            100,
        )
      : 0;


  /* ==========================================================================
     ADD TO CART
     ======================================================================== */

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


  /* ==========================================================================
     BUY NOW
     ======================================================================== */

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


  /* ==========================================================================
     QUANTITY
     ======================================================================== */

  const decreaseQuantity =
    () => {

      setQuantity(
        (current) =>
          Math.max(
            1,
            current - 1,
          ),
      );
    };


  const increaseQuantity =
    () => {

      setQuantity(
        (current) =>
          current + 1,
      );
    };


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <>
      {/* ======================================================================
          SEO
          =================================================================== */}

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


      {/* ======================================================================
          PRODUCT PURCHASE AREA
          =================================================================== */}

      <section
        className="
          overflow-hidden
          bg-brand-ivory
          py-6
          sm:py-8
          lg:py-10
        "
      >

        <div
          className="
            container-max
            container-px
          "
        >

          {/* ==================================================================
              BREADCRUMB
              ================================================================== */}

          <nav
            aria-label="Breadcrumb"
            className="
              mb-4
              flex
              min-w-0
              items-center
              gap-1.5
              overflow-hidden
              text-[10px]
              text-brand-brown/45
              sm:text-xs
            "
          >

            <Link
              to="/"
              className="shrink-0 hover:text-brand-green"
            >
              Home
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              to="/shop"
              className="shrink-0 hover:text-brand-green"
            >
              Shop
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span
              className="
                truncate
                text-brand-brown/60
              "
            >
              {product.name}
            </span>

          </nav>


          <div
            className="
              grid
              items-start
              gap-6
              lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)]
              lg:gap-10
              xl:gap-14
            "
          >

            {/* ==================================================================
                PRODUCT VISUAL
                =================================================================== */}

            <div
              className="
                lg:sticky
                lg:top-24
              "
            >

              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-brand-cream-dark
                  shadow-card
                "
              >

                {/* ==============================================================
                    IMAGE STAGE
                    =========================================================== */}

                <div
                  className="
                    relative
                    aspect-square
                    overflow-hidden
                    bg-gradient-to-br
                    from-white
                    via-brand-cream
                    to-brand-cream-dark
                  "
                >

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-[45%]
                      h-[60%]
                      w-[60%]
                      -translate-x-1/2
                      -translate-y-1/2
                      rounded-full
                      bg-brand-saffron/5
                      blur-3xl
                    "
                    aria-hidden="true"
                  />


                  <div
                    className="
                      pointer-events-none
                      absolute
                      bottom-[9%]
                      left-1/2
                      h-[7%]
                      w-[45%]
                      -translate-x-1/2
                      rounded-[50%]
                      bg-brand-brown/15
                      blur-[12px]
                    "
                    aria-hidden="true"
                  />


                  <div
                    className="
                      relative
                      z-10
                      h-full
                      w-full
                      p-[7%]
                    "
                  >

                    <ProductImage
                      productId={
                        product.id
                      }
                      product={
                        product
                      }
                      variant="detail"
                      className="
                        h-full
                        w-full
                      "
                    />

                  </div>


                  {/* ============================================================
                      CATEGORY
                      ========================================================= */}

                  <div
                    className="
                      absolute
                      left-5
                      top-5
                      z-20
                      rounded-full
                      border
                      border-white/70
                      bg-white/85
                      px-3
                      py-1.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-brand-green
                      shadow-soft
                      backdrop-blur-sm
                    "
                  >
                    {product.category}
                  </div>


                  {/* ============================================================
                      DISCOUNT
                      ========================================================= */}

                  {discount > 0 && (
                    <div
                      className="
                        absolute
                        right-5
                        top-5
                        z-20
                        rounded-full
                        bg-brand-saffron
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        text-white
                        shadow-soft
                      "
                    >
                      {discount}% OFF
                    </div>
                  )}

                </div>

              </div>


              {/* ================================================================
                  MOBILE TRUST STRIP
                  ============================================================= */}

              <div
                className="
                  mt-3
                  grid
                  grid-cols-3
                  gap-2
                  lg:hidden
                "
              >

                <TrustMini
                  icon={
                    <Leaf
                      className="h-4 w-4"
                    />
                  }
                  label="100% Veg"
                />

                <TrustMini
                  icon={
                    <ShieldCheck
                      className="h-4 w-4"
                    />
                  }
                  label="FSSAI"
                />

                <TrustMini
                  icon={
                    <Truck
                      className="h-4 w-4"
                    />
                  }
                  label="Free Ship"
                />

              </div>

            </div>


            {/* ==================================================================
                BUY BOX
                =================================================================== */}

            <div
              className="
                min-w-0
              "
            >

              <div
                className="
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-white
                  p-4
                  shadow-card
                  sm:p-6
                  lg:p-7
                "
              >

                {/* ==============================================================
                    PRODUCT IDENTITY
                    =========================================================== */}

                <span
                  className="
                    section-eyebrow
                    text-brand-saffron
                  "
                >
                  {product.category}
                </span>


                <h1
                  className="
                    mt-1.5
                    text-balance
                    font-serif
                    text-3xl
                    font-bold
                    leading-[1.05]
                    text-brand-green
                    sm:text-4xl
                    lg:text-[2.75rem]
                  "
                >
                  {product.name}
                </h1>


                <p
                  className="
                    mt-1.5
                    text-sm
                    font-medium
                    text-brand-brown/50
                  "
                >
                  {product.variant}
                </p>


                <p
                  className="
                    mt-4
                    text-sm
                    leading-6
                    text-brand-brown/65
                    sm:text-base
                    sm:leading-7
                  "
                >
                  {product.description}
                </p>


                {/* ==============================================================
                    PACK SELECTOR
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    border-t
                    border-brand-green/10
                    pt-5
                  "
                >

                  <label
                    htmlFor="product-pack-size"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-brand-green
                    "
                  >
                    Choose Your Pack
                  </label>


                  <select
                    id="product-pack-size"
                    value={
                      selectedSkuIndex
                    }
                    onChange={(
                      event,
                    ) => {

                      const nextIndex =
                        Number(
                          event.target
                            .value,
                        );


                      if (
                        Number.isInteger(
                          nextIndex,
                        ) &&
                        nextIndex >=
                          0 &&
                        nextIndex <
                          purchasableSkus.length
                      ) {

                        setSelectedSkuIndex(
                          nextIndex,
                        );

                        setQuantity(1);

                        setAdded(false);

                      }

                    }}
                    className="
                      min-h-[50px]
                      w-full
                      cursor-pointer
                      appearance-none
                      rounded-xl
                      border
                      border-brand-green/15
                      bg-brand-cream
                      px-4
                      py-3
                      font-semibold
                      text-brand-brown
                      outline-none
                      transition-all
                      duration-200
                      hover:border-brand-green/25
                      focus:border-brand-saffron
                      focus:ring-2
                      focus:ring-brand-saffron/10
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
                          value={
                            index
                          }
                        >
                          {PACK_LABELS[
                            sku.packSize
                          ] ??
                            `${sku.packSize}g`}
                        </option>

                      ),
                    )}

                  </select>


                  <p
                    className="
                      mt-1.5
                      text-[10px]
                      text-brand-brown/40
                    "
                  >
                    Selected pack:{' '}
                    <span className="font-semibold text-brand-brown/60">
                      {packLabel}
                    </span>
                  </p>

                </div>


                {/* ==============================================================
                    PRICE
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    rounded-2xl
                    bg-brand-ivory
                    p-3.5
                    sm:p-4
                  "
                >

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-3
                      gap-y-1
                    "
                  >

                    <span
                      className="
                        text-3xl
                        font-bold
                        tracking-tight
                        text-brand-green
                        sm:text-4xl
                      "
                    >
                      {formatPrice(
                        selectedSku.websitePrice,
                      )}
                    </span>


                    {selectedSku.mrp >
                      selectedSku.websitePrice && (
                      <span
                        className="
                          text-sm
                          text-brand-brown/35
                          line-through
                          sm:text-base
                        "
                      >
                        {formatPrice(
                          selectedSku.mrp,
                        )}
                      </span>
                    )}


                    {discount > 0 && (
                      <span
                        className="
                          rounded-full
                          bg-brand-saffron/10
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          text-brand-saffron-dark
                        "
                      >
                        Save {discount}%
                      </span>
                    )}

                  </div>


                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      text-[11px]
                      text-brand-brown/50
                    "
                  >

                    <Truck
                      className="
                        h-3.5
                        w-3.5
                        text-brand-green
                      "
                      aria-hidden="true"
                    />

                    <span>
                      Free shipping included
                    </span>

                  </div>

                </div>


                {/* ==============================================================
                    QUANTITY + ACTIONS
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    gap-2.5
                    sm:flex-row
                  "
                >

                  {/* QUANTITY */}

                  <div
                    className="
                      flex
                      min-h-[52px]
                      shrink-0
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-brand-ivory
                      sm:w-[138px]
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      className="
                        flex
                        h-full
                        w-11
                        items-center
                        justify-center
                        rounded-l-xl
                        text-brand-green/65
                        transition-colors
                        hover:bg-brand-green/5
                        hover:text-brand-green
                        active:bg-brand-green/10
                      "
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>


                    <span
                      className="
                        min-w-[32px]
                        text-center
                        text-sm
                        font-bold
                        text-brand-green
                      "
                    >
                      {quantity}
                    </span>


                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      className="
                        flex
                        h-full
                        w-11
                        items-center
                        justify-center
                        rounded-r-xl
                        text-brand-green/65
                        transition-colors
                        hover:bg-brand-green/5
                        hover:text-brand-green
                        active:bg-brand-green/10
                      "
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                  </div>


                  {/* ADD TO CART */}

                  <button
                    type="button"
                    onClick={
                      handleAddToCart
                    }
                    className={`
                      flex
                      min-h-[52px]
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      active:translate-y-px

                      ${
                        added
                          ? `
                            border-brand-green
                            bg-brand-green
                            text-white
                            shadow-green-glow
                          `
                          : `
                            border-brand-green/15
                            bg-white
                            text-brand-green
                            shadow-soft
                            hover:-translate-y-0.5
                            hover:bg-brand-green/5
                            hover:border-brand-green/25
                          `
                      }
                    `}
                  >

                    {added ? (
                      <>
                        <Check
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        Add to Cart
                      </>
                    )}

                  </button>


                  {/* BUY NOW */}

                  <button
                    type="button"
                    onClick={
                      handleBuyNow
                    }
                    className="
                      btn-buy
                      group/buy
                      min-h-[52px]
                      flex-1
                      px-4
                      py-3
                    "
                  >

                    <Zap
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Buy Now

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-200
                        group-hover/buy:translate-x-0.5
                      "
                      aria-hidden="true"
                    />

                  </button>

                </div>


                {/* ==============================================================
                    TRUST STRIP
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-3
                    gap-2
                    border-t
                    border-brand-green/10
                    pt-5
                  "
                >

                  <TrustMini
                    icon={
                      <Leaf
                        className="h-4 w-4"
                      />
                    }
                    label="100% Vegetarian"
                  />


                  <TrustMini
                    icon={
                      <ShieldCheck
                        className="h-4 w-4"
                      />
                    }
                    label="FSSAI Licensed"
                  />


                  <TrustMini
                    icon={
                      <PackageCheck
                        className="h-4 w-4"
                      />
                    }
                    label="Carefully Packed"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          PRODUCT INFORMATION
          =================================================================== */}

      <section
        className="
          bg-brand-cream-dark
          py-9
          sm:py-11
          lg:py-14
        "
      >

        <div
          className="
            container-max
            container-px
          "
        >

          <div
            className="
              mb-6
              max-w-2xl
            "
          >

            <span className="section-eyebrow">
              Know Your Papad
            </span>


            <h2
              className="
                mt-1.5
                font-serif
                text-2xl
                font-bold
                text-brand-green
                sm:text-3xl
              "
            >
              Everything you need to know
            </h2>

          </div>


          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
              sm:gap-4
              lg:grid-cols-3
            "
          >

            {/* INGREDIENTS */}

            <InfoCard
              title="Ingredients"
              content={
                <ul
                  className="
                    space-y-2
                  "
                >

                  {product.ingredients.map(
                    (
                      ingredient,
                    ) => (

                      <li
                        key={
                          ingredient
                        }
                        className="
                          flex
                          gap-2.5
                          text-sm
                          leading-relaxed
                          text-brand-brown/65
                        "
                      >

                        <span
                          className="
                            mt-2
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-brand-saffron
                          "
                        />

                        <span>
                          {ingredient}
                        </span>

                      </li>

                    ),
                  )}

                </ul>
              }
            />


            {/* TASTE */}

            <InfoCard
              title="Taste Profile"
              content={
                <p
                  className="
                    text-sm
                    leading-6
                    text-brand-brown/65
                  "
                >
                  {product.tasteProfile}
                </p>
              }
            />


            {/* STORAGE */}

            <InfoCard
              title="Storage"
              content={
                <p
                  className="
                    text-sm
                    leading-6
                    text-brand-brown/65
                  "
                >
                  {product.storage}
                </p>
              }
            />


            {/* SERVING */}

            <InfoCard
              title="Serving Information"
              content={
                <p
                  className="
                    text-sm
                    leading-6
                    text-brand-brown/65
                  "
                >
                  {product.serving}
                </p>
              }
            />


            {/* NUTRITION */}

            <InfoCard
              title="Nutrition"
              content={
                <p
                  className="
                    text-sm
                    leading-6
                    text-brand-brown/65
                  "
                >
                  {product.nutritionNote}
                </p>
              }
            />


            {/* FSSAI */}

            <InfoCard
              title="Food Safety"
              content={
                <div
                  className="
                    space-y-3
                  "
                >

                  <div
                    className="
                      rounded-xl
                      bg-brand-ivory
                      p-3
                    "
                  >

                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-brand-brown/45
                      "
                    >
                      FSSAI Licence
                    </p>


                    <p
                      className="
                        mt-1
                        font-mono
                        text-sm
                        font-semibold
                        text-brand-green
                      "
                    >
                      {FSSAI_LICENSE}
                    </p>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-brand-brown/65
                    "
                  >

                    <Leaf
                      className="
                        h-4
                        w-4
                        text-brand-green
                      "
                      aria-hidden="true"
                    />

                    100% Vegetarian

                  </div>

                </div>
              }
            />

          </div>

        </div>

      </section>


      {/* ======================================================================
          REVIEWS
          =================================================================== */}

      <section
        id="reviews"
        className="
          bg-brand-ivory
          py-10
          sm:py-12
          lg:py-14
        "
      >

        <div
          className="
            container-max
            container-px
          "
        >

          <div
            className="
              mb-6
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-brand-saffron/10
                text-brand-saffron
              "
            >

              <Star
                className="
                  h-5
                  w-5
                  fill-current
                "
                aria-hidden="true"
              />

            </div>


            <div>

              <span className="section-eyebrow">
                Customer Voice
              </span>


              <h2
                className="
                  mt-0.5
                  font-serif
                  text-2xl
                  font-bold
                  text-brand-green
                  sm:text-3xl
                "
              >
                Customer Reviews
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-brand-brown/50
                "
              >
                Genuine customer feedback for this product.
              </p>

            </div>

          </div>


          <ReviewSection
            productId={
              product.id
            }
            productName={
              product.name
            }
            sku={
              selectedSku.sku
            }
          />

        </div>

      </section>


      {/* ======================================================================
          RELATED PRODUCTS
          =================================================================== */}

      {relatedProducts.length >
        0 && (

        <section
          className="
            bg-brand-cream-dark
            py-10
            sm:py-12
            lg:py-14
          "
        >

          <div
            className="
              container-max
              container-px
            "
          >

            <div
              className="
                mb-6
                flex
                items-end
                justify-between
                gap-4
              "
            >

              <div>

                <span className="section-eyebrow">
                  Explore More
                </span>


                <h2
                  className="
                    mt-1.5
                    font-serif
                    text-2xl
                    font-bold
                    text-brand-green
                    sm:text-3xl
                  "
                >
                  More from {product.category}
                </h2>

              </div>


              <Link
                to="/shop"
                className="
                  hidden
                  items-center
                  gap-1.5
                  text-xs
                  font-semibold
                  text-brand-green
                  transition-all
                  hover:gap-2
                  sm:inline-flex
                "
              >
                View all

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

            </div>


            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:gap-4
                lg:grid-cols-4
                lg:gap-5
              "
            >

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


            <Link
              to="/shop"
              className="
                btn-outline
                mt-5
                w-full
                sm:hidden
              "
            >
              View All Products

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>

          </div>

        </section>

      )}

    </>
  );
}


/* ==========================================================================
   TRUST MINI
   ========================================================================== */

interface TrustMiniProps {
  icon: React.ReactNode;
  label: string;
}


function TrustMini({
  icon,
  label,
}: TrustMiniProps) {

  return (
    <div
      className="
        flex
        min-h-[62px]
        flex-col
        items-center
        justify-center
        gap-1.5
        rounded-xl
        border
        border-brand-green/10
        bg-brand-ivory
        px-2
        py-2.5
        text-center
      "
    >

      <span
        className="
          text-brand-green
        "
        aria-hidden="true"
      >
        {icon}
      </span>


      <span
        className="
          text-[9px]
          font-semibold
          leading-tight
          text-brand-brown/60
          sm:text-[10px]
        "
      >
        {label}
      </span>

    </div>
  );
}


/* ==========================================================================
   INFORMATION CARD
   ========================================================================== */

interface InfoCardProps {
  title: string;
  content: React.ReactNode;
}


function InfoCard({
  title,
  content,
}: InfoCardProps) {

  return (
    <article
      className="
        rounded-2xl
        border
        border-brand-green/10
        bg-white
        p-4
        shadow-soft
        sm:p-5
      "
    >

      <h3
        className="
          mb-3
          font-serif
          text-lg
          font-bold
          text-brand-green
        "
      >
        {title}
      </h3>


      {content}

    </article>
  );
}
