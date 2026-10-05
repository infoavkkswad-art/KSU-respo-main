import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  Utensils,
  Star,
  Clock,
  Smile,
} from 'lucide-react';

import { SEO, organizationSchema } from '@/components/SEO';
import { ProductCard } from '@/components/ProductCard';
import {
  Reveal,
  CTABanner,
} from '@/components/Reveal';
import { ProductService } from '@/services/product-service';
import { brand } from '@/data/brand';
import { blogPosts } from '@/data/blog';


/* ==========================================================================
   KAWAD SWAD 2.0
   HOME PAGE

   Conversion flow:
   ATTENTION → TRUST → CHOICE → DESIRE → MEANING → PROOF → ACTION

   Hero update:
   - Better vertical balance
   - Stronger mascot presence
   - Reduced dead space
   - More premium visual composition
   - Desktop and mobile responsive
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
          py-5
          sm:py-7
          lg:py-9
          xl:py-11
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
            opacity-30
          "
          aria-hidden="true"
        />


        {/* --------------------------------------------------------------------
            LARGE DECORATIVE CIRCLE
            ----------------------------------------------------------------- */}

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
            sm:h-72
            sm:w-72
            lg:-right-40
            lg:-top-44
            lg:h-[34rem]
            lg:w-[34rem]
            xl:h-[38rem]
            xl:w-[38rem]
          "
          aria-hidden="true"
        />


        {/* --------------------------------------------------------------------
            SECONDARY DECORATIVE ARC
            ----------------------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-20
            hidden
            h-44
            w-44
            rounded-full
            border
            border-brand-green/10
            lg:block
            xl:h-56
            xl:w-56
          "
          aria-hidden="true"
        />


        {/* --------------------------------------------------------------------
            HERO CONTENT
            ----------------------------------------------------------------- */}

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
              sm:gap-8
              lg:min-h-[610px]
              lg:grid-cols-12
              lg:gap-8
              xl:min-h-[650px]
              xl:gap-12
            "
          >

            {/* ================================================================
                HERO COPY
                ============================================================= */}

            <div
              className="
                animate-fade-up
                lg:col-span-6
                lg:-translate-y-6
                xl:-translate-y-8
              "
            >

              <span
                className="
                  section-eyebrow
                  mb-2.5
                  block
                  sm:mb-3
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
                  leading-[0.94]
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
                  sm:mt-5
                  sm:text-lg
                  lg:max-w-[560px]
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
                  mt-5
                  flex
                  w-full
                  flex-col
                  gap-2.5
                  sm:mt-6
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
                    shadow-green-glow
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    sm:w-auto
                    sm:px-7
                  "
                >
                  Shop Papads

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
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
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
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
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-x-4
                  gap-y-1.5
                  text-xs
                  text-brand-brown/55
                  sm:mt-6
                "
              >

                <span>
                  निमाड़ का अपना पापड़
                </span>

                <span
                  className="
                    h-1
                    w-1
                    shrink-0
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
                  max-w-[430px]
                  sm:max-w-[450px]
                  lg:max-w-[455px]
                  xl:max-w-[480px]
                "
              >

                {/* ------------------------------------------------------------
                    BACKGROUND DEPTH
                    ------------------------------------------------------------ */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-5
                    bottom-[-14px]
                    top-5
                    rounded-[2rem]
                    bg-brand-saffron/10
                    blur-[1px]
                    sm:inset-x-6
                    sm:bottom-[-18px]
                  "
                  aria-hidden="true"
                />


                {/* ------------------------------------------------------------
                    VIDEO CONTAINER
                    ------------------------------------------------------------ */}

                <div
                  className="
                    image-premium
                    relative
                    z-10
                    aspect-[9/16]
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-brand-green/10
                    bg-brand-ivory-dark
                    shadow-lift
                    transition-transform
                    duration-700
                    ease-ks-standard
                    hover:-translate-y-1
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
                      PREMIUM VIDEO OVERLAY
                      ---------------------------------------------------------- */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-brand-green/20
                      via-transparent
                      to-white/10
                    "
                    aria-hidden="true"
                  />


                  {/* ----------------------------------------------------------
                      TOP GLASS HIGHLIGHT
                      ---------------------------------------------------------- */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      h-24
                      bg-gradient-to-b
                      from-white/10
                      to-transparent
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
                    -bottom-5
                    -right-5
                    z-0
                    h-24
                    w-24
                    rounded-full
                    border
                    border-brand-saffron/30
                    sm:-bottom-7
                    sm:-right-7
                    sm:h-32
                    sm:w-32
                    lg:h-36
                    lg:w-36
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
                    z-20
                    rounded-2xl
                    border
                    border-brand-ivory/10
                    bg-brand-green
                    px-4
                    py-3
                    shadow-card
                    sm:-bottom-4
                    sm:-left-5
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

          {/* ==================================================================
              CATEGORY DISCOVERY CARDS (Amazon-style fast visual navigation)
              ================================================================== */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { name: 'Moong Family', sub: 'Traditional Crisp', category: 'moong', count: '13 SKUs', badge: 'Classic' },
              { name: 'Chana Family', sub: 'Hearty Crunch', category: 'chana', count: '10 SKUs', badge: 'Popular' },
              { name: 'Urad Family', sub: 'Bold & Spiced', category: 'urad', count: '16 SKUs', badge: 'Special' },
              { name: 'Combo Packs', sub: 'Family Assortment', category: 'combo', count: '4 SKUs', badge: 'Best Value' },
            ].map((cat) => (
              <Link
                key={cat.category}
                to={`/shop?category=${cat.category}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-green/10 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-saffron/40 hover:shadow-card"
              >
                <div>
                  <span className="inline-block rounded-full bg-brand-green/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-green">
                    {cat.badge}
                  </span>
                  <h3 className="mt-2 font-serif text-base font-bold text-brand-green group-hover:text-brand-saffron transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-brand-brown/60">
                    {cat.sub}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-brand-green/5 pt-2 text-xs font-semibold text-brand-brown/50 group-hover:text-brand-green">
                  <span>{cat.count}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>


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
                    overflow-hidden
                    rounded-3xl
                  "
                >

                  <img
                    src="/images/pages/product-showcase.png"
                    alt="Authentic Kawad Swad papads texture and crisp presentation"
                    className="
                      aspect-[4/3]
                      w-full
                      object-cover
                    "
                    loading="lazy"
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

              <div className="overflow-hidden rounded-3xl border border-brand-green/10 shadow-lift">
                <img
                  src="/images/pages/home-trust.png"
                  alt="Kawad Swad traditional papad heritage in Nimar"
                  className="
                    aspect-[4/3]
                    w-full
                    object-cover
                  "
                  loading="lazy"
                />
              </div>

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
          PAPAD SQUAD
          BRAND PERSONALITY & JOY
          =================================================================== */}

      <section
        className="
          bg-brand-cream/50
          py-12
          sm:py-16
          lg:py-20
          border-b
          border-brand-green/10
        "
      >
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="section-eyebrow mb-2.5 block text-brand-saffron">
                Brand Personality
              </span>
              <h2 className="font-serif text-headline-md font-bold text-brand-green">
                Meet the Papad Squad
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-brown/65 sm:text-base">
                Every Kawad Swad papad has its own distinct personality, crafted with authentic regional flavours and joyful spirit.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {[
              {
                name: 'Munchy Moong',
                tagline: 'Light, Crispy & Gentle',
                description: 'Our traditional recipe moong papad. Crisp, airy, and perfect for family thalis.',
                category: 'moong',
                color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              },
              {
                name: 'Crunchy Chana',
                tagline: 'Hearty & Golden',
                description: 'Made with wholesome chana dal flour for that robust bite and nutty crunch.',
                category: 'chana',
                color: 'bg-amber-50 text-amber-800 border-amber-200',
              },
              {
                name: 'Urad Ustad',
                tagline: 'Bold & Punchy',
                description: 'The heavyweight classic seasoned with black pepper and authentic spices.',
                category: 'urad',
                color: 'bg-stone-50 text-stone-800 border-stone-200',
              },
              {
                name: 'Masala Mitra',
                tagline: 'Zesty & Lively',
                description: 'For those who love extra chatpata flavour with their evening chai and gatherings.',
                category: 'combo',
                color: 'bg-orange-50 text-orange-800 border-orange-200',
              },
            ].map((squad, idx) => (
              <Reveal key={squad.name} delay={idx * 60}>
                <div className={`h-full rounded-3xl border p-5 sm:p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 ${squad.color}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft">
                    <Smile className="h-6 w-6 text-brand-saffron" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-brand-brown">
                    {squad.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-brand-saffron-dark">
                    {squad.tagline}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-brown/70">
                    {squad.description}
                  </p>
                  <Link
                    to={`/shop?category=${squad.category}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                  >
                    <span>Taste this family</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ======================================================================
          REVIEWS / CUSTOMER VOICE
          AUTHENTIC TRANSPARENCY (Rule #13)
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-12
          sm:py-16
          lg:py-20
          border-b
          border-brand-green/10
        "
      >
        <div className="container-max container-px">
          <div className="mx-auto max-w-3xl rounded-3xl border border-brand-green/10 bg-white p-6 sm:p-8 lg:p-10 shadow-card text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/5 text-brand-green">
              <Star className="h-6 w-6 fill-brand-saffron text-brand-saffron" aria-hidden="true" />
            </div>

            <span className="section-eyebrow mt-4 block">Customer Voice</span>

            <h2 className="mt-1 font-serif text-2xl font-bold text-brand-green sm:text-3xl">
              Authentic Feedback from Real Homes
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-brand-brown/65">
              We never fabricate star counts, testimonials, or false review counts. Every rating on our platform comes from real patrons who enjoy Kawad Swad papads at their dining tables.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/reviews"
                className="btn-primary min-h-[44px] px-6 text-xs sm:text-sm"
              >
                Read Customer Reviews
              </Link>
              <Link
                to="/reviews"
                className="btn-outline min-h-[44px] px-6 text-xs sm:text-sm"
              >
                Share Your Experience
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ======================================================================
          JOURNAL / RECIPES & KNOWLEDGE
          =================================================================== */}

      <section
        className="
          bg-brand-ivory-light
          py-12
          sm:py-16
          lg:py-20
        "
      >
        <div className="container-max container-px">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="section-eyebrow mb-2 block">Papad Journal</span>
              <h2 className="font-serif text-headline-md font-bold text-brand-green">
                From Our Kitchen to Yours
              </h2>
              <p className="mt-1 text-sm text-brand-brown/65">
                Roasting tips, easy recipes, and stories from central India's culinary heart.
              </p>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-green hover:underline"
            >
              <span>Explore all articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post, idx) => (
              <Reveal key={post.slug} delay={idx * 80}>
                <article className="flex h-full flex-col justify-between rounded-3xl border border-brand-green/10 bg-white p-5 sm:p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card">
                  <div>
                    <div className="flex items-center justify-between text-2xs text-brand-brown/50">
                      <span className="rounded-full bg-brand-green/5 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-green">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="mt-3 font-serif text-lg font-bold text-brand-brown hover:text-brand-green transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-brand-brown/65 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-brand-green/5 pt-3">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-saffron hover:text-brand-saffron-dark"
                    >
                      <span>Read guide</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
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
