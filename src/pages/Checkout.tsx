import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { SEO } from '../components/SEO';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, FormContainer } from '../components/Form';
import { useCart, formatPrice } from '../context/CartContext';
import { useOrder, type CustomerInfo } from '../context/OrderContext';
import { ProductService } from '../services/product-service';
import { PACK_LABELS } from '../data/products';

const initial: CustomerInfo = { fullName: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const { items, subtotal, shippingTotal, total, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const navigate = useNavigate();
  const form = useFormState(initial);
  const [error, setError] = useState('');

  const resolvedItems = items.map((item) => {
    const res = ProductService.getProductBySku(item.sku);
    return {
      ...item,
      product: res?.family,
      skuObj: res?.skuObj,
    };
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = form.validate({
      fullName: validators.required(),
      phone: validators.phone(),
      email: validators.email(),
      address: validators.required(),
      city: validators.required(),
      state: validators.required(),
      pincode: validators.pincode(),
    });
    if (!valid || items.length === 0 || form.status === 'submitting') return;
    
    form.setStatus('submitting');
    setError('');
    
    try {
      const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await placeOrder(
        form.values,
        items,
        { subtotal, totalShipping: shippingTotal, total },
        idempotencyKey
      );

      clearCart();
      navigate('/order-success');
    } catch (err: unknown) {
      let msg = 'We could not submit your order right now. Please try again.';
      if (err instanceof Error && err.message) {
        msg = err.message;
      }
      setError(msg);
      form.setStatus('error');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Checkout" description="Complete your Kawad Swad order." path="/checkout" indexable={false} />
        <div className="container-max container-px py-20 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-brand-brown/20" />
          <h1 className="text-3xl font-serif font-bold mt-4">Your cart is empty</h1>
          <Link to="/shop" className="btn-primary mt-6">Shop Papads</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Checkout" description="Complete your Kawad Swad order." path="/checkout" indexable={false} />
      <div className="bg-brand-cream py-12">
        <div className="container-max container-px">
          <div className="flex items-center gap-2 text-xs text-brand-brown/50 mb-6">
            <Link to="/cart" className="hover:text-brand-red">Cart</Link>
            <ArrowRight className="w-3 h-3" />
            <span>Checkout</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <form onSubmit={submit} className="card p-8 bg-white border border-brand-brown/5 shadow-soft">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-brown/10">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-brand-brown">Delivery Details</h1>
                  <p className="text-sm text-brand-brown/60">Provide your shipping information for order fulfillment.</p>
                </div>
              </div>

              <FormContainer>
                <FormField label="Full Name" name="fullName" value={form.values.fullName} onChange={(v) => form.setValue('fullName', v)} error={form.errors.fullName} required autoComplete="name" placeholder="Your full name" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Phone" name="phone" type="tel" value={form.values.phone} onChange={(v) => form.setValue('phone', v)} error={form.errors.phone} required autoComplete="tel" placeholder="10-digit mobile number" />
                  <FormField label="Email" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} error={form.errors.email} required autoComplete="email" placeholder="you@example.com" />
                </div>
                <FormField label="Address" name="address" type="textarea" value={form.values.address} onChange={(v) => form.setValue('address', v)} error={form.errors.address} required placeholder="House number, street, landmark" rows={3} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="City" name="city" value={form.values.city} onChange={(v) => form.setValue('city', v)} error={form.errors.city} required />
                  <FormField label="State" name="state" value={form.values.state} onChange={(v) => form.setValue('state', v)} error={form.errors.state} required />
                  <FormField label="PIN Code" name="pincode" type="text" value={form.values.pincode} onChange={(v) => form.setValue('pincode', v)} error={form.errors.pincode} required placeholder="6 digits" />
                </div>
              </FormContainer>

              {error && (
                <div className="mt-6">
                  <FormStatusMessage status="error" successMsg="" errorMsg={error} />
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-brand-brown/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-brand-brown/70 hover:text-brand-red font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to cart
                </Link>
                <SubmitButton status={form.status} label="Place Order Request" />
              </div>
              <p className="mt-6 text-2xs text-brand-brown/50 text-center">Secure order processing. No online payment required at this stage.</p>
            </form>

            <aside className="card p-8 bg-white border border-brand-brown/5 lg:sticky lg:top-28 shadow-soft">
              <h2 className="text-xl font-serif font-bold text-brand-brown mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {resolvedItems.map(({ sku, quantity, product, skuObj }) => {
                  if (!product || !skuObj) return null;
                  const packLabel = PACK_LABELS[skuObj.packSize] || `${skuObj.packSize}g`;
                  return (
                    <div key={sku} className="flex justify-between gap-4 text-sm pb-3 border-b border-brand-brown/5">
                      <span className="text-brand-brown/70">{product.name} ({packLabel}) × {quantity}</span>
                      <span className="font-semibold text-brand-brown whitespace-nowrap">{formatPrice(skuObj.websitePrice * quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-brand-brown/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-brown/70">
                  <span>Shipping</span>
                  <span>{shippingTotal ? formatPrice(shippingTotal) : 'Free'}</span>
                </div>
                <div className="border-t border-brand-brown/10 pt-4 flex justify-between text-lg font-bold text-brand-brown">
                  <span>Total</span>
                  <span className="text-brand-red">{formatPrice(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
