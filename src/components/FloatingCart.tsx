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


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL FLOATING CART SYSTEM

   Purpose:
   - Persistent purchase reminder
   - Fast cart access
   - Fast checkout access
   - Mobile-safe conversion surface

   Visual authority:
   - Central design tokens
   - Central elevation
   - Central motion
   - Central CTA hierarchy
   ========================================================================== */


export function FloatingCart() {
  const {
    itemCount,
    total,
    clearCart,
  } = useCart();

  const location = useLocation();


  /* ==========================================================================
     ROUTE VISIBILITY
     ======================================================================== */

  const hiddenRoutes = [
    '/cart',
    '/checkout',
    '/order-success',
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      location.pathname.startsWith(route),
  );


  /* ==========================================================================
     VISIBILITY GUARD
     ======================================================================== */

  if (
    itemCount <= 0 ||
    shouldHide
  ) {
    return null;
  }


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <div
      className="
        pointer-events-none
        fixed
        bottom-3
        left-3
        right-3
        z-toast
        sm:bottom-4
        sm:left-4
        sm:right-4
        md:bottom-6
        md:left-auto
        md:right-6
        md:w-[520px]
        animate-slide-up
      "
      role="region"
      aria-label="Shopping cart"
    >
      <div
        className="
          pointer-events-auto
          overflow-hidden
          rounded-2xl
          border
          border-brand-green/10
          bg-white/95
          p-3
          shadow-floating
          backdrop-blur-xl
          transition-all
          duration-300
          ease-ks-standard
          sm:p-4
        "
      >

        {/* ====================================================================
            MAIN CART ROW
            ================================================================ */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            md:gap-4
          "
        >

          {/* ================================================================
              CART ICON
              ================================================================ */}

          <div
            className="
              hidden
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-brand-green/8
              text-brand-green
              sm:flex
              md:h-11
              md:w-11
            "
            aria-hidden="true"
          >
            <ShoppingBag
              className="
                h-5
                w-5
              "
            />
          </div>


          {/* ================================================================
              CART INFORMATION
              ================================================================ */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate
                text-xs
                font-semibold
                text-brand-brown
                sm:text-sm
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
                mt-0.5
                text-sm
                font-bold
                text-brand-green
                sm:text-base
              "
            >
              {formatPrice(total)}
            </p>
          </div>


          {/* ================================================================
              DESKTOP VIEW CART
              ================================================================ */}

          <Link
            to="/cart"
            className="
              hidden
              min-h-[42px]
              shrink-0
              items-center
              justify-center
              whitespace-nowrap
              rounded-xl
              border
              border-brand-green/15
              bg-white
              px-3
              py-2.5
              text-xs
              font-semibold
              text-brand-brown
              shadow-soft
              transition-all
              duration-200
              ease-ks-standard
              hover:-translate-y-0.5
              hover:border-brand-green/25
              hover:bg-brand-green/5
              hover:text-brand-green
              active:translate-y-0
              sm:inline-flex
              md:px-4
              md:text-sm
            "
          >
            View Cart
          </Link>


          {/* ================================================================
              PRIMARY CHECKOUT CTA
              ================================================================ */}

          <Link
            to="/checkout"
            className="
              btn-primary
              group/checkout
              min-h-[42px]
              shrink-0
              gap-1
              whitespace-nowrap
              px-3
              py-2.5
              text-xs
              shadow-green-glow
              sm:gap-1.5
              sm:px-4
              sm:text-sm
            "
          >
            <span>
              Checkout
            </span>

            <ArrowRight
              className="
                h-3.5
                w-3.5
                transition-transform
                duration-200
                group-hover/checkout:translate-x-0.5
                sm:h-4
                sm:w-4
              "
              aria-hidden="true"
            />
          </Link>


          {/* ================================================================
              CLEAR CART
              ================================================================ */}

          <button
            type="button"
            onClick={clearCart}
            className="
              hidden
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-brand-brown/35
              transition-all
              duration-200
              ease-ks-standard
              hover:bg-brand-red/5
              hover:text-brand-red
              active:scale-95
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-saffron
              md:flex
            "
            aria-label="Clear cart"
            title="Clear cart"
          >
            <X
              className="
                h-4
                w-4
              "
              aria-hidden="true"
            />
          </button>
        </div>


        {/* ====================================================================
            MOBILE VIEW CART
            ================================================================= */}

        <Link
          to="/cart"
          className="
            mt-2
            flex
            min-h-[30px]
            items-center
            justify-center
            gap-1
            border-t
            border-brand-green/10
            pt-2
            text-xs
            font-semibold
            text-brand-brown/65
            transition-colors
            duration-200
            hover:text-brand-green
            sm:hidden
          "
        >
          <span>
            View full cart
          </span>

          <ArrowRight
            className="
              h-3.5
              w-3.5
            "
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
