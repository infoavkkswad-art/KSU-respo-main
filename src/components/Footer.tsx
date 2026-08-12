import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Youtube, MessageCircle, MapPin, Send } from 'lucide-react';
import { brand, footerLinks } from '@/data/brand';
import { Logo } from '@/components/Logo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <footer className="bg-brand-brown text-brand-cream mt-20">
      {/* Newsletter */}
      <div className="border-b border-brand-cream/10">
        <div className="container-max container-px py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                Stay in the loop
              </h3>
              <p className="text-brand-cream/70 text-sm">
                Get product updates, recipes and special offers from Kawad Swad.
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-full bg-brand-cream/10 text-white placeholder:text-brand-cream/40 border border-brand-cream/15 focus:border-brand-yellow focus:ring-0"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn-yellow shrink-0">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
          </div>
          {submitted && (
            <p className="mt-3 text-sm text-brand-yellow animate-fade-in">
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="container-max container-px py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-brand-cream/70 mb-4 max-w-xs">
              Premium Papad from Nimar, Madhya Pradesh. {brand.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href={brand.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-cream/10 hover:bg-brand-red flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={brand.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-cream/10 hover:bg-brand-red flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-cream/10 hover:bg-brand-red flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Brand</h4>
            <ul className="space-y-2.5">
              {footerLinks.brand.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Business</h4>
            <ul className="space-y-2.5">
              {footerLinks.business.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-10 pt-8 border-t border-brand-cream/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href={`tel:${brand.phoneRaw}`} className="flex items-center gap-3 text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
            <Phone className="w-4 h-4 shrink-0" />
            {brand.phone}
          </a>
          <a href={`mailto:${brand.email}`} className="flex items-center gap-3 text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
            <Mail className="w-4 h-4 shrink-0" />
            {brand.email}
          </a>
          <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-brand-cream/70 hover:text-brand-yellow transition-colors">
            <MessageCircle className="w-4 h-4 shrink-0" />
            WhatsApp: {brand.phone}
          </a>
          <div className="flex items-center gap-3 text-sm text-brand-cream/70">
            <MapPin className="w-4 h-4 shrink-0" />
            {brand.region}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-cream/10">
        <div className="container-max container-px py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-brand-cream/50">
          <p>
            © {new Date().getFullYear()} {brand.manufacturer}. All rights reserved.
          </p>
          <p>
            FSSAI: {brand.fssai} · {brand.dietType}
          </p>
        </div>
      </div>
    </footer>
  );
}
