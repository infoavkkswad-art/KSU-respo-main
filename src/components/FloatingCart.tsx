import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useCart, formatPrice } from '../context/CartContext';

export function FloatingCart() {
  const { itemCount, total, clearCart } = useCart();
  const location = useLocation();

  const hiddenRoutes = [
    '/cart',
    '/checkout',
    '/order-success',
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (itemCount <= 0 || shouldHide) {
    return null;
  }

  return (
    <div
      className="
        fixed
        bottom-4
        left-4
        right-4
        z-[70]
        md:left-auto
        md:right-6
        md:bottom-6
        md:w-[520px]
        animate-in
        slide-in-from-bottom-4
        duration-300
      "
      role="region"
      aria-label="Shopping cart"
    >
      <div
        className="
          bg-white
          border
          border-brand-brown/10
          shadow-2xl
          rounded-2xl
          p-3
          md:p-4
          backdrop-blur-xl
        "
      >
        <div className="flex items-center gap-3 md:gap-4">

          {/* Cart icon */}
          <div
            className="
              hidden
              sm:flex
              w-11
              h-11
              rounded-xl
              bg-brand-red/10
              text-brand-red
              items-center
              justify-center
              shrink-0
            "
          >
            <ShoppingBag className="w-5 h-5" />
          </div>

          {/* Cart information */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-brown">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </p>

            <p className="text-sm font-bold text-brand-red mt-0.5">
              {formatPrice(total)}
            </p>
          </div>

          {/* View cart */}
          <Link
            to="/cart"
            className="
              hidden
              sm:inline-flex
              items-center
              justify-center
              px-4
              py-2.5
              rounded-xl
              border
              border-brand-brown/15
              text-sm
              font-semibold
              text-brand-brown
              hover:bg-brand-brown/5
              transition-colors
              whitespace-nowrap
            "
          >
            View Cart
          </Link>

          {/* Checkout */}
          <Link
            to="/checkout"
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              px-4
              py-2.5
              rounded-xl
              bg-brand-red
              text-white
              text-sm
              font-semibold
              hover:opacity-90
              transition-opacity
              whitespace-nowrap
              shadow-sm
            "
          >
            Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Clear cart */}
          <button
            type="button"
            onClick={clearCart}
            className="
              hidden
              md:flex
              w-9
              h-9
              rounded-full
              items-center
              justify-center
              text-brand-brown/40
              hover:text-brand-red
              hover:bg-brand-red/5
              transition-colors
              shrink-0
            "
            aria-label="Clear cart"
            title="Clear cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Cart */}
        <Link
          to="/cart"
          className="
            sm:hidden
            flex
            items-center
            justify-center
            mt-2
            pt-2
            border-t
            border-brand-brown/10
            text-xs
            font-semibold
            text-brand-brown/70
          "
        >
          View full cart
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}
