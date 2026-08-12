import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search } from 'lucide-react';
import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { PageHero } from '../components/Section';
import { Reveal } from '../components/Reveal';
import { ProductService } from '../services/product-service';
import { CATEGORY_LABELS, ProductCategory } from '../data/products';

const categories: (ProductCategory | 'all')[] = ['all', 'moong', 'chana', 'urad', 'combo'];
const packSizes = [200, 500, 1000, 235];

export default function Products() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [packFilter, setPackFilter] = useState<number | null>(null);
  const [search, setSearch] = useState(query);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = ProductService.getAllProducts();

    // 1. Compose Category Filter
    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    // 2. Compose Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.hindiName.includes(q) ||
          p.variant.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skus.some((s) => s.sku.toLowerCase().includes(q) || String(s.packSize).includes(q))
      );
    }

    // 3. Compose Pack Filter
    if (packFilter !== null) {
      list = list.filter((p) =>
        p.skus.some((s) => s.packSize === packFilter)
      );
    }

    // 4. Sort
    switch (sortBy) {
      case 'price-low':
        list = [...list].sort((a, b) => a.skus[0].websitePrice - b.skus[0].websitePrice);
        break;
      case 'price-high':
        list = [...list].sort((a, b) => b.skus[0].websitePrice - a.skus[0].websitePrice);
        break;
      case 'name':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [category, search, packFilter, sortBy]);

  const activeFilterCount = (category !== 'all' ? 1 : 0) + (packFilter !== null ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <>
      <SEO
        title="Products"
        description="Browse the full range of Kawad Swad premium papads from Nimar — moong, chana, urad and combo packs in 200g, 500g and 1kg sizes."
        path="/products"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
        ])}
      />

      <PageHero
        eyebrow="Catalogue"
        title="Our Products"
        description="Premium papads in moong, chana and urad varieties — each available in multiple pack sizes."
      />

      <section className="container-max container-px py-12">
        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
              aria-label="Search products"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-field sm:w-48"
            aria-label="Sort products"
          >
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="btn-outline sm:hidden flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-brand-red text-white text-2xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-brand-brown">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setCategory('all');
                      setPackFilter(null);
                      setSearch('');
                    }}
                    className="text-xs text-brand-red hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="label-field">Category</p>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === cat
                          ? 'bg-brand-red/10 text-brand-red font-medium'
                          : 'text-brand-brown/70 hover:bg-brand-brown/5'
                      }`}
                    >
                      {cat === 'all' ? 'All Products' : CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pack size */}
              <div>
                <p className="label-field">Pack Size</p>
                <div className="flex flex-wrap gap-2">
                  {packSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setPackFilter(packFilter === size ? null : size)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        packFilter === size
                          ? 'bg-brand-red text-white'
                          : 'bg-brand-brown/5 text-brand-brown/70 hover:bg-brand-brown/10'
                      }`}
                    >
                      {size === 1000 ? '1kg' : size === 235 ? 'Combo' : `${size}g`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-brand-brown/60">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </p>
              {activeFilterCount > 0 && (
                <div className="hidden lg:flex items-center gap-2">
                  {category !== 'all' && (
                    <span className="badge-brown flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-xs text-brand-brown border border-amber-200">
                      {CATEGORY_LABELS[category]}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('all')} />
                    </span>
                  )}
                  {packFilter !== null && (
                    <span className="badge-brown flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-xs text-brand-brown border border-amber-200">
                      {packFilter === 1000 ? '1kg' : packFilter === 235 ? 'Combo' : `${packFilter}g`}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setPackFilter(null)} />
                    </span>
                  )}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-brand-brown/60 mb-2">No products found.</p>
                <button
                  onClick={() => {
                    setCategory('all');
                    setPackFilter(null);
                    setSearch('');
                  }}
                  className="text-brand-red font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i * 50, 300)}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
