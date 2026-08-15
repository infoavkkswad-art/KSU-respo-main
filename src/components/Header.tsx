import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
} from 'lucide-react';

import { brand, navLinks } from '@/data/brand';
import { useCart } from '@/context/CartContext';
import { Logo } from '@/components/Logo';

export function Header() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [scrolled, setScrolled] =
    useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { itemCount } = useCart();

  /* ==========================================================================
   * CLOSE MOBILE UI WHEN ROUTE CHANGES
   * ======================================================================== */

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /* ==========================================================================
   * HEADER SCROLL STATE
   * ======================================================================== */

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 8);

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true },
    );

    return () =>
      window.removeEventListener(
        'scroll',
        onScroll,
      );
  }, []);

  /* ==========================================================================
   * LOCK PAGE SCROLL WHEN MOBILE MENU IS OPEN
   * ======================================================================== */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* ==========================================================================
   * ESCAPE KEY
   * ======================================================================== */

  useEffect(() => {
    if (!mobileOpen && !searchOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
  }, [mobileOpen, searchOpen]);

  /* ==========================================================================
   * SEARCH
   * ======================================================================== */

  const handleSearch = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    navigate(
      `/shop?q=${encodeURIComponent(query)}`,
    );

    setSearchOpen(false);
    setSearchQuery('');
  };

  const toggleMobileMenu = () => {
    setMobileOpen((open) => !open);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ======================================================================
          ANNOUNCEMENT BAR
      ======================================================================= */}

      <div
        className="
          bg-brand-brown
          text-brand-cream
          text-center
          text-[9px]
          sm:text-2xs
          uppercase
          tracking-[0.12em]
          sm:tracking-widest
          py-2
          px-3
          sm:px-4
          border-b
          border-brand-brown/10
        "
      >
        <span className="font-medium">
          Premium Nimar Papads · FSSAI {brand.fssai} ·
          Authentic Quality
        </span>
      </div>

      {/* ======================================================================
          HEADER
      ======================================================================= */}

      <header
        className={`
          sticky
          top-0
          z-50
          transition-all
          duration-300
          border-b
          ${
            scrolled
              ? 'bg-brand-cream/95 backdrop-blur-md border-brand-brown/5 shadow-soft'
              : 'bg-brand-cream border-brand-brown/5'
          }
        `}
      >
        <div className="container-max container-px">
          <div
            className="
              flex
              items-center
              justify-between
              min-h-[64px]
              sm:min-h-[72px]
              lg:h-20
              gap-2
            "
          >
            {/* ==================================================================
                LOGO
            =================================================================== */}

            <div className="min-w-0 flex-shrink">
              <Logo />
            </div>

            {/* ==================================================================
                DESKTOP NAV
            =================================================================== */}

            <nav
              className="
                hidden
                lg:flex
                items-center
                gap-1
              "
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-medium
                      transition-all
                      ${
                        isActive
                          ? 'text-brand-red'
                          : 'text-brand-brown/80 hover:text-brand-red'
                      }
                    `
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* ==================================================================
                ACTIONS
            =================================================================== */}

            <div
              className="
                flex
                items-center
                gap-0.5
                sm:gap-1
                flex-shrink-0
              "
            >
              {/* Search */}

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(
                    (open) => !open,
                  )
                }
                className="
                  min-w-[42px]
                  min-h-[42px]
                  p-2.5
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-brand-brown
                  hover:bg-brand-brown/5
                  active:bg-brand-brown/10
                  transition-colors
                "
                aria-label={
                  searchOpen
                    ? 'Close search'
                    : 'Search products'
                }
                aria-expanded={searchOpen}
              >
                {searchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>

              {/* Cart */}

              <Link
                to="/cart"
                className="
                  relative
                  min-w-[42px]
                  min-h-[42px]
                  p-2.5
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-brand-brown
                  hover:bg-brand-brown/5
                  active:bg-brand-brown/10
                  transition-colors
                "
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />

                {itemCount > 0 && (
                  <span
                    className="
                      absolute
                      top-0.5
                      right-0.5
                      min-w-[17px]
                      h-[17px]
                      px-0.5
                      rounded-full
                      bg-brand-red
                      text-white
                      text-[9px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {itemCount > 9
                      ? '9+'
                      : itemCount}
                  </span>
                )}
              </Link>

              {/* Desktop Shop Button */}

              <Link
                to="/shop"
                className="
                  hidden
                  sm:inline-flex
                  btn-primary
                  text-sm
                  px-5
                  lg:px-6
                  py-2.5
                  ml-1
                  lg:ml-2
                  shadow-none
                  hover:shadow-glow
                "
              >
                Shop Now
              </Link>

              {/* Mobile Menu */}

              <button
                type="button"
                onClick={toggleMobileMenu}
                className="
                  lg:hidden
                  min-w-[42px]
                  min-h-[42px]
                  p-2.5
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-brand-brown
                  hover:bg-brand-brown/5
                  active:bg-brand-brown/10
                  transition-colors
                "
                aria-label={
                  mobileOpen
                    ? 'Close menu'
                    : 'Open menu'
                }
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================
            SEARCH BAR
        ======================================================================= */}

        {searchOpen && (
          <div
            className="
              border-t
              border-brand-brown/5
              bg-white
              animate-slide-down
            "
          >
            <div
              className="
                container-max
                container-px
                py-3
                sm:py-4
              "
            >
              <form
                onSubmit={handleSearch}
                className="
                  flex
                  gap-2
                "
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value,
                    )
                  }
                  placeholder="Search our papads..."
                  className="
                    input-field
                    bg-brand-cream/30
                    min-h-[44px]
                    flex-1
                    min-w-0
                  "
                  autoFocus
                  aria-label="Search products"
                />

                <button
                  type="submit"
                  className="
                    btn-primary
                    px-4
                    sm:px-6
                    min-h-[44px]
                    flex-shrink-0
                  "
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================
          MOBILE MENU
      ======================================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            lg:hidden
          "
        >
          {/* Backdrop */}

          <button
            type="button"
            className="
              absolute
              inset-0
              w-full
              h-full
              bg-brand-brown/25
              backdrop-blur-sm
              cursor-default
            "
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          />

          {/* Drawer */}

          <nav
            id="mobile-navigation"
            className="
              absolute
              right-0
              top-0
              bottom-0
              w-[min(88vw,360px)]
              max-w-full
              bg-brand-cream
              shadow-lift
              p-4
              sm:p-6
              animate-fade-in
              flex
              flex-col
              overflow-y-auto
              overscroll-contain
            "
            aria-label="Mobile navigation"
          >
            {/* Drawer Header */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                mb-5
                sm:mb-8
                pb-4
                border-b
                border-brand-brown/10
              "
            >
              <div className="min-w-0">
                <Logo />
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="
                  min-w-[42px]
                  min-h-[42px]
                  p-2
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-brand-brown
                  hover:bg-brand-brown/5
                  active:bg-brand-brown/10
                  flex-shrink-0
                "
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}

            <div className="space-y-1.5 flex-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      min-h-[48px]
                      px-4
                      py-3
                      rounded-xl
                      text-base
                      sm:text-lg
                      font-medium
                      transition-colors
                      ${
                        isActive
                          ? 'bg-brand-red/10 text-brand-red'
                          : 'text-brand-brown hover:bg-brand-brown/5'
                      }
                    `
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Drawer Bottom */}

            <div
              className="
                pt-5
                sm:pt-6
                mt-5
                border-t
                border-brand-brown/10
              "
            >
              <Link
                to="/shop"
                onClick={closeMobileMenu}
                className="
                  btn-primary
                  w-full
                  min-h-[48px]
                  justify-center
                  items-center
                  inline-flex
                "
              >
                Shop Papads
              </Link>

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="
                  mt-2
                  w-full
                  min-h-[46px]
                  justify-center
                  items-center
                  inline-flex
                  gap-2
                  rounded-xl
                  border
                  border-brand-brown/15
                  text-brand-brown
                  font-medium
                  text-sm
                  hover:bg-brand-brown/5
                  transition-colors
                "
              >
                <ShoppingBag className="w-4 h-4" />

                Cart
                {itemCount > 0 && (
                  <span className="text-brand-red">
                    ({itemCount})
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
