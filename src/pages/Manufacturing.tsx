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

   Narrative:
   HERO → PROCESS → PHILOSOPHY → QUALITY → B2B ACTION

   Design-system rule:
   This page uses existing central classes only.
   No page-specific design tokens are introduced here.
   ========================================================================== */


const FACTORY_HERO_IMAGE =
  '/images/pages/manufacturing-hero.png';

const FACTORY_PRODUCTION_IMAGE =
  '/images/pages/manufacturing-production.png';


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

      <section className="relative overflow-hidden">
        <div
          className="
            relative
            min-h-[380px]
            w-full
            bg-brand-green
            sm:min-h-[460px]
            lg:min-h-[580px]
          "
        >
          <img
            src={FACTORY_HERO_IMAGE}
            alt="Kawad Swad factory and manufacturing environment"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/90
              via-brand-green/60
              to-brand-green/10
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/30
              via-transparent
              to-transparent
            "
            aria-hidden="true"
          />

          <div
            className="
              container-max
              container-px
              relative
              flex
              min-h-[380px]
              items-center
              sm:min-h-[460px]
              lg:min-h-[580px]
            "
          >
            <Reveal>
              <div className="max-w-3xl py-14 sm:py-16 lg:py-20">
                <span
                  className="
                    section-eyebrow
                    mb-4
                    block
                    text-brand-saffron
                  "
                >
                  Our Process
                </span>

                <h1
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
                    mt-5
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

                <div className="mt-7 flex flex-wrap gap-3">
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
          py-14
          sm:py-18
          lg:py-22
        "
      >
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-eyebrow mb-3 block">
                From Flour to Crisp
              </span>

              <h2
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
                  mt-4
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
          PROCESS STEPS
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          pb-16
          sm:pb-20
          lg:pb-28
        "
      >
        <div className="container-max container-px">
          <div className="space-y-14 sm:space-y-20 lg:space-y-24">
            {steps.map((step, index) => (
              <Reveal
                key={step.num}
                delay={Math.min(index * 70, 280)}
              >
                <div
                  className={`
                    grid
                    items-center
                    gap-8
                    lg:grid-cols-12
                    lg:gap-16
                    ${
                      index % 2 === 1
                        ? 'lg:grid-flow-dense'
                        : ''
                    }
                  `}
                >
                  {/* Image */}

                  <div
                    className={`
                      lg:col-span-6
                      ${
                        index % 2 === 1
                          ? 'lg:col-start-7'
                          : ''
                      }
                    `}
                  >
                    <div className="image-premium shadow-lift">
                      <PlaceholderImage
                        label={`${step.title} — real process photography pending`}
                        aspect="aspect-[4/3]"
                      />
                    </div>
                  </div>


                  {/* Content */}

                  <div
                    className={`
                      lg:col-span-6
                      ${
                        index % 2 === 1
                          ? 'lg:col-start-1 lg:row-start-1'
                          : ''
                      }
                    `}
                  >
                    <span
                      className="
                        mb-3
                        block
                        font-serif
                        text-5xl
                        font-bold
                        leading-none
                        text-brand-saffron/30
                        sm:text-6xl
                      "
                      aria-hidden="true"
                    >
                      {step.num}
                    </span>

                    <h2
                      className="
                        text-balance
                        font-serif
                        text-headline-sm
                        font-bold
                        text-brand-green
                        sm:text-headline-md
                      "
                    >
                      {step.title}
                    </h2>

                    <p
                      className="
                        text-pretty
                        mt-4
                        max-w-xl
                        text-sm
                        leading-relaxed
                        text-brand-brown/70
                        sm:text-base
                        lg:text-lg
                      "
                    >
                      {step.desc}
                    </p>

                    <div
                      className="
                        mt-5
                        h-px
                        w-16
                        bg-brand-saffron/40
                      "
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ======================================================================
          MANUFACTURING PHILOSOPHY
          =================================================================== */}

      <section
        className="
          bg-brand-green
          py-16
          text-brand-ivory
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-max container-px">
          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-12
              lg:gap-16
            "
          >
            <div className="lg:col-span-6">
              <Reveal>
                <div>
                  <span
                    className="
                      section-eyebrow
                      mb-3
                      block
                      text-brand-saffron
                    "
                  >
                    Manufacturing Philosophy
                  </span>

                  <h2
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
                      mt-5
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
                      mt-8
                      grid
                      gap-3
                      sm:grid-cols-3
                      sm:gap-4
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
                            p-4
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white/10
                            sm:p-5
                          "
                        >
                          <Icon
                            className="
                              mb-3
                              h-6
                              w-6
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
                    alt="Kawad Swad papad production line and factory environment"
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      aspect-[4/3]
                      h-full
                      w-full
                      object-cover
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
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <span className="section-eyebrow mb-3 block">
                Quality Assurance
              </span>

              <h2
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
                  mx-auto
                  mt-4
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
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-5
            "
          >
            {[
              'FSSAI Licence No. 21425890001224',
              '100% vegetarian production line',
              'Dedicated dietary variant options',
              'Sealed food-grade packaging',
              'Regular batch quality reviews',
              'Authentic regional spice blends',
              'Careful lentil flour sourcing',
              'Standardized quality control steps',
            ].map((point, index) => (
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
                    p-5
                    shadow-soft
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-lift
                    sm:p-6
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
            ))}
          </div>
        </div>
      </section>


      {/* ======================================================================
          B2B CTA
          =================================================================== */}

      <section
        className="
          border-t
          border-brand-green/10
          bg-brand-ivory-dark
          py-16
          sm:py-20
        "
      >
        <div className="container-max container-px text-center">
          <Reveal>
            <div className="mx-auto max-w-2xl">
              <span className="section-eyebrow mb-3 block">
                Business Partnerships
              </span>

              <h2
                className="
                  text-balance
                  font-serif
                  text-headline-sm
                  font-bold
                  text-brand-green
                  sm:text-headline-md
                "
              >
                Ready to partner with Kawad Swad?
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-4
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/70
                  sm:text-base
                "
              >
                Whether you are looking for bulk supply
                for your business or regional distribution
                partnerships, our team is ready to assist
                you.
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  justify-center
                  gap-3
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-4
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
