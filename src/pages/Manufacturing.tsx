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
   CENTRAL MANUFACTURING EXPERIENCE

   Narrative:
   HERO → PROCESS INTRO → PRODUCTION JOURNEY
   → MANUFACTURING PHILOSOPHY → QUALITY SYSTEM
   → B2B ACTION

   Central design system:
   - Green = trust / manufacturing confidence
   - Saffron = process highlights / action
   - Ivory = editorial canvas
   - Brown = premium contrast

   Image system:
   - Hero artwork is displayed completely.
   - 3:2 artwork is never cropped.
   - Hero height is intentionally compact.
   - Production artwork uses natural image ratio.
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
          { name: 'Home', path: '/' },
          { name: 'Manufacturing', path: '/manufacturing' },
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

              The supplied artwork is displayed with object-contain so the
              complete composition remains visible on every screen size.
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
              src={FACTORY_HERO_IMAGE}
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
              opacity-[0.06]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
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
                  max-w-3xl
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
                  Our Process
                </span>

                <h1
                  id="manufacturing-title"
                  className="
                    text-balance
                    font-serif
                    text-display-sm
                    font-bold
                    leading-[1.02]
                    text-white
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
                    mt-4
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
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                    sm:gap-2.5
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
          py-10
          sm:py-12
          lg:py-16
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
              <span className="section-eyebrow mb-2.5 block">
                From Flour to Crisp
              </span>

              <h2
                id="process-overview-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Five stages. One consistent standard.
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
          pb-12
          sm:pb-14
          lg:pb-18
        "
        aria-label="Manufacturing process"
      >
        <div className="container-max container-px">

          <div className="relative">

            {/* Central desktop timeline */}
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

            <div className="space-y-10 sm:space-y-12 lg:space-y-16">

              {steps.map((step, index) => (
                <Reveal
                  key={step.num}
                  delay={Math.min(index * 70, 280)}
                >
                  <article
                    className="
                      relative
                      grid
                      items-center
                      gap-6
                      lg:grid-cols-2
                      lg:gap-14
                    "
                  >

                    {/* ========================================================
                        IMAGE
                        ===================================================== */}

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


                    {/* ========================================================
                        CONTENT
                        ===================================================== */}

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
                            h-11
                            w-11
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
                            lg:h-12
                            lg:w-12
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
                              sm:text-xs
                            "
                          >
                            Production Stage
                          </span>

                          <h2
                            className="
                              text-balance
                              mt-1.5
                              font-serif
                              text-headline-sm
                              font-bold
                              text-brand-green
                              sm:text-headline-md
                            "
                          >
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <p
                        className={`
                          text-pretty
                          mt-4
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
                          mt-4
                          h-px
                          w-14
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
              ))}

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
          py-12
          text-brand-ivory
          sm:py-16
          lg:py-20
        "
        aria-labelledby="manufacturing-philosophy-title"
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            border
            border-brand-saffron/10
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

        <div className="container-max container-px relative">

          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-12
              lg:gap-12
            "
          >

            <div className="lg:col-span-6">
              <Reveal>
                <div>

                  <span
                    className="
                      section-eyebrow
                      mb-2.5
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
                      text-headline-md
                      font-bold
                      text-white
                    "
                  >
                    Honoring tradition through
                    structured execution.
                  </h2>

                  <p
                    className="
                      text-pretty
                      mt-4
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
                      mt-6
                      grid
                      gap-2.5
                      sm:grid-cols-3
                      sm:gap-3
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
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-3.5
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white/10
                            sm:p-4
                          "
                        >
                          <Icon
                            className="
                              mb-2.5
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


            <div className="lg:col-span-6">
              <Reveal delay={150}>
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
                      max-h-[560px]
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
          py-12
          sm:py-16
          lg:py-20
        "
        aria-labelledby="quality-title"
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
                Quality Assurance
              </span>

              <h2
                id="quality-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Standards built into every batch.
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
                Clear standards help us keep the finished
                product consistent from production through
                packaging.
              </p>
            </div>
          </Reveal>


          <div
            className="
              grid
              gap-2.5
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-4
            "
          >
            {qualityPoints.map(
              (point, index) => (
                <Reveal
                  key={point}
                  delay={Math.min(index * 40, 240)}
                >
                  <div
                    className="
                      card
                      flex
                      h-full
                      items-start
                      gap-3
                      border
                      border-brand-green/10
                      bg-white
                      p-4
                      shadow-soft
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-lift
                      sm:p-5
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
          py-12
          sm:py-16
        "
        aria-labelledby="manufacturing-business-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div className="mx-auto max-w-2xl text-center">

              <span className="section-eyebrow mb-2.5 block">
                Business Partnerships
              </span>

              <h2
                id="manufacturing-business-title"
                className="
                  text-balance
                  font-serif
                  text-headline-sm
                  font-bold
                  text-brand-green
                  sm:text-headline-md
                "
              >
                Looking for a reliable papad supply partner?
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-3
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
                  mt-6
                  flex
                  flex-col
                  justify-center
                  gap-3
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
