import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-brand-brown text-brand-cream text-center text-2xs uppercase tracking-widest py-2 px-4 border-b border-brand-brown/10">
        <span className="font-medium">
          Premium Nimar Papads · FSSAI {brand.fssai} · Authentic Quality
        </span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-brand-cream/95 backdrop-blur-md border-brand-brown/5 shadow-soft'
            : 'bg-brand-cream border-brand-brown/5'
        }`}
      >
        <div className="container-max container-px">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'text-brand-red'
                        : 'text-brand-brown/80 hover:text-brand-red'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2.5 rounded-full text-brand-brown hover:bg-brand-brown/5 transition-colors"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/cart"
                className="relative p-2.5 rounded-full text-brand-brown hover:bg-brand-brown/5 transition-colors"
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              <Link to="/shop" className="hidden sm:inline-flex btn-primary text-sm px-6 py-2.5 ml-2 shadow-none hover:shadow-glow">
                Shop Now
              </Link>

              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden p-2.5 rounded-full text-brand-brown hover:bg-brand-brown/5"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-brand-brown/5 bg-white animate-slide-down">
            <div className="container-max container-px py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search our papads..."
                  className="input-field bg-brand-cream/30"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-6">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-brown/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute right-0 top-0 bottom-0 w-80 bg-brand-cream shadow-lift p-6 animate-fade-in flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-brown/10">
                <Logo />
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-brand-brown/5">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-3 rounded-lg text-lg font-medium text-brand-brown hover:bg-brand-brown/5 transition-colors"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-brand-brown/10">
              <Link to="/shop" className="btn-primary w-full justify-center">
                Shop Papads
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
