import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Check, Truck, Shield, Leaf } from 'lucide-react';
import { SEO, breadcrumbSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { ProductService } from '../services/product-service';
import { PACK_LABELS } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const product = slug ? ProductService.getProductBySlug(slug) : undefined;

  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return ProductService.getProductsByCategory(product.category)
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO title="Product Not Found" description="Product not found" path="/product/not-found" />
        <h1 className="text-3xl font-serif font-bold text-brand-brown mb-4">Product not found</h1>
        <Link to="/products" className="btn-primary">Browse All</Link>
      </div>
    );
  }

  const selectedSku = product.skus[selectedSkuIndex] || product.skus[0];
  const discount = Math.round(((selectedSku.mrp - selectedSku.websitePrice) / selectedSku.mrp) * 100);

  const handleAddToCart = () => {
    addItem(selectedSku.sku, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />

      <div className="container-max container-px py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Visual Presentation - Family Level Image */}
          <div className="sticky top-28">
            <div className="aspect-square rounded-4xl overflow-hidden bg-brand-cream-dark border border-brand-brown/5 shadow-soft">
              <ProductImage
                productId={product.id}
                product={product}
                variant="detail"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Buying Experience */}
          <div>
            <div className="mb-6">
              <span className="text-brand-red font-semibold uppercase tracking-widest text-xs">{product.category}</span>
              <h1 className="text-4xl font-serif font-bold text-brand-brown mt-2">{product.name}</h1>
              <p className="mt-4 text-brand-brown/70 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="py-8 border-y border-brand-brown/10">
              <div className="mb-6">
                <label className="text-sm font-bold uppercase tracking-widest text-brand-brown mb-3 block">Pack Size</label>
                <div className="flex gap-2 flex-wrap">
                  {product.skus.map((s, i) => (
                    <button
                      key={s.sku}
                      onClick={() => setSelectedSkuIndex(i)}
                      className={`px-6 py-3 rounded-full text-sm font-medium border transition-all ${
                        selectedSkuIndex === i ? 'bg-brand-brown text-white border-brand-brown' : 'bg-white border-brand-brown/10 hover:border-brand-brown/30'
                      }`}
                    >
                      {PACK_LABELS[s.packSize] || `${s.packSize}g`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold text-brand-brown">₹{selectedSku.websitePrice}</span>
                <span className="text-lg text-brand-brown/40 line-through">₹{selectedSku.mrp}</span>
                {discount > 0 && <span className="badge-red mb-1.5">{discount}% OFF</span>}
              </div>
              <p className="text-xs text-brand-brown/60 mt-2">
                {selectedSku.freeShipping ? (
                  <span className="text-green-600 font-medium">Free shipping</span>
                ) : (
                  `+ ₹${selectedSku.shipping} shipping`
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 py-8">
              <div className="flex items-center bg-white border border-brand-brown/10 rounded-full p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 btn-primary py-4">
                {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                {added ? 'Added' : 'Add to Cart'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-t border-brand-brown/10">
              {[ { icon: Leaf, label: 'Pure Veg' }, { icon: Shield, label: 'FSSAI Licence' }, { icon: Truck, label: 'Delivery available' } ].map((f, i) => (
                <div key={i} className="text-center flex flex-col items-center gap-2">
                  <f.icon className="w-6 h-6 text-brand-brown/30" />
                  <span className="text-xs font-medium text-brand-brown/70">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <section className="bg-brand-cream-dark py-20">
        <div className="container-max container-px">
          <h2 className="text-3xl font-serif font-bold text-brand-brown mb-12 text-center">More from {product.category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}