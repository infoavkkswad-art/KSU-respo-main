import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  SlidersHorizontal as FilterIcon,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { ProductService } from '@/services/product-service';
import { ProductCategory } from '@/data/products';

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

const MAX_PRICE = 700;
const MIN_PRICE = 79;

export default function Shop() {
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] =
    useState<ProductCategory | 'all'>('all');

  const [sortBy, setSortBy] = useState<
    'default' | 'price-low' | 'price-high' | 'name'
  >('default');

  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = ProductService.getAllProducts();

    if (category !== 'all') {
      list = list.filter(
        (product) => product.category === category,
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((product) => {
        const matchesProduct =
          product.name.toLowerCase().includes(query) ||
          product.hindiName.includes(query) ||
          product.variant.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);

        const matchesSku = product.skus.some(
          (sku) =>
            sku.sku.toLowerCase().includes(query) ||
            String(sku.packSize).includes(query),
        );

        return matchesProduct || matchesSku;
      });
    }

    list = list.filter((product) => {
      const firstSku = product.skus[0];

      return (
        firstSku &&
        firstSku.websitePrice <= maxPrice
      );
    });

    switch (sortBy) {
      case 'price-low':
        list = [...list].sort(
          (a, b) =>
            (a.skus[0]?.websitePrice ?? 0) -
            (b.skus[0]?.websitePrice ?? 0),
        );
        break;

      case 'price-high':
        list = [...list].sort(
          (a, b) =>
            (b.skus[0]?.websitePrice ?? 0) -
            (a.skus[0]?.websitePrice ?? 0),
        );
        break;

      case 'name':
        list = [...list].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          }),
        );
        break;

      default:
        break;
    }

    return list;
  }, [category, search, sortBy, maxPrice]);

  const clearFilters = () => {
    setCategory('all');
    setSearch('');
    setMaxPrice(MAX_PRICE);
    setSortBy('default');
  };

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <>
      <SEO
        title="Shop Premium Papads"
        description="Shop authentic Kawad Swad papads from Nimar. Explore moong, chana, urad and combo packs."
        path="/shop"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />

      {/* ================================================================
          SHOP HERO
      ================================================================= */}
      <section className="relative overflow-hidden bg-brand-ivory py-10 sm:py-14 lg:py-20">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-brand-saffron/15 sm:h-80 sm:w-80"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-30"
          aria-hidden="true"
        />

        <div className="container-max container-px relative text-center">
          <span className="section-eyebrow mb-3 block">
            Kawad Swad
          </span>

          <h1 className="font-serif text-3xl font-bold leading-tight text-brand-green sm:text-4xl lg:text-6xl">
            Find Your Papad
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-brown/65 sm:text-base lg:text-lg">
            Explore authentic flavours from Nimar and find the
            papad made for your table.
          </p>
        </div>
      </section>

      {/* ================================================================
          SHOP
      ================================================================= */}
      <section className="container-max container-px py-8 sm:py-10 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

          {/* ============================================================
              FILTER PANEL
          ============================================================= */}
          <aside
            className={`
              w-full shrink-0 lg:w-64
              ${showMobileFilters ? 'block' : 'hidden lg:block'}
            `}
          >
            <div className="card border border-brand-green/10 bg-white p-4 sm:p-5 lg:sticky lg:top-24">

              <div className="mb-5 flex items-center justify-between lg:hidden">
                <div>
                  <h2 className="font-serif text-lg font-bold text-brand-green">
                    Filters
                  </h2>
                  <p className="mt-0.5 text-xs text-brand-brown/50">
                    Refine your selection
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-brand-brown/60 hover:bg-brand-green/5"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Category */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-green sm:text-sm">
                  Category
                </h3>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const active = category === cat;

                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`
                          flex min-h-[44px] w-full items-center rounded-xl
                          px-3 py-2.5 text-left text-sm transition-all
                          ${
                            active
                              ? 'bg-brand-green/10 font-semibold text-brand-green'
                              : 'text-brand-brown/70 hover:bg-brand-green/5 hover:text-brand-green'
                          }
                        `}
                      >
                        {cat === 'all'
                          ? 'All Products'
                          : CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="my-6 h-px bg-brand-green/10" />

              {/* Price */}
              <div>
                <label
                  htmlFor="shop-price-limit"
                  className="mb-4 block text-xs font-bold uppercase tracking-[0.16em] text-brand-green sm:text-sm"
                >
                  Price Limit
                  <span className="ml-1 text-brand-saffron">
                    ₹{maxPrice}
                  </span>
                </label>

                <input
                  id="shop-price-limit"
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step="25"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(Number(event.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-brand-green/10 accent-brand-saffron"
                />

                <div className="mt-2 flex justify-between text-[10px] text-brand-brown/40">
                  <span>₹{MIN_PRICE}</span>
                  <span>₹{MAX_PRICE}+</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[46px] flex-1 rounded-xl border border-brand-green/15 px-4 text-sm font-semibold text-brand-green hover:bg-brand-green/5"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-[46px] flex-1 rounded-xl bg-brand-green px-4 text-sm font-semibold text-white hover:bg-brand-green-dark"
                >
                  Apply
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================
              PRODUCT AREA
          ============================================================= */}
          <main className="min-w-0 flex-1">

            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

              {/* Search */}
              <div className="min-w-0 flex-1">
                <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-brand-green/10 bg-white px-3 shadow-soft">
                  <Search
                    className="h-4 w-4 shrink-0 text-brand-green/45"
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search papads, flavours or pack sizes..."
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-brand-brown outline-none placeholder:text-brand-brown/35"
                    aria-label="Search products"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-brown/40 hover:bg-brand-green/5"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <p className="hidden text-xs text-brand-brown/50 sm:block">
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'product' : 'products'}
                </p>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as typeof sortBy,
                    )
                  }
                  className="min-h-[44px] flex-1 cursor-pointer rounded-xl border border-brand-green/10 bg-white px-3 text-xs font-medium text-brand-green outline-none focus:border-brand-saffron/40 sm:flex-none sm:text-sm"
                  aria-label="Sort products"
                >
                  <option value="default">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters(!showMobileFilters)
                  }
                  className="relative flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-brand-green/10 bg-white px-3 text-brand-green hover:bg-brand-green/5 lg:hidden"
                  aria-label="Open shop filters"
                  aria-expanded={showMobileFilters}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    Filters
                  </span>

                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-saffron px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {category !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategory('all')}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-brand-green/10 px-3 text-xs font-medium text-brand-green"
                  >
                    {CATEGORY_LABELS[category]}
                    <X className="h-3 w-3" />
                  </button>
                )}

                {maxPrice < MAX_PRICE && (
                  <button
                    type="button"
                    onClick={() => setMaxPrice(MAX_PRICE)}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-brand-saffron/10 px-3 text-xs font-medium text-brand-saffron"
                  >
                    Under ₹{maxPrice}
                    <X className="h-3 w-3" />
                  </button>
                )}

                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="inline-flex min-h-[32px] max-w-full items-center gap-1 rounded-full bg-brand-green/10 px-3 text-xs font-medium text-brand-green"
                  >
                    <span className="max-w-[180px] truncate">
                      Search: {search}
                    </span>
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[32px] px-2 text-xs font-medium text-brand-brown/50 hover:text-brand-green"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="mb-4 text-xs text-brand-brown/50 sm:hidden">
              Showing {filtered.length}{' '}
              {filtered.length === 1 ? 'product' : 'products'}
            </div>

            {/* Empty */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-brand-green/10 px-5 py-16 text-center sm:py-20">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-ivory">
                  <Search className="h-6 w-6 text-brand-green/30" />
                </div>

                <h2 className="font-serif text-xl font-bold text-brand-green">
                  No papads found
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-brand-brown/50">
                  Try another search or remove some filters to
                  discover more products.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-primary mt-6 min-h-[44px] px-6"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {filtered.map((product, index) => (
                  <Reveal
                    key={product.id}
                    delay={Math.min(index * 40, 240)}
                  >
                    <ProductCard product={product} />
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
