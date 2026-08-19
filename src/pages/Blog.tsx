import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';

import {
  SEO,
  breadcrumbSchema,
} from '@/components/SEO';

import { Reveal } from '@/components/Reveal';

import {
  blogCategories,
  blogService,
} from '@/data/blog';


/* ==========================================================================
   KAWAD SWAD 2.0
   BLOG / JOURNAL

   FLOW:
   HERO
   → CATEGORY FILTER
   → FEATURED ARTICLE
   → ARTICLE GRID

   DESIGN RULES:
   - Compact hero
   - Full hero artwork visibility
   - Full featured artwork visibility
   - Reduced vertical whitespace
   - Clean article-card rhythm
   - Mobile-first spacing
   - Central Kawad Swad visual language
   ========================================================================== */


const BLOG_HERO_IMAGE =
  '/images/pages/blog-hero.png';

const FEATURED_ARTICLE_IMAGE =
  '/images/pages/featured-article.png';


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Blog() {

  const [
    category,
    setCategory,
  ] = useState<string>('All');


  /* ------------------------------------------------------------------------
     POSTS
     ------------------------------------------------------------------------ */

  const allPosts = useMemo(
    () => blogService.getAll(),
    [],
  );


  const filteredPosts = useMemo(
    () =>
      blogService.getByCategory(
        category,
      ),
    [category],
  );


  const featuredPost =
    category === 'All'
      ? allPosts[0]
      : null;


  const standardPosts =
    category === 'All'
      ? allPosts.slice(1)
      : filteredPosts;


  return (
    <>
      {/* ======================================================================
          SEO
          =================================================================== */}

      <SEO
        title="Journal & Stories"
        description="The Kawad Swad Journal, featuring recipes, papad knowledge, Indian food traditions, brand updates and business insights from Nimar."
        path="/blog"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Blog',
            path: '/blog',
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
        aria-labelledby="blog-page-title"
      >

        <div
          className="
            relative
            min-h-[270px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[315px]
            lg:min-h-[355px]
          "
        >

          {/* ==================================================================
              HERO ARTWORK

              The supplied artwork is displayed completely.
              No object-cover is used.
              ================================================================== */}

          <div
            className="
              pointer-events-none
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
              src={BLOG_HERO_IMAGE}
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
              opacity-[0.035]
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              DECORATIVE RING
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
              min-h-[270px]
              items-center
              sm:min-h-[315px]
              lg:min-h-[355px]
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
                    text-brand-saffron
                  "
                >
                  Kawad Swad Journal
                </span>


                <h1
                  id="blog-page-title"
                  className="
                    text-balance
                    font-serif
                    text-3xl
                    font-bold
                    leading-[1.03]
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Stories, Recipes
                  <br />

                  <span className="text-brand-saffron">
                    &amp; Tradition
                  </span>
                </h1>


                <p
                  className="
                    text-pretty
                    mt-2.5
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-white/80
                    sm:text-base
                    lg:text-lg
                  "
                >
                  Explorations into papad craftsmanship,
                  Indian thali traditions, kitchen tips and
                  brand updates from our team in Nimar.
                </p>

              </div>

            </Reveal>

          </div>

        </div>

      </section>


      {/* ======================================================================
          CONTENT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-7
          sm:py-9
          lg:py-11
        "
        aria-label="Kawad Swad journal articles"
      >

        <div className="container-max container-px">


          {/* ==================================================================
              CATEGORY FILTER
              ================================================================= */}

          <Reveal>

            <div
              className="
                mb-5
                flex
                flex-wrap
                items-center
                justify-center
                gap-1.5
                sm:mb-6
                sm:gap-2
              "
              role="group"
              aria-label="Filter articles by category"
            >

              {blogCategories.map(
                (cat) => {

                  const isActive =
                    category === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setCategory(cat)
                      }
                      aria-pressed={
                        isActive
                      }
                      className={`
                        min-h-[38px]
                        rounded-full
                        border
                        px-3.5
                        py-1.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        transition-all
                        duration-200
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-brand-ivory
                        sm:min-h-[40px]
                        sm:px-4
                        sm:text-xs

                        ${
                          isActive
                            ? `
                              border-brand-green
                              bg-brand-green
                              text-white
                              shadow-soft
                            `
                            : `
                              border-brand-green/10
                              bg-white
                              text-brand-brown/70
                              hover:-translate-y-0.5
                              hover:border-brand-green/20
                              hover:bg-brand-green/5
                              hover:text-brand-green
                            `
                        }
                      `}
                    >
                      {cat}
                    </button>
                  );
                },
              )}

            </div>

          </Reveal>


          {/* ==================================================================
              FEATURED ARTICLE
              ================================================================= */}

          {featuredPost && (
            <Reveal
              className="
                mb-6
                sm:mb-8
              "
            >

              <Link
                to={`/blog/${featuredPost.slug}`}
                aria-label={`Read featured article: ${featuredPost.title}`}
                className="
                  group
                  grid
                  items-center
                  gap-4
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-white
                  p-2.5
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lift
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                  focus-visible:ring-offset-2
                  sm:gap-5
                  sm:p-4
                  lg:grid-cols-12
                  lg:gap-6
                  lg:p-5
                "
              >

                {/* ============================================================
                    FEATURED IMAGE
                    ========================================================= */}

                <div
                  className="
                    image-premium
                    overflow-hidden
                    bg-brand-ivory-dark
                    lg:col-span-7
                  "
                >

                  <img
                    src={FEATURED_ARTICLE_IMAGE}
                    alt={featuredPost.title}
                    loading="eager"
                    decoding="async"
                    className="
                      block
                      aspect-[16/9]
                      h-full
                      w-full
                      object-contain
                      bg-brand-ivory-dark
                      transition-transform
                      duration-500
                      group-hover:scale-[1.01]
                    "
                  />

                </div>


                {/* ============================================================
                    FEATURED CONTENT
                    ========================================================= */}

                <div
                  className="
                    flex
                    flex-col
                    justify-center
                    lg:col-span-5
                  "
                >

                  <div
                    className="
                      mb-2
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >

                    <span className="badge-red">
                      {featuredPost.category}
                    </span>


                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-[10px]
                        text-brand-brown/50
                        sm:text-xs
                      "
                    >
                      <Clock
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />

                      {featuredPost.readTime}
                    </span>

                  </div>


                  <h2
                    className="
                      text-balance
                      mb-2.5
                      font-serif
                      text-2xl
                      font-bold
                      leading-tight
                      text-brand-green
                      transition-colors
                      duration-200
                      group-hover:text-brand-saffron
                      sm:text-3xl
                    "
                  >
                    {featuredPost.title}
                  </h2>


                  <p
                    className="
                      mb-3.5
                      line-clamp-3
                      text-pretty
                      text-sm
                      leading-relaxed
                      text-brand-brown/70
                      sm:text-base
                    "
                  >
                    {featuredPost.excerpt}
                  </p>


                  <div
                    className="
                      flex
                      flex-col
                      gap-2
                      border-t
                      border-brand-green/10
                      pt-2.5
                      text-xs
                      text-brand-brown/60
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                      "
                    >
                      <Calendar
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />

                      {featuredPost.date}
                    </span>


                    <span
                      className="
                        inline-flex
                        min-h-[32px]
                        items-center
                        gap-1
                        font-semibold
                        text-brand-green
                        transition-all
                        duration-200
                        group-hover:gap-2
                      "
                    >
                      Read Article

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                  </div>

                </div>

              </Link>

            </Reveal>
          )}


          {/* ==================================================================
              STANDARD POSTS
              ================================================================= */}

          {standardPosts.length === 0 ? (

            <Reveal>

              <div
                className="
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-brand-ivory-dark
                  p-7
                  text-center
                  sm:p-9
                "
              >

                <span className="section-eyebrow">
                  Journal
                </span>


                <p
                  className="
                    mt-2
                    text-sm
                    text-brand-brown/60
                  "
                >
                  No articles in this category yet.
                </p>

              </div>

            </Reveal>

          ) : (

            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
                sm:gap-4
                lg:grid-cols-3
                lg:gap-5
              "
            >

              {standardPosts.map(
                (post, index) => (

                  <Reveal
                    key={post.slug}
                    delay={Math.min(
                      index * 45,
                      240,
                    )}
                  >

                    <Link
                      to={`/blog/${post.slug}`}
                      aria-label={`Read article: ${post.title}`}
                      className="
                        group
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-brand-green/10
                        bg-white
                        shadow-card
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lift
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >

                      {/* ======================================================
                          ARTICLE VISUAL
                          =================================================== */}

                      <div
                        className="
                          overflow-hidden
                          bg-brand-ivory-dark
                        "
                      >

                        <div
                          className="
                            flex
                            aspect-[16/9]
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-brand-ivory-dark
                            via-brand-ivory
                            to-brand-saffron/10
                            p-4
                            transition-transform
                            duration-500
                            group-hover:scale-[1.015]
                            sm:p-5
                          "
                        >

                          <span
                            className="
                              max-w-[78%]
                              text-center
                              font-serif
                              text-sm
                              font-semibold
                              leading-snug
                              text-brand-brown/40
                              sm:text-base
                            "
                          >
                            {post.category}
                          </span>

                        </div>

                      </div>


                      {/* ======================================================
                          ARTICLE CONTENT
                          =================================================== */}

                      <div
                        className="
                          flex
                          flex-1
                          flex-col
                          justify-between
                          p-3.5
                          sm:p-4
                        "
                      >

                        <div>

                          <div
                            className="
                              mb-2
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >

                            <span className="badge-brown">
                              {post.category}
                            </span>


                            <span
                              className="
                                shrink-0
                                text-[9px]
                                text-brand-brown/50
                              "
                            >
                              {post.readTime}
                            </span>

                          </div>


                          <h3
                            className="
                              text-balance
                              mb-2
                              font-serif
                              text-lg
                              font-semibold
                              leading-snug
                              text-brand-green
                              transition-colors
                              duration-200
                              group-hover:text-brand-saffron
                              sm:text-xl
                            "
                          >
                            {post.title}
                          </h3>


                          <p
                            className="
                              mb-4
                              line-clamp-2
                              text-pretty
                              text-sm
                              leading-relaxed
                              text-brand-brown/65
                            "
                          >
                            {post.excerpt}
                          </p>

                        </div>


                        {/* ====================================================
                            ARTICLE META
                            ================================================= */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            border-t
                            border-brand-green/10
                            pt-2.5
                            text-[10px]
                            text-brand-brown/50
                          "
                        >

                          <span>
                            {post.date}
                          </span>


                          <span
                            className="
                              inline-flex
                              min-h-[30px]
                              items-center
                              gap-1
                              font-semibold
                              text-brand-green
                              transition-all
                              duration-200
                              group-hover:gap-1.5
                            "
                          >
                            Read

                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>

                        </div>

                      </div>

                    </Link>

                  </Reveal>

                ),
              )}

            </div>

          )}

        </div>

      </section>
    </>
  );
}
