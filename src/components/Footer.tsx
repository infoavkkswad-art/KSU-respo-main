import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Send,
} from 'lucide-react';

import { brand, footerLinks } from '@/data/brand';
import { Logo } from '@/components/Logo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail('');

    window.setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <footer
      className="
        mt-12
        overflow-hidden
        bg-brand-brown
        text-brand-cream
        sm:mt-16
        lg:mt-20
      "
    >
      {/* ================================================================
          NEWSLETTER
      ================================================================= */}

      <div className="border-b border-brand-cream/10">
        <div
          className="
            container-max
            container-px
            py-9
            sm:py-12
            lg:py-14
          "
        >
          <div
            className="
              grid
              items-center
              gap-6
              md:grid-cols-2
              md:gap-10
            "
          >
            <div className="min-w-0">
              <span
                className="
                  mb-2
                  block
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-brand-yellow
                  sm:text-xs
                "
              >
                Stay Connected
              </span>

              <h3
                className="
                  font-serif
                  text-2xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-3xl
                "
              >
                Stay in the loop
              </h3>

              <p
                className="
                  mt-2
                  max-w-lg
                  text-sm
                  leading-relaxed
                  text-brand-cream/70
                  sm:text-base
                "
              >
                Get product updates, recipes and special
                offers from Kawad Swad.
              </p>
            </div>

            <div className="min-w-0">
              <form
                onSubmit={handleNewsletter}
                className="
                  flex
                  w-full
                  flex-col
                  gap-2
                  sm:flex-row
                "
              >
                <label
                  htmlFor="footer-newsletter-email"
                  className="sr-only"
                >
                  Email address
                </label>

                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Your email address"
                  required
                  autoComplete="email"
                  className="
                    min-h-[48px]
                    min-w-0
                    flex-1
                    rounded-full
                    border
                    border-brand-cream/15
                    bg-brand-cream/10
                    px-5
                    py-3
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-brand-cream/40
                    focus:border-brand-yellow
                    focus:ring-2
                    focus:ring-brand-yellow/20
                  "
                />

                <button
                  type="submit"
                  className="
                    btn-yellow
                    min-h-[48px]
                    w-full
                    shrink-0
                    px-5
                    sm:w-auto
                  "
                >
                  <Send className="h-4 w-4" />

                  <span>
                    Subscribe
                  </span>
                </button>
              </form>

              {submitted && (
                <p
                  className="
                    mt-3
                    text-xs
                    font-medium
                    text-brand-yellow
                    animate-fade-in
                  "
                  role="status"
                >
                  Thank you for subscribing!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          MAIN FOOTER
      ================================================================= */}

      <div
        className="
          container-max
          container-px
          py-10
          sm:py-12
          lg:py-14
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-x-6
            gap-y-10
            sm:gap-x-8
            md:grid-cols-4
            lg:grid-cols-5
            lg:gap-10
          "
        >
          {/* Brand */}
          <div
            className="
              col-span-2
              min-w-0
              md:col-span-4
              lg:col-span-1
            "
          >
            <div className="mb-4">
              <Logo />
            </div>

            <p
              className="
                mb-5
                max-w-xs
                text-sm
                leading-relaxed
                text-brand-cream/70
              "
            >
              Premium Papad from Nimar, Madhya Pradesh.
              {' '}
              {brand.tagline}
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={brand.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-cream/10
                  transition-colors
                  hover:bg-brand-red
                  focus-visible:ring-2
                  focus-visible:ring-brand-yellow
                "
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>

              <a
                href={brand.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-cream/10
                  transition-colors
                  hover:bg-brand-red
                  focus-visible:ring-2
                  focus-visible:ring-brand-yellow
                "
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>

              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-cream/10
                  transition-colors
                  hover:bg-brand-red
                  focus-visible:ring-2
                  focus-visible:ring-brand-yellow
                "
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Brand links */}
          <div className="min-w-0">
            <h4
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                sm:text-xs
              "
            >
              Brand
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.brand.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="
                      inline-block
                      py-0.5
                      text-xs
                      leading-relaxed
                      text-brand-cream/65
                      transition-colors
                      hover:text-brand-yellow
                      sm:text-sm
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop links */}
          <div className="min-w-0">
            <h4
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                sm:text-xs
              "
            >
              Shop
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="
                      inline-block
                      py-0.5
                      text-xs
                      leading-relaxed
                      text-brand-cream/65
                      transition-colors
                      hover:text-brand-yellow
                      sm:text-sm
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business links */}
          <div className="min-w-0">
            <h4
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                sm:text-xs
              "
            >
              Business
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.business.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="
                      inline-block
                      py-0.5
                      text-xs
                      leading-relaxed
                      text-brand-cream/65
                      transition-colors
                      hover:text-brand-yellow
                      sm:text-sm
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="min-w-0">
            <h4
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                sm:text-xs
              "
            >
              Support
            </h4>

            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="
                      inline-block
                      py-0.5
                      text-xs
                      leading-relaxed
                      text-brand-cream/65
                      transition-colors
                      hover:text-brand-yellow
                      sm:text-sm
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ==============================================================
            CONTACT INFORMATION
        ============================================================== */}

        <div
          className="
            mt-10
            grid
            gap-3
            border-t
            border-brand-cream/10
            pt-8
            sm:grid-cols-2
            lg:mt-12
            lg:grid-cols-4
            lg:gap-4
          "
        >
          <a
            href={`tel:${brand.phoneRaw}`}
            className="
              flex
              min-w-0
              min-h-[42px]
              items-center
              gap-3
              rounded-lg
              text-xs
              leading-relaxed
              text-brand-cream/65
              transition-colors
              hover:text-brand-yellow
              sm:text-sm
            "
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">
              {brand.phone}
            </span>
          </a>

          <a
            href={`mailto:${brand.email}`}
            className="
              flex
              min-w-0
              min-h-[42px]
              items-center
              gap-3
              rounded-lg
              text-xs
              leading-relaxed
              text-brand-cream/65
              transition-colors
              hover:text-brand-yellow
              sm:text-sm
            "
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">
              {brand.email}
            </span>
          </a>

          <a
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              min-w-0
              min-h-[42px]
              items-center
              gap-3
              rounded-lg
              text-xs
              leading-relaxed
              text-brand-cream/65
              transition-colors
              hover:text-brand-yellow
              sm:text-sm
            "
          >
            <MessageCircle className="h-4 w-4 shrink-0" />

            <span className="min-w-0 break-words">
              WhatsApp: {brand.phone}
            </span>
          </a>

          <div
            className="
              flex
              min-w-0
              min-h-[42px]
              items-center
              gap-3
              rounded-lg
              text-xs
              leading-relaxed
              text-brand-cream/65
              sm:text-sm
            "
          >
            <MapPin className="h-4 w-4 shrink-0" />

            <span className="min-w-0 break-words">
              {brand.region}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          BOTTOM BAR
      ================================================================= */}

      <div className="border-t border-brand-cream/10">
        <div
          className="
            container-max
            container-px
            flex
            flex-col
            items-center
            justify-between
            gap-2
            py-5
            text-center
            text-[10px]
            leading-relaxed
            text-brand-cream/50
            sm:flex-row
            sm:text-left
            sm:text-2xs
          "
        >
          <p>
            © {new Date().getFullYear()}{' '}
            {brand.manufacturer}. All rights reserved.
          </p>

          <p>
            FSSAI: {brand.fssai}
            {' · '}
            {brand.dietType}
          </p>
        </div>
      </div>
    </footer>
  );
}
