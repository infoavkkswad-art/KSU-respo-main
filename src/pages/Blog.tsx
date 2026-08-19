import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import {
  blogCategories,
  blogService,
} from '@/data/blog';


/* ==========================================================================
   KAWAD SWAD 2.0
   BLOG / JOURNAL

   Central design-system rules:
   - Typography comes from Tailwind brand tokens
   - Surfaces come from central card/shadow tokens
   - Buttons/actions use central interaction patterns
   - Motion uses the central Reveal component
   - Spacing follows the central rhythm

   Image system:
   - Blog hero artwork is displayed completely.
   - Featured article artwork remains fully visible.
   - No unnecessary vertical whitespace.
   ========================================================================== */


const BLOG_HERO_IMAGE =
  '/images/pages/blog-hero.png';

const FEATURED_ARTICLE_IMAGE =
  '/images/pages/featured-article.png';


export default function Blog() {
  const [category, setCategory] =
    useState<string>('All');

  const allPosts = useMemo(
    () => blogService.getAll(),
    [],
  );

  const filteredPosts = useMemo(
    () =>
      blogService.getByCategory(category),
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
            min-h-[340px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[400px]
            lg:min-h-[460px]
          "
        >

          {/* ==================================================================
              FULL HERO ARTWORK

              object-contain prevents the supplied artwork from being cropped.
              Any remaining area is filled by the brand-green background.
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
              src={BLOG_HERO_IMAGE}
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


          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/90
              via-brand-green/55
              to-transparent
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/25
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
              min-h-[340px]
              items-center
              sm:min-h-[400px]
              lg:min-h-[460px]
            "
          >
            <Reveal>
              <div
                className="
                  max-w-3xl
                  py-9
                  sm:py-11
                  lg:py-12
                "
              >
                <span
                  className="
                    section-eyebrow
                    mb-2.5
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
                    text-display-sm
                    font-bold
                    leading-[1.02]
                    text-white
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
                    mt-3
                    max-w-xl
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
          py-9
          sm:py-12
          lg:py-16
        "
        aria-label="Kawad Swad journal articles"
      >
        <div className="container-max container-px">


          {/* ==================================================================
              CATEGORY FILTER
              =============================================================== */}

          <Reveal>
            <div
              className="
                mb-7
                flex
                flex-wrap
                items-center
                justify-center
                gap-2
                sm:mb-8
              "
              role="group"
              aria-label="Filter articles by category"
            >
              {blogCategories.map((cat) => {
                const isActive =
                  category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setCategory(cat)
                    }
                    aria-pressed={isActive}
                    className={`
                      min-h-[40px]
                      rounded-full
                      border
                      px-4
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      transition-all
                      duration-200
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-brand-saffron
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-brand-ivory

                      sm:px-5
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
              })}
            </div>
          </Reveal>


          {/* ==================================================================
              FEATURED ARTICLE
              =================================================================== */}

          {featuredPost && (
            <Reveal className="mb-8 sm:mb-10">
              <Link
                to={`/blog/${featuredPost.slug}`}
                aria-label={`Read featured article: ${featuredPost.title}`}
                className="
                  group
                  grid
                  items-center
                  gap-5
                  overflow-hidden
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-white
                  p-3.5
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lift
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-saffron
                  focus-visible:ring-offset-2
                  sm:gap-6
                  sm:p-5
                  lg:grid-cols-12
                  lg:gap-7
                  lg:p-7
                "
              >
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
                    "
                  />
                </div>

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
                      mb-2.5
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
                        flex
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
                      mb-3
                      font-serif
                      text-headline-sm
                      font-bold
                      leading-tight
                      text-brand-green
                      transition-colors
                      duration-200
                      group-hover:text-brand-saffron
                      sm:text-headline-md
                    "
                  >
                    {featuredPost.title}
                  </h2>

                  <p
                    className="
                      mb-4
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
                      gap-2.5
                      border-t
                      border-brand-green/10
                      pt-3
                      text-xs
                      text-brand-brown/60
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <span
                      className="
                        flex
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
              =============================================================== */}

          {standardPosts.length === 0 ? (
            <Reveal>
              <div
                className="
                  rounded-3xl
                  border
                  border-brand-green/10
                  bg-brand-ivory-dark
                  p-8
                  text-center
                  sm:p-10
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
                gap-4
                sm:grid-cols-2
                sm:gap-5
                lg:grid-cols-3
                lg:gap-6
              "
            >
              {standardPosts.map((post, index) => (
                <Reveal
                  key={post.slug}
                  delay={Math.min(
                    index * 60,
                    300,
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
                    <div
                      className="
                        overflow-hidden
                        bg-brand-ivory-dark
                      "
                    >
                      <div
                        className="
                          flex
                          aspect-video
                          items-center
                          justify-center
                          bg-gradient-to-br
                          from-brand-ivory-dark
                          via-brand-ivory
                          to-brand-saffron/10
                          p-5
                          transition-transform
                          duration-500
                          group-hover:scale-[1.015]
                        "
                      >
                        <span
                          className="
                            max-w-[80%]
                            text-center
                            font-serif
                            text-sm
                            font-semibold
                            text-brand-brown/40
                          "
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        flex-1
                        flex-col
                        justify-between
                        p-4
                        sm:p-5
                      "
                    >
                      <div>
                        <div
                          className="
                            mb-2.5
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
                            mb-2.5
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
                            mb-5
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

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          border-t
                          border-brand-green/10
                          pt-3
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
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
