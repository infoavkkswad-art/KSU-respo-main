import {
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

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

import {
  brand,
  footerLinks,
} from '@/data/brand';

import { Logo } from '@/components/Logo';


/* ==========================================================================
   KAWAD SWAD 2.0
   PREMIUM FOOTER SYSTEM

   Hierarchy:
   TRUST → DISCOVER → SHOP → BUSINESS → SUPPORT → CONTACT

   Design goals:
   - Compact premium footer
   - Strong brand presence
   - Clear newsletter section
   - Efficient link grouping
   - Strong mobile usability
   - Premium social-media presentation
   - Consistent Kawad Swad visual language
   ========================================================================== */


/* ==========================================================================
   FOOTER
   ========================================================================== */

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] =
    useState(false);


  /* ==========================================================================
     NEWSLETTER
     ======================================================================== */

  const handleNewsletter = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      return;
    }

    setSubmitted(true);
    setEmail('');

    window.setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };


  /* ==========================================================================
     SHARED LINK STYLE
     ======================================================================== */

  const linkClass = `
    group
    inline-flex
    min-w-0
    items-center
    gap-1.5
    py-0.5
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
        mt-4
        overflow-hidden
        bg-brand-brown
        text-brand-cream
        sm:mt-6
        lg:mt-8
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
          -right-24
          -top-28
          h-60
          w-60
          rounded-full
          border
          border-brand-saffron/10
          shadow-[0_0_80px_rgba(200,138,42,0.05)]
          sm:-right-28
          sm:-top-32
          sm:h-72
          sm:w-72
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -left-24
          h-72
          w-72
          rounded-full
          border
          border-brand-cream/5
          sm:-bottom-36
          sm:-left-28
          sm:h-80
          sm:w-80
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
            py-5
            sm:py-6
            lg:py-7
          "
        >

          <div
            className="
              grid
              items-center
              gap-4
              md:grid-cols-[1fr_auto]
              md:gap-7
              lg:gap-10
            "
          >

            {/* --------------------------------------------------------------
                NEWSLETTER COPY
                -------------------------------------------------------------- */}

            <div className="min-w-0">

              <span
                className="
                  section-eyebrow
                  mb-1
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
                  text-xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-2xl
                  lg:text-[1.65rem]
                "
              >
                Keep the Swad coming.
              </h3>

              <p
                className="
                  mt-1
                  max-w-lg
                  text-xs
                  leading-relaxed
                  text-brand-cream/70
                  sm:text-sm
                "
              >
                Get product updates, recipes and special
                offers from Kawad Swad.
              </p>

            </div>


            {/* --------------------------------------------------------------
                NEWSLETTER FORM
                -------------------------------------------------------------- */}

            <div
              className="
                min-w-0
                md:w-[340px]
                lg:w-[400px]
              "
            >

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
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="Your email address"
                  required
                  autoComplete="email"
                  className="
                    min-h-[42px]
                    min-w-0
                    flex-1
                    rounded-full
                    border
                    border-brand-cream/15
                    bg-brand-cream/10
                    px-4
                    py-2
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
                    min-h-[42px]
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
                    mt-1.5
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
                    className="
                      h-4
                      w-4
                      shrink-0
                    "
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
          py-6
          sm:py-7
          lg:py-8
        "
      >

        <div
          className="
            grid
            grid-cols-2
            gap-x-5
            gap-y-5
            sm:gap-x-7
            md:grid-cols-4
            lg:grid-cols-5
            lg:gap-6
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
                mb-2.5
                w-fit
              "
            >

              <div
                className="
                  relative
                  rounded-2xl
                  p-0.5
                  transition-transform
                  duration-300
                  hover:-translate-y-0.5
                "
              >

                {/* Grounding shadow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-[8%]
                    right-[8%]
                    h-2
                    rounded-[50%]
                    bg-black/20
                    blur-md
                  "
                  aria-hidden="true"
                />


                {/* Logo surface */}

                <div
                  className="
                    relative
                    z-10
                    rounded-xl
                    bg-white/[0.03]
                    px-0.5
                    py-0.5
                    shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                  "
                >

                  <Logo
                    imgClassName="
                      h-12
                      sm:h-13
                      lg:h-15
                    "
                  />

                </div>

              </div>

            </div>


            <p
              className="
                mb-3
                max-w-xs
                text-xs
                leading-relaxed
                text-brand-cream/70
                sm:text-sm
              "
            >
              Premium Papad from Nimar, Madhya Pradesh.
              {' '}
              {brand.tagline}
            </p>


            {/* ==================================================================
                PREMIUM SOCIAL BUTTONS
                ================================================================== */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <SocialLink
                href={brand.instagramUrl}
                label="Instagram"
                platform="instagram"
              >
                <Instagram
                  className="
                    relative
                    z-10
                    h-[18px]
                    w-[18px]
                  "
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </SocialLink>


              <SocialLink
                href={brand.youtubeUrl}
                label="YouTube"
                platform="youtube"
              >
                <Youtube
                  className="
                    relative
                    z-10
                    h-[19px]
                    w-[19px]
                  "
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </SocialLink>


              <SocialLink
                href={brand.whatsappUrl}
                label="WhatsApp"
                platform="whatsapp"
              >
                <MessageCircle
                  className="
                    relative
                    z-10
                    h-[18px]
                    w-[18px]
                  "
                  strokeWidth={2}
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
            mt-5
            grid
            gap-1
            border-t
            border-brand-cream/10
            pt-3.5
            sm:mt-6
            sm:grid-cols-2
            sm:gap-1.5
            lg:grid-cols-4
            lg:gap-2
          "
        >

          <ContactItem
            href={`tel:${brand.phoneRaw}`}
            icon={
              <Phone className="h-4 w-4" />
            }
            label={brand.phone}
          />


          <ContactItem
            href={`mailto:${brand.email}`}
            icon={
              <Mail className="h-4 w-4" />
            }
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
            icon={
              <MapPin className="h-4 w-4" />
            }
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
            gap-1
            py-2.5
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
  platform:
    | 'instagram'
    | 'youtube'
    | 'whatsapp';
  children: ReactNode;
}


function SocialLink({
  href,
  label,
  platform,
  children,
}: SocialLinkProps) {

  const platformLabel = {
    instagram: 'Instagram',
    youtube: 'YouTube',
    whatsapp: 'WhatsApp',
  }[platform];


  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={platformLabel}
      className="
        group/social
        relative
        flex
        h-11
        w-11
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-brand-cream/15
        bg-brand-cream/[0.08]
        text-brand-cream
        shadow-[0_5px_14px_rgba(0,0,0,0.12)]
        backdrop-blur-sm
        transition-all
        duration-300
        ease-ks-standard
        hover:-translate-y-1
        hover:border-brand-saffron/50
        hover:bg-brand-saffron
        hover:text-white
        hover:shadow-[0_10px_24px_rgba(200,138,42,0.25)]
        active:translate-y-[1px]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-brown
        sm:h-12
        sm:w-12
      "
    >

      {/* ==================================================================
          TOP GLASS HIGHLIGHT
          ================================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-1
          top-1
          h-1/2
          rounded-t-lg
          bg-gradient-to-b
          from-white/15
          to-transparent
          opacity-70
          transition-opacity
          duration-300
          group-hover/social:opacity-100
        "
      />


      {/* ==================================================================
          INNER DEPTH
          ================================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-xl
          shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-2px_0_rgba(0,0,0,0.12)]
        "
      />


      {/* ==================================================================
          HOVER GLOW
          ================================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -inset-4
          rounded-full
          bg-brand-saffron/20
          opacity-0
          blur-xl
          transition-opacity
          duration-300
          group-hover/social:opacity-100
        "
      />


      {/* ==================================================================
          ICON
          ================================================================== */}

      <span
        className="
          relative
          z-10
          flex
          items-center
          justify-center
          transition-transform
          duration-300
          ease-ks-spring
          group-hover/social:scale-110
        "
      >
        {children}
      </span>


      {/* ==================================================================
          SHINE SWEEP
          ================================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-8
          top-0
          h-full
          w-5
          rotate-[18deg]
          bg-white/25
          blur-sm
          transition-transform
          duration-500
          ease-ks-standard
          group-hover/social:translate-x-[70px]
        "
      />

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
          mb-2
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


      <ul className="space-y-0.5">

        {links.map((link) => (

          <li
            key={link.path}
          >

            <Link
              to={link.path}
              className={linkClass}
            >

              <span
                className="
                  min-w-0
                  break-words
                "
              >
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
          h-8
          w-8
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


      <span
        className="
          min-w-0
          break-words
        "
      >
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
          min-h-[36px]
          items-center
          gap-2.5
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
      target={
        external
          ? '_blank'
          : undefined
      }
      rel={
        external
          ? 'noopener noreferrer'
          : undefined
      }
      className="
        group
        flex
        min-w-0
        min-h-[36px]
        items-center
        gap-2.5
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
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-brown
        sm:text-sm
      "
    >
      {content}
    </a>
  );
}
