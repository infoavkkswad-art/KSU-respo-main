import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Factory,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   ABOUT PAGE

   Narrative:
   ORIGIN → REGION → VALUES → HERITAGE → CREDIBILITY → ACTION

   Layout goals:
   - Compact hero
   - Reduced top whitespace
   - Full artwork visibility
   - No image cropping
   - Tighter section rhythm
   - Stronger visual hierarchy
   - Mobile-first spacing
   ========================================================================== */


const ABOUT_HERO_IMAGE =
  '/images/pages/about-hero.png';

const ABOUT_POSTER_IMAGE =
  '/images/pages/about-poster.png';


/* ==========================================================================
   BRAND VALUES
   ========================================================================== */

const values = [
  {
    icon: Leaf,
    title: 'Traditional Taste',
    desc: 'Authentic regional recipes and time-tested spice formulations that preserve genuine Indian flavors.',
  },
  {
    icon: Shield,
    title: 'Consistent Quality',
    desc: 'Rigorous ingredient selection and structured manufacturing standards in every batch we produce.',
  },
  {
    icon: Award,
    title: 'Food Craft',
    desc: 'Expertise in lentil processing, dough mixing, rolling, and traditional drying techniques.',
  },
  {
    icon: Sparkles,
    title: 'Customer Trust',
    desc: 'Transparent business operations, dependable fulfillment, and clear labeling for retail and B2B partners.',
  },
];


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Kawad Swad is a premium papad brand from Nimar, Madhya Pradesh, crafting authentic traditional papads with dependable quality standards."
        path="/about"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'About',
            path: '/about',
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
        aria-labelledby="about-page-title"
      >

        <div
          className="
            relative
            min-h-[260px]
            overflow-hidden
            bg-brand-green
            sm:min-h-[310px]
            lg:min-h-[350px]
          "
        >

          {/* ==================================================================
              COMPLETE HERO ARTWORK

              The supplied artwork is preserved completely.
              No object-cover.
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              flex
              items-center
              justify-center
              overflow-hidden
              bg-brand-green
            "
            aria-hidden="true"
          >
            <img
              src={ABOUT_HERO_IMAGE}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="
                block
                h-full
                w-full
                max-h-full
                max-w-full
                object-contain
                object-center
              "
            />
          </div>


          {/* ==================================================================
              HERO READABILITY
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-gradient-to-r
              from-brand-green/95
              via-brand-green/55
              to-brand-green/5
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-gradient-to-t
              from-brand-green/30
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
              z-10
              bg-dots
              opacity-[0.04]
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              DECORATIVE ARC
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              z-10
              h-44
              w-44
              rounded-full
              border
              border-brand-saffron/15
              sm:h-56
              sm:w-56
              lg:h-64
              lg:w-64
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
              min-h-[260px]
              items-center
              sm:min-h-[310px]
              lg:min-h-[350px]
            "
          >

            <Reveal>

              <div
                className="
                  max-w-3xl
                  py-6
                  sm:py-7
                  lg:py-8
                "
              >

                <span
                  className="
                    section-eyebrow
                    mb-2
                    block
                    text-brand-saffron-light
                  "
                >
                  Our Brand Story
                </span>


                <h1
                  id="about-page-title"
                  className="
                    text-balance
                    font-serif
                    text-3xl
                    font-bold
                    leading-[1.02]
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  From Nimar,
                  <br />
                  <span className="text-brand-saffron">
                    with tradition.
                  </span>
                </h1>


                <p
                  className="
                    text-pretty
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-white/80
                    sm:text-base
                    lg:max-w-3xl
                    lg:text-lg
                  "
                >
                  Kawad Swad brings the authentic taste of
                  Nimar&apos;s papad-making heritage to
                  kitchens across India, uniting
                  time-honored recipes with the reliability
                  of modern food manufacturing.
                </p>

              </div>

            </Reveal>

          </div>

        </div>

      </section>


      {/* ======================================================================
          REGION / BRAND INTRODUCTION
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-7
          sm:py-9
          lg:py-11
        "
        aria-labelledby="region-title"
      >

        <div className="container-max container-px">

          <div
            className="
              grid
              items-center
              gap-6
              lg:grid-cols-12
              lg:gap-8
            "
          >

            {/* ================================================================
                TEXT
                ============================================================= */}

            <div className="lg:col-span-6">

              <Reveal>

                <div>

                  <span className="section-eyebrow mb-2 block">
                    The Region
                  </span>


                  <h2
                    id="region-title"
                    className="
                      text-balance
                      max-w-xl
                      font-serif
                      text-2xl
                      font-bold
                      leading-tight
                      text-brand-green
                      sm:text-3xl
                      lg:text-4xl
                    "
                  >
                    Rooted in the fertile soil of Nimar,
                    Madhya Pradesh.
                  </h2>


                  <div
                    className="
                      mt-3
                      space-y-2
                      text-sm
                      leading-relaxed
                      text-brand-brown/70
                      sm:text-base
                    "
                  >

                    <p>
                      Nimar is a historical region renowned
                      for its deep agricultural roots and rich
                      culinary craftsmanship. It is the home
                      of Kawad Swad, established by{' '}
                      <strong className="font-semibold text-brand-brown">
                        {brand.manufacturer}
                      </strong>{' '}
                      to give traditional Indian papads a
                      dependable, professional platform.
                    </p>


                    <p>
                      Our papads carry the distinct warmth and
                      flavor of this region. We work with
                      carefully selected local ingredients and
                      authentic spice blends to produce papads
                      that taste the way traditional papad
                      should.
                    </p>

                  </div>


                  <blockquote
                    className="
                      my-3.5
                      rounded-r-2xl
                      border-l-2
                      border-brand-saffron
                      bg-brand-ivory-dark
                      p-3
                      font-devanagari
                      text-lg
                      text-brand-brown/90
                      shadow-soft
                    "
                  >
                    {brand.tagline}
                  </blockquote>


                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-brand-green/5
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-brand-green
                    "
                  >

                    <MapPin
                      className="
                        h-4
                        w-4
                        text-brand-saffron
                      "
                      aria-hidden="true"
                    />

                    Nimar, Madhya Pradesh

                  </div>

                </div>

              </Reveal>

            </div>


            {/* ================================================================
                IMAGE
                ============================================================= */}

            <div className="lg:col-span-6">

              <Reveal delay={100}>

                <div
                  className="
                    image-premium
                    border
                    border-brand-green/10
                    bg-brand-ivory-dark
                    shadow-lift
                  "
                >

                  <img
                    src={ABOUT_HERO_IMAGE}
                    alt="Kawad Swad and the Nimar region"
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      h-auto
                      w-full
                      object-contain
                      object-center
                    "
                  />

                </div>

              </Reveal>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          CORE VALUES
          =================================================================== */}

      <section
        className="
          border-y
          border-brand-green/10
          bg-brand-ivory-dark
          py-8
          sm:py-10
          lg:py-12
        "
        aria-labelledby="values-title"
      >

        <div className="container-max container-px">

          <Reveal>

            <div
              className="
                mx-auto
                mb-6
                max-w-2xl
                text-center
                sm:mb-7
              "
            >

              <span className="section-eyebrow mb-2 block">
                What We Stand For
              </span>


              <h2
                id="values-title"
                className="
                  text-balance
                  font-serif
                  text-2xl
                  font-bold
                  leading-tight
                  text-brand-green
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                Built on uncompromising principles.
              </h2>


              <p
                className="
                  text-pretty
                  mx-auto
                  mt-2.5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                The principles behind the way we make,
                package, and present every Kawad Swad
                product.
              </p>

            </div>

          </Reveal>


          <div
            className="
              grid
              gap-2.5
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-3
            "
          >

            {values.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal
                    key={item.title}
                    delay={Math.min(
                      index * 60,
                      180,
                    )}
                  >

                    <article
                      className="
                        card
                        flex
                        h-full
                        flex-col
                        border
                        border-brand-green/10
                        bg-white
                        p-4
                        shadow-card
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lift
                        sm:p-4.5
                      "
                    >

                      <div
                        className="
                          mb-2.5
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-2xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </div>


                      <h3
                        className="
                          mb-1.5
                          font-serif
                          text-lg
                          font-semibold
                          leading-tight
                          text-brand-green
                        "
                      >
                        {item.title}
                      </h3>


                      <p
                        className="
                          text-sm
                          leading-relaxed
                          text-brand-brown/65
                        "
                      >
                        {item.desc}
                      </p>

                    </article>

                  </Reveal>
                );
              },
            )}

          </div>

        </div>

      </section>


      {/* ======================================================================
          HERITAGE & DIETARY PHILOSOPHY
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-8
          sm:py-10
          lg:py-12
        "
        aria-labelledby="heritage-title"
      >

        <div className="container-max container-px">

          <div
            className="
              grid
              items-center
              gap-6
              lg:grid-cols-12
              lg:gap-8
            "
          >

            {/* ================================================================
                IMAGE
                ============================================================= */}

            <div
              className="
                order-2
                lg:order-1
                lg:col-span-6
              "
            >

              <Reveal>

                <div
                  className="
                    image-premium
                    border
                    border-brand-green/10
                    bg-brand-ivory-dark
                    shadow-lift
                  "
                >

                  <img
                    src={ABOUT_POSTER_IMAGE}
                    alt="Kawad Swad traditional preparation and culinary heritage"
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      h-auto
                      w-full
                      object-contain
                      object-center
                    "
                  />

                </div>

              </Reveal>

            </div>


            {/* ================================================================
                TEXT
                ============================================================= */}

            <div
              className="
                order-1
                lg:order-2
                lg:col-span-6
              "
            >

              <Reveal delay={100}>

                <div>

                  <span className="section-eyebrow mb-2 block">
                    Heritage & Dietary Choices
                  </span>


                  <h2
                    id="heritage-title"
                    className="
                      text-balance
                      max-w-xl
                      font-serif
                      text-2xl
                      font-bold
                      leading-tight
                      text-brand-green
                      sm:text-3xl
                      lg:text-4xl
                    "
                  >
                    Honoring traditional culinary roots.
                  </h2>


                  <div
                    className="
                      mt-3
                      space-y-2
                      text-sm
                      leading-relaxed
                      text-brand-brown/70
                      sm:text-base
                    "
                  >

                    <p>
                      Our brand heritage is deeply
                      intertwined with traditional vegetarian
                      culinary practices, including offerings
                      tailored for Jain dietary preferences. We
                      provide dedicated non-garlic options
                      alongside our spiced variants.
                    </p>


                    <p>
                      Because our product catalogue includes
                      specific garlic-infused SKUs, we
                      maintain clear, transparent labeling on
                      every product so households and
                      businesses can select exactly what
                      matches their requirements.
                    </p>

                  </div>


                  <div
                    className="
                      mt-4
                      grid
                      gap-2
                      sm:grid-cols-2
                    "
                  >

                    <div
                      className="
                        rounded-2xl
                        border
                        border-brand-green/10
                        bg-brand-ivory-dark
                        p-3
                      "
                    >

                      <Leaf
                        className="
                          mb-1.5
                          h-5
                          w-5
                          text-brand-green
                        "
                        aria-hidden="true"
                      />

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-brand-green
                        "
                      >
                        Traditional Roots
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-relaxed
                          text-brand-brown/55
                        "
                      >
                        Recipes inspired by regional
                        culinary heritage.
                      </p>

                    </div>


                    <div
                      className="
                        rounded-2xl
                        border
                        border-brand-green/10
                        bg-brand-ivory-dark
                        p-3
                      "
                    >

                      <Shield
                        className="
                          mb-1.5
                          h-5
                          w-5
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      />

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-brand-green
                        "
                      >
                        Clear Choices
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-relaxed
                          text-brand-brown/55
                        "
                      >
                        Clear product labeling for informed
                        selection.
                      </p>

                    </div>

                  </div>

                </div>

              </Reveal>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          MANUFACTURER CREDIBILITY
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-8
          text-brand-ivory
          sm:py-10
          lg:py-12
        "
        aria-labelledby="manufacturer-title"
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            border
            border-brand-saffron/15
            sm:h-56
            sm:w-56
            lg:h-64
            lg:w-64
          "
          aria-hidden="true"
        />


        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-grid
            opacity-[0.04]
          "
          aria-hidden="true"
        />


        <div
          className="
            container-max
            container-px
            relative
          "
        >

          <Reveal>

            <div className="max-w-4xl">

              <span
                className="
                  section-eyebrow
                  mb-2
                  block
                  text-brand-saffron
                "
              >
                Manufacturer Credibility
              </span>


              <h2
                id="manufacturer-title"
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
                Crafted by Kawad Swad Udhyog.
              </h2>


              <p
                className="
                  text-pretty
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-brand-ivory/75
                  sm:text-base
                  lg:text-lg
                "
              >
                Every packet of Kawad Swad papad reflects
                our dedication to proper hygiene, structured
                packaging, and dependable supply chains. We
                invite you to explore our production methods
                or get in touch for commercial partnerships.
              </p>


              {/* ==============================================================
                  CREDENTIAL STRIP
                  =========================================================== */}

              <div
                className="
                  mt-4
                  grid
                  gap-2.5
                  border-t
                  border-brand-ivory/15
                  pt-3.5
                  sm:grid-cols-3
                  sm:gap-4
                "
              >

                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-2.5
                  "
                >

                  <Factory
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-brand-saffron
                    "
                    aria-hidden="true"
                  />

                  <div className="min-w-0">

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      Manufacturer
                    </p>

                    <p
                      className="
                        mt-0.5
                        break-words
                        text-xs
                        leading-relaxed
                        text-brand-ivory/60
                      "
                    >
                      {brand.manufacturer}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-2.5
                  "
                >

                  <MapPin
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-brand-saffron
                    "
                    aria-hidden="true"
                  />

                  <div className="min-w-0">

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      Region
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        leading-relaxed
                        text-brand-ivory/60
                      "
                    >
                      {brand.region}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-2.5
                  "
                >

                  <Shield
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-brand-saffron
                    "
                    aria-hidden="true"
                  />

                  <div className="min-w-0">

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      FSSAI Licensed
                    </p>

                    <p
                      className="
                        mt-0.5
                        break-words
                        text-xs
                        leading-relaxed
                        text-brand-ivory/60
                      "
                    >
                      Licence No. {brand.fssai}
                    </p>

                  </div>

                </div>

              </div>


              {/* ==============================================================
                  ACTIONS
                  =========================================================== */}

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                  sm:flex-wrap
                "
              >

                <Link
                  to="/manufacturing"
                  className="
                    btn-yellow
                    min-h-[44px]
                    justify-center
                    px-5
                    sm:px-7
                  "
                >
                  View Manufacturing Process

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>


                <Link
                  to="/bulk-orders"
                  className="
                    btn-outline
                    min-h-[44px]
                    justify-center
                    border-brand-ivory/30
                    px-5
                    text-brand-ivory
                    hover:bg-brand-ivory
                    hover:text-brand-green
                    sm:px-7
                  "
                >
                  Explore Bulk Supply
                </Link>

              </div>

            </div>

          </Reveal>

        </div>

      </section>


      {/* ======================================================================
          FINAL CTA
          =================================================================== */}

      <CTABanner
        title="Experience authentic Nimar taste."
        description="Browse our complete selection of premium moong, chana, and urad papads."
        primaryLabel="Shop Papads"
        primaryLink="/shop"
        secondaryLabel="Contact Us"
        secondaryLink="/contact"
      />

    </>
  );
}
