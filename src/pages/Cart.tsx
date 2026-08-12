import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useCart, formatPrice } from '../context/CartContext';
import { ProductService } from '../services/product-service';
import { PACK_LABELS } from '../data/products';

export default function Cart() {
  const { items, subtotal, shippingTotal, total, updateQuantity, removeItem, addItem } = useCart();

  const resolvedItems = items.map((item) => {
    const res = ProductService.getProductBySku(item.sku);
    return {
      ...item,
      product: res?.family,
      skuObj: res?.skuObj,
    };
  });

  return (
    <>
      <SEO 
        title="Shopping Cart" 
        description="Review your Kawad Swad papad order before checkout." 
        path="/cart" 
        indexable={false} 
      />
      
      <div className="bg-brand-cream py-16">
        <div className="container-max container-px text-center">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-brown mb-4">Your Shopping Cart</h1>
          <p className="text-brand-brown/70 max-w-lg mx-auto">Review your selected papads and proceed to checkout when you are ready.</p>
        </div>
      </div>

      <section className="container-max container-px py-12">
        {items.length === 0 ? (
          <div className="card max-w-xl mx-auto p-12 text-center bg-white border border-brand-brown/5 shadow-soft">
            <ShoppingBag className="w-12 h-12 text-brand-brown/20 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">Your cart is empty</h2>
            <p className="text-sm text-brand-brown/60 mb-6">Explore our authentic papads and find your next favourite flavour.</p>
            <Link to="/shop" className="btn-primary">Browse Papads <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-4">
              {resolvedItems.map(({ sku, quantity, product, skuObj }) => {
                if (!product || !skuObj) return null;
                const packLabel = PACK_LABELS[skuObj.packSize] || `${skuObj.packSize}g`;

                return (
                  <div key={sku} className="card p-6 bg-white border border-brand-brown/5 flex flex-col sm:flex-row gap-6 items-center justify-between shadow-soft">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 rounded-2xl bg-brand-cream-dark flex items-center justify-center shrink-0 border border-brand-brown/5">
                        <span className="font-serif font-bold text-brand-red text-lg">क</span>
                      </div>
                      <div className="min-w-0">
                        <Link to={`/product/${product.slug}`} className="font-serif font-semibold text-brand-brown hover:text-brand-red text-lg">
                          {product.name}
                        </Link>
                        <p className="text-xs text-brand-brown/60 mt-1 uppercase tracking-wider">
                          {product.variant} · {packLabel}
                        </p>
                        <p className="text-sm font-bold text-brand-red mt-2">{formatPrice(skuObj.websitePrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-brand-brown/5">
                      <div className="flex items-center border border-brand-brown/15 rounded-full overflow-hidden bg-brand-cream/30">
                        <button
                          onClick={() => updateQuantity(sku, quantity - 1)}
                          className="p-2.5 hover:bg-brand-brown/5 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => addItem(sku, 1)}
                          className="p-2.5 hover:bg-brand-brown/5 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(sku)}
                        className="p-2.5 text-brand-brown/40 hover:text-brand-red transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-brand-brown hover:text-brand-red transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> Continue shopping
                </Link>
              </div>
            </div>

            <aside className="card p-8 bg-white border border-brand-brown/5 lg:sticky lg:top-28 shadow-soft">
              <h2 className="text-xl font-serif font-bold text-brand-brown mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-brand-brown/70">
                  <span>Subtotal</span>
                  <span className="font-medium text-brand-brown">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-brown/70">
                  <span>Shipping</span>
                  <span className="font-medium text-brand-brown">{shippingTotal ? formatPrice(shippingTotal) : 'Free'}</span>
                </div>
                <div className="border-t border-brand-brown/10 pt-4 flex justify-between text-lg font-bold text-brand-brown">
                  <span>Total</span>
                  <span className="text-brand-red">{formatPrice(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full mt-8 py-4 justify-center">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-2xs text-brand-brown/50 text-center mt-4">Secure order request processing.</p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
