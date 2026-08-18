import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Send,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

import { brand, footerLinks } from '@/data/brand';
import { Logo } from '@/components/Logo';

/* ==========================================================================
   KAWAD SWAD 2.0
   PREMIUM FOOTER SYSTEM

   Hierarchy:
   TRUST → DISCOVER → SHOP → BUSINESS → SUPPORT → CONTACT

   Design goals:
   - Stronger premium finish
   - Larger dimensional brand presence
   - Better mobile spacing
   - Better interaction states
   - No dependency on custom Tailwind classes outside the current system
   - Accessible newsletter feedback
   ========================================================================== */

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    setSubmitted(true);
    setEmail('');

    window.setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const linkClass = `
    group
    inline-flex
    min-w-0
    items-center
    gap-1.5
    py-1
    text-xs
    leading-relaxed
    text-brand-cream/65
    transition-all
    duration-200
    hover:translate-x-0.5
    hover:text-brand-saffron-light
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-brand-saffron
    focus-visible:ring-offset-2
    focus-visible:ring-offset-brand-brown
    sm:text-sm
  `;

  return (
    <footer
      className="
        relative
        mt-12
        overflow-hidden
        bg-brand-brown
        text-brand-cream
        sm:mt-16
        lg:mt-20
      "
    >
      {/* ======================================================================
          AMBIENT BRAND LAYER
          =================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-warm-glow
          opacity-20
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-36
          h-80
          w-80
          rounded-full
          border
          border-brand-saffron/10
          shadow-[0_0_100px_rgba(200,138,42,0.05)]
          sm:h-96
          sm:w-96
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-44
          -left-32
          h-96
          w-96
          rounded-full
          border
          border-brand-cream/5
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-dots
          opacity-[0.025]
        "
        aria-hidden="true"
      />


      {/* ======================================================================
          NEWSLETTER
          =================================================================== */}

      <div
        className="
          relative
          border-b
          border-brand-cream/10
        "
      >
        <div
          className="
            container-max
            container-px
            py-10
            sm:py-12
            lg:py-16
          "
        >
          <div
            className="
              grid
              items-center
              gap-7
              md:grid-cols-[1fr_auto]
              md:gap-12
              lg:gap-20
            "
          >
            <div className="min-w-0">
              <span
                className="
                  section-eyebrow
                  mb-2.5
                  block
                  text-brand-saffron-light
                "
              >
                Stay Connected
              </span>

              <h3
                className="
                  text-balance
                  font-serif
                  text-2xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                Keep the Swad coming.
              </h3>

              <p
                className="
                  mt-3
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

            <div className="min-w-0 md:w-[420px] lg:w-[480px]">
              <form
                onSubmit={handleNewsletter}
                className="
                  flex
                  w-full
                  flex-col
                  gap-2.5
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
                    min-h-[50px]
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
                    transition-all
                    duration-200
                    focus:border-brand-saffron
                    focus:bg-brand-cream/15
                    focus:ring-2
                    focus:ring-brand-saffron/20
                  "
                />

                <button
                  type="submit"
                  className="
                    btn-yellow
                    min-h-[50px]
                    w-full
                    shrink-0
                    px-5
                    sm:w-auto
                  "
                >
                  <Send
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Subscribe
                </button>
              </form>

              {submitted && (
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-brand-saffron-light
                    animate-fade-in
                  "
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  Thank you for subscribing!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ======================================================================
          MAIN FOOTER
          =================================================================== */}

      <div
        className="
          relative
          container-max
          container-px
          py-11
          sm:py-14
          lg:py-16
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

          {/* ==================================================================
              BRAND COLUMN
              ================================================================= */}

          <div
            className="
              col-span-2
              min-w-0
              md:col-span-4
              lg:col-span-1
            "
          >
            <div
              className="
                mb-5
                w-fit
              "
            >
              <div
                className="
                  relative
                  rounded-2xl
                  p-1
                  transition-transform
                  duration-300
                  hover:-translate-y-0.5
                "
              >
                {/* Dimensional logo grounding */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-[8%]
                    right-[8%]
                    h-3
                    rounded-[50%]
                    bg-black/20
                    blur-md
                  "
                  aria-hidden="true"
                />

                <div
                  className="
                    relative
                    z-10
                    rounded-xl
                    bg-white/[0.03]
                    px-1
                    py-1
                    shadow-[0_12px_28px_rgba(0,0,0,0.12)]
                  "
                >
                  <Logo
                    imgClassName="
                      h-16
                      sm:h-[72px]
                      lg:h-20
                    "
                  />
                </div>
              </div>
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

            <div className="flex flex-wrap gap-2.5">
              <SocialLink
                href={brand.instagramUrl}
                label="Instagram"
              >
                <Instagram
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </SocialLink>

              <SocialLink
                href={brand.youtubeUrl}
                label="YouTube"
              >
                <Youtube
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </SocialLink>

              <SocialLink
                href={brand.whatsappUrl}
                label="WhatsApp"
              >
                <MessageCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </SocialLink>
            </div>
          </div>


          {/* ==================================================================
              LINK GROUPS
              ================================================================= */}

          <FooterLinkGroup
            title="Brand"
            links={footerLinks.brand}
            linkClass={linkClass}
          />

          <FooterLinkGroup
            title="Shop"
            links={footerLinks.shop}
            linkClass={linkClass}
          />

          <FooterLinkGroup
            title="Business"
            links={footerLinks.business}
            linkClass={linkClass}
          />

          <FooterLinkGroup
            title="Support"
            links={footerLinks.support}
            linkClass={linkClass}
          />
        </div>


        {/* ======================================================================
            CONTACT INFORMATION
            =================================================================== */}

        <div
          className="
            mt-10
            grid
            gap-2
            border-t
            border-brand-cream/10
            pt-8
            sm:mt-12
            sm:grid-cols-2
            sm:gap-3
            lg:grid-cols-4
            lg:gap-4
          "
        >
          <ContactItem
            href={`tel:${brand.phoneRaw}`}
            icon={<Phone className="h-4 w-4" />}
            label={brand.phone}
          />

          <ContactItem
            href={`mailto:${brand.email}`}
            icon={<Mail className="h-4 w-4" />}
            label={brand.email}
          />

          <ContactItem
            href={brand.whatsappUrl}
            icon={
              <MessageCircle className="h-4 w-4" />
            }
            label={`WhatsApp: ${brand.phone}`}
            external
          />

          <ContactItem
            icon={<MapPin className="h-4 w-4" />}
            label={brand.region}
          />
        </div>
      </div>


      {/* ======================================================================
          BOTTOM BAR
          =================================================================== */}

      <div
        className="
          relative
          border-t
          border-brand-cream/10
          bg-black/10
        "
      >
        <div
          className="
            container-max
            container-px
            flex
            flex-col
            items-center
            justify-between
            gap-3
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


/* ============================================================================
   SOCIAL LINK
   ========================================================================== */

interface SocialLinkProps {
  href: string;
  label: string;
  children: ReactNode;
}

function SocialLink({
  href,
  label,
  children,
}: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        border
        border-brand-cream/10
        bg-brand-cream/10
        text-brand-cream
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-brand-saffron/30
        hover:bg-brand-saffron
        hover:text-white
        hover:shadow-glow
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-brown
      "
      aria-label={label}
    >
      {children}
    </a>
  );
}


/* ============================================================================
   FOOTER LINK GROUP
   ========================================================================== */

interface FooterLink {
  label: string;
  path: string;
}

interface FooterLinkGroupProps {
  title: string;
  links: readonly FooterLink[];
  linkClass: string;
}

function FooterLinkGroup({
  title,
  links,
  linkClass,
}: FooterLinkGroupProps) {
  return (
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
        {title}
      </h4>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={linkClass}
            >
              <span className="min-w-0 break-words">
                {link.label}
              </span>

              <ArrowUpRight
                className="
                  h-3
                  w-3
                  shrink-0
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                  group-hover:opacity-70
                "
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


/* ============================================================================
   CONTACT ITEM
   ========================================================================== */

interface ContactItemProps {
  href?: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}

function ContactItem({
  href,
  icon,
  label,
  external = false,
}: ContactItemProps) {
  const content = (
    <>
      <span
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-brand-cream/[0.08]
          text-brand-saffron-light
          transition-all
          duration-200
          group-hover:bg-brand-saffron/15
        "
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="min-w-0 break-words">
        {label}
      </span>
    </>
  );

  if (!href) {
    return (
      <div
        className="
          flex
          min-w-0
          min-h-[42px]
          items-center
          gap-3
          text-xs
          leading-relaxed
          text-brand-cream/65
          sm:text-sm
        "
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={
        external
          ? 'noopener noreferrer'
          : undefined
      }
      className="
        group
        flex
        min-w-0
        min-h-[42px]
        items-center
        gap-3
        rounded-xl
        text-xs
        leading-relaxed
        text-brand-cream/65
        transition-all
        duration-200
        hover:bg-brand-cream/5
        hover:text-brand-saffron-light
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        sm:text-sm
      "
    >
      {content}
    </a>
  );
}
