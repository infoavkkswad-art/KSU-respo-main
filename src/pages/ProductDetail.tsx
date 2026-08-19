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
  ExternalLink,
  Store,
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
   KAWAD SWAD
   PRODUCT DETAIL PAGE

   IMPORTANT:
   ProductService remains the commercial authority.

   ProductDetail does NOT create:
   - pricing rules
   - SKU availability rules
   - shipping calculations
   - discount rules

   This page only presents the authoritative product values.
   ========================================================================== */


/* ==========================================================================
   FSSAI
   ========================================================================== */

const FSSAI_LICENSE =
  '21425890001224';


/* ==========================================================================
   MARKETPLACE CONFIGURATION
   ==========================================================================

   IMPORTANT:
   Only add a URL when the exact Kawad Swad marketplace listing/store URL
   has been verified.

   Do NOT replace these with generic marketplace homepages.
   ========================================================================== */

interface Marketplace {
  name: string;
  logo: string;
  url?: string;
  available: boolean;
}


const MARKETPLACES: Marketplace[] = [
  {
    name: 'Amazon',
    logo: 'https://cdn.simpleicons.org/amazon/173C32',
    available: false,
  },
  {
    name: 'Flipkart',
    logo: 'https://cdn.simpleicons.org/flipkart/173C32',
    available: false,
  },
  {
    name: 'Meesho',
    logo: 'https://cdn.simpleicons.org/meesho/173C32',
    url: 'https://www.meesho.com/',
    available: true,
  },
  {
    name: 'JioMart',
    logo: 'https://cdn.simpleicons.org/jiomart/173C32',
    available: false,
  },
  {
    name: 'ONDC',
    logo: 'https://cdn.simpleicons.org/ondc/173C32',
    available: false,
  },
];


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
              className="
                shrink-0
                transition-colors
                hover:text-brand-green
              "
            >
              Home
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              to="/shop"
              className="
                shrink-0
                transition-colors
                hover:text-brand-green
              "
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


                  {/* CATEGORY */}

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

                </div>

              </div>


              {/* MOBILE TRUST STRIP */}

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

                {/* PRODUCT IDENTITY */}

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
                          event.target.value,
                        );


                      if (
                        Number.isInteger(
                          nextIndex,
                        ) &&
                        nextIndex >= 0 &&
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

                    <span
                      className="
                        font-semibold
                        text-brand-brown/60
                      "
                    >
                      {packLabel}
                    </span>

                  </p>

                </div>


                {/* ==============================================================
                    PRICE
                    =================================================================
                    MRP and discount deliberately removed.
                    Website price is the only customer-facing price.
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    rounded-2xl
                    bg-brand-ivory
                    p-4
                    sm:p-5
                  "
                >

                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-4
                    "
                  >

                    <div>

                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-brand-brown/40
                        "
                      >
                        Website Price
                      </p>


                      <span
                        className="
                          mt-0.5
                          block
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

                    </div>


                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-brand-green/10
                        bg-white
                        px-3
                        py-2
                        text-[10px]
                        font-semibold
                        text-brand-green
                        shadow-soft
                      "
                    >

                      <Truck
                        className="
                          h-3.5
                          w-3.5
                        "
                        aria-hidden="true"
                      />

                      Free Shipping

                    </div>

                  </div>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                      border-t
                      border-brand-green/10
                      pt-3
                      text-[11px]
                      text-brand-brown/50
                    "
                  >

                    <PackageCheck
                      className="
                        h-3.5
                        w-3.5
                        text-brand-green
                      "
                      aria-hidden="true"
                    />

                    Carefully packed for safe delivery

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
                      min-h-[54px]
                      shrink-0
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-brand-ivory
                      shadow-inner-soft
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
                        transition-all
                        duration-200
                        hover:bg-brand-green/5
                        hover:text-brand-green
                        active:scale-95
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
                        transition-all
                        duration-200
                        hover:bg-brand-green/5
                        hover:text-brand-green
                        active:scale-95
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
                      group/cart
                      relative
                      flex
                      min-h-[54px]
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      active:translate-y-[2px]

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
                            hover:-translate-y-1
                            hover:border-brand-green/25
                            hover:bg-brand-green/5
                            hover:shadow-lift
                          `
                      }
                    `}
                  >

                    {!added && (
                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          -translate-x-full
                          bg-gradient-to-r
                          from-transparent
                          via-white/50
                          to-transparent
                          transition-transform
                          duration-700
                          group-hover/cart:translate-x-full
                        "
                        aria-hidden="true"
                      />
                    )}


                    {added ? (
                      <>

                        <span
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-white/15
                          "
                        >

                          <Check
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                        </span>

                        Added to Cart

                      </>
                    ) : (
                      <>

                        <ShoppingBag
                          className="
                            relative
                            z-10
                            h-4
                            w-4
                          "
                          aria-hidden="true"
                        />

                        <span className="relative z-10">
                          Add to Cart
                        </span>

                      </>
                    )}

                  </button>


                  {/* ============================================================
                      BUY NOW
                      Premium CTA
                      ========================================================= */}

                  <button
                    type="button"
                    onClick={
                      handleBuyNow
                    }
                    className="
                      group/buy
                      relative
                      flex
                      min-h-[54px]
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-xl
                      border
                      border-brand-saffron-dark
                      bg-brand-saffron
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_5px_0_#A96F18,0_12px_24px_rgba(200,138,42,0.22)]
                      transition-all
                      duration-200
                      hover:-translate-y-1
                      hover:bg-brand-saffron-light
                      hover:shadow-[0_6px_0_#A96F18,0_18px_30px_rgba(200,138,42,0.28)]
                      active:translate-y-[3px]
                      active:shadow-[0_2px_0_#A96F18,0_6px_12px_rgba(200,138,42,0.18)]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-brand-saffron
                      focus:ring-offset-2
                    "
                  >

                    {/* SHINE */}

                    <span
                      className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        -left-1/2
                        w-1/3
                        -skew-x-12
                        bg-white/20
                        transition-all
                        duration-700
                        group-hover/buy:left-[120%]
                      "
                      aria-hidden="true"
                    />


                    {/* ICON */}

                    <span
                      className="
                        relative
                        z-10
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-white/15
                        shadow-inner-soft
                      "
                    >

                      <Zap
                        className="
                          h-4
                          w-4
                          fill-current
                        "
                        aria-hidden="true"
                      />

                    </span>


                    <span
                      className="
                        relative
                        z-10
                        whitespace-nowrap
                      "
                    >
                      Buy Now
                    </span>


                    <ArrowRight
                      className="
                        relative
                        z-10
                        h-4
                        w-4
                        transition-transform
                        duration-200
                        group-hover/buy:translate-x-1
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


                {/* ==============================================================
                    MARKETPLACE AVAILABILITY
                    =========================================================== */}

                <MarketplaceSection />

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
   MARKETPLACE SECTION
   ========================================================================== */

function MarketplaceSection() {

  return (
    <section
      className="
        mt-5
        border-t
        border-brand-green/10
        pt-5
      "
      aria-labelledby="marketplace-heading"
    >

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        <span
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-brand-saffron/10
            text-brand-saffron
          "
        >

          <Store
            className="h-4 w-4"
            aria-hidden="true"
          />

        </span>


        <div>

          <p
            id="marketplace-heading"
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-brand-green
            "
          >
            Also Available On
          </p>


          <p
            className="
              mt-0.5
              text-[10px]
              text-brand-brown/45
            "
          >
            Shop Kawad Swad on your preferred platform
          </p>

        </div>

      </div>


      <div
        className="
          mt-3
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-3
          lg:grid-cols-5
        "
      >

        {MARKETPLACES.map(
          (marketplace) => (

            <MarketplaceCard
              key={
                marketplace.name
              }
              marketplace={
                marketplace
              }
            />

          ),
        )}

      </div>

    </section>
  );
}


/* ==========================================================================
   MARKETPLACE CARD
   ========================================================================== */

interface MarketplaceCardProps {
  marketplace: Marketplace;
}


function MarketplaceCard({
  marketplace,
}: MarketplaceCardProps) {

  const content = (
    <>
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-brand-green/10
          bg-white
          shadow-soft
        "
      >

        <img
          src={
            marketplace.logo
          }
          alt=""
          className="
            h-5
            w-5
            object-contain
          "
          loading="lazy"
          aria-hidden="true"
        />

      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            truncate
            text-xs
            font-bold
            text-brand-green
          "
        >
          {marketplace.name}
        </p>


        <p
          className="
            mt-0.5
            flex
            items-center
            gap-1
            text-[9px]
            font-medium
            text-brand-brown/45
          "
        >

          {marketplace.available ? (
            <>
              Available

              <ExternalLink
                className="h-2.5 w-2.5"
                aria-hidden="true"
              />
            </>
          ) : (
            'Coming Soon'
          )}

        </p>

      </div>

    </>
  );


  if (
    marketplace.available &&
    marketplace.url
  ) {

    return (
      <a
        href={
          marketplace.url
        }
        target="_blank"
        rel="noopener noreferrer"
        className="
          group/market
          flex
          min-h-[62px]
          items-center
          gap-2.5
          rounded-xl
          border
          border-brand-green/10
          bg-brand-ivory
          px-2.5
          py-2
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-brand-saffron/30
          hover:bg-white
          hover:shadow-soft
          focus:outline-none
          focus:ring-2
          focus:ring-brand-saffron/40
        "
        aria-label={`Shop Kawad Swad on ${marketplace.name}`}
      >
        {content}
      </a>
    );
  }


  return (
    <div
      className="
        flex
        min-h-[62px]
        items-center
        gap-2.5
        rounded-xl
        border
        border-brand-green/5
        bg-brand-ivory/60
        px-2.5
        py-2
        opacity-70
      "
      aria-label={`${marketplace.name} coming soon`}
    >
      {content}
    </div>
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
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-soft
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
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-card
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
