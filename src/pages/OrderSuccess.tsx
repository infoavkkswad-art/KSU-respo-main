import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../context/CartContext';
import { PACK_LABELS } from '../data/products';

export default function OrderSuccess() {
  const { lastOrder } = useOrder();

  if (!lastOrder) {
    return (
      <>
        <SEO title="Order Unavailable" description="Order information is currently unavailable." path="/order-success" indexable={false} />
        <section className="container-max container-px py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-brand-brown/30" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-brown mt-4">Order information unavailable</h1>
          <p className="mt-2 text-sm text-brand-brown/60 max-w-md mx-auto">
            We could not find your recent order details, or the session has expired.
          </p>
          <div className="mt-8">
            <Link to="/shop" className="btn-primary">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </>
    );
  }

  const totalUnits = lastOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <SEO title="Order Received" description="Your Kawad Swad order request has been received." path="/order-success" indexable={false} />
      <section className="container-max container-px py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <p className="section-eyebrow mt-6">Thank you</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-brown mt-2">Order received</h1>
          <p className="mt-4 text-brand-brown/65">
            Your order request has been recorded. We will contact you on {lastOrder.customer.phone} to confirm the next steps.
          </p>

          <div className="card text-left p-6 mt-8 space-y-4">
            <div className="flex justify-between gap-4 pb-4 border-b border-brand-brown/10">
              <span className="text-sm text-brand-brown/60">Order ID</span>
              <span className="font-semibold font-mono text-brand-brown">{lastOrder.orderId}</span>
            </div>
            <div className="flex justify-between gap-4 pb-4 border-b border-brand-brown/10">
              <span className="text-sm text-brand-brown/60">Total Units</span>
              <span className="font-semibold text-brand-brown">{totalUnits} item{totalUnits !== 1 ? 's' : ''}</span>
            </div>

            {/* Itemized Breakdown using Historical Snapshots */}
            <div className="py-2 space-y-2 border-b border-brand-brown/10">
              <p className="text-xs font-semibold text-brand-brown/50 uppercase tracking-wider mb-2">
                Ordered Items (Historical Snapshots)
              </p>
              {lastOrder.items.map((item, idx) => {
                const name = item.productNameSnapshot || `SKU: ${item.sku}`;
                const packLabel = item.packSizeSnapshot ? (PACK_LABELS[item.packSizeSnapshot] || `${item.packSizeSnapshot}g`) : '';
                const lineTotal = item.unitPrice !== undefined ? item.unitPrice * item.quantity : undefined;

                return (
                  <div key={idx} className="flex justify-between items-center text-sm py-1">
                    <span className="text-brand-brown/70">
                      {name} {packLabel && `(${packLabel})`} × {item.quantity}
                    </span>
                    {lineTotal !== undefined && (
                      <span className="font-medium whitespace-nowrap">{formatPrice(lineTotal)}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 text-sm pt-2">
              <div className="flex justify-between text-brand-brown/65">
                <span>Subtotal</span>
                <span>{formatPrice(lastOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-brown/65">
                <span>Shipping</span>
                <span>{lastOrder.totalShipping ? formatPrice(lastOrder.totalShipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-brand-brown/10">
                <span className="text-sm font-semibold text-brand-brown">Order total</span>
                <span className="font-bold text-brand-red text-lg">{formatPrice(lastOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/track-order" className="btn-primary inline-flex items-center gap-2">
              <Truck className="w-4 h-4" /> Track Order Status
            </Link>
            <Link to="/shop" className="btn-outline">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
