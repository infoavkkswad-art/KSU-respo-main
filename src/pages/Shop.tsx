import {
  useMemo,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'react-router-dom';

import {
  SlidersHorizontal,
  X,
  Search,
  ShoppingBag,
} from 'lucide-react';

import {
  SEO,
  breadcrumbSchema,
} from '@/components/SEO';

import {
  ProductCard,
} from '@/components/ProductCard';

import {
  Reveal,
} from '@/components/Reveal';

import {
  ProductService,
} from '@/services/product-service';

import type {
  ProductCategory,
  ProductFamily,
} from '@/data/products';


/* ============================================================================
 * KAWAD SWAD 2.0
 * SHOP PAGE
 *
 * VISUAL FLOW:
 *
 * HERO
 * → SEARCH / SORT
 * → FILTERS
 * → PRODUCT GRID
 *
 * IMPORTANT:
 * ProductService remains the commercial authority.
 *
 * Shop does NOT recreate:
 * - SKU availability
 * - Pricing
 * - MRP
 * - Shipping
 * - Commercial validation
 *
 * Shop only handles:
 * - Search
 * - Category filtering
 * - Price filtering
 * - Sorting
 * - Presentation
 * ========================================================================== */


/* ============================================================================
 * CATEGORIES
 * ========================================================================== */

const categories: Array<
  ProductCategory | 'all'
> = [
  'all',
  'moong',
  'chana',
  'urad',
  'combo',
];


const CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  moong: 'Moong Family',
  chana: 'Chana Family',
  urad: 'Urad Family',
  combo: 'Combo Packs',
};


/* ============================================================================
 * SORTING
 * ========================================================================== */

const SORT_OPTIONS = [
  'default',
  'price-low',
  'price-high',
  'name',
] as const;


type SortOption =
  (typeof SORT_OPTIONS)[number];


/* ============================================================================
 * PRODUCT SERVICE HELPERS
 * ========================================================================== */

function getPurchasableSkus(
  product: ProductFamily,
) {
  return ProductService.getAvailableSkus(
    product,
  );
}


/* ============================================================================
 * SHOP CATALOG
 * ========================================================================== */

function getShopProducts(): ProductFamily[] {
  return ProductService
    .getAllProducts()
    .filter(
      (product) =>
        getPurchasableSkus(
          product,
        ).length > 0,
    );
}


/* ============================================================================
 * PRICE HELPERS
 * ========================================================================== */

function getValidWebsitePrices(
  product: ProductFamily,
): number[] {
  return getPurchasableSkus(
    product,
  )
    .map(
      (sku) =>
        sku.websitePrice,
    )
    .filter(
      (
        price,
      ): price is number =>
        typeof price ===
          'number' &&
        Number.isFinite(
          price,
        ) &&
        price >= 0,
    );
}


function getMinimumWebsitePrice(
  product: ProductFamily,
): number {
  const prices =
    getValidWebsitePrices(
      product,
    );

  return prices.length > 0
    ? Math.min(...prices)
    : Number.POSITIVE_INFINITY;
}


function getMaximumWebsitePrice(
  product: ProductFamily,
): number {
  const prices =
    getValidWebsitePrices(
      product,
    );

  return prices.length > 0
    ? Math.max(...prices)
    : Number.NEGATIVE_INFINITY;
}


/* ============================================================================
 * INITIAL CATALOG RANGE
 * ========================================================================== */

const catalogProducts =
  getShopProducts();


const catalogPrices =
  catalogProducts.flatMap(
    getValidWebsitePrices,
  );


const MIN_PRICE =
  catalogPrices.length > 0
    ? Math.min(...catalogPrices)
    : 0;


const MAX_PRICE =
  catalogPrices.length > 0
    ? Math.max(...catalogPrices)
    : 0;


/* ============================================================================
 * SHOP PAGE
 * ========================================================================== */

export default function Shop() {

  const [
    searchParams,
  ] = useSearchParams();


  /* --------------------------------------------------------------------------
     INITIAL SEARCH
     ----------------------------------------------------------------------- */

  const initialQuery =
    searchParams.get('q') ?? '';


  const [
    search,
    setSearch,
  ] = useState(
    initialQuery,
  );


  /* --------------------------------------------------------------------------
     FILTER STATE
     ----------------------------------------------------------------------- */

  const [
    category,
    setCategory,
  ] = useState<
    ProductCategory | 'all'
  >('all');


  const [
    sortBy,
    setSortBy,
  ] = useState<SortOption>(
    'default',
  );


  const [
    maxPrice,
    setMaxPrice,
  ] = useState(
    MAX_PRICE,
  );


  const [
    showMobileFilters,
    setShowMobileFilters,
  ] = useState(false);


  /* ==========================================================================
     FILTERED PRODUCTS
     ======================================================================== */

  const filtered =
    useMemo(() => {

      let list =
        getShopProducts();


      /* ----------------------------------------------------------------------
         CATEGORY
         -------------------------------------------------------------------- */

      if (
        category !== 'all'
      ) {
        list = list.filter(
          (product) =>
            product.category ===
            category,
        );
      }


      /* ----------------------------------------------------------------------
         SEARCH
         -------------------------------------------------------------------- */

      const query =
        search
          .trim()
          .toLowerCase();


      if (query) {

        list = list.filter(
          (product) => {

            const matchesProduct =
              product.name
                .toLowerCase()
                .includes(query) ||
              product.hindiName
                .toLowerCase()
                .includes(query) ||
              product.variant
                .toLowerCase()
                .includes(query) ||
              product.category
                .toLowerCase()
                .includes(query) ||
              product.description
                .toLowerCase()
                .includes(query);


            const matchesSku =
              getPurchasableSkus(
                product,
              ).some(
                (sku) =>
                  sku.sku
                    .toLowerCase()
                    .includes(query) ||
                  String(
                    sku.packSize,
                  ).includes(query),
              );


            return (
              matchesProduct ||
              matchesSku
            );
          },
        );
      }


      /* ----------------------------------------------------------------------
         PRICE FILTER
         -------------------------------------------------------------------- */

      list = list.filter(
        (product) =>
          getValidWebsitePrices(
            product,
          ).some(
            (price) =>
              price <= maxPrice,
          ),
      );


      /* ----------------------------------------------------------------------
         SORT
         -------------------------------------------------------------------- */

      switch (sortBy) {

        case 'price-low':

          list = [...list].sort(
            (a, b) =>
              getMinimumWebsitePrice(
                a,
              ) -
              getMinimumWebsitePrice(
                b,
              ),
          );

          break;


        case 'price-high':

          list = [...list].sort(
            (a, b) =>
              getMaximumWebsitePrice(
                b,
              ) -
              getMaximumWebsitePrice(
                a,
              ),
          );

          break;


        case 'name':

          list = [...list].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                undefined,
                {
                  sensitivity:
                    'base',
                },
              ),
          );

          break;


        default:
          break;
      }


      return list;

    }, [
      category,
      search,
      sortBy,
      maxPrice,
    ]);


  /* ==========================================================================
     CLEAR FILTERS
     ======================================================================== */

  const clearFilters = () => {

    setCategory('all');

    setSearch('');

    setMaxPrice(
      MAX_PRICE,
    );

    setSortBy('default');
  };


  /* ==========================================================================
     ACTIVE FILTER COUNT
     ======================================================================== */

  const activeFilterCount =
    (category !== 'all'
      ? 1
      : 0) +
    (maxPrice <
    MAX_PRICE
      ? 1
      : 0) +
    (search.trim()
      ? 1
      : 0);


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <>
      {/* ======================================================================
          SEO
          =================================================================== */}

      <SEO
        title="Shop Premium Papads"
        description="Shop authentic Kawad Swad papads from Nimar. Explore moong, chana, urad and combo packs."
        path="/shop"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Shop',
            path: '/shop',
          },
        ])}
      />


      {/* ======================================================================
          SHOP HERO
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-8
          sm:py-10
          lg:py-12
        "
        aria-labelledby="shop-page-title"
      >

        {/* --------------------------------------------------------------------
            BACKGROUND DECORATION
            ------------------------------------------------------------------ */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-52
            w-52
            rounded-full
            border
            border-brand-saffron/15
            sm:h-64
            sm:w-64
            lg:h-72
            lg:w-72
          "
          aria-hidden="true"
        />


        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-dots
            opacity-[0.035]
          "
          aria-hidden="true"
        />


        <div
          className="
            pointer-events-none
            absolute
            bottom-[-80px]
            left-[-60px]
            h-40
            w-40
            rounded-full
            border
            border-brand-saffron/10
            sm:h-52
            sm:w-52
          "
          aria-hidden="true"
        />


        {/* --------------------------------------------------------------------
            HERO CONTENT
            ------------------------------------------------------------------ */}

        <div
          className="
            container-max
            container-px
            relative
            text-center
          "
        >

          <Reveal>

            <div className="mx-auto max-w-3xl">

              <span
                className="
                  section-eyebrow
                  mb-2
                  block
                  text-brand-saffron
                "
              >
                Kawad Swad
              </span>


              <h1
                id="shop-page-title"
                className="
                  text-balance
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Find Your Papad
              </h1>


              <p
                className="
                  text-pretty
                  mx-auto
                  mt-2.5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-ivory/75
                  sm:text-base
                  lg:text-lg
                "
              >
                Explore authentic flavours from Nimar
                and find the papad made for your table.
              </p>


              <div
                className="
                  mx-auto
                  mt-4
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-3.5
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-white/65
                  sm:text-xs
                "
              >

                <ShoppingBag
                  className="
                    h-3.5
                    w-3.5
                    text-brand-saffron
                  "
                  aria-hidden="true"
                />

                Authentic Nimar Papads

              </div>

            </div>

          </Reveal>

        </div>

      </section>


      {/* ======================================================================
          SHOP CONTENT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-6
          sm:py-8
          lg:py-10
        "
        aria-label="Shop products"
      >

        <div className="container-max container-px">

          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-start
              lg:gap-7
            "
          >

            {/* ==================================================================
                FILTER SIDEBAR
                =================================================================== */}

            <aside
              className={`
                w-full
                shrink-0
                lg:w-60
                ${
                  showMobileFilters
                    ? 'block'
                    : 'hidden lg:block'
                }
              `}
              aria-label="Product filters"
            >

              <div
                className="
                  card
                  border
                  border-brand-green/10
                  bg-white
                  p-4
                  shadow-card
                  sm:p-5
                  lg:sticky
                  lg:top-24
                "
              >

                {/* ==============================================================
                    MOBILE HEADER
                    =========================================================== */}

                <div
                  className="
                    mb-5
                    flex
                    items-center
                    justify-between
                    lg:hidden
                  "
                >

                  <div>

                    <span className="section-eyebrow">
                      Refine
                    </span>

                    <h2
                      className="
                        mt-0.5
                        font-serif
                        text-xl
                        font-bold
                        text-brand-green
                      "
                    >
                      Filters
                    </h2>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileFilters(
                        false,
                      )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      text-brand-brown/50
                      transition-all
                      hover:bg-brand-green/5
                      hover:text-brand-green
                      active:scale-95
                    "
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>

                </div>


                {/* ==============================================================
                    CATEGORY
                    =========================================================== */}

                <div>

                  <h3
                    className="
                      mb-2.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-brand-green
                    "
                  >
                    Category
                  </h3>


                  <div className="space-y-1">

                    {categories.map(
                      (cat) => {

                        const active =
                          category ===
                          cat;


                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() =>
                              setCategory(
                                cat,
                              )
                            }
                            className={`
                              flex
                              min-h-[42px]
                              w-full
                              items-center
                              rounded-xl
                              px-3
                              py-2
                              text-left
                              text-sm
                              transition-all
                              duration-200

                              ${
                                active
                                  ? `
                                    bg-brand-green
                                    font-semibold
                                    text-white
                                    shadow-soft
                                  `
                                  : `
                                    text-brand-brown/70
                                    hover:bg-brand-green/5
                                    hover:text-brand-green
                                  `
                              }
                            `}
                          >

                            {cat ===
                            'all'
                              ? 'All Products'
                              : CATEGORY_LABELS[
                                  cat
                                ]}

                          </button>
                        );
                      },
                    )}

                  </div>

                </div>


                <div
                  className="
                    my-5
                    h-px
                    bg-brand-green/10
                  "
                />


                {/* ==============================================================
                    PRICE
                    =========================================================== */}

                <div>

                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                      gap-2
                    "
                  >

                    <label
                      htmlFor="shop-price-limit"
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-brand-green
                      "
                    >
                      Price Limit
                    </label>


                    <span
                      className="
                        rounded-full
                        bg-brand-saffron/10
                        px-2
                        py-1
                        text-xs
                        font-bold
                        text-brand-saffron
                      "
                    >
                      ₹{maxPrice}
                    </span>

                  </div>


                  <input
                    id="shop-price-limit"
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step="1"
                    value={maxPrice}
                    onChange={(
                      event,
                    ) =>
                      setMaxPrice(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    className="
                      h-1.5
                      w-full
                      cursor-pointer
                      appearance-none
                      rounded-full
                      bg-brand-green/10
                      accent-brand-saffron
                    "
                    aria-label="Maximum product price"
                  />


                  <div
                    className="
                      mt-2
                      flex
                      justify-between
                      text-[10px]
                      text-brand-brown/40
                    "
                  >

                    <span>
                      ₹{MIN_PRICE}
                    </span>

                    <span>
                      ₹{MAX_PRICE}
                    </span>

                  </div>

                </div>


                {/* ==============================================================
                    MOBILE FILTER ACTIONS
                    =========================================================== */}

                <div
                  className="
                    mt-5
                    flex
                    gap-2
                    lg:hidden
                  "
                >

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="
                      min-h-[44px]
                      flex-1
                      rounded-xl
                      border
                      border-brand-green/15
                      px-4
                      text-sm
                      font-semibold
                      text-brand-green
                      transition-all
                      hover:bg-brand-green/5
                      active:translate-y-px
                    "
                  >
                    Clear
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileFilters(
                        false,
                      )
                    }
                    className="
                      min-h-[44px]
                      flex-1
                      rounded-xl
                      bg-brand-green
                      px-4
                      text-sm
                      font-semibold
                      text-white
                      shadow-soft
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-brand-green-dark
                      active:translate-y-px
                    "
                  >
                    Apply
                  </button>

                </div>

              </div>

            </aside>


            {/* ==================================================================
                PRODUCT AREA
                =================================================================== */}

            <main
              className="
                min-w-0
                flex-1
              "
            >

              {/* ================================================================
                  SEARCH + SORT BAR
                  ============================================================= */}

              <div
                className="
                  mb-4
                  rounded-2xl
                  border
                  border-brand-green/10
                  bg-white
                  p-2
                  shadow-soft
                  sm:mb-5
                  sm:p-2.5
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-center
                  "
                >

                  {/* SEARCH */}

                  <div
                    className="
                      flex
                      min-h-[44px]
                      min-w-0
                      flex-1
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-brand-ivory
                      px-3
                      transition-all
                      focus-within:border-brand-saffron/30
                      focus-within:bg-white
                    "
                  >

                    <Search
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-brand-green/45
                      "
                      aria-hidden="true"
                    />


                    <input
                      type="search"
                      value={search}
                      onChange={(
                        event,
                      ) =>
                        setSearch(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Search papads, flavours or pack sizes..."
                      className="
                        min-w-0
                        flex-1
                        bg-transparent
                        py-2
                        text-sm
                        text-brand-brown
                        outline-none
                        placeholder:text-brand-brown/35
                      "
                      aria-label="Search products"
                    />


                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch('')
                        }
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-brand-brown/40
                          transition-all
                          hover:bg-brand-green/5
                          hover:text-brand-green
                          active:scale-90
                        "
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                  </div>


                  {/* COUNT */}

                  <div
                    className="
                      hidden
                      shrink-0
                      px-1
                      text-xs
                      text-brand-brown/45
                      sm:block
                    "
                  >
                    {filtered.length}{' '}
                    {filtered.length ===
                    1
                      ? 'product'
                      : 'products'}
                  </div>


                  {/* SORT */}

                  <select
                    value={sortBy}
                    onChange={(
                      event,
                    ) => {

                      const value =
                        event.target
                          .value;


                      if (
                        SORT_OPTIONS.includes(
                          value as SortOption,
                        )
                      ) {
                        setSortBy(
                          value as SortOption,
                        );
                      }

                    }}
                    className="
                      min-h-[44px]
                      cursor-pointer
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-brand-ivory
                      px-3
                      text-xs
                      font-semibold
                      text-brand-green
                      outline-none
                      transition-all
                      hover:border-brand-green/20
                      focus:border-brand-saffron/40
                      sm:w-[175px]
                      sm:text-sm
                    "
                    aria-label="Sort products"
                  >

                    <option value="default">
                      Recommended
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="name">
                      Name: A to Z
                    </option>

                  </select>


                  {/* MOBILE FILTER BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileFilters(
                        !showMobileFilters,
                      )
                    }
                    className="
                      relative
                      flex
                      min-h-[44px]
                      shrink-0
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      border
                      border-brand-green/10
                      bg-brand-green
                      px-4
                      text-white
                      shadow-soft
                      transition-all
                      hover:-translate-y-0.5
                      lg:hidden
                    "
                    aria-label="Open shop filters"
                    aria-expanded={
                      showMobileFilters
                    }
                  >

                    <SlidersHorizontal className="h-4 w-4" />

                    <span
                      className="
                        text-xs
                        font-semibold
                      "
                    >
                      Filters
                    </span>


                    {activeFilterCount >
                      0 && (
                      <span
                        className="
                          absolute
                          -right-1.5
                          -top-1.5
                          flex
                          h-5
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-brand-saffron
                          px-1
                          text-[10px]
                          font-bold
                          text-white
                          shadow-soft
                        "
                      >
                        {
                          activeFilterCount
                        }
                      </span>
                    )}

                  </button>

                </div>

              </div>


              {/* ================================================================
                  ACTIVE FILTERS
                  ============================================================= */}

              {activeFilterCount >
                0 && (
                <div
                  className="
                    mb-4
                    flex
                    flex-wrap
                    items-center
                    gap-1.5
                    sm:mb-5
                    sm:gap-2
                  "
                >

                  {category !==
                    'all' && (
                    <button
                      type="button"
                      onClick={() =>
                        setCategory(
                          'all',
                        )
                      }
                      className="
                        inline-flex
                        min-h-[30px]
                        items-center
                        gap-1
                        rounded-full
                        bg-brand-green/10
                        px-2.5
                        text-[11px]
                        font-semibold
                        text-brand-green
                        transition-all
                        hover:bg-brand-green/15
                      "
                    >

                      {
                        CATEGORY_LABELS[
                          category
                        ]
                      }

                      <X className="h-3 w-3" />

                    </button>
                  )}


                  {maxPrice <
                    MAX_PRICE && (
                    <button
                      type="button"
                      onClick={() =>
                        setMaxPrice(
                          MAX_PRICE,
                        )
                      }
                      className="
                        inline-flex
                        min-h-[30px]
                        items-center
                        gap-1
                        rounded-full
                        bg-brand-saffron/10
                        px-2.5
                        text-[11px]
                        font-semibold
                        text-brand-saffron
                        transition-all
                        hover:bg-brand-saffron/15
                      "
                    >

                      Under ₹
                      {maxPrice}

                      <X className="h-3 w-3" />

                    </button>
                  )}


                  {search.trim() && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch('')
                      }
                      className="
                        inline-flex
                        min-h-[30px]
                        max-w-full
                        items-center
                        gap-1
                        rounded-full
                        bg-brand-green/10
                        px-2.5
                        text-[11px]
                        font-semibold
                        text-brand-green
                        transition-all
                        hover:bg-brand-green/15
                      "
                    >

                      <span className="max-w-[180px] truncate">
                        Search:{' '}
                        {search}
                      </span>

                      <X className="h-3 w-3 shrink-0" />

                    </button>
                  )}


                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="
                      min-h-[30px]
                      px-2
                      text-[11px]
                      font-semibold
                      text-brand-brown/45
                      transition-colors
                      hover:text-brand-green
                    "
                  >
                    Clear all
                  </button>

                </div>
              )}


              {/* ================================================================
                  MOBILE RESULT COUNT
                  ============================================================= */}

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  text-xs
                  text-brand-brown/50
                  sm:hidden
                "
              >

                <span>
                  Showing{' '}
                  {filtered.length}{' '}
                  {filtered.length ===
                  1
                    ? 'product'
                    : 'products'}
                </span>

                {activeFilterCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="
                      font-semibold
                      text-brand-green
                    "
                  >
                    Clear filters
                  </button>
                )}

              </div>


              {/* ================================================================
                  EMPTY STATE
                  ============================================================= */}

              {filtered.length ===
              0 ? (

                <Reveal>

                  <div
                    className="
                      rounded-3xl
                      border
                      border-brand-green/10
                      bg-white
                      px-5
                      py-14
                      text-center
                      shadow-soft
                      sm:py-18
                    "
                  >

                    <div
                      className="
                        mx-auto
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-brand-green/5
                        text-brand-green/35
                      "
                    >
                      <Search className="h-6 w-6" />
                    </div>


                    <h2
                      className="
                        font-serif
                        text-xl
                        font-bold
                        text-brand-green
                        sm:text-2xl
                      "
                    >
                      No papads found
                    </h2>


                    <p
                      className="
                        mx-auto
                        mt-2
                        max-w-sm
                        text-sm
                        leading-relaxed
                        text-brand-brown/50
                      "
                    >
                      Try another search or
                      remove some filters to
                      discover more products.
                    </p>


                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="
                        btn-primary
                        mt-5
                        min-h-[44px]
                        px-6
                        shadow-soft
                      "
                    >
                      Clear All Filters
                    </button>

                  </div>

                </Reveal>

              ) : (

                /* ==============================================================
                   PRODUCT GRID
                   =========================================================== */

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:gap-4
                    lg:grid-cols-3
                    lg:gap-5
                    xl:grid-cols-4
                  "
                >

                  {filtered.map(
                    (
                      product,
                      index,
                    ) => (

                      <Reveal
                        key={
                          product.id
                        }
                        delay={Math.min(
                          index *
                            35,
                          210,
                        )}
                      >

                        <ProductCard
                          product={
                            product
                          }
                        />

                      </Reveal>

                    ),
                  )}

                </div>

              )}

            </main>

          </div>

        </div>

      </section>
    </>
  );
}
