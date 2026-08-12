import { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { apiClient, TrackedOrder } from '../services/api-client';
import { formatPrice } from '../context/CartContext';
import { PACK_LABELS } from '../data/products';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

const STATUS_LABELS: Record<string, { label: string; desc: string }> = {
  pending: { label: 'Order Request Received', desc: 'Your order request has been securely recorded and is awaiting review.' },
  confirmed: { label: 'Order Confirmed', desc: 'Your order has been verified and confirmed for preparation.' },
  processing: { label: 'Processing & Packing', desc: 'Your papads are being carefully packed in airtight packaging.' },
  shipped: { label: 'Shipped', desc: 'Your order is on its way with our logistics partner.' },
  delivered: { label: 'Delivered', desc: 'Your order has been successfully delivered.' },
  cancelled: { label: 'Cancelled', desc: 'This order has been cancelled.' },
};

export default function TrackOrder() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !phoneInput.trim()) {
      setError('Please provide both your Order ID and 10-digit phone number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneInput.trim())) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const result = await apiClient.trackOrder(orderIdInput, phoneInput);
      setOrderData(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to retrieve order details. Please verify your details and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Track Order"
        description="Check the live status of your Kawad Swad papad order request."
        path="/track-order"
      />
      <div className="container-max container-px py-10 lg:py-14">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-brand-red" />
            </div>
            <h1 className="text-3xl font-serif font-bold">Track Your Order</h1>
            <p className="text-sm text-brand-brown/60 mt-1">
              Enter your Order ID and registered phone number to view live status and historical details.
            </p>
          </div>

          <form onSubmit={handleTrack} className="card p-6 sm:p-8 mb-8 space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-brand-brown/80 mb-1">
                Order ID <span className="text-brand-red">*</span>
              </label>
              <input
                id="orderId"
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. KS-123456ABC"
                className="w-full px-4 py-2.5 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-red/30 text-sm font-mono uppercase"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-brown/80 mb-1">
                Registered Phone Number <span className="text-brand-red">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-red/30 text-sm"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {orderData && (
            <div className="card p-6 sm:p-8 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-brand-brown/10 gap-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-brand-brown/50">Order Reference</span>
                  <h2 className="text-xl font-mono font-bold text-brand-brown">{orderData.orderId}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-brand-brown/50">Placed On</span>
                  <p className="text-sm font-medium text-brand-brown/80">
                    {new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-brand-sand/50 border border-brand-brown/10 flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-brand-brown capitalize">
                    {STATUS_LABELS[orderData.status]?.label || orderData.status}
                  </h3>
                  <p className="text-xs text-brand-brown/70 mt-0.5">
                    {STATUS_LABELS[orderData.status]?.desc || 'Your order request is being processed.'}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              {orderData.status !== 'cancelled' && (
                <div className="py-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-brown/50 mb-3">
                    Progress Timeline
                  </h4>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {STATUS_STEPS.map((st, idx) => {
                      const currentIdx = STATUS_STEPS.indexOf(orderData.status as typeof STATUS_STEPS[number]);
                      const isCompleted = currentIdx >= idx;
                      return (
                        <div key={st} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                              isCompleted
                                ? 'bg-brand-red text-white'
                                : 'bg-brand-brown/10 text-brand-brown/40'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className="text-2xs text-brand-brown/70 capitalize hidden sm:block">
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer summary */}
              <div className="text-xs text-brand-brown/60 bg-brand-brown/5 p-3 rounded-lg flex items-center justify-between">
                <span>Customer: <strong>{orderData.customer.fullName}</strong> ({orderData.customer.phoneMasked})</span>
                <span>{orderData.customer.city}, {orderData.customer.state}</span>
              </div>

              {/* Items Snapshot */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-brown/50 mb-3">
                  Order Items (Historical Snapshots)
                </h4>
                <div className="space-y-3">
                  {orderData.items.map((item, idx) => {
                    const packLabel = PACK_LABELS[item.packSizeSnapshot] || `${item.packSizeSnapshot}g`;
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm pb-2 border-b border-brand-brown/10 last:border-0">
                        <div>
                          <p className="font-medium text-brand-brown">{item.productNameSnapshot}</p>
                          <p className="text-xs text-brand-brown/50">{packLabel} × {item.quantity}</p>
                        </div>
                        <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-brand-brown/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brand-brown/65">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-brown/65">
                  <span>Shipping</span>
                  <span>{orderData.shipping ? formatPrice(orderData.shipping) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-brand-red">{formatPrice(orderData.total)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-brown/10 flex items-center justify-between text-xs text-brand-brown/50">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Secure Order Record
                </span>
                <Link to="/shop" className="text-brand-red hover:underline">Continue Shopping</Link>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-brown/65 hover:text-brand-red">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
