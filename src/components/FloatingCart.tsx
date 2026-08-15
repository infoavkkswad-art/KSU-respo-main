import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  X,
} from 'lucide-react';

import {
  useCart,
  formatPrice,
} from '../context/CartContext';

export function FloatingCart() {
  const {
    itemCount,
    total,
    clearCart,
  } = useCart();

  const location = useLocation();

  const hiddenRoutes = [
    '/cart',
    '/checkout',
    '/order-success',
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      location.pathname.startsWith(route),
  );

  if (itemCount <= 0 || shouldHide) {
    return null;
  }

  return (
    <div
      className="
        fixed
        left-3
        right-3
        bottom-3
        sm:left-4
        sm:right-4
        sm:bottom-4
        md:left-auto
        md:right-6
        md:bottom-6
        z-[70]
        md:w-[520px]
        animate-in
        slide-in-from-bottom-4
        duration-300
        pointer-events-none
      "
      role="region"
      aria-label="Shopping cart"
    >
      <div
        className="
          pointer-events-auto
          bg-white/95
          border
          border-brand-brown/10
          shadow-2xl
          rounded-2xl
          p-3
          sm:p-4
          backdrop-blur-xl
        "
      >
        {/* ================================================================
            MAIN CART ROW
        ================================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            md:gap-4
          "
        >
          {/* Cart Icon */}

          <div
            className="
              hidden
              sm:flex
              w-10
              h-10
              md:w-11
              md:h-11
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

          {/* Cart Information */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                text-xs
                sm:text-sm
                font-semibold
                text-brand-brown
                truncate
              "
            >
              {itemCount}{' '}
              {itemCount === 1
                ? 'item'
                : 'items'}{' '}
              in cart
            </p>

            <p
              className="
                text-sm
                sm:text-base
                font-bold
                text-brand-red
                mt-0.5
              "
            >
              {formatPrice(total)}
            </p>
          </div>

          {/* Desktop View Cart */}

          <Link
            to="/cart"
            className="
              hidden
              sm:inline-flex
              items-center
              justify-center
              min-h-[42px]
              px-3
              md:px-4
              py-2.5
              rounded-xl
              border
              border-brand-brown/15
              text-xs
              md:text-sm
              font-semibold
              text-brand-brown
              hover:bg-brand-brown/5
              active:bg-brand-brown/10
              transition-colors
              whitespace-nowrap
              shrink-0
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
              gap-1
              sm:gap-1.5
              min-h-[42px]
              px-3
              sm:px-4
              py-2.5
              rounded-xl
              bg-brand-red
              text-white
              text-xs
              sm:text-sm
              font-semibold
              hover:opacity-90
              active:opacity-80
              transition-opacity
              whitespace-nowrap
              shadow-sm
              shrink-0
            "
          >
            <span>Checkout</span>

            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>

          {/* Clear Cart */}

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
              active:bg-brand-red/10
              transition-colors
              shrink-0
            "
            aria-label="Clear cart"
            title="Clear cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================
            MOBILE VIEW CART
        ================================================================= */}

        <Link
          to="/cart"
          className="
            sm:hidden
            flex
            items-center
            justify-center
            gap-1
            mt-2
            pt-2
            border-t
            border-brand-brown/10
            text-xs
            font-semibold
            text-brand-brown/70
            min-h-[30px]
            hover:text-brand-red
            transition-colors
          "
        >
          View full cart

          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
