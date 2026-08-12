import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { ProductService } from '../services/product-service';
import { ProductCategory } from '../data/products';

const categories: (ProductCategory | 'all')[] = ['all', 'moong', 'chana', 'urad', 'combo'];
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
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [maxPrice, setMaxPrice] = useState(700);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = ProductService.getAllProducts();

    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

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

    list = list.filter((p) => p.skus[0].websitePrice <= maxPrice);

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
  }, [category, search, sortBy, maxPrice]);

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

      <section className="bg-brand-cream py-16">
        <div className="container-max container-px text-center">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-brown mb-4">Our Papad Selection</h1>
          <p className="text-brand-brown/70 max-w-lg mx-auto">Discover the authentic taste of Nimar with our premium, carefully crafted papads.</p>
        </div>
      </section>

      <section className="container-max container-px py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-brown mb-4">Category</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`block w-full text-left py-2 text-sm transition-colors ${
                        category === cat ? 'text-brand-red font-semibold' : 'text-brand-brown/70 hover:text-brand-red'
                      }`}
                    >
                      {cat === 'all' ? 'All Products' : CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-widest text-brand-brown mb-4 block">
                  Price Limit: <span className="text-brand-red">₹{maxPrice}</span>
                </label>
                <input
                  type="range"
                  min="79"
                  max="700"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-brand-brown/10 rounded-full appearance-none accent-brand-red cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <p className="text-sm text-brand-brown/60">Showing {filtered.length} products</p>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-transparent border-none text-sm font-medium text-brand-brown focus:ring-0 cursor-pointer"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden p-2 text-brand-brown"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-brand-brown/10 rounded-2xl">
                <p className="text-brand-brown/60">No products match your filters.</p>
                <button onClick={() => { setCategory('all'); setSearch(''); setMaxPrice(700); }} className="text-brand-red mt-2 font-medium hover:underline">Clear all</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <Reveal key={product.id}>
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
