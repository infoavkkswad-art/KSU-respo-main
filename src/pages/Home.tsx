import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';

import { SEO, organizationSchema } from '@/components/SEO';
import { ProductCard } from '@/components/ProductCard';
import { PlaceholderImage } from '@/components/Section';
import {
  Reveal,
  CTABanner,
} from '@/components/Reveal';
import { ProductService } from '@/services/product-service';
import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   HOME PAGE

   Conversion flow:
   ATTENTION → TRUST → CHOICE → DESIRE → MEANING → PROOF → ACTION

   The page intentionally consumes the central design system rather than
   creating page-specific visual tokens.
   ========================================================================== */


export default function Home() {
  const featured =
    ProductService.getFeaturedProducts();


  /* ==========================================================================
     TRUST DATA
     ======================================================================== */

  const trustItems = [
    {
      icon: Leaf,
      title: '100% Vegetarian',
      description: 'Made for the whole table',
    },
    {
      icon: ShieldCheck,
      title: 'FSSAI Registered',
      description: `Licence ${brand.fssai}`,
    },
    {
      icon: Utensils,
      title: 'Traditional Recipe',
      description: 'Rooted in Nimar',
    },
  ];


  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <>
      <SEO
        title="Kawad Swad | Nimar's Own Papad"
        description="Discover Kawad Swad papads from Nimar, made with traditional recipes, authentic ingredients and dependable quality."
        path="/"
        structuredData={organizationSchema()}
      />


      {/* ======================================================================
          HERO
          ATTENTION → DESIRE
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-ivory
          py-10
          sm:py-16
          lg:py-24
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-grid
            opacity-40
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-72
            w-72
            rounded-full
            border
            border-brand-saffron/15
            sm:h-[28rem]
            sm:w-[28rem]
            lg:-right-48
            lg:-top-48
            lg:h-[42rem]
            lg:w-[42rem]
          "
          aria-hidden="true"
        />

        <div className="container-max container-px relative">
          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-12
              lg:gap-12
              xl:gap-20
            "
          >

            {/* ================================================================
                HERO COPY
                ============================================================= */}

            <div
              className="
                animate-fade-up
                lg:col-span-6
              "
            >
              <span className="section-eyebrow mb-4 block">
                Nimar · Since 2025
              </span>

              <h1
                className="
                  max-w-3xl
                  font-serif
                  text-display-sm
                  font-bold
                  text-brand-green
                "
              >
                Nimar's own
                <br />
                <span className="text-brand-saffron">
                  papad.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-xl
                  text-base
                  leading-relaxed
                  text-brand-brown/70
                  sm:text-lg
                  lg:mt-7
                "
              >
                Traditional flavour, made with care.
                Discover crisp, authentic papads rooted
                in the taste and food culture of Nimar.
              </p>

              <div
                className="
                  mt-8
                  flex
                  w-full
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-4
                "
              >
                <Link
                  to="/shop"
                  className="
                    btn-primary
                    min-h-[50px]
                    w-full
                    px-7
                    sm:w-auto
                    sm:px-8
                  "
                >
                  Shop Papads

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to="/about"
                  className="
                    btn-outline
                    min-h-[50px]
                    w-full
                    px-7
                    sm:w-auto
                    sm:px-8
                  "
                >
                  Our Story
                </Link>
              </div>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  items-center
                  gap-x-5
                  gap-y-2
                  text-xs
                  text-brand-brown/55
                "
              >
                <span>
                  निमाड़ का अपना पापड़
                </span>

                <span
                  className="
                    h-1
                    w-1
                    rounded-full
                    bg-brand-saffron
                  "
                  aria-hidden="true"
                />

                <span>
                  100% Vegetarian
                </span>
              </div>
            </div>


            {/* ================================================================
                HERO VISUAL
                ============================================================= */}

            <div
              className="
                relative
                lg:col-span-6
              "
            >
              <div
                className="
                  relative
                  mx-auto
                  max-w-[560px]
                "
              >
                <div
                  className="
                    image-premium
                    relative
                    aspect-[4/5]
                    bg-brand-ivory-dark
                    shadow-lift
                    sm:aspect-[5/6]
                  "
                >
                  <img
                    src="/images/pages/product-showcase.png"
                    alt="Kawad Swad premium papad collection"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                    fetchPriority="high"
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-brand-green/15
                      via-transparent
                      to-white/10
                    "
                    aria-hidden="true"
                  />
                </div>


                {/* Dimensional accent */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-8
                    -right-8
                    h-28
                    w-28
                    rounded-full
                    border
                    border-brand-saffron/30
                    sm:h-40
                    sm:w-40
                  "
                  aria-hidden="true"
                />


                {/* Heritage badge */}

                <div
                  className="
                    absolute
                    -bottom-4
                    left-4
                    rounded-2xl
                    bg-brand-green
                    px-5
                    py-4
                    shadow-card
                    sm:-bottom-5
                    sm:-left-5
                    sm:px-6
                    sm:py-5
                  "
                >
                  <p
                    className="
                      font-serif
                      text-lg
                      font-bold
                      leading-tight
                      text-brand-ivory
                      sm:text-xl
                    "
                  >
                    निमाड़ का
                    <br />
                    अपना पापड़
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ======================================================================
          TRUST STRIP
          MEANING → TRUST
          =================================================================== */}

      <section
        className="
          border-y
          border-brand-green/10
          bg-brand-green
          text-brand-ivory
        "
      >
        <div className="container-max container-px py-7 sm:py-8">
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              sm:divide-x
              sm:divide-brand-ivory/15
            "
          >
            {trustItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-3
                      px-3
                      py-3
                      text-center
                      sm:min-h-[62px]
                      sm:px-5
                    "
                  >
                    <Icon
                      className="
                        h-5
                        w-5
                        shrink-0
                        text-brand-saffron
                      "
                      aria-hidden="true"
                    />

                    <div className="text-left">
                      <p
                        className="
                          text-xs
                          font-semibold
                          sm:text-sm
                        "
                      >
                        {item.title}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-2xs
                          text-brand-ivory/55
                          sm:text-xs
                        "
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>


      {/* ======================================================================
          PRODUCT DISCOVERY
          CHOICE
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-ivory-light
          py-16
          sm:py-20
          lg:py-28
        "
      >
        <div className="container-max container-px relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="section-eyebrow mb-3 block">
                Find Your Taste
              </span>

              <h2
                className="
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Something for every craving.
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
                From familiar classics to bold masalas,
                choose the papad that belongs on your table.
              </p>
            </div>
          </Reveal>


          {featured.length > 0 && (
            <div
              className="
                mt-10
                grid
                grid-cols-2
                gap-3
                sm:mt-12
                sm:gap-5
                md:grid-cols-3
                lg:grid-cols-4
                lg:gap-6
              "
            >
              {featured.map(
                (
                  product,
                  index,
                ) => (
                  <Reveal
                    key={product.id}
                    delay={Math.min(
                      index * 60,
                      300,
                    )}
                  >
                    <ProductCard
                      product={product}
                    />
                  </Reveal>
                ),
              )}
            </div>
          )}


          <div
            className="
              mt-10
              text-center
              sm:mt-12
            "
          >
            <Link
              to="/shop"
              className="
                btn-outline
                min-h-[46px]
                px-6
                sm:px-8
              "
            >
              Explore All Papads

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* ======================================================================
          SENSORY MOMENT
          DESIRE
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
          py-16
          text-brand-ivory
          sm:py-20
          lg:py-28
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -left-24
            top-1/2
            h-72
            w-72
            -translate-y-1/2
            rounded-full
            border
            border-brand-saffron/20
            sm:h-[26rem]
            sm:w-[26rem]
          "
          aria-hidden="true"
        />

        <div className="container-max container-px relative">
          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-12
              lg:gap-16
            "
          >
            <Reveal className="lg:col-span-5">
              <span
                className="
                  mb-3
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-brand-saffron
                  sm:text-sm
                "
              >
                The Crisp Moment
              </span>

              <h2
                className="
                  font-serif
                  text-headline-md
                  font-bold
                  text-white
                "
              >
                Hear it.
                <br />
                See it.
                <br />
                <span className="text-brand-saffron">
                  Taste it.
                </span>
              </h2>

              <p
                className="
                  mt-5
                  max-w-lg
                  text-base
                  leading-relaxed
                  text-brand-ivory/70
                  sm:text-lg
                "
              >
                A good papad begins with tradition
                and ends with that unmistakable crisp bite.
              </p>

              <Link
                to="/shop"
                className="
                  mt-7
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  font-semibold
                  text-brand-saffron
                  transition-all
                  duration-200
                  hover:gap-3
                "
              >
                Find your favourite

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>


            <Reveal
              delay={100}
              className="lg:col-span-7"
            >
              <div
                className="
                  relative
                  mx-auto
                  max-w-2xl
                "
              >
                <div
                  className="
                    image-premium
                    border
                    border-brand-ivory/10
                    bg-brand-green-dark
                    shadow-lift
                  "
                >
                  <PlaceholderImage
                    label="Papad texture and crisp moment"
                    aspect="aspect-[4/3]"
                    className="rounded-3xl bg-brand-green-dark"
                  />
                </div>

                <Sparkles
                  className="
                    absolute
                    -right-3
                    -top-3
                    h-8
                    w-8
                    text-brand-saffron
                    sm:-right-5
                    sm:-top-5
                    sm:h-10
                    sm:w-10
                  "
                  aria-hidden="true"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          HERITAGE
          MEANING
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-16
          sm:py-20
          lg:py-28
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
            <Reveal className="lg:col-span-6">
              <PlaceholderImage
                label="Kawad Swad heritage and making"
                aspect="aspect-[4/3]"
                className="rounded-3xl"
              />
            </Reveal>

            <Reveal
              delay={100}
              className="lg:col-span-6"
            >
              <span className="section-eyebrow mb-3 block">
                From Nimar
              </span>

              <h2
                className="
                  max-w-xl
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                A familiar taste,
                carried forward.
              </h2>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-base
                  leading-relaxed
                  text-brand-brown/70
                  sm:text-lg
                "
              >
                Kawad Swad brings the taste of Nimar
                into everyday kitchens, respecting
                traditional recipes while building with
                modern discipline and dependable standards.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="badge-green">
                  Nimar Heritage
                </span>

                <span className="badge-yellow">
                  Traditional Recipe
                </span>

                <span className="badge-brown">
                  Made with Care
                </span>
              </div>

              <Link
                to="/about"
                className="
                  mt-8
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  font-semibold
                  text-brand-green
                  transition-all
                  duration-200
                  hover:gap-3
                "
              >
                Discover Our Story

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          MANUFACTURING / TRUST
          PROOF
          =================================================================== */}

      <section
        className="
          border-y
          border-brand-green/10
          bg-brand-ivory-dark
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="section-eyebrow mb-3 block">
                From Flour to Crisp
              </span>

              <h2
                className="
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                Tradition, made with precision.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                Careful sourcing, consistent preparation,
                quality inspection and secure packaging are
                built into every batch.
              </p>
            </div>
          </Reveal>


          <div
            className="
              mt-10
              grid
              gap-3
              sm:grid-cols-3
              lg:mt-12
              lg:grid-cols-5
            "
          >
            {[
              ['01', 'Prepare'],
              ['02', 'Shape'],
              ['03', 'Dry'],
              ['04', 'Inspect'],
              ['05', 'Pack'],
            ].map(
              (
                [number, title],
                index,
              ) => (
                <Reveal
                  key={number}
                  delay={index * 50}
                >
                  <div
                    className="
                      card-flat
                      relative
                      h-full
                      p-5
                    "
                  >
                    <span
                      className="
                        font-serif
                        text-3xl
                        font-bold
                        text-brand-saffron/60
                      "
                    >
                      {number}
                    </span>

                    <h3
                      className="
                        mt-4
                        font-serif
                        text-lg
                        font-semibold
                        text-brand-green
                      "
                    >
                      {title}
                    </h3>
                  </div>
                </Reveal>
              ),
            )}
          </div>


          <div className="mt-10 text-center">
            <Link
              to="/manufacturing"
              className="
                btn-outline
                min-h-[46px]
                px-6
              "
            >
              See How We Make It

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* ======================================================================
          FINAL CTA
          ACTION
          =================================================================== */}

      <CTABanner
        title="Bring Nimar to your table."
        description="Choose your favourite Kawad Swad papad and make every meal a little more memorable."
        primaryLabel="Shop Papads"
        primaryLink="/shop"
        secondaryLabel="Our Story"
        secondaryLink="/about"
      />
    </>
  );
}
