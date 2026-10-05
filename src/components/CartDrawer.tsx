import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Tag,
} from 'lucide-react';
import { useCart, formatPrice } from '@/context/CartContext';
import { ProductService } from '@/services/product-service';
import { PACK_LABELS } from '@/data/products';
import { ProductImage } from '@/components/ProductImage';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const navigate = useNavigate();

  // Escape key handler & body overflow lock
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  // Resolve cart items with authoritative ProductService data
  const resolvedItems = useMemo(() => {
    return items
      .map((item) => {
        const result = ProductService.getPurchasableProductBySku(item.sku);
        if (!result) return null;

        const { family, skuObj } = result;
        const lineTotal = skuObj.websitePrice * item.quantity;
        const lineMrp = skuObj.mrp * item.quantity;
        const lineSavings = Math.max(0, lineMrp - lineTotal);

        return {
          sku: item.sku,
          quantity: item.quantity,
          product: family,
          skuObj,
          packLabel: PACK_LABELS[skuObj.packSize] ?? `${skuObj.packSize}g`,
          lineTotal,
          lineMrp,
          lineSavings,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [items]);

  const totalSavings = useMemo(() => {
    return resolvedItems.reduce((acc, curr) => acc + curr.lineSavings, 0);
  }, [resolvedItems]);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-brown/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-brand-green/10 bg-brand-ivory px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-green" aria-hidden="true" />
            <h2 id="cart-drawer-title" className="font-serif text-lg font-bold text-brand-green">
              Shopping Cart
            </h2>
            <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-semibold text-brand-green">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-brown/60 transition-colors hover:bg-brand-green/10 hover:text-brand-green"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Savings Notice (Amazon style) */}
        {totalSavings > 0 && (
          <div className="flex items-center gap-2 bg-brand-green/5 px-4 py-2.5 text-xs text-brand-green sm:px-6">
            <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              You are saving <strong>{formatPrice(totalSavings)}</strong> on this order!
            </span>
          </div>
        )}

        {/* Drawer Body / Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {resolvedItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-brand-green/40">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="mt-4 font-serif text-lg font-bold text-brand-brown">
                Your cart is empty
              </p>
              <p className="mt-1 max-w-xs text-xs text-brand-brown/60">
                Explore authentic Nimar papads handcrafted with traditional recipes and dependable quality.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  navigate('/shop');
                }}
                className="btn-primary mt-6 min-h-[42px] px-6 text-xs shadow-soft"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-brand-green/10">
              {resolvedItems.map((item) => (
                <div key={item.sku} className="flex gap-3 pt-4 first:pt-0">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={closeDrawer}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-green/10 bg-brand-cream p-1"
                  >
                    <ProductImage
                      productId={item.product.id}
                      product={item.product}
                      variant="card"
                      className="h-full w-full object-contain"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="font-serif text-sm font-semibold text-brand-brown hover:text-brand-green transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.sku)}
                          className="text-brand-brown/35 hover:text-brand-red transition-colors p-1"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-brown/60">
                        <span className="font-medium text-brand-green bg-brand-green/5 px-2 py-0.5 rounded">
                          {item.packLabel}
                        </span>
                        {item.skuObj.mrp > item.skuObj.websitePrice && (
                          <span className="line-through text-brand-brown/40">
                            {formatPrice(item.skuObj.mrp)}
                          </span>
                        )}
                        <span className="font-bold text-brand-brown">
                          {formatPrice(item.skuObj.websitePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Line Total */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-brand-green/15 bg-brand-ivory">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-brand-brown/60 hover:text-brand-green"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-brand-brown tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-brand-brown/60 hover:text-brand-green"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-serif text-sm font-bold text-brand-green tabular-nums">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {resolvedItems.length > 0 && (
          <div className="border-t border-brand-green/10 bg-brand-ivory p-4 sm:p-6 space-y-3">
            {/* Subtotal */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-brand-brown/70">Subtotal</span>
              <span className="font-serif text-xl font-bold text-brand-green tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-brand-brown/50">
              Fulfilment and delivery calculated at checkout based on address.
            </p>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="btn-primary w-full min-h-[48px] justify-center text-sm shadow-green-glow"
            >
              <Lock className="h-4 w-4" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* View Full Cart Link */}
            <button
              type="button"
              onClick={handleViewCart}
              className="w-full text-center text-xs font-semibold text-brand-brown/70 hover:text-brand-green transition-colors py-1"
            >
              View Full Cart Details
            </button>

            {/* Trust Assurance */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-brown/50 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
              <span>100% Safe & Secure Checkout via Razorpay</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
