import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Check,
  Factory,
  Leaf,
  Shield,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PlaceholderImage } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   MANUFACTURING PAGE

   Visual hierarchy:
   HERO
   → PROCESS INTRO
   → PRODUCTION JOURNEY
   → MANUFACTURING PHILOSOPHY
   → QUALITY SYSTEM
   → BUSINESS ACTION
   → FINAL CTA

   Image rules:
   - Supplied manufacturing artwork is never cropped.
   - 3:2 artwork remains completely visible.
   - Production artwork keeps its natural aspect ratio.
   - No object-cover is used for supplied brand artwork.
   - Vertical spacing is intentionally compact.
   ========================================================================== */


/* ==========================================================================
   ASSETS
   ========================================================================== */

const FACTORY_HERO_IMAGE =
  '/images/pages/manufacturing-hero.png';

const FACTORY_PRODUCTION_IMAGE =
  '/images/pages/manufacturing-production.png';


/* ==========================================================================
   PRODUCTION STEPS
   ========================================================================== */

const steps = [
  {
    num: '01',
    title: 'Raw Material Selection',
    desc: 'Premium quality moong, chana, and urad dal flours are sourced alongside authentic regional spices, ensuring the foundational purity and flavor profile of every batch.',
  },
  {
    num: '02',
    title: 'Dough Mixing & Shaping',
    desc: 'Flours and spice blends are combined with water, kneaded to consistent texture, and shaped into traditional papads following established regional recipes.',
  },
  {
    num: '03',
    title: 'Traditional Drying',
    desc: 'Shaped papads are dried under standard facility conditions to achieve appropriate moisture levels, structural integrity, and shelf stability.',
  },
  {
    num: '04',
    title: 'Quality Inspection',
    desc: 'Every production lot is reviewed for uniform thickness, texture consistency, and general appearance before final approval.',
  },
  {
    num: '05',
    title: 'Sealed Packaging',
    desc: 'Finished papads are packed securely in food-grade packaging to preserve authentic flavor and crunch from our Nimar facility to your kitchen.',
  },
];


/* ==========================================================================
   QUALITY POINTS
   ========================================================================== */

const qualityPoints = [
  'FSSAI Licence No. 21425890001224',
  '100% vegetarian production line',
  'Dedicated dietary variant options',
  'Sealed food-grade packaging',
  'Regular batch quality reviews',
  'Authentic regional spice blends',
  'Careful lentil flour sourcing',
  'Standardized quality control steps',
];


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Manufacturing() {
  return (
    <>
      <SEO
        title="Manufacturing Process"
        description="Explore the Kawad Swad manufacturing approach at Kawad Swad Udhyog in Nimar, from ingredient selection and papad preparation to quality checking and sealed packaging."
        path="/manufacturing"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Manufacturing',
            path: '/manufacturing',
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
        aria-labelledby="manufacturing-title"
      >

        <div
          className="
            relative
            min-h-[280px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[330px]
            lg:min-h-[370px]
          "
        >

          {/* ==================================================================
              COMPLETE HERO ARTWORK

              The supplied artwork is 3:2.
              It is intentionally contained instead of cropped.
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
              src={FACTORY_HERO_IMAGE}
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
              via-brand-green/58
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
              from-brand-green/35
              via-transparent
              to-transparent
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              SUBTLE TEXTURE
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-dots
              opacity-[0.045]
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
              h-48
              w-48
              rounded-full
              border
              border-brand-saffron/15
              sm:h-60
              sm:w-60
              lg:h-72
              lg:w-72
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
              min-h-[280px]
              items-center
              sm:min-h-[330px]
              lg:min-h-[370px]
            "
          >

            <Reveal>

              <div
                className="
                  max-w-3xl
                  py-7
                  sm:py-8
                  lg:py-9
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
                  Our Process
                </span>


                <h1
                  id="manufacturing-title"
                  className="
                    max-w-3xl
                    text-balance
                    font-serif
                    text-3xl
                    font-bold
                    leading-[1.04]
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Crafted with precision,
                  <br />
                  <span className="text-brand-saffron">
                    grounded in tradition.
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
                    lg:text-lg
                  "
                >
                  A structured manufacturing workflow
                  designed to preserve authentic Nimar papad
                  recipes while maintaining careful quality
                  and hygiene practices.
                </p>


                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  <span className="badge bg-white/10 text-white">
                    Traditional Recipes
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Quality Focused
                  </span>

                  <span className="badge bg-white/10 text-white">
                    FSSAI Licensed
                  </span>

                </div>

              </div>

            </Reveal>

          </div>

        </div>

      </section>


      {/* ======================================================================
          PROCESS INTRO
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-7
          sm:py-9
          lg:py-11
        "
        aria-labelledby="process-overview-title"
      >

        <div className="container-max container-px">

          <Reveal>

            <div
              className="
                mx-auto
                max-w-3xl
                text-center
              "
            >

              <span className="section-eyebrow mb-2 block">
                From Flour to Crisp
              </span>


              <h2
                id="process-overview-title"
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
                Five stages. One consistent standard.
              </h2>


              <p
                className="
                  text-pretty
                  mx-auto
                  mt-2.5
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                Each stage of our workflow has a clear
                purpose, from selecting the ingredients to
                protecting the finished papad inside its
                final package.
              </p>

            </div>

          </Reveal>

        </div>

      </section>


      {/* ======================================================================
          PROCESS TIMELINE
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          pb-8
          sm:pb-10
          lg:pb-13
        "
        aria-label="Manufacturing process"
      >

        <div className="container-max container-px">

          <div className="relative">

            {/* --------------------------------------------------------------
                DESKTOP TIMELINE
                -------------------------------------------------------------- */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                top-0
                hidden
                w-px
                -translate-x-1/2
                bg-brand-green/10
                lg:block
              "
              aria-hidden="true"
            />


            <div
              className="
                space-y-6
                sm:space-y-8
                lg:space-y-9
              "
            >

              {steps.map(
                (step, index) => (
                  <Reveal
                    key={step.num}
                    delay={Math.min(
                      index * 60,
                      240,
                    )}
                  >

                    <article
                      className="
                        relative
                        grid
                        items-center
                        gap-5
                        lg:grid-cols-2
                        lg:gap-10
                      "
                    >

                      {/* ======================================================
                          IMAGE
                          =================================================== */}

                      <div
                        className={`
                          ${
                            index % 2 === 1
                              ? 'lg:order-2'
                              : 'lg:order-1'
                          }
                        `}
                      >

                        <div
                          className="
                            image-premium
                            border
                            border-brand-green/10
                            bg-white
                            shadow-card
                          "
                        >

                          <PlaceholderImage
                            label={`${step.title} — real process photography pending`}
                            aspect="aspect-[4/3]"
                            className="rounded-3xl"
                          />

                        </div>

                      </div>


                      {/* ======================================================
                          CONTENT
                          =================================================== */}

                      <div
                        className={`
                          ${
                            index % 2 === 1
                              ? 'lg:order-1 lg:text-right'
                              : 'lg:order-2'
                          }
                        `}
                      >

                        <div
                          className={`
                            flex
                            items-start
                            gap-3
                            ${
                              index % 2 === 1
                                ? 'lg:flex-row-reverse'
                                : ''
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-brand-saffron/20
                              bg-brand-ivory
                              font-serif
                              text-sm
                              font-bold
                              text-brand-saffron
                              shadow-soft
                              lg:h-11
                              lg:w-11
                            "
                            aria-hidden="true"
                          >
                            {step.num}
                          </div>


                          <div className="min-w-0">

                            <span
                              className="
                                block
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-brand-saffron
                              "
                            >
                              Production Stage
                            </span>


                            <h2
                              className="
                                text-balance
                                mt-1
                                font-serif
                                text-xl
                                font-bold
                                leading-tight
                                text-brand-green
                                sm:text-2xl
                                lg:text-3xl
                              "
                            >
                              {step.title}
                            </h2>

                          </div>

                        </div>


                        <p
                          className={`
                            text-pretty
                            mt-3
                            max-w-xl
                            text-sm
                            leading-relaxed
                            text-brand-brown/70
                            sm:text-base
                            ${
                              index % 2 === 1
                                ? 'lg:ml-auto'
                                : ''
                            }
                          `}
                        >
                          {step.desc}
                        </p>


                        <div
                          className={`
                            mt-3
                            h-px
                            w-12
                            bg-brand-saffron/40
                            ${
                              index % 2 === 1
                                ? 'lg:ml-auto'
                                : ''
                            }
                          `}
                          aria-hidden="true"
                        />

                      </div>

                    </article>

                  </Reveal>
                ),
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================================
          MANUFACTURING PHILOSOPHY
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-9
          text-brand-ivory
          sm:py-11
          lg:py-14
        "
        aria-labelledby="manufacturing-philosophy-title"
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
            border-brand-saffron/10
            sm:h-64
            sm:w-64
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

          <div
            className="
              grid
              items-center
              gap-6
              lg:grid-cols-12
              lg:gap-9
            "
          >

            {/* ================================================================
                TEXT
                ============================================================= */}

            <div className="lg:col-span-6">

              <Reveal>

                <div>

                  <span
                    className="
                      section-eyebrow
                      mb-2
                      block
                      text-brand-saffron
                    "
                  >
                    Manufacturing Philosophy
                  </span>


                  <h2
                    id="manufacturing-philosophy-title"
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
                    Honoring tradition through
                    structured execution.
                  </h2>


                  <p
                    className="
                      text-pretty
                      mt-3
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-brand-ivory/75
                      sm:text-base
                      lg:text-lg
                    "
                  >
                    At Kawad Swad Udhyog, we believe that
                    exceptional papad requires respect for
                    traditional culinary methods combined
                    with structured operational hygiene and
                    careful ingredient sourcing.
                  </p>


                  <div
                    className="
                      mt-5
                      grid
                      gap-2
                      sm:grid-cols-3
                      sm:gap-2.5
                    "
                  >

                    {[
                      {
                        icon: Leaf,
                        title: 'Authentic Recipes',
                        desc: 'Rooted in Nimar traditions',
                      },
                      {
                        icon: Shield,
                        title: 'FSSAI Licence',
                        desc: `Licence No. ${brand.fssai}`,
                      },
                      {
                        icon: Factory,
                        title: 'Commercial Supply',
                        desc: 'Consistent production capacity',
                      },
                    ].map((item) => {

                      const Icon =
                        item.icon;

                      return (
                        <div
                          key={item.title}
                          className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-3
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white/10
                            sm:p-3.5
                          "
                        >

                          <Icon
                            className="
                              mb-2
                              h-5
                              w-5
                              text-brand-saffron
                            "
                            aria-hidden="true"
                          />


                          <h3
                            className="
                              mb-1
                              font-serif
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            {item.title}
                          </h3>


                          <p
                            className="
                              text-xs
                              leading-relaxed
                              text-brand-ivory/60
                            "
                          >
                            {item.desc}
                          </p>

                        </div>
                      );
                    })}

                  </div>

                </div>

              </Reveal>

            </div>


            {/* ================================================================
                PRODUCTION IMAGE
                ============================================================= */}

            <div className="lg:col-span-6">

              <Reveal delay={120}>

                <div
                  className="
                    image-premium
                    border
                    border-white/10
                    bg-brand-green-dark
                    shadow-lift
                  "
                >

                  <img
                    src={FACTORY_PRODUCTION_IMAGE}
                    alt="Kawad Swad papad production environment"
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
          QUALITY ASSURANCE
          =================================================================== */}

      <section
        className="
          bg-brand-ivory-light
          py-9
          sm:py-11
          lg:py-14
        "
        aria-labelledby="quality-title"
      >

        <div className="container-max container-px">

          <Reveal>

            <div
              className="
                mx-auto
                mb-6
                max-w-2xl
                text-center
                sm:mb-8
              "
            >

              <span className="section-eyebrow mb-2 block">
                Quality Assurance
              </span>


              <h2
                id="quality-title"
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
                Standards built into every batch.
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
                Clear standards help us keep the finished
                product consistent from production through
                packaging.
              </p>

            </div>

          </Reveal>


          <div
            className="
              grid
              gap-2
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-2.5
            "
          >

            {qualityPoints.map(
              (point, index) => (
                <Reveal
                  key={point}
                  delay={Math.min(
                    index * 35,
                    210,
                  )}
                >

                  <div
                    className="
                      card
                      flex
                      h-full
                      items-start
                      gap-2.5
                      border
                      border-brand-green/10
                      bg-white
                      p-3
                      shadow-soft
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-lift
                      sm:p-3.5
                    "
                  >

                    <span
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-brand-green/10
                      "
                    >

                      <Check
                        className="
                          h-3.5
                          w-3.5
                          text-brand-green
                        "
                        aria-hidden="true"
                      />

                    </span>


                    <span
                      className="
                        text-sm
                        font-medium
                        leading-relaxed
                        text-brand-brown/80
                      "
                    >
                      {point}
                    </span>

                  </div>

                </Reveal>
              ),
            )}

          </div>

        </div>

      </section>


      {/* ======================================================================
          BUSINESS ACTION
          =================================================================== */}

      <section
        className="
          border-t
          border-brand-green/10
          bg-brand-ivory-dark
          py-8
          sm:py-10
        "
        aria-labelledby="manufacturing-business-title"
      >

        <div className="container-max container-px">

          <Reveal>

            <div
              className="
                mx-auto
                max-w-2xl
                text-center
              "
            >

              <span className="section-eyebrow mb-2 block">
                Business Partnerships
              </span>


              <h2
                id="manufacturing-business-title"
                className="
                  text-balance
                  font-serif
                  text-xl
                  font-bold
                  leading-tight
                  text-brand-green
                  sm:text-2xl
                  lg:text-3xl
                "
              >
                Looking for a reliable papad supply partner?
              </h2>


              <p
                className="
                  text-pretty
                  mx-auto
                  mt-2.5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/70
                  sm:text-base
                "
              >
                Explore bulk supply and distribution
                opportunities with Kawad Swad.
              </p>


              <div
                className="
                  mt-5
                  flex
                  flex-col
                  justify-center
                  gap-2.5
                  sm:flex-row
                  sm:flex-wrap
                "
              >

                <Link
                  to="/bulk-orders"
                  className="
                    btn-primary
                    min-h-[46px]
                    justify-center
                    px-8
                  "
                >
                  Request Bulk Supply

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>


                <Link
                  to="/distributor"
                  className="
                    btn-outline
                    min-h-[46px]
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

      </section>


      {/* ======================================================================
          FINAL CTA
          =================================================================== */}

      <CTABanner
        title="Questions about our manufacturing?"
        description="Get in touch with our commercial and operations team for direct assistance."
        primaryLabel="Contact Us"
        primaryLink="/contact"
        secondaryLabel="Explore Products"
        secondaryLink="/products"
      />

    </>
  );
}
