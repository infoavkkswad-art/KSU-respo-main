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
  Sparkles,
  Flame,
  Utensils,
} from 'lucide-react';

import roastedCrunchImg from '@/assets/images/papad_roasted_crunch_1791221162084.jpg';
import thaliSpreadImg from '@/assets/images/papad_thali_spread_1791221171851.jpg';
import freshStackImg from '@/assets/images/papad_fresh_stack_1791221183582.jpg';

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

import {
  ReviewService,
} from '@/services/review-service';

import type {
  ReviewSummary,
} from '@/types/reviews';


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

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const galleryItems = useMemo(() => {
    if (!product) return [];
    return [
      {
        id: 'pack',
        title: 'Packaging',
        subtitle: 'Authentic Pack Artwork',
        type: 'pack' as const,
        src: `/images/products/${product.id}.png`,
        alt: `${product.name} official packaging from Nimar`,
      },
      {
        id: 'crunch',
        title: 'Fire-Roasted',
        subtitle: 'Bubbly Crisp Texture',
        type: 'photo' as const,
        src: roastedCrunchImg,
        alt: `Fire-roasted crisp ${product.name} with golden blisters and mint chutney`,
        badge: '100% Crisp Texture',
      },
      {
        id: 'thali',
        title: 'Thali Feast',
        subtitle: 'Authentic Meal Pairing',
        type: 'photo' as const,
        src: thaliSpreadImg,
        alt: `Traditional Indian thali meal featuring ${product.name}`,
        badge: 'Family Lunch Companion',
      },
      {
        id: 'spices',
        title: 'Pure Spices',
        subtitle: 'Sun-Dried Craft',
        type: 'photo' as const,
        src: freshStackImg,
        alt: `Handcrafted ${product.name} papads with whole cumin and pepper`,
        badge: 'Handcrafted in Nimar',
      },
    ];
  }, [product]);

  const activeImage = galleryItems[activeGalleryIndex] ?? galleryItems[0];

  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!product) return;
    ReviewService.getSummary(product.id)
      .then((summary) => {
        if (!cancelled) setReviewSummary(summary);
      })
      .catch(() => {
        if (!cancelled) setReviewSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const [pincode, setPincode] = useState('');
  const [pinChecked, setPinChecked] = useState(false);
  const [pinResult, setPinResult] = useState<{
    valid: boolean;
    message: string;
    estimatedDelivery?: string;
  } | null>(null);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinResult({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      });
      setPinChecked(true);
      return;
    }

    const isMadhyaPradesh =
      cleanPin.startsWith('45') ||
      cleanPin.startsWith('46') ||
      cleanPin.startsWith('47') ||
      cleanPin.startsWith('48');
    const daysToAdd = isMadhyaPradesh ? 2 : 4;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    const dateFormatted = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setPinResult({
      valid: true,
      message: `Delivery available to ${cleanPin}`,
      estimatedDelivery: `Standard delivery by ${dateFormatted}`,
    });
    setPinChecked(true);
  };


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

  const hasSavings =
    selectedSku.mrp !== null &&
    selectedSku.mrp > selectedSku.websitePrice;

  const savingsAmount = hasSavings ? selectedSku.mrp - selectedSku.websitePrice : 0;
  const discountPercent = hasSavings && selectedSku.mrp ? Math.round((savingsAmount / selectedSku.mrp) * 100) : 0;

  const packGrams = typeof selectedSku.packSize === 'number' ? selectedSku.packSize : 200;
  const ratePer100g = ((selectedSku.websitePrice / packGrams) * 100).toFixed(1);


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
                PRODUCT VISUAL & INTERACTIVE IMAGE TRAY
                =================================================================== */}

            <div
              className="
                lg:sticky
                lg:top-24
                space-y-3.5
              "
            >

              {/* MAIN HERO VIEWPORT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/12
                  bg-white
                  shadow-card
                "
              >

                <div
                  className="
                    relative
                    aspect-square
                    w-full
                    overflow-hidden
                    bg-gradient-to-br
                    from-white
                    via-brand-cream/60
                    to-brand-cream-dark/50
                  "
                >

                  {/* SUBTLE WARM SUNSET AMBIANCE */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-1/2
                      h-[75%]
                      w-[75%]
                      -translate-x-1/2
                      -translate-y-1/2
                      rounded-full
                      bg-brand-saffron/8
                      blur-3xl
                    "
                    aria-hidden="true"
                  />

                  {/* ACTIVE VIEW CONTENT */}
                  {activeImage?.type === 'pack' ? (
                    <div className="relative z-10 flex h-full w-full items-center justify-center p-6 sm:p-8">
                      {/* Natural contact shadow directly under pack base */}
                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-[7%]
                          left-1/2
                          h-[6%]
                          w-[50%]
                          -translate-x-1/2
                          rounded-[50%]
                          bg-brand-brown/16
                          blur-[10px]
                        "
                        aria-hidden="true"
                      />
                      <img
                        src={activeImage.src}
                        alt={activeImage.alt}
                        className="
                          relative
                          z-10
                          h-full
                          w-full
                          max-h-full
                          max-w-full
                          object-contain
                          drop-shadow-[0_16px_22px_rgba(41,24,17,0.18)]
                          transition-transform
                          duration-500
                          group-hover:scale-[1.02]
                        "
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 h-full w-full overflow-hidden">
                      <img
                        src={activeImage?.src}
                        alt={activeImage?.alt}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-700
                          ease-out
                          group-hover:scale-105
                        "
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                      {activeImage?.badge && (
                        <div className="absolute bottom-4 left-4 z-20 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft">
                          ✨ {activeImage.badge}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TOP BADGES */}
                  <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
                    <span className="rounded-full border border-brand-green/15 bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-green shadow-soft backdrop-blur-sm">
                      {product.category}
                    </span>
                    <span className="rounded-full bg-brand-green text-white px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-soft">
                      100% Veg
                    </span>
                  </div>

                  {/* ACTIVE INDICATOR PILL */}
                  <div className="absolute right-4 top-4 z-20 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    {activeGalleryIndex + 1} / {galleryItems.length}
                  </div>
                </div>
              </div>


              {/* ================================================================
                  INTERACTIVE IMAGE TRAY (Thumbnails with ZERO mismatch!)
                  ============================================================= */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-brand-brown/70 px-1">
                  <span>Product Gallery ({galleryItems.length})</span>
                  <span className="text-brand-saffron-dark font-medium">Click thumbnail to switch view</span>
                </div>

                <div
                  className="grid grid-cols-4 gap-2 sm:gap-2.5"
                  role="tablist"
                  aria-label="Product image gallery thumbnails"
                >
                  {galleryItems.map((item, index) => {
                    const isActive = index === activeGalleryIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveGalleryIndex(index)}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`View ${item.title}`}
                        className={`
                          group/thumb
                          relative
                          flex
                          flex-col
                          items-center
                          rounded-2xl
                          p-1.5
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? 'bg-white ring-2 ring-brand-saffron shadow-card border-transparent'
                              : 'bg-white/80 border border-brand-brown/15 hover:border-brand-saffron/40 hover:bg-white shadow-soft'
                          }
                        `}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-cream/60">
                          <img
                            src={item.src}
                            alt=""
                            className={`
                              h-full
                              w-full
                              transition-transform
                              duration-300
                              ${item.type === 'pack' ? 'object-contain p-1' : 'object-cover'}
                              ${isActive ? 'scale-105' : 'group-hover/thumb:scale-105'}
                            `}
                            loading="lazy"
                          />
                        </div>
                        <span className={`mt-1.5 truncate text-[10px] font-bold sm:text-xs ${isActive ? 'text-brand-green' : 'text-brand-brown/70'}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute -bottom-1 h-1 w-6 rounded-full bg-brand-saffron" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* SENSORY & TASTE HIGHLIGHT (Emotional Resonance Trigger) */}
              <div className="rounded-2xl border border-brand-green/12 bg-gradient-to-br from-brand-cream/90 to-brand-cream-dark/60 p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-saffron/15 text-brand-saffron">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-brand-green sm:text-sm">
                      The Nimar Sunday Crunch Experience
                    </h4>
                    <p className="text-[11px] text-brand-brown/65">
                      Featherlight texture · Hand-rolled & sun-dried recipe
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-brand-green/10 pt-2.5 text-center text-xs">
                  <div className="rounded-lg bg-white/70 p-2">
                    <span className="block font-bold text-brand-green">10 / 10</span>
                    <span className="text-[10px] text-brand-brown/60">Crunch Score</span>
                  </div>
                  <div className="rounded-lg bg-white/70 p-2">
                    <span className="block font-bold text-brand-saffron">Smoky Char</span>
                    <span className="text-[10px] text-brand-brown/60">Flame Roast</span>
                  </div>
                  <div className="rounded-lg bg-white/70 p-2">
                    <span className="block font-bold text-brand-green">Zero Oil</span>
                    <span className="text-[10px] text-brand-brown/60">Microwave Ready</span>
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
                  label="Nimar Direct"
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

                {/* PRODUCT IDENTITY & BRAND */}
                <div className="flex items-center gap-2">
                  <Link to="/about" className="text-xs font-semibold text-brand-green hover:underline">
                    Visit the Kawad Swad Store
                  </Link>
                  <span className="text-brand-brown/30" aria-hidden="true">·</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-brand-brown/50">
                    {product.category}
                  </span>
                </div>

                <h1
                  className="
                    mt-2
                    text-balance
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
                    mt-1
                    text-sm
                    font-medium
                    text-brand-brown/60
                  "
                >
                  {product.variant} {product.hindiName && `· ${product.hindiName}`}
                </p>

                {/* SOCIAL PROOF RATING (Real reviews from backend API) */}
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  {reviewSummary && reviewSummary.reviewCount > 0 ? (
                    <>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                        <span className="ml-1 font-bold text-brand-brown">
                          {reviewSummary.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-brand-brown/30" aria-hidden="true">·</span>
                      <a href="#reviews" className="font-medium text-brand-green hover:underline">
                        {reviewSummary.reviewCount} customer review{reviewSummary.reviewCount === 1 ? '' : 's'}
                      </a>
                    </>
                  ) : (
                    <a href="#reviews" className="flex items-center gap-1.5 font-medium text-brand-green hover:underline">
                      <Star className="h-3.5 w-3.5 text-brand-saffron" aria-hidden="true" />
                      <span>Customer Reviews & Feedback</span>
                    </a>
                  )}
                </div>

                {/* ==============================================================
                    AMAZON-STYLE PRICE BOX
                    =========================================================== */}
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-brand-green/10
                    bg-brand-cream/50
                    p-4
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      items-baseline
                      gap-2.5
                    "
                  >
                    <span
                      className="
                        font-serif
                        text-3xl
                        font-bold
                        tracking-tight
                        text-brand-green
                        sm:text-4xl
                        tabular-nums
                      "
                    >
                      {formatPrice(
                        selectedSku.websitePrice,
                      )}
                    </span>

                    {hasSavings && (
                      <>
                        <span className="text-sm text-brand-brown/45 line-through tabular-nums">
                          M.R.P.: {formatPrice(selectedSku.mrp)}
                        </span>

                        <span className="rounded-md bg-brand-green/10 px-2 py-0.5 text-xs font-bold text-brand-green">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {hasSavings && (
                    <p className="mt-1 text-xs font-semibold text-brand-green">
                      You Save: {formatPrice(savingsAmount)} ({discountPercent}%)
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-green/10 pt-2.5 text-xs text-brand-brown/60">
                    <span>Inclusive of all taxes</span>
                    <span>(₹{ratePer100g} per 100g)</span>
                  </div>

                  {/* STOCK & FULFILMENT STATUS */}
                  <div className="mt-3 flex flex-col gap-1 border-t border-brand-green/10 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>In Stock</span>
                    </div>
                    <p className="text-[11px] text-brand-brown/60">
                      Dispatched within 24 hours · Direct from Kawad Swad Udhyog, Nimar
                    </p>
                  </div>
                </div>

                {/* ==============================================================
                    PACK SELECTOR (Interactive comparison tiles)
                    =========================================================== */}
                <div
                  className="
                    mt-5
                    border-t
                    border-brand-green/10
                    pt-4
                  "
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-brown/60">
                      Choose Pack Size:
                    </span>
                    <span className="text-xs font-bold text-brand-green">{packLabel}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2" role="group" aria-label={`Select pack size for ${product.name}`}>
                    {purchasableSkus.map((sku, index) => {
                      const isSelected = index === selectedSkuIndex;
                      const label = PACK_LABELS[sku.packSize] ?? `${sku.packSize}g`;
                      return (
                        <button
                          key={sku.sku}
                          type="button"
                          onClick={() => {
                            setSelectedSkuIndex(index);
                            setQuantity(1);
                            setAdded(false);
                          }}
                          className={`
                            flex
                            flex-col
                            items-center
                            justify-center
                            rounded-xl
                            p-2.5
                            text-center
                            transition-all
                            ${
                              isSelected
                                ? 'border-2 border-brand-green bg-white shadow-md ring-2 ring-brand-green/20'
                                : 'border border-brand-brown/15 bg-white/70 hover:border-brand-green/40 hover:bg-white'
                            }
                          `}
                          aria-pressed={isSelected}
                        >
                          <span className="text-xs font-bold text-brand-brown">{label}</span>
                          <span className="mt-0.5 text-xs font-bold text-brand-green tabular-nums">
                            {formatPrice(sku.websitePrice)}
                          </span>
                          {sku.mrp > sku.websitePrice && (
                            <span className="text-[10px] text-brand-brown/40 line-through tabular-nums">
                              {formatPrice(sku.mrp)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ==============================================================
                    PIN CODE DELIVERY CHECKER (Amazon style)
                    =========================================================== */}
                <div className="mt-5 rounded-2xl border border-brand-green/10 bg-brand-ivory p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-brown">
                    <Truck className="h-4 w-4 text-brand-green" aria-hidden="true" />
                    <span>Delivery Availability & Estimated Timeline</span>
                  </div>

                  <form onSubmit={handleCheckPincode} className="mt-2.5 flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, ''));
                        setPinChecked(false);
                      }}
                      placeholder="Enter 6-digit PIN code"
                      className="input-field min-h-[40px] flex-1 bg-white text-xs"
                      aria-label="Enter PIN code for delivery check"
                    />
                    <button
                      type="submit"
                      className="btn-primary min-h-[40px] px-4 text-xs shrink-0"
                    >
                      Check
                    </button>
                  </form>

                  {pinChecked && pinResult && (
                    <div
                      className={`mt-2.5 rounded-lg p-2.5 text-xs ${
                        pinResult.valid
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <p className="font-semibold">{pinResult.message}</p>
                      {pinResult.estimatedDelivery && (
                        <p className="mt-0.5 text-[11px] text-emerald-700">
                          {pinResult.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  )}

                  {!pinChecked && (
                    <p className="mt-2 text-[11px] text-brand-brown/50">
                      Delivery across India via India Post and trusted express couriers.
                    </p>
                  )}
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
                    ABOUT THIS ITEM (Amazon-grade product highlights)
                    =========================================================== */}
                <div className="mt-5 border-t border-brand-green/10 pt-4">
                  <h3 className="font-serif text-sm font-bold text-brand-green">
                    About this item
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-brand-brown/70">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span><strong>Traditional Recipe:</strong> Rooted in authentic Nimar culinary heritage with balanced spices.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span><strong>100% Vegetarian:</strong> Hygienically crafted in a certified vegetarian facility (FSSAI {FSSAI_LICENSE}).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span><strong>Crisp Texture:</strong> Can be roasted or deep-fried for exceptional crunch and aroma.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span><strong>Factory Fresh:</strong> Direct from Kawad Swad Udhyog, Barwah / Nimar, Madhya Pradesh.</span>
                    </li>
                  </ul>
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

      {/* ======================================================================
          STICKY MOBILE BUY BAR (Amazon style, height capped <= 15% viewport)
          =================================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-brand-green/15 bg-white/95 backdrop-blur-md p-2.5 shadow-lg sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-xs font-bold text-brand-brown">
              {product.name} ({packLabel})
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-sm font-bold text-brand-green tabular-nums">
                {formatPrice(selectedSku.websitePrice)}
              </span>
              {hasSavings && (
                <span className="text-[10px] text-brand-brown/40 line-through tabular-nums">
                  {formatPrice(selectedSku.mrp)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex min-h-[36px] items-center justify-center rounded-lg border border-brand-green/20 bg-brand-cream px-3 text-xs font-semibold text-brand-green"
              aria-label="Add to cart"
            >
              Add
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="btn-primary min-h-[36px] px-3.5 text-xs shadow-soft"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

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
