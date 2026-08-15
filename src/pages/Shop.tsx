import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { ProductService } from '../services/product-service';
import { ProductCategory } from '../data/products';

const categories: (ProductCategory | 'all')[] = [
  'all',
  'moong',
  'chana',
  'urad',
  'combo',
];

const CATEGORY_LABELS: Record<string, string> = {
  moong: 'Moong Family',
  chana: 'Chana Family',
  urad: 'Urad Family',
  combo: 'Combo Packs',
};

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] =
    useState<ProductCategory | 'all'>('all');

  const [sortBy, setSortBy] = useState<
    'default' | 'price-low' | 'price-high' | 'name'
  >('default');

  const [maxPrice, setMaxPrice] = useState(700);
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  const filtered = useMemo(() => {
    let list = ProductService.getAllProducts();

    // Category
    if (category !== 'all') {
      list = list.filter(
        (p) => p.category === category,
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();

      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.hindiName.includes(q) ||
          p.variant.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skus.some(
            (s) =>
              s.sku.toLowerCase().includes(q) ||
              String(s.packSize).includes(q),
          ),
      );
    }

    // Price
    list = list.filter(
      (p) =>
        p.skus[0].websitePrice <= maxPrice,
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        list = [...list].sort(
          (a, b) =>
            a.skus[0].websitePrice -
            b.skus[0].websitePrice,
        );
        break;

      case 'price-high':
        list = [...list].sort(
          (a, b) =>
            b.skus[0].websitePrice -
            a.skus[0].websitePrice,
        );
        break;

      case 'name':
        list = [...list].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        break;
    }

    return list;
  }, [category, search, sortBy, maxPrice]);

  const clearFilters = () => {
    setCategory('all');
    setSearch('');
    setMaxPrice(700);
  };

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (maxPrice < 700 ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <>
      <SEO
        title="Shop Premium Papads"
        description="Shop premium papads online from Nimar. Browse moong, chana and urad papad varieties, choose your pack size and get them delivered."
        path="/shop"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />

      {/* Hero */}
      <section className="bg-brand-cream py-10 sm:py-12 lg:py-16">
        <div className="container-max container-px text-center">
          <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-serif
              font-bold
              text-brand-brown
              mb-3
              sm:mb-4
            "
          >
            Our Papad Selection
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              text-brand-brown/70
              max-w-lg
              mx-auto
            "
          >
            Discover the authentic taste of Nimar
            with our premium, carefully crafted
            papads.
          </p>
        </div>
      </section>

      {/* Shop */}
      <section className="container-max container-px py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
          {/* Sidebar / Mobile Filters */}
          <aside
            className={`
              lg:w-64
              flex-shrink-0
              ${
                showMobileFilters
                  ? 'block'
                  : 'hidden lg:block'
              }
            `}
          >
            <div
              className="
                card
                p-4
                sm:p-5
                lg:p-0
                lg:bg-transparent
                lg:border-0
                lg:shadow-none
                lg:rounded-none
                lg:sticky
                lg:top-24
                space-y-6
                lg:space-y-8
              "
            >
              {/* Mobile filter header */}
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-serif font-semibold text-brand-brown">
                  Filters
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters(false)
                  }
                  className="
                    p-1.5
                    rounded-full
                    text-brand-brown/60
                    hover:bg-brand-brown/5
                  "
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div>
                <h3
                  className="
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-brand-brown
                    mb-3
                    sm:mb-4
                  "
                >
                  Category
                </h3>

                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() =>
                        setCategory(cat)
                      }
                      className={`
                        block
                        w-full
                        text-left
                        py-2.5
                        px-2
                        rounded-lg
                        text-sm
                        transition-colors
                        ${
                          category === cat
                            ? 'text-brand-red bg-brand-red/5 font-semibold'
                            : 'text-brand-brown/70 hover:text-brand-red hover:bg-brand-brown/5'
                        }
                      `}
                    >
                      {cat === 'all'
                        ? 'All Products'
                        : CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="shop-price-limit"
                  className="
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-brand-brown
                    mb-4
                    block
                  "
                >
                  Price Limit:{' '}
                  <span className="text-brand-red">
                    ₹{maxPrice}
                  </span>
                </label>

                <input
                  id="shop-price-limit"
                  type="range"
                  min="79"
                  max="700"
                  step="50"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(
                      Number(e.target.value),
                    )
                  }
                  className="
                    w-full
                    h-1
                    bg-brand-brown/10
                    rounded-full
                    appearance-none
                    accent-brand-red
                    cursor-pointer
                  "
                />

                <div className="flex justify-between mt-2 text-[10px] text-brand-brown/40">
                  <span>₹79</span>
                  <span>₹700+</span>
                </div>
              </div>

              {/* Mobile apply */}
              <div className="lg:hidden pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters(false)
                  }
                  className="
                    w-full
                    bg-brand-red
                    text-white
                    rounded-xl
                    py-3
                    px-4
                    font-semibold
                    text-sm
                    hover:opacity-90
                    transition-opacity
                  "
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:justify-between
                sm:items-center
                mb-5
                sm:mb-8
                gap-3
              "
            >
              <div className="flex items-center justify-between sm:block">
                <p className="text-xs sm:text-sm text-brand-brown/60">
                  Showing {filtered.length}{' '}
                  product
                  {filtered.length !== 1
                    ? 's'
                    : ''}
                </p>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      sm:hidden
                      text-xs
                      text-brand-red
                      font-medium
                    "
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  sm:justify-end
                  gap-2
                "
              >
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as typeof sortBy,
                    )
                  }
                  className="
                    bg-transparent
                    border
                    border-brand-brown/10
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    sm:text-sm
                    font-medium
                    text-brand-brown
                    focus:ring-0
                    focus:border-brand-red/40
                    cursor-pointer
                    min-h-[40px]
                  "
                  aria-label="Sort products"
                >
                  <option value="default">
                    Sort: Recommended
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

                {/* Mobile filter button */}
                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters(
                      !showMobileFilters,
                    )
                  }
                  className="
                    lg:hidden
                    min-h-[40px]
                    px-3
                    rounded-lg
                    border
                    border-brand-brown/10
                    text-brand-brown
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    relative
                  "
                  aria-label="Open shop filters"
                  aria-expanded={showMobileFilters}
                >
                  <SlidersHorizontal className="w-4 h-4" />

                  <span className="text-xs font-medium">
                    Filters
                  </span>

                  {activeFilterCount > 0 && (
                    <span
                      className="
                        absolute
                        -top-2
                        -right-2
                        w-5
                        h-5
                        rounded-full
                        bg-brand-red
                        text-white
                        text-[10px]
                        flex
                        items-center
                        justify-center
                        font-bold
                      "
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="hidden sm:flex flex-wrap gap-2 mb-5">
                {category !== 'all' && (
                  <button
                    type="button"
                    onClick={() =>
                      setCategory('all')
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1
                      px-2.5
                      py-1.5
                      rounded-full
                      bg-brand-red/5
                      text-brand-red
                      text-xs
                      font-medium
                    "
                  >
                    {CATEGORY_LABELS[category]}
                    <X className="w-3 h-3" />
                  </button>
                )}

                {maxPrice < 700 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMaxPrice(700)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1
                      px-2.5
                      py-1.5
                      rounded-full
                      bg-brand-red/5
                      text-brand-red
                      text-xs
                      font-medium
                    "
                  >
                    Under ₹{maxPrice}
                    <X className="w-3 h-3" />
                  </button>
                )}

                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      px-2.5
                      py-1.5
                      rounded-full
                      bg-brand-red/5
                      text-brand-red
                      text-xs
                      font-medium
                    "
                  >
                    Search: {search}
                    <X className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    px-2
                    py-1.5
                    text-xs
                    text-brand-brown/50
                    hover:text-brand-red
                  "
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div
                className="
                  py-14
                  sm:py-20
                  px-5
                  text-center
                  border-2
                  border-dashed
                  border-brand-brown/10
                  rounded-2xl
                "
              >
                <p className="text-brand-brown/60">
                  No products match your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    text-brand-red
                    mt-2
                    font-medium
                    hover:underline
                  "
                >
                  Clear all
                </button>
              </div>
            ) : (
              /*
               * Responsive product grid:
               *
               * Very small phones: 1 column
               * Normal mobile/tablet: 2 columns
               * Desktop: 3 columns
               */
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-4
                  sm:gap-5
                  lg:gap-6
                "
              >
                {filtered.map((product) => (
                  <Reveal key={product.id}>
                    <ProductCard
                      product={product}
                      className="h-full"
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
