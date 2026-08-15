import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PlaceholderImage } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';
import {
  Leaf,
  Shield,
  Factory,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

      {/* ================================================================
          MANUFACTURING HERO
      ================================================================= */}

      <section className="relative overflow-hidden">
        <div
          className="
            relative
            min-h-[360px]
            w-full
            bg-brand-brown
            sm:min-h-[440px]
            lg:min-h-[560px]
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
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-brown/85
              via-brand-brown/55
              to-brand-brown/15
            "
          />

          <div
            className="
              container-max
              container-px
              relative
              flex
              min-h-[360px]
              items-center
              sm:min-h-[440px]
              lg:min-h-[560px]
            "
          >
            <div className="max-w-3xl py-14 sm:py-16 lg:py-20">
              <span
                className="
                  mb-4
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-brand-yellow
                  sm:text-sm
                "
              >
                Our Process
              </span>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.05]
                  tracking-tight
                  text-white
                  sm:text-5xl
                  lg:text-7xl
                "
              >
                Crafted with precision,
                <br />
                <span className="text-brand-yellow">
                  grounded in tradition.
                </span>
              </h1>

              <p
                className="
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
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          EDITORIAL PROCESS STEPS
      ================================================================= */}

      <section className="container-max container-px py-16 sm:py-20 lg:py-28">
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, index) => (
            <Reveal key={step.num}>
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
                  <div
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-brand-brown/10
                      bg-brand-cream-dark
                      shadow-lift
                      sm:rounded-3xl
                    "
                  >
                    <PlaceholderImage
                      label={`${step.title} — real process photography pending`}
                      aspect="aspect-[4/3]"
                    />
                  </div>
                </div>

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
                      text-brand-red/20
                      sm:text-6xl
                    "
                  >
                    {step.num}
                  </span>

                  <h2
                    className="
                      mb-4
                      font-serif
                      text-2xl
                      font-bold
                      text-brand-brown
                      sm:text-3xl
                      lg:text-4xl
                    "
                  >
                    {step.title}
                  </h2>

                  <p
                    className="
                      text-sm
                      leading-relaxed
                      text-brand-brown/70
                      sm:text-base
                      lg:text-lg
                    "
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================================================================
          MANUFACTURING PHILOSOPHY + REAL FACTORY IMAGE
      ================================================================= */}

      <section className="bg-brand-brown py-16 text-brand-cream sm:py-20 lg:py-24">
        <div className="container-max container-px">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Reveal>
                <div>
                  <span
                    className="
                      mb-3
                      block
                      text-sm
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-brand-yellow
                    "
                  >
                    Manufacturing Philosophy
                  </span>

                  <h2
                    className="
                      mb-6
                      font-serif
                      text-3xl
                      font-bold
                      text-white
                      sm:text-4xl
                    "
                  >
                    Honoring tradition through
                    structured execution.
                  </h2>

                  <p
                    className="
                      mb-10
                      text-sm
                      leading-relaxed
                      text-brand-cream/80
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
                      grid
                      gap-4
                      border-t
                      border-brand-cream/15
                      pt-6
                      sm:grid-cols-3
                      sm:gap-6
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
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          p-4
                          sm:p-5
                        "
                      >
                        <item.icon
                          className="mb-3 h-6 w-6 text-brand-yellow"
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

                        <p className="text-xs text-brand-cream/60">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={150}>
                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-brand-brown-dark
                    shadow-lift
                    sm:rounded-3xl
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

      {/* ================================================================
          OPERATIONAL STANDARDS
      ================================================================= */}

      <section className="container-max container-px py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <span className="section-eyebrow mb-3 block">
              Quality Assurance
            </span>

            <h2
              className="
                font-serif
                text-3xl
                font-bold
                text-brand-brown
                sm:text-4xl
              "
            >
              Standards built into every batch
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
              delay={index * 40}
            >
              <div
                className="
                  card
                  flex
                  h-full
                  items-start
                  gap-3
                  border
                  border-brand-brown/5
                  bg-white
                  p-5
                  shadow-soft
                  sm:p-6
                "
              >
                <Check
                  className="
                    mt-0.5
                    h-5
                    w-5
                    shrink-0
                    text-brand-red
                  "
                  aria-hidden="true"
                />

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
      </section>

      {/* ================================================================
          B2B CTA
      ================================================================= */}

      <section className="border-t border-brand-brown/5 bg-brand-cream-dark py-16 sm:py-20">
        <div className="container-max container-px text-center">
          <Reveal>
            <div className="mx-auto max-w-2xl">
              <h2
                className="
                  mb-4
                  font-serif
                  text-2xl
                  font-bold
                  text-brand-brown
                  sm:text-3xl
                "
              >
                Ready to partner with Kawad Swad?
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-brand-brown/70 sm:text-base">
                Whether you are looking for bulk supply
                for your business or regional distribution
                partnerships, our team is ready to assist
                you.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/bulk-orders"
                  className="btn-primary justify-center px-8 py-3"
                >
                  Request Bulk Supply
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>

                <Link
                  to="/distributor"
                  className="btn-outline justify-center px-8 py-3"
                >
                  Become a Distributor
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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
