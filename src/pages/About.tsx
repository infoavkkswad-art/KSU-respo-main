import { Link } from 'react-router-dom';
import {
  Leaf,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Factory,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Kawad Swad is a premium papad brand from Nimar, Madhya Pradesh, crafting authentic traditional papads with dependable quality standards."
        path="/about"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      {/* ================================================================
          EDITORIAL HERO
      ================================================================= */}

      <section className="relative overflow-hidden border-b border-brand-brown/5 bg-brand-cream py-16 sm:py-20 lg:py-28">
        <div className="container-max container-px">
          <div className="max-w-3xl">
            <span className="section-eyebrow mb-4 block">
              Our Brand Story
            </span>

            <h1
              className="
                mb-6
                font-serif
                text-4xl
                font-bold
                leading-[1.05]
                tracking-tight
                text-brand-brown
                sm:text-5xl
                lg:text-7xl
              "
            >
              From Nimar, with{' '}
              <span className="text-brand-red">
                tradition.
              </span>
            </h1>

            <p
              className="
                text-base
                font-normal
                leading-relaxed
                text-brand-brown/70
                sm:text-lg
                lg:text-xl
              "
            >
              Kawad Swad brings the authentic taste of
              Nimar’s papad-making heritage to kitchens
              across India, uniting time-honored recipes
              with the reliability of modern food
              manufacturing.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          BRAND INTRODUCTION & NIMAR CONNECTION
      ================================================================= */}

      <section className="container-max container-px py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <div>
                <span className="section-eyebrow mb-3 block">
                  The Region
                </span>

                <h2
                  className="
                    mb-6
                    font-serif
                    text-3xl
                    font-bold
                    text-brand-brown
                    sm:text-4xl
                  "
                >
                  Rooted in the fertile soil of Nimar,
                  Madhya Pradesh.
                </h2>

                <div className="space-y-4 text-base leading-relaxed text-brand-brown/70">
                  <p>
                    Nimar is a historical region renowned
                    for its deep agricultural roots and rich
                    culinary craftsmanship. It is the home
                    of Kawad Swad, established by{' '}
                    {brand.manufacturer} to give traditional
                    Indian papads a dependable, professional
                    platform.
                  </p>

                  <p>
                    Our papads carry the distinct warmth and
                    flavor of this region. We work with
                    carefully selected local ingredients and
                    authentic spice blends to produce papads
                    that taste the way traditional papad
                    should.
                  </p>

                  <blockquote
                    className="
                      my-6
                      rounded-r-xl
                      border-l-2
                      border-brand-red
                      bg-brand-cream-dark
                      p-4
                      font-devanagari
                      text-lg
                      text-brand-brown/90
                    "
                  >
                    {brand.tagline}
                  </blockquote>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={150}>
              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-brown/10
                  bg-brand-cream-dark
                  shadow-lift
                "
              >
                <img
                  src="/images/pages/about-hero.png"
                  alt="Kawad Swad and the Nimar region"
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
      </section>

      {/* ================================================================
          CORE VALUES
      ================================================================= */}

      <section className="border-y border-brand-brown/5 bg-brand-cream-dark py-16 sm:py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
              <span className="section-eyebrow mb-3 block">
                What We Stand For
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
                Built on uncompromising principles.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
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
                desc: 'Expertise in lentil processing, dough mixing, rolling, and sun-drying techniques.',
              },
              {
                icon: Sparkles,
                title: 'Customer Trust',
                desc: 'Transparent business operations, dependable fulfillment, and clear labeling for retail and B2B partners.',
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={index * 80}
                >
                  <div
                    className="
                      card
                      flex
                      h-full
                      flex-col
                      border
                      border-brand-brown/5
                      bg-white
                      p-6
                      shadow-soft
                      transition-all
                      hover:shadow-lift
                      sm:p-8
                    "
                  >
                    <div
                      className="
                        mb-5
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-brand-red/5
                      "
                    >
                      <Icon
                        className="h-6 w-6 text-brand-red"
                        aria-hidden="true"
                      />
                    </div>

                    <h3
                      className="
                        mb-3
                        font-serif
                        text-lg
                        font-semibold
                        text-brand-brown
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
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          HERITAGE & DIETARY PHILOSOPHY
      ================================================================= */}

      <section className="container-max container-px py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <Reveal>
              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-brown/10
                  bg-brand-cream-dark
                  shadow-lift
                "
              >
                <img
                  src="/images/pages/about-poster.png"
                  alt="Kawad Swad traditional preparation and culinary heritage"
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

          <div className="order-1 lg:order-2 lg:col-span-6">
            <Reveal delay={150}>
              <div>
                <span className="section-eyebrow mb-3 block">
                  Heritage & Dietary Choices
                </span>

                <h2
                  className="
                    mb-6
                    font-serif
                    text-3xl
                    font-bold
                    text-brand-brown
                    sm:text-4xl
                  "
                >
                  Honoring traditional culinary roots.
                </h2>

                <div className="space-y-4 text-base leading-relaxed text-brand-brown/70">
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
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          QUALITY-FOCUSED APPROACH & MANUFACTURER DETAILS
      ================================================================= */}

      <section className="bg-brand-brown py-16 text-brand-cream sm:py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="max-w-3xl">
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
                Manufacturer Credibility
              </span>

              <h2
                className="
                  mb-6
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Crafted by Kawad Swad Udhyog.
              </h2>

              <p
                className="
                  mb-10
                  text-base
                  leading-relaxed
                  text-brand-cream/80
                  sm:text-lg
                "
              >
                Every packet of Kawad Swad papad reflects
                our dedication to proper hygiene, structured
                packaging, and dependable supply chains. We
                invite you to explore our production methods
                or get in touch for commercial partnerships.
              </p>

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  border-t
                  border-brand-cream/15
                  pt-6
                  text-sm
                  text-brand-cream/70
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-6
                "
              >
                <span className="flex items-center gap-2">
                  <Factory
                    className="h-4 w-4 shrink-0 text-brand-yellow"
                    aria-hidden="true"
                  />
                  {brand.manufacturer}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin
                    className="h-4 w-4 shrink-0 text-brand-yellow"
                    aria-hidden="true"
                  />
                  {brand.region}
                </span>

                <span className="flex items-center gap-2">
                  <Shield
                    className="h-4 w-4 shrink-0 text-brand-yellow"
                    aria-hidden="true"
                  />
                  FSSAI Licence No. {brand.fssai}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/manufacturing"
                  className="btn-yellow justify-center px-6 py-3 sm:px-8"
                >
                  View Manufacturing Process
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>

                <Link
                  to="/bulk-orders"
                  className="
                    btn-outline
                    justify-center
                    border-brand-cream/30
                    px-6
                    py-3
                    text-brand-cream
                    hover:bg-white/10
                    sm:px-8
                  "
                >
                  Explore Bulk Supply
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================
          CTA
      ================================================================= */}

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
