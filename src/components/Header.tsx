import {
  useEffect,
  useRef,
  useState,
} from 'react';

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
  ArrowRight,
} from 'lucide-react';

import {
  brand,
  navLinks,
} from '@/data/brand';

import { useCart } from '@/context/CartContext';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/context/LanguageContext';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL HEADER / NAVIGATION SYSTEM
   ========================================================================== */

export function Header() {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();


  /* ==========================================================================
     ROUTE CHANGE
     ======================================================================== */

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);


  /* ==========================================================================
     SCROLL STATE
     ======================================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 24,
      );
    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, []);


  /* ==========================================================================
     BODY LOCK
     ======================================================================== */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow =
        'hidden';
    } else {
      document.body.style.overflow =
        '';
    }

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [mobileOpen]);


  /* ==========================================================================
     KEYBOARD ESCAPE
     ======================================================================== */

  useEffect(() => {
    if (
      !mobileOpen &&
      !searchOpen
    ) {
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

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    mobileOpen,
    searchOpen,
  ]);


  /* ==========================================================================
     SEARCH AUTO FOCUS
     ======================================================================== */

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          searchInputRef.current?.focus();
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );
    };
  }, [searchOpen]);


  /* ==========================================================================
     SEARCH
     ======================================================================== */

  const handleSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const query =
      searchQuery.trim();

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(
      `/shop?q=${encodeURIComponent(
        query,
      )}`,
    );

    setSearchQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
  };


  /* ==========================================================================
     UI HELPERS
     ======================================================================== */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(
      (open) => !open,
    );

    setMobileOpen(false);
  };

  const toggleMobile = () => {
    setMobileOpen(
      (open) => !open,
    );

    setSearchOpen(false);
  };


  return (
    <>
      {/* ======================================================================
          TRUST BAR
          =================================================================== */}

      <div
        className="
          w-full
          bg-brand-green
          text-brand-ivory
        "
      >
        <div
          className="
            container-max
            container-px
            flex
            min-h-[24px]
            items-center
            justify-center
            text-center
            sm:min-h-[26px]
          "
        >
          <span
            className="
              text-[8px]
              font-medium
              uppercase
              leading-none
              tracking-[0.09em]
              sm:text-2xs
              sm:tracking-widest
            "
          >
            {t('header.trust.nimadsOwnPapad')}

            <span
              className="
                mx-1.5
                text-brand-saffron/70
              "
              aria-hidden="true"
            >
              ·
            </span>

            FSSAI {brand.fssai}
          </span>
        </div>
      </div>


      {/* ======================================================================
          MAIN HEADER
          =================================================================== */}

      <header
        className={`
          sticky
          top-0
          z-header
          w-full
          border-b
          transition-all
          duration-300
          ease-ks-standard

          ${
            scrolled
              ? `
                border-brand-green/10
                bg-brand-ivory/92
                shadow-soft
                backdrop-blur-xl
              `
              : `
                border-brand-green/5
                bg-brand-ivory
              `
          }
        `}
      >

        <div
          className="
            container-max
            container-px
          "
        >

          <div
            className="
              flex
              min-h-[56px]
              w-full
              items-center
              justify-between
              gap-2
              sm:min-h-[64px]
              lg:min-h-[70px]
            "
          >

            {/* BRAND */}

            <div
              className="
                min-w-0
                shrink-0
              "
            >
              <Logo
                imgClassName="
                  h-10
                  w-auto
                  object-contain
                  drop-shadow-[0_5px_4px_rgba(62,39,35,0.12)]
                  transition-all
                  duration-300
                  group-hover:drop-shadow-[0_8px_8px_rgba(62,39,35,0.18)]
                  group-hover:scale-[1.025]
                  sm:h-11
                  lg:h-[60px]
                "
              />
            </div>


            {/* DESKTOP NAVIGATION */}

            <nav
              className="
                hidden
                flex-1
                items-center
                justify-center
                gap-0.5
                lg:flex
              "
              aria-label={t('header.mainNavigation')}
            >
              {navLinks.map(
                (link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({
                      isActive,
                    }) =>
                      `
                        group
                        relative
                        whitespace-nowrap
                        rounded-full
                        px-2.5
                        py-1.5
                        text-sm
                        font-medium
                        transition-all
                        duration-200
                        ease-ks-standard
                        xl:px-3

                        ${
                          isActive
                            ? `
                              font-semibold
                              text-brand-green
                            `
                            : `
                              text-brand-brown/75
                              hover:-translate-y-0.5
                              hover:text-brand-green
                            `
                        }
                      `
                    }
                  >
                    {({
                      isActive,
                    }) => (
                      <>
                        {t(
                          `nav.${
                            link.path.replace(
                              '/',
                              '',
                            ) || 'home'
                          }`,
                        )}

                        <span
                          aria-hidden="true"
                          className={`
                            absolute
                            bottom-0
                            left-1/2
                            h-1
                            w-1
                            -translate-x-1/2
                            rounded-full
                            bg-brand-saffron
                            transition-all
                            duration-200

                            ${
                              isActive
                                ? `
                                  scale-100
                                  opacity-100
                                `
                                : `
                                  scale-0
                                  opacity-0
                                `
                            }
                          `}
                        />
                      </>
                    )}
                  </NavLink>
                ),
              )}
            </nav>


            {/* HEADER ACTIONS */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-end
                gap-1
                sm:gap-1.5
              "
            >

              {/* LANGUAGE */}

              <div
                className="
                  hidden
                  items-center
                  gap-1
                  rounded-full
                  border
                  border-brand-green/10
                  bg-white
                  p-1
                  shadow-soft
                  sm:flex
                "
                role="group"
                aria-label={t('header.language')}
              >
                <button
                  type="button"
                  onClick={() =>
                    setLanguage('en')
                  }
                  aria-pressed={
                    language === 'en'
                  }
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      language === 'en'
                        ? 'bg-brand-green text-white'
                        : 'text-brand-brown/70 hover:text-brand-green'
                    }
                  `}
                >
                  EN
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLanguage('hi')
                  }
                  aria-pressed={
                    language === 'hi'
                  }
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      language === 'hi'
                        ? 'bg-brand-green text-white'
                        : 'text-brand-brown/70 hover:text-brand-green'
                    }
                  `}
                >
                  हिन्दी
                </button>
              </div>


              {/* SEARCH */}

              <button
                type="button"
                onClick={toggleSearch}
                className="
                  flex
                  min-h-[40px]
                  min-w-[40px]
                  items-center
                  justify-center
                  rounded-full
                  p-2
                  text-brand-green
                  transition-all
                  duration-200
                  ease-ks-standard
                  hover:-translate-y-0.5
                  hover:bg-brand-green/5
                  hover:shadow-soft
                  active:translate-y-0
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                "
                aria-label={
                  searchOpen
                    ? t('header.closeSearch')
                    : t('header.searchProducts')
                }
                aria-expanded={
                  searchOpen
                }
                aria-controls="header-search"
              >
                {searchOpen ? (
                  <X
                    className="
                      h-5
                      w-5
                    "
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    className="
                      h-5
                      w-5
                    "
                    aria-hidden="true"
                  />
                )}
              </button>


              {/* CART */}

              <Link
                to="/cart"
                className="
                  group
                  relative
                  flex
                  min-h-[42px]
                  min-w-[42px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-brand-green/10
                  bg-white
                  p-2
                  text-brand-green
                  shadow-soft
                  transition-all
                  duration-200
                  ease-ks-standard
                  hover:-translate-y-1
                  hover:border-brand-saffron/30
                  hover:text-brand-saffron
                  hover:shadow-card
                  active:translate-y-[1px]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                "
                aria-label={t(
                  'header.cartAria',
                  { count: itemCount },
                )}
              >
                <ShoppingBag
                  className="
                    h-5
                    w-5
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                  aria-hidden="true"
                />

                {itemCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-[19px]
                      min-w-[19px]
                      items-center
                      justify-center
                      rounded-full
                      bg-brand-saffron
                      px-1
                      text-[9px]
                      font-bold
                      text-white
                      shadow-gold-glow
                    "
                    aria-hidden="true"
                  >
                    {itemCount > 9
                      ? '9+'
                      : itemCount}
                  </span>
                )}
              </Link>


              {/* SHOP CTA */}

              <Link
                to="/shop"
                className="
                  btn-primary
                  group
                  ml-1
                  hidden
                  min-h-[40px]
                  px-4
                  py-2
                  text-sm
                  md:inline-flex
                  lg:ml-2
                  lg:px-5
                "
              >
                <span>
                  {t('header.shopPapads')}
                </span>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                  aria-hidden="true"
                />
              </Link>


              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={toggleMobile}
                className="
                  flex
                  min-h-[40px]
                  min-w-[40px]
                  items-center
                  justify-center
                  rounded-full
                  p-2
                  text-brand-green
                  transition-all
                  duration-200
                  hover:bg-brand-green/5
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                  lg:hidden
                "
                aria-label={
                  mobileOpen
                    ? t('header.closeMenu')
                    : t('header.openMenu')
                }
                aria-expanded={
                  mobileOpen
                }
                aria-controls="mobile-navigation"
              >
                {mobileOpen ? (
                  <X
                    className="
                      h-6
                      w-6
                    "
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    className="
                      h-6
                      w-6
                    "
                    aria-hidden="true"
                  />
                )}
              </button>

            </div>
          </div>
        </div>


        {/* SEARCH PANEL */}

        <div
          id="header-search"
          className={`
            w-full
            overflow-hidden
            border-t
            border-brand-green/10
            bg-brand-ivory-light
            transition-all
            duration-300
            ease-ks-standard

            ${
              searchOpen
                ? `
                  max-h-40
                  opacity-100
                `
                : `
                  pointer-events-none
                  max-h-0
                  opacity-0
                `
            }
          `}
          aria-hidden={!searchOpen}
        >

          <div
            className="
              container-max
              container-px
              py-2.5
              sm:py-3
            "
          >

            <form
              onSubmit={handleSearch}
              className="
                mx-auto
                flex
                w-full
                max-w-3xl
                gap-2
              "
            >

              <label
                htmlFor="header-search-input"
                className="sr-only"
              >
                {t('header.searchProducts')}
              </label>

              <input
                ref={searchInputRef}
                id="header-search-input"
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder={t(
                  'header.searchPlaceholder',
                )}
                className="
                  input-field
                  min-h-[42px]
                  min-w-0
                  flex-1
                  bg-white/80
                "
                tabIndex={
                  searchOpen
                    ? 0
                    : -1
                }
              />

              <button
                type="submit"
                className="
                  btn-primary
                  min-h-[42px]
                  shrink-0
                  px-4
                  sm:px-6
                "
              >
                {t('header.search')}
              </button>

            </form>
          </div>
        </div>

      </header>


      {/* MOBILE NAVIGATION */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-modal
            lg:hidden
          "
        >

          {/* BACKDROP */}

          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-default
              bg-brand-green/25
              backdrop-blur-sm
            "
            aria-label={t(
              'header.closeMobileMenu',
            )}
          />


          {/* DRAWER */}

          <nav
            id="mobile-navigation"
            aria-label={t(
              'header.mobileNavigation',
            )}
            className="
              absolute
              right-0
              top-0
              flex
              h-full
              w-[min(88vw,380px)]
              max-w-full
              flex-col
              overflow-y-auto
              overscroll-contain
              bg-brand-ivory
              p-4
              shadow-modal
              animate-slide-down
              sm:p-6
            "
          >

            {/* DRAWER HEADER */}

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
                gap-3
                border-b
                border-brand-green/10
                pb-3.5
                sm:mb-5
                sm:pb-4
              "
            >

              <div className="min-w-0">
                <Logo
                  imgClassName="
                    h-10
                    w-auto
                    object-contain
                    sm:h-11
                  "
                />
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="
                  flex
                  min-h-[40px]
                  min-w-[40px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  p-2
                  text-brand-green
                  transition-all
                  hover:bg-brand-green/5
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                "
                aria-label={t(
                  'header.closeMenu',
                )}
              >
                <X
                  className="
                    h-6
                    w-6
                  "
                  aria-hidden="true"
                />
              </button>

            </div>


            {/* MOBILE LANGUAGE */}

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-brand-green/10
                bg-white
                p-1
                shadow-soft
              "
              role="group"
              aria-label={t('header.language')}
            >
              <button
                type="button"
                onClick={() =>
                  setLanguage('en')
                }
                aria-pressed={
                  language === 'en'
                }
                className={`
                  min-h-[40px]
                  flex-1
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    language === 'en'
                      ? 'bg-brand-green text-white'
                      : 'text-brand-brown/70 hover:text-brand-green'
                  }
                `}
              >
                English
              </button>

              <button
                type="button"
                onClick={() =>
                  setLanguage('hi')
                }
                aria-pressed={
                  language === 'hi'
                }
                className={`
                  min-h-[40px]
                  flex-1
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    language === 'hi'
                      ? 'bg-brand-green text-white'
                      : 'text-brand-brown/70 hover:text-brand-green'
                  }
                `}
              >
                हिन्दी
              </button>
            </div>


            {/* MOBILE NAV LINKS */}

            <div
              className="
                flex-1
                space-y-0.5
              "
            >

              {navLinks.map(
                (link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={
                      closeMobileMenu
                    }
                    className={({
                      isActive,
                    }) =>
                      `
                        flex
                        min-h-[46px]
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-4
                        py-2
                        text-base
                        font-medium
                        transition-all
                        duration-200
                        sm:min-h-[48px]
                        sm:text-lg

                        ${
                          isActive
                            ? `
                              bg-brand-green/10
                              font-semibold
                              text-brand-green
                              shadow-[inset_3px_0_0_#C88A2A]
                            `
                            : `
                              text-brand-brown
                              hover:bg-brand-green/5
                              hover:text-brand-green
                            `
                        }
                      `
                    }
                  >
                    {({
                      isActive,
                    }) => (
                      <>
                        <span>
                          {t(
                            `nav.${
                              link.path.replace(
                                '/',
                                '',
                              ) || 'home'
                            }`,
                          )}
                        </span>

                        {isActive && (
                          <span
                            className="
                              h-2
                              w-2
                              rounded-full
                              bg-brand-saffron
                            "
                            aria-hidden="true"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ),
              )}

            </div>


            {/* MOBILE COMMERCE */}

            <div
              className="
                mt-3
                border-t
                border-brand-green/10
                pt-3
                sm:mt-4
                sm:pt-4
              "
            >

              <Link
                to="/shop"
                onClick={
                  closeMobileMenu
                }
                className="
                  btn-primary
                  group
                  min-h-[48px]
                  w-full
                  shadow-green-glow
                "
              >
                <span>
                  {t('header.shopPapads')}
                </span>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                  aria-hidden="true"
                />
              </Link>


              <Link
                to="/cart"
                onClick={
                  closeMobileMenu
                }
                className="
                  mt-2
                  inline-flex
                  min-h-[46px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-brand-green/15
                  bg-white
                  text-sm
                  font-medium
                  text-brand-green
                  shadow-soft
                  transition-all
                  duration-200
                  ease-ks-standard
                  hover:-translate-y-0.5
                  hover:bg-brand-green/5
                  active:translate-y-[1px]
                "
              >

                <ShoppingBag
                  className="
                    h-4
                    w-4
                  "
                  aria-hidden="true"
                />

                {t('header.cart')}

                {itemCount > 0 && (
                  <span
                    className="
                      font-semibold
                      text-brand-saffron
                    "
                  >
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
