import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search } from 'lucide-react';

import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { PageHero } from '../components/Section';
import { Reveal } from '../components/Reveal';
import { ProductService } from '../services/product-service';
import {
  CATEGORY_LABELS,
  ProductCategory,
} from '../data/products';


/* ==========================================================================
   KAWAD SWAD 2.0
   PRODUCTS / CATALOGUE PAGE

   Flow:
   HERO → SEARCH / SORT → FILTERS → PRODUCT GRID

   Cleanup:
   - Reduced unnecessary vertical spacing.
   - Kept product grid responsive.
   - Preserved filtering and sorting logic.
   - Preserved product data and ProductCard functionality.
   - Product image rendering remains inside ProductCard.tsx.
   ========================================================================== */


const categories: (ProductCategory | 'all')[] = [
  'all',
  'moong',
  'chana',
  'urad',
  'combo',
];

const packSizes = [200, 500, 1000, 235];


export default function Products() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';

  const [category, setCategory] =
    useState<ProductCategory | 'all'>('all');

  const [packFilter, setPackFilter] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState(query);

  const [sortBy, setSortBy] = useState<
    'default' | 'price-low' | 'price-high' | 'name'
  >('default');

  const [showFilters, setShowFilters] =
    useState(false);


  /* ==========================================================================
     FILTER + SORT
     ========================================================================== */

  const filtered = useMemo(() => {
    let list = ProductService.getAllProducts();

    /* ------------------------------------------------------------------------
       CATEGORY
       ------------------------------------------------------------------------ */

    if (category !== 'all') {
      list = list.filter(
        (product) =>
          product.category === category,
      );
    }


    /* ------------------------------------------------------------------------
       SEARCH
       ------------------------------------------------------------------------ */

    if (search.trim()) {
      const q = search
        .toLowerCase()
        .trim();

      list = list.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(q) ||
          product.hindiName.includes(q) ||
          product.variant
            .toLowerCase()
            .includes(q) ||
          product.category
            .toLowerCase()
            .includes(q) ||
          product.description
            .toLowerCase()
            .includes(q) ||
          product.skus.some(
            (sku) =>
              sku.sku
                .toLowerCase()
                .includes(q) ||
              String(
                sku.packSize,
              ).includes(q),
          ),
      );
    }


    /* ------------------------------------------------------------------------
       PACK SIZE
       ------------------------------------------------------------------------ */

    if (packFilter !== null) {
      list = list.filter(
        (product) =>
          ProductService
            .getAvailableSkus(product)
            .some(
              (sku) =>
                sku.packSize === packFilter,
            ),
      );
    }


    /* ------------------------------------------------------------------------
       SORT
       ------------------------------------------------------------------------ */

    switch (sortBy) {
      case 'price-low':
        list = [...list].sort((a, b) => {
          const aSkus =
            ProductService.getAvailableSkus(a);

          const bSkus =
            ProductService.getAvailableSkus(b);

          const aPrice =
            aSkus.length > 0
              ? Math.min(
                  ...aSkus.map(
                    (sku) =>
                      sku.websitePrice,
                  ),
                )
              : Number.POSITIVE_INFINITY;

          const bPrice =
            bSkus.length > 0
              ? Math.min(
                  ...bSkus.map(
                    (sku) =>
                      sku.websitePrice,
                  ),
                )
              : Number.POSITIVE_INFINITY;

          return aPrice - bPrice;
        });
        break;


      case 'price-high':
        list = [...list].sort((a, b) => {
          const aSkus =
            ProductService.getAvailableSkus(a);

          const bSkus =
            ProductService.getAvailableSkus(b);

          const aPrice =
            aSkus.length > 0
              ? Math.min(
                  ...aSkus.map(
                    (sku) =>
                      sku.websitePrice,
                  ),
                )
              : Number.NEGATIVE_INFINITY;

          const bPrice =
            bSkus.length > 0
              ? Math.min(
                  ...bSkus.map(
                    (sku) =>
                      sku.websitePrice,
                  ),
                )
              : Number.NEGATIVE_INFINITY;

          return bPrice - aPrice;
        });
        break;


      case 'name':
        list = [...list].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
            ),
        );
        break;


      case 'default':
      default:
        break;
    }

    return list;
  }, [
    category,
    search,
    packFilter,
    sortBy,
  ]);


  /* ==========================================================================
     ACTIVE FILTERS
     ========================================================================== */

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (packFilter !== null ? 1 : 0) +
    (search.trim() ? 1 : 0);


  /* ==========================================================================
     CLEAR FILTERS
     ========================================================================== */

  const clearFilters = () => {
    setCategory('all');
    setPackFilter(null);
    setSearch('');
  };


  /* ==========================================================================
     PAGE
     ========================================================================== */

  return (
    <>
      <SEO
        title="Products"
        description="Browse the full range of Kawad Swad premium papads from Nimar — moong, chana, urad and combo packs in 200g, 500g and 1kg sizes."
        path="/products"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Products',
            path: '/products',
          },
        ])}
      />


      {/* ======================================================================
          HERO
          =================================================================== */}

      <PageHero
        eyebrow="Catalogue"
        title="Our Products"
        description="Premium papads in moong, chana and urad varieties — each available in multiple pack sizes."
      />


      {/* ======================================================================
          CATALOGUE
          =================================================================== */}

      <section
        className="
          container-max
          container-px
          py-6
          sm:py-8
          lg:py-10
        "
        aria-label="Product catalogue"
      >

        {/* ====================================================================
            SEARCH / SORT BAR
            ================================================================= */}

        <div
          className="
            mb-4
            flex
            flex-col
            gap-2
            sm:mb-5
            sm:flex-row
            sm:items-stretch
            sm:gap-3
          "
        >

          {/* Search */}

          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-brand-brown/40
              "
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="
                input-field
                min-h-[44px]
                w-full
                pl-10
              "
              aria-label="Search products"
            />
          </div>


          {/* Sort */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as typeof sortBy,
              )
            }
            className="
              input-field
              min-h-[44px]
              w-full
              sm:w-48
            "
            aria-label="Sort products"
          >
            <option value="default">
              Sort: Default
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


          {/* Mobile filters */}

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (value) => !value,
              )
            }
            className="
              btn-outline
              flex
              min-h-[44px]
              w-full
              items-center
              justify-center
              gap-2
              sm:hidden
            "
            aria-expanded={showFilters}
            aria-controls="mobile-product-filters"
          >
            <Filter
              className="h-4 w-4"
              aria-hidden="true"
            />

            <span>Filters</span>

            {activeFilterCount > 0 && (
              <span
                className="
                  ml-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-red
                  text-2xs
                  text-white
                "
              >
                {activeFilterCount}
              </span>
            )}
          </button>

        </div>


        {/* ====================================================================
            MAIN CATALOGUE LAYOUT
            ================================================================= */}

        <div
          className="
            grid
            gap-5
            lg:grid-cols-[210px_minmax(0,1fr)]
            lg:gap-7
          "
        >

          {/* ==================================================================
              FILTER SIDEBAR
              ================================================================= */}

          <aside
            id="mobile-product-filters"
            className={`
              ${
                showFilters
                  ? 'block'
                  : 'hidden'
              }
              lg:block
            `}
            aria-label="Product filters"
          >
            <div
              className="
                card
                sticky
                top-24
                p-4
                sm:p-5
              "
            >

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                "
              >
                <h3
                  className="
                    font-serif
                    font-semibold
                    text-brand-brown
                  "
                >
                  Filters
                </h3>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      text-xs
                      text-brand-red
                      hover:underline
                    "
                  >
                    Clear all
                  </button>
                )}
              </div>


              {/* ==============================================================
                  CATEGORY
                  =========================================================== */}

              <div className="mb-5">
                <p className="label-field">
                  Category
                </p>

                <div className="space-y-1">
                  {categories.map(
                    (cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() =>
                          setCategory(cat)
                        }
                        className={`
                          w-full
                          rounded-lg
                          px-3
                          py-2
                          text-left
                          text-sm
                          transition-colors
                          ${
                            category === cat
                              ? 'bg-brand-red/10 font-medium text-brand-red'
                              : 'text-brand-brown/70 hover:bg-brand-brown/5'
                          }
                        `}
                      >
                        {cat === 'all'
                          ? 'All Products'
                          : CATEGORY_LABELS[
                              cat
                            ]}
                      </button>
                    ),
                  )}
                </div>
              </div>


              {/* ==============================================================
                  PACK SIZE
                  =========================================================== */}

              <div>
                <p className="label-field">
                  Pack Size
                </p>

                <div className="flex flex-wrap gap-2">
                  {packSizes.map(
                    (size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() =>
                          setPackFilter(
                            packFilter ===
                              size
                              ? null
                              : size,
                          )
                        }
                        className={`
                          rounded-full
                          px-3
                          py-2
                          text-sm
                          transition-colors
                          ${
                            packFilter === size
                              ? 'bg-brand-red text-white'
                              : 'bg-brand-brown/5 text-brand-brown/70 hover:bg-brand-brown/10'
                          }
                        `}
                      >
                        {size === 1000
                          ? '1kg'
                          : size === 235
                            ? 'Combo'
                            : `${size}g`}
                      </button>
                    ),
                  )}
                </div>
              </div>


              {/* ==============================================================
                  MOBILE APPLY
                  =========================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="
                  btn-outline
                  mt-4
                  w-full
                  sm:hidden
                "
              >
                Apply Filters
              </button>

            </div>
          </aside>


          {/* ==================================================================
              PRODUCT AREA
              ================================================================= */}

          <div className="min-w-0">

            {/* ================================================================
                RESULT BAR
                ============================================================= */}

            <div
              className="
                mb-3
                flex
                min-h-[28px]
                items-center
                justify-between
                gap-3
              "
            >
              <p
                className="
                  text-xs
                  text-brand-brown/60
                  sm:text-sm
                "
              >
                {filtered.length} product
                {filtered.length !== 1
                  ? 's'
                  : ''}
              </p>


              {/* ==============================================================
                  ACTIVE FILTER CHIPS
                  =========================================================== */}

              {activeFilterCount > 0 && (
                <div
                  className="
                    hidden
                    flex-wrap
                    items-center
                    justify-end
                    gap-1.5
                    lg:flex
                  "
                >

                  {category !== 'all' && (
                    <span
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-md
                        border
                        border-amber-200
                        bg-amber-50
                        px-2.5
                        py-1
                        text-xs
                        text-brand-brown
                      "
                    >
                      {CATEGORY_LABELS[
                        category
                      ]}

                      <button
                        type="button"
                        onClick={() =>
                          setCategory('all')
                        }
                        aria-label="Remove category filter"
                      >
                        <X
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      </button>
                    </span>
                  )}


                  {packFilter !== null && (
                    <span
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-md
                        border
                        border-amber-200
                        bg-amber-50
                        px-2.5
                        py-1
                        text-xs
                        text-brand-brown
                      "
                    >
                      {packFilter === 1000
                        ? '1kg'
                        : packFilter === 235
                          ? 'Combo'
                          : `${packFilter}g`}

                      <button
                        type="button"
                        onClick={() =>
                          setPackFilter(null)
                        }
                        aria-label="Remove pack size filter"
                      >
                        <X
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      </button>
                    </span>
                  )}


                  {search.trim() && (
                    <span
                      className="
                        flex
                        max-w-[240px]
                        items-center
                        gap-1
                        rounded-md
                        border
                        border-amber-200
                        bg-amber-50
                        px-2.5
                        py-1
                        text-xs
                        text-brand-brown
                      "
                    >
                      <span className="truncate">
                        Search: {search.trim()}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSearch('')
                        }
                        aria-label="Remove search filter"
                      >
                        <X
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      </button>
                    </span>
                  )}

                </div>
              )}

            </div>


            {/* ================================================================
                EMPTY STATE
                ============================================================= */}

            {filtered.length === 0 ? (
              <div
                className="
                  card
                  p-8
                  text-center
                  sm:p-10
                "
              >
                <p
                  className="
                    mb-2
                    text-brand-brown/60
                  "
                >
                  No products found.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    font-medium
                    text-brand-red
                    hover:underline
                  "
                >
                  Clear filters
                </button>
              </div>
            ) : (

              /* ==============================================================
                 PRODUCT GRID
                 =========================================================== */

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  sm:gap-5
                  lg:grid-cols-3
                  lg:gap-5
                "
              >
                {filtered.map(
                  (product, index) => (
                    <Reveal
                      key={product.id}
                      delay={Math.min(
                        index * 40,
                        240,
                      )}
                    >
                      <ProductCard
                        product={product}
                        className="h-full"
                      />
                    </Reveal>
                  ),
                )}
              </div>

            )}

          </div>
        </div>
      </section>
    </>
  );
}
