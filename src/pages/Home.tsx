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

   Spacing strategy:
   - Compact first viewport
   - Strong visual hierarchy
   - Reduced empty vertical space
   - Consistent shared design system
   - No unnecessary page-level whitespace
   ========================================================================== */


export default function Home() {
  const featured =
    ProductService.getFeaturedProducts();


  /* ==========================================================================
     HERO VIDEO
     ======================================================================== */

  const videoSrc =
    '/videos/home-hero.mp4';

  const posterSrc =
    '/images/pages/home-hero-poster.png';


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
          py-7
          sm:py-10
          lg:py-14
        "
      >

        {/* --------------------------------------------------------------------
            BACKGROUND GRID
            ----------------------------------------------------------------- */}

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


        {/* --------------------------------------------------------------------
            DECORATIVE CIRCLE
            ----------------------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-56
            w-56
            rounded-full
            border
            border-brand-saffron/15
            sm:h-80
            sm:w-80
            lg:-right-40
            lg:-top-40
            lg:h-[34rem]
            lg:w-[34rem]
          "
          aria-hidden="true"
        />


        {/* --------------------------------------------------------------------
            HERO CONTENT
            ----------------------------------------------------------------- */}

        <div className="container-max container-px relative">

          <div
            className="
              grid
              items-center
              gap-7
              lg:grid-cols-12
              lg:gap-9
              xl:gap-14
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

              <span
                className="
                  section-eyebrow
                  mb-3
                  block
                "
              >
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
                  mt-4
                  max-w-xl
                  text-base
                  leading-relaxed
                  text-brand-brown/70
                  sm:text-lg
                  lg:mt-5
                "
              >
                Traditional flavour, made with care.
                Discover crisp, authentic papads rooted
                in the taste and food culture of Nimar.
              </p>


              {/* --------------------------------------------------------------
                  HERO ACTIONS
                  -------------------------------------------------------------- */}

              <div
                className="
                  mt-6
                  flex
                  w-full
                  flex-col
                  gap-2.5
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-3
                "
              >

                <Link
                  to="/shop"
                  className="
                    btn-primary
                    min-h-[48px]
                    w-full
                    px-6
                    sm:w-auto
                    sm:px-7
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
                    min-h-[48px]
                    w-full
                    px-6
                    sm:w-auto
                    sm:px-7
                  "
                >
                  Our Story
                </Link>

              </div>


              {/* --------------------------------------------------------------
                  BRAND MICRO COPY
                  -------------------------------------------------------------- */}

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  items-center
                  gap-x-4
                  gap-y-1.5
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
                HERO VIDEO
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
                  w-full
                  max-w-[400px]
                  lg:max-w-[410px]
                "
              >

                {/* ------------------------------------------------------------
                    VIDEO CONTAINER
                    ------------------------------------------------------------ */}

                <div
                  className="
                    image-premium
                    relative
                    aspect-[9/16]
                    overflow-hidden
                    rounded-3xl
                    bg-brand-ivory-dark
                    shadow-lift
                  "
                >

                  <video
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                    "
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                    aria-label="Kawad Swad welcoming papad mascot hero video"
                  >

                    <source
                      src={videoSrc}
                      type="video/mp4"
                    />

                    <img
                      src={posterSrc}
                      alt="Kawad Swad welcoming mascot"
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                      "
                    />

                    Your browser does not support the hero video.

                  </video>


                  {/* ----------------------------------------------------------
                      PREMIUM OVERLAY
                      ---------------------------------------------------------- */}

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


                {/* ============================================================
                    DIMENSIONAL ACCENT
                    ========================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-6
                    -right-6
                    h-24
                    w-24
                    rounded-full
                    border
                    border-brand-saffron/30
                    sm:-bottom-7
                    sm:-right-7
                    sm:h-32
                    sm:w-32
                  "
                  aria-hidden="true"
                />


                {/* ============================================================
                    HERITAGE BADGE
                    ========================================================= */}

                <div
                  className="
                    absolute
                    -bottom-3
                    left-3
                    rounded-2xl
                    bg-brand-green
                    px-4
                    py-3
                    shadow-card
                    sm:-bottom-4
                    sm:-left-4
                    sm:px-5
                    sm:py-4
                  "
                  aria-hidden="true"
                >

                  <p
                    className="
                      font-serif
                      text-base
                      font-bold
                      leading-tight
                      text-brand-ivory
                      sm:text-lg
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

        <div
          className="
            container-max
            container-px
            py-5
            sm:py-6
          "
        >

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
                      py-2
                      text-center
                      sm:min-h-[58px]
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
          py-10
          sm:py-14
          lg:py-18
        "
      >

        <div className="container-max container-px relative">

          <Reveal>

            <div className="mx-auto max-w-2xl text-center">

              <span
                className="
                  section-eyebrow
                  mb-2.5
                  block
                "
              >
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
                  mt-3
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
                mt-8
                grid
                grid-cols-2
                gap-3
                sm:mt-10
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
              mt-8
              text-center
              sm:mt-10
            "
          >

            <Link
              to="/shop"
              className="
                btn-outline
                min-h-[44px]
                px-6
                sm:px-7
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
          py-10
          text-brand-ivory
          sm:py-14
          lg:py-18
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -left-20
            top-1/2
            h-56
            w-56
            -translate-y-1/2
            rounded-full
            border
            border-brand-saffron/20
            sm:h-80
            sm:w-80
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

            <Reveal className="lg:col-span-5">

              <span
                className="
                  mb-2.5
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
                  mt-4
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
                  mt-6
                  inline-flex
                  min-h-[42px]
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
                    className="
                      rounded-3xl
                      bg-brand-green-dark
                    "
                  />

                </div>


                <Sparkles
                  className="
                    absolute
                    -right-3
                    -top-3
                    h-7
                    w-7
                    text-brand-saffron
                    sm:-right-4
                    sm:-top-4
                    sm:h-9
                    sm:w-9
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
          py-10
          sm:py-14
          lg:py-18
        "
      >

        <div className="container-max container-px">

          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-12
              lg:gap-12
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

              <span
                className="
                  section-eyebrow
                  mb-2.5
                  block
                "
              >
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
                  mt-4
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


              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  gap-2.5
                "
              >

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
                  mt-6
                  inline-flex
                  min-h-[42px]
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
          py-10
          sm:py-14
          lg:py-16
        "
      >

        <div className="container-max container-px">

          <Reveal>

            <div className="mx-auto max-w-2xl text-center">

              <span
                className="
                  section-eyebrow
                  mb-2.5
                  block
                "
              >
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
                  mt-3
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
              mt-8
              grid
              gap-3
              sm:grid-cols-3
              lg:mt-10
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
                      p-4
                      sm:p-5
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
                        mt-3
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


          <div
            className="
              mt-8
              text-center
            "
          >

            <Link
              to="/manufacturing"
              className="
                btn-outline
                min-h-[44px]
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
