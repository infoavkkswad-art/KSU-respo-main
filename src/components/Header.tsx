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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, searchOpen]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/shop?q=${encodeURIComponent(query)}`);

    setSearchQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Brand announcement */}
      <div className="w-full bg-brand-green text-brand-ivory">
        <div className="container-max container-px flex min-h-[32px] items-center justify-center text-center">
          <span className="text-[9px] font-medium uppercase tracking-[0.12em] leading-relaxed sm:text-2xs sm:tracking-widest">
            Nimar's Own Papad · FSSAI {brand.fssai}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`
          sticky top-0 z-50 w-full border-b
          transition-all duration-300
          ${
            scrolled
              ? 'border-brand-green/10 bg-brand-ivory/95 shadow-soft backdrop-blur-md'
              : 'border-brand-green/5 bg-brand-ivory'
          }
        `}
      >
        <div className="container-max container-px">
          <div
            className="
              flex min-h-[68px] w-full items-center
              justify-between gap-2
              sm:min-h-[76px] lg:h-[84px]
            "
          >
            {/* ==========================================================
                3D BRAND LOGO
            ========================================================== */}
            <div
              className="
                min-w-0 shrink-0
                transition-transform duration-300
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  relative
                  drop-shadow-[0_5px_4px_rgba(62,39,35,0.12)]
                  transition-all duration-300
                  hover:drop-shadow-[0_8px_8px_rgba(62,39,35,0.18)]
                "
              >
                <Logo
                  imgClassName="
                    h-12 w-auto object-contain
                    sm:h-14
                    lg:h-[68px]
                    transition-transform duration-300
                    hover:scale-[1.025]
                  "
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="
                hidden flex-1 items-center
                justify-center gap-1 lg:flex
              "
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `
                      relative whitespace-nowrap rounded-full
                      px-3 py-2 text-sm font-medium
                      transition-all duration-200
                      xl:px-4
                      ${
                        isActive
                          ? 'text-brand-green'
                          : 'text-brand-brown/75 hover:-translate-y-0.5 hover:text-brand-green'
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="
                            absolute bottom-0 left-1/2
                            h-1 w-1 -translate-x-1/2
                            rounded-full bg-brand-saffron
                            shadow-[0_1px_3px_rgba(230,126,34,0.45)]
                          "
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">

              {/* Search */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((open) => !open);
                  setMobileOpen(false);
                }}
                className="
                  flex min-h-[44px] min-w-[44px]
                  items-center justify-center
                  rounded-full p-2.5
                  text-brand-green
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-brand-green/5
                  hover:shadow-[0_4px_10px_rgba(62,39,35,0.08)]
                  active:translate-y-0
                "
                aria-label={
                  searchOpen
                    ? 'Close search'
                    : 'Search products'
                }
                aria-expanded={searchOpen}
              >
                {searchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              {/* ========================================================
                  3D CART
              ======================================================== */}
              <Link
                to="/cart"
                className="
                  group relative flex min-h-[46px] min-w-[46px]
                  items-center justify-center
                  rounded-full
                  border border-brand-green/10
                  bg-white
                  p-2.5 text-brand-green
                  shadow-[0_3px_0_rgba(62,39,35,0.10),0_5px_12px_rgba(62,39,35,0.08)]
                  transition-all duration-200
                  hover:-translate-y-1
                  hover:border-brand-saffron/25
                  hover:text-brand-saffron
                  hover:shadow-[0_5px_0_rgba(62,39,35,0.10),0_9px_18px_rgba(62,39,35,0.12)]
                  active:translate-y-[1px]
                  active:shadow-[0_2px_0_rgba(62,39,35,0.10),0_3px_7px_rgba(62,39,35,0.08)]
                "
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingBag
                  className="
                    h-5 w-5
                    transition-transform duration-200
                    group-hover:scale-105
                  "
                />

                {itemCount > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1
                      flex h-[19px] min-w-[19px]
                      items-center justify-center
                      rounded-full
                      bg-brand-saffron
                      px-1
                      text-[9px] font-bold text-white
                      shadow-[0_2px_5px_rgba(230,126,34,0.35)]
                    "
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* ========================================================
                  3D SHOP CTA
              ======================================================== */}
              <Link
                to="/shop"
                className="
                  btn-primary
                  ml-1 hidden min-h-[44px]
                  px-4 py-2 text-sm
                  shadow-[0_4px_0_rgba(190,75,25,0.65),0_7px_14px_rgba(62,39,35,0.12)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_5px_0_rgba(190,75,25,0.65),0_10px_20px_rgba(62,39,35,0.15)]
                  active:translate-y-[2px]
                  active:shadow-[0_2px_0_rgba(190,75,25,0.65),0_4px_8px_rgba(62,39,35,0.10)]
                  md:inline-flex
                  lg:ml-2 lg:px-5
                "
              >
                Shop Papads
              </Link>

              {/* Mobile Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen((open) => !open);
                  setSearchOpen(false);
                }}
                className="
                  flex min-h-[44px] min-w-[44px]
                  items-center justify-center
                  rounded-full p-2.5
                  text-brand-green
                  transition-all duration-200
                  hover:bg-brand-green/5
                  active:scale-95
                  lg:hidden
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
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        {searchOpen && (
          <div className="w-full border-t border-brand-green/10 bg-brand-ivory-light animate-slide-down">
            <div className="container-max container-px py-3 sm:py-4">
              <form
                onSubmit={handleSearch}
                className="mx-auto flex w-full max-w-3xl gap-2"
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search papads..."
                  className="
                    input-field min-h-[44px]
                    min-w-0 flex-1 bg-white/70
                  "
                  autoFocus
                  aria-label="Search products"
                />

                <button
                  type="submit"
                  className="
                    btn-primary min-h-[44px] shrink-0
                    px-4 sm:px-6
                    shadow-[0_3px_0_rgba(190,75,25,0.55)]
                    active:translate-y-[1px]
                  "
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              absolute inset-0 h-full w-full
              cursor-default bg-brand-green/25
              backdrop-blur-sm
            "
            aria-label="Close mobile menu"
          />

          {/* Drawer */}
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="
              absolute right-0 top-0
              flex h-full w-[min(88vw,380px)]
              max-w-full flex-col
              overflow-y-auto overscroll-contain
              bg-brand-ivory p-4
              shadow-lift animate-fade-in
              sm:p-6
            "
          >
            {/* Drawer Header */}
            <div
              className="
                mb-5 flex items-center justify-between
                gap-3 border-b border-brand-green/10
                pb-4 sm:mb-7
              "
            >
              <div className="min-w-0">
                <Logo
                  imgClassName="
                    h-12 w-auto object-contain
                    sm:h-14
                    drop-shadow-[0_5px_4px_rgba(62,39,35,0.12)]
                  "
                />
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="
                  flex min-h-[42px] min-w-[42px]
                  shrink-0 items-center justify-center
                  rounded-full p-2 text-brand-green
                  transition-all
                  hover:bg-brand-green/5
                  active:scale-95
                "
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 space-y-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `
                      flex min-h-[48px] w-full items-center
                      rounded-xl px-4 py-3
                      text-base font-medium
                      transition-all sm:text-lg
                      ${
                        isActive
                          ? 'bg-brand-green/10 text-brand-green shadow-[inset_3px_0_0_#E67E22]'
                          : 'text-brand-brown hover:bg-brand-green/5'
                      }
                    `
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="mt-5 border-t border-brand-green/10 pt-5 sm:mt-6 sm:pt-6">
              <Link
                to="/shop"
                onClick={closeMobileMenu}
                className="
                  btn-primary inline-flex min-h-[50px] w-full
                  items-center justify-center
                  shadow-[0_4px_0_rgba(190,75,25,0.65),0_8px_16px_rgba(62,39,35,0.12)]
                  active:translate-y-[2px]
                "
              >
                Shop Papads
              </Link>

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="
                  mt-3 inline-flex min-h-[48px] w-full
                  items-center justify-center gap-2
                  rounded-xl border border-brand-green/15
                  bg-white
                  text-sm font-medium text-brand-green
                  shadow-[0_3px_0_rgba(62,39,35,0.08)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-brand-green/5
                  active:translate-y-[1px]
                "
              >
                <ShoppingBag className="h-4 w-4" />
                Cart

                {itemCount > 0 && (
                  <span className="text-brand-saffron">
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
