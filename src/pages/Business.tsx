import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Factory,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Store,
  Utensils,
  Users,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   BUSINESS HUB

   Conversion flow:
   HERO → BUSINESS PATHWAYS → WHO WE SERVE
   → WHY PARTNER → DIRECT SUPPORT → CTA

   CENTRAL DESIGN SYSTEM
   - Green   = trust / primary authority
   - Saffron = commercial action / appetite
   - Ivory   = editorial canvas
   - Brown   = heritage / premium contrast

   IMAGE SYSTEM
   - Hero artwork is displayed completely.
   - 3:2 artwork is never cropped.
   - Hero height is intentionally compact.
   - Green background fills any remaining space.
   ========================================================================== */


/* ==========================================================================
   ASSETS
   ========================================================================== */

const BUSINESS_HERO_IMAGE =
  '/images/pages/business-hero.png';


/* ==========================================================================
   BUSINESS PATHWAYS
   ========================================================================== */

const businessPathways = [
  {
    icon: Utensils,
    title: 'Hotels & Restaurants',
    description:
      'Dedicated supply for professional kitchens, dining rooms, and food service partners.',
    link: '/work-with-us',
    cta: 'Work With Us',
  },
  {
    icon: Factory,
    title: 'Manufacturing Standards',
    description:
      'Explore our manufacturing approach, quality controls, and FSSAI licensing.',
    link: '/manufacturing',
    cta: 'View Manufacturing',
  },
  {
    icon: Users,
    title: 'General Business Enquiry',
    description:
      'For custom collaborations, trade queries, and general partnership discussions.',
    link: '/contact',
    cta: 'Contact Us',
  },
];


/* ==========================================================================
   CUSTOMER TYPES
   ========================================================================== */

const customerTypes = [
  'Retailers',
  'Wholesalers',
  'Distributors',
  'Hotels',
  'Restaurants',
  'Food Businesses',
];


/* ==========================================================================
   PARTNERSHIP BENEFITS
   ========================================================================== */

const partnershipBenefits = [
  'Authentic papad with broad consumer appeal',
  'Quality craftsmanship from Nimar traditions',
  'Growing product range across moong, chana and urad varieties',
  'Flexible supply options for businesses of different sizes',
  'Responsive communication and dedicated commercial support',
];


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Business() {
  return (
    <>
      <SEO
        title="Business Hub"
        description="B2B papad supply and partnerships from Nimar. Explore bulk orders, distribution, manufacturing, and commercial collaborations with Kawad Swad."
        path="/business"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Business',
            path: '/business',
          },
        ])}
      />


      {/* ======================================================================
          HERO
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
        "
        aria-labelledby="business-page-title"
      >
        <div
          className="
            relative
            min-h-[360px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[420px]
            lg:min-h-[480px]
          "
        >

          {/* ==================================================================
              FULL HERO ARTWORK

              IMPORTANT:
              The supplied business hero artwork is 3:2.

              object-cover was intentionally removed because it crops the
              artwork when the browser hero ratio differs from 3:2.

              object-contain keeps the entire artwork visible.
              ================================================================== */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              overflow-hidden
              bg-brand-green
            "
            aria-hidden="true"
          >
            <img
              src={BUSINESS_HERO_IMAGE}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="
                h-full
                w-full
                object-contain
                object-center
              "
            />
          </div>


          {/* ==================================================================
              HERO OVERLAY
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/95
              via-brand-green/60
              to-brand-green/5
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/40
              via-transparent
              to-transparent
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-dots
              opacity-[0.05]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-28
              -top-28
              h-64
              w-64
              rounded-full
              border
              border-brand-saffron/15
              sm:h-80
              sm:w-80
              lg:h-96
              lg:w-96
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              HERO CONTENT
              ================================================================== */}

          <div
            className="
              container-max
              container-px
              relative
              z-20
              flex
              min-h-[360px]
              items-center
              sm:min-h-[420px]
              lg:min-h-[480px]
            "
          >
            <Reveal>
              <div
                className="
                  max-w-4xl
                  py-10
                  sm:py-12
                  lg:py-14
                "
              >
                <span
                  className="
                    section-eyebrow
                    mb-3
                    block
                    text-brand-saffron
                  "
                >
                  B2B Partnerships
                </span>

                <h1
                  id="business-page-title"
                  className="
                    text-balance
                    font-serif
                    text-display-sm
                    font-bold
                    leading-[1.02]
                    text-white
                  "
                >
                  Built for Consumers.
                  <br />
                  <span className="text-brand-saffron">
                    Ready for Business.
                  </span>
                </h1>

                <p
                  className="
                    text-pretty
                    mt-4
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-white/80
                    sm:text-base
                    lg:text-lg
                  "
                >
                  Business partnerships for retailers,
                  wholesalers, distributors and food
                  businesses. Find the right commercial
                  pathway for your needs.
                </p>

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                    sm:gap-2.5
                  "
                >
                  <span className="badge bg-white/10 text-white">
                    Bulk Supply
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Distribution
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Commercial Support
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          BUSINESS PATHWAYS
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-12
          sm:py-14
          lg:py-18
        "
        aria-labelledby="business-pathways-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div
              className="
                mx-auto
                mb-8
                max-w-3xl
                text-center
                sm:mb-10
              "
            >
              <span className="section-eyebrow mb-2.5 block">
                Business Hub
              </span>

              <h2
                id="business-pathways-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Choose the right pathway for your business
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                From bulk supply to regional distribution,
                find the commercial route that fits your
                requirements.
              </p>
            </div>
          </Reveal>


          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">

            {/* ==================================================================
                PRIMARY PATHWAY
                =============================================================== */}

            <div className="lg:col-span-8">
              <Reveal className="h-full">
                <article
                  className="
                    relative
                    flex
                    h-full
                    min-h-[320px]
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-6
                    text-brand-cream
                    shadow-lift
                    sm:p-7
                    lg:p-8
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      h-56
                      w-56
                      rounded-full
                      border
                      border-brand-saffron/15
                    "
                    aria-hidden="true"
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-dots
                      opacity-10
                    "
                    aria-hidden="true"
                  />

                  <div className="relative">

                    <span
                      className="
                        mb-5
                        inline-flex
                        rounded-full
                        bg-brand-saffron
                        px-3
                        py-1.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-white
                        sm:text-xs
                      "
                    >
                      Primary Pathway
                    </span>

                    <div
                      className="
                        mb-5
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/10
                        text-brand-saffron
                        shadow-soft
                      "
                      aria-hidden="true"
                    >
                      <Package className="h-6 w-6" />
                    </div>

                    <h3
                      className="
                        text-balance
                        font-serif
                        text-2xl
                        font-bold
                        text-white
                        sm:text-3xl
                      "
                    >
                      Bulk Orders & Institutional Supply
                    </h3>

                    <p
                      className="
                        text-pretty
                        mt-3
                        max-w-xl
                        text-sm
                        leading-relaxed
                        text-brand-cream/80
                        sm:text-base
                      "
                    >
                      Large-quantity supply designed for
                      businesses, events, hotels, caterers,
                      and institutional requirements. Access
                      our full catalogue and discuss supply
                      requirements with our team.
                    </p>
                  </div>

                  <div className="relative mt-6">
                    <Link
                      to="/bulk-orders"
                      className="
                        btn-yellow
                        min-h-[46px]
                        w-full
                        px-6
                        sm:w-auto
                        sm:px-8
                      "
                    >
                      Request Bulk Supply

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            </div>


            {/* ==================================================================
                DISTRIBUTOR
                =============================================================== */}

            <div className="lg:col-span-4">
              <Reveal
                delay={100}
                className="h-full"
              >
                <article
                  className="
                    card
                    flex
                    h-full
                    min-h-[320px]
                    flex-col
                    justify-between
                    border
                    border-brand-green/10
                    bg-white
                    p-6
                    shadow-card
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-lift
                    sm:p-7
                  "
                >
                  <div>

                    <span
                      className="
                        mb-5
                        inline-flex
                        rounded-full
                        bg-brand-green/10
                        px-2.5
                        py-1
                        text-2xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-brand-green
                      "
                    >
                      Regional Growth
                    </span>

                    <div
                      className="
                        mb-5
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-2xl
                        bg-brand-saffron/10
                        text-brand-saffron
                      "
                      aria-hidden="true"
                    >
                      <Store className="h-5 w-5" />
                    </div>

                    <h3
                      className="
                        text-balance
                        font-serif
                        text-xl
                        font-semibold
                        text-brand-green
                      "
                    >
                      Become a Distributor
                    </h3>

                    <p
                      className="
                        text-pretty
                        mt-3
                        text-sm
                        leading-relaxed
                        text-brand-brown/70
                      "
                    >
                      Partner with Kawad Swad to bring our
                      premium Nimar papads to retailers and
                      consumers in your region.
                    </p>
                  </div>

                  <Link
                    to="/distributor"
                    className="
                      group
                      mt-6
                      inline-flex
                      min-h-[42px]
                      items-center
                      gap-2
                      border-t
                      border-brand-green/10
                      pt-3
                      text-sm
                      font-semibold
                      text-brand-green
                      transition-all
                      duration-200
                      hover:gap-3
                      hover:text-brand-saffron
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-brand-saffron
                      focus-visible:ring-offset-2
                    "
                  >
                    Explore Distribution

                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              </Reveal>
            </div>


            {/* ==================================================================
                SUPPORTING PATHWAYS
                =============================================================== */}

            {businessPathways.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="lg:col-span-4"
                  >
                    <Reveal
                      delay={150 + index * 50}
                      className="h-full"
                    >
                      <article
                        className="
                          card
                          flex
                          h-full
                          min-h-[250px]
                          flex-col
                          justify-between
                          border
                          border-brand-green/10
                          bg-white
                          p-6
                          shadow-card
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-lift
                          sm:p-7
                        "
                      >
                        <div>

                          <div
                            className="
                              mb-5
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-2xl
                              border
                              border-brand-green/10
                              bg-brand-ivory-dark
                              text-brand-saffron
                            "
                            aria-hidden="true"
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <h3
                            className="
                              text-balance
                              font-serif
                              text-xl
                              font-semibold
                              text-brand-green
                            "
                          >
                            {item.title}
                          </h3>

                          <p
                            className="
                              text-pretty
                              mt-3
                              text-sm
                              leading-relaxed
                              text-brand-brown/70
                            "
                          >
                            {item.description}
                          </p>
                        </div>

                        <Link
                          to={item.link}
                          className="
                            inline-flex
                            min-h-[42px]
                            items-center
                            gap-2
                            border-t
                            border-brand-green/10
                            pt-3
                            text-sm
                            font-semibold
                            text-brand-green
                            transition-all
                            duration-200
                            hover:gap-3
                            hover:text-brand-saffron
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-brand-saffron
                            focus-visible:ring-offset-2
                          "
                        >
                          {item.cta}

                          <ArrowRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Link>
                      </article>
                    </Reveal>
                  </div>
                );
              },
            )}

          </div>
        </div>
      </section>


      {/* ======================================================================
          WHO WE SERVE
          =================================================================== */}

      <section
        className="
          border-y
          border-brand-green/10
          bg-brand-ivory-dark
          py-12
          sm:py-14
        "
        aria-labelledby="who-we-serve-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div
              className="
                mx-auto
                mb-8
                max-w-2xl
                text-center
                sm:mb-10
              "
            >
              <span className="section-eyebrow mb-2.5 block">
                Who We Serve
              </span>

              <h2
                id="who-we-serve-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Partners across the food ecosystem
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-3
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                From retail shelves to professional kitchens,
                our commercial model is designed around
                dependable product supply.
              </p>
            </div>
          </Reveal>


          <div
            className="
              grid
              grid-cols-2
              gap-2.5
              sm:grid-cols-3
              sm:gap-3
              lg:grid-cols-6
            "
          >
            {customerTypes.map(
              (target, index) => (
                <Reveal
                  key={target}
                  delay={index * 50}
                >
                  <article
                    className="
                      card
                      flex
                      h-full
                      flex-col
                      items-center
                      justify-center
                      border
                      border-brand-green/10
                      bg-white
                      p-4
                      text-center
                      shadow-soft
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-card
                      sm:p-5
                    "
                  >
                    <div
                      className="
                        mb-2.5
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-brand-saffron/10
                        text-brand-saffron
                      "
                      aria-hidden="true"
                    >
                      <Check className="h-4 w-4" />
                    </div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-brand-green
                        sm:text-sm
                      "
                    >
                      {target}
                    </p>
                  </article>
                </Reveal>
              ),
            )}
          </div>

        </div>
      </section>


      {/* ======================================================================
          WHY PARTNER
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-14
          sm:py-16
          lg:py-20
        "
        aria-labelledby="why-partner-title"
      >
        <div className="container-max container-px">

          <div
            className="
              grid
              items-stretch
              gap-7
              lg:grid-cols-12
              lg:gap-10
            "
          >

            {/* ================================================================
                BENEFITS
                ============================================================= */}

            <div className="lg:col-span-7">
              <Reveal>
                <div className="h-full">

                  <span className="section-eyebrow mb-2.5 block">
                    Why Partner With Us
                  </span>

                  <h2
                    id="why-partner-title"
                    className="
                      text-balance
                      max-w-2xl
                      font-serif
                      text-headline-lg
                      font-bold
                      leading-tight
                      text-brand-green
                    "
                  >
                    A brand built for lasting partnerships.
                  </h2>

                  <p
                    className="
                      text-pretty
                      mt-4
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-brand-brown/65
                      sm:text-base
                    "
                  >
                    We combine traditional Nimar taste with
                    practical commercial support, giving
                    business partners a clear and dependable
                    route to market.
                  </p>

                  <ul
                    className="
                      mt-6
                      grid
                      gap-2.5
                      sm:grid-cols-2
                    "
                  >
                    {partnershipBenefits.map(
                      (point) => (
                        <li
                          key={point}
                          className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-brand-green/10
                            bg-white
                            p-3.5
                            text-sm
                            leading-relaxed
                            text-brand-brown/75
                            shadow-soft
                          "
                        >
                          <span
                            className="
                              mt-0.5
                              flex
                              h-5
                              w-5
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-brand-green/10
                              text-brand-green
                            "
                            aria-hidden="true"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>

                          <span>{point}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  <div
                    className="
                      mt-6
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:flex-wrap
                    "
                  >
                    <Link
                      to="/bulk-orders"
                      className="
                        btn-primary
                        justify-center
                        px-8
                      "
                    >
                      Request Bulk Supply
                    </Link>

                    <Link
                      to="/distributor"
                      className="
                        btn-outline
                        justify-center
                        px-8
                      "
                    >
                      Become a Distributor
                    </Link>
                  </div>

                </div>
              </Reveal>
            </div>


            {/* ================================================================
                DIRECT SUPPORT
                ============================================================= */}

            <div className="lg:col-span-5">
              <Reveal
                delay={150}
                className="h-full"
              >
                <aside
                  className="
                    relative
                    flex
                    h-full
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-6
                    text-brand-cream
                    shadow-lift
                    sm:p-7
                    lg:p-8
                  "
                  aria-labelledby="commercial-support-title"
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-44
                      w-44
                      rounded-full
                      border
                      border-brand-saffron/15
                    "
                    aria-hidden="true"
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-dots
                      opacity-10
                    "
                    aria-hidden="true"
                  />

                  <div className="relative">

                    <span
                      className="
                        mb-2
                        block
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-brand-saffron
                      "
                    >
                      Commercial Support
                    </span>

                    <h3
                      id="commercial-support-title"
                      className="
                        font-serif
                        text-2xl
                        font-bold
                        text-white
                      "
                    >
                      Direct Commercial Support
                    </h3>

                    <p
                      className="
                        text-pretty
                        mt-3
                        text-sm
                        leading-relaxed
                        text-brand-cream/80
                      "
                    >
                      Tell us about your business requirements.
                      Our commercial team will connect with you
                      to discuss pricing, logistics, and
                      partnership terms.
                    </p>


                    <div className="mt-6 space-y-2.5">

                      <a
                        href={`tel:${brand.phoneRaw}`}
                        className="
                          flex
                          min-h-[48px]
                          items-center
                          gap-3
                          rounded-xl
                          bg-white/5
                          p-2.5
                          text-sm
                          font-medium
                          text-brand-cream
                          transition-all
                          duration-200
                          hover:bg-white/10
                          hover:text-brand-saffron
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-brand-saffron
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-brand-brown
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-brand-saffron
                            text-white
                          "
                          aria-hidden="true"
                        >
                          <Phone className="h-4 w-4" />
                        </span>

                        <span className="break-all">
                          {brand.phone}
                        </span>
                      </a>


                      <a
                        href={brand.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          flex
                          min-h-[48px]
                          items-center
                          gap-3
                          rounded-xl
                          bg-white/5
                          p-2.5
                          text-sm
                          font-medium
                          text-brand-cream
                          transition-all
                          duration-200
                          hover:bg-white/10
                          hover:text-brand-saffron
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-brand-saffron
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-brand-brown
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-emerald-600
                            text-white
                          "
                          aria-hidden="true"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </span>

                        <span>
                          WhatsApp Commercial Desk
                        </span>
                      </a>


                      <a
                        href={`mailto:${brand.email}`}
                        className="
                          flex
                          min-h-[48px]
                          items-center
                          gap-3
                          rounded-xl
                          bg-white/5
                          p-2.5
                          text-sm
                          font-medium
                          text-brand-cream
                          transition-all
                          duration-200
                          hover:bg-white/10
                          hover:text-brand-saffron
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-brand-saffron
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-brand-brown
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-brand-saffron
                            text-brand-brown
                          "
                          aria-hidden="true"
                        >
                          <Mail className="h-4 w-4" />
                        </span>

                        <span className="break-all">
                          {brand.email}
                        </span>
                      </a>

                    </div>
                  </div>


                  <div className="relative mt-6">
                    <Link
                      to="/contact"
                      className="
                        btn-yellow
                        min-h-[46px]
                        w-full
                        justify-center
                      "
                    >
                      Send Business Enquiry

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </aside>
              </Reveal>
            </div>

          </div>
        </div>
      </section>


      {/* ======================================================================
          CTA
          =================================================================== */}

      <CTABanner
        title="Let's build something together."
        description="Whether you need bulk supply, a distribution partnership or a custom collaboration, we would love to hear from you."
        primaryLabel="Request Bulk Supply"
        primaryLink="/bulk-orders"
        secondaryLabel="Become a Distributor"
        secondaryLink="/distributor"
      />
    </>
  );
}
