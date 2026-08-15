import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { blogService, blogCategories } from '@/data/blog';

const BLOG_HERO_IMAGE = '/images/pages/blog-hero.png';
const FEATURED_ARTICLE_IMAGE =
  '/images/pages/featured-article.png';

export default function Blog() {
  const [category, setCategory] = useState<string>('All');

  const allPosts = useMemo(
    () => blogService.getAll(),
    [],
  );

  const filteredPosts = useMemo(
    () => blogService.getByCategory(category),
    [category],
  );

  const featuredPost =
    category === 'All' ? allPosts[0] : null;

  const standardPosts =
    category === 'All'
      ? allPosts.slice(1)
      : filteredPosts;

  return (
    <>
      <SEO
        title="Journal & Stories"
        description="The Kawad Swad Journal — recipes, papad knowledge, Indian food traditions, brand updates and business insights from Nimar."
        path="/blog"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      {/* ================================================================
          BLOG HERO
      ================================================================= */}

      <section className="relative overflow-hidden">
        <div
          className="
            relative
            aspect-[16/8]
            min-h-[280px]
            max-h-[560px]
            w-full
            bg-brand-brown
            sm:min-h-[340px]
          "
        >
          <img
            src={BLOG_HERO_IMAGE}
            alt="Kawad Swad Journal — stories, recipes and tradition"
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
              from-brand-brown/75
              via-brand-brown/35
              to-transparent
            "
          />

          <div
            className="
              container-max
              container-px
              relative
              flex
              h-full
              items-center
            "
          >
            <div className="max-w-2xl py-12 sm:py-16 lg:py-20">
              <span
                className="
                  mb-3
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-brand-yellow
                  sm:text-sm
                "
              >
                Kawad Swad Journal
              </span>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.05]
                  text-white
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Stories, Recipes
                <br />
                & Tradition
              </h1>

              <p
                className="
                  mt-4
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
          </div>
        </div>
      </section>

      <section className="container-max container-px py-12 sm:py-16 lg:py-24">
        {/* ================================================================
            CATEGORY FILTER
        ================================================================= */}

        <div
          className="
            mb-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
            sm:mb-12
          "
        >
          {blogCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`
                min-h-[40px]
                rounded-full
                px-4
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                transition-all
                sm:px-5
                sm:text-xs
                ${
                  category === cat
                    ? 'bg-brand-red text-white shadow-soft'
                    : 'bg-brand-brown/5 text-brand-brown/70 hover:bg-brand-brown/10'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ================================================================
            FEATURED ARTICLE
        ================================================================= */}

        {featuredPost && category === 'All' && (
          <Reveal className="mb-12 sm:mb-16">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="
                group
                grid
                items-center
                gap-6
                overflow-hidden
                rounded-3xl
                border
                border-brand-brown/10
                bg-white
                p-4
                shadow-soft
                transition-all
                hover:shadow-lift
                sm:p-6
                lg:grid-cols-12
                lg:gap-8
                lg:p-10
              "
            >
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  bg-brand-cream-dark
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
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
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
                    mb-3
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    sm:gap-3
                  "
                >
                  <span
                    className="
                      rounded-md
                      bg-brand-red/10
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-brand-red
                      sm:text-xs
                    "
                  >
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
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2
                  className="
                    mb-4
                    font-serif
                    text-2xl
                    font-bold
                    leading-tight
                    text-brand-brown
                    transition-colors
                    group-hover:text-brand-red
                    sm:text-3xl
                  "
                >
                  {featuredPost.title}
                </h2>

                <p
                  className="
                    mb-6
                    line-clamp-3
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
                    gap-3
                    border-t
                    border-brand-brown/10
                    pt-4
                    text-xs
                    text-brand-brown/60
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {featuredPost.date}
                  </span>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      font-semibold
                      text-brand-red
                      transition-all
                      group-hover:gap-2
                    "
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* ================================================================
            STANDARD POSTS
        ================================================================= */}

        {standardPosts.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-brand-brown/10
              bg-brand-cream-dark
              p-10
              text-center
              sm:p-12
            "
          >
            <p className="text-sm text-brand-brown/60">
              No articles in this category yet.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              sm:gap-6
              lg:grid-cols-3
              lg:gap-8
            "
          >
            {standardPosts.map((post, index) => (
              <Reveal
                key={post.slug}
                delay={Math.min(index * 60, 300)}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="
                    group
                    flex
                    h-full
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-brand-brown/10
                    bg-white
                    shadow-soft
                    transition-all
                    hover:shadow-lift
                  "
                >
                  <div className="overflow-hidden bg-brand-cream-dark">
                    <div
                      className="
                        flex
                        aspect-video
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-brand-cream-dark
                        via-brand-cream
                        to-brand-brown/5
                        p-5
                      "
                    >
                      <span
                        className="
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
                      p-5
                      sm:p-6
                    "
                  >
                    <div>
                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span
                          className="
                            rounded
                            bg-brand-brown/5
                            px-2.5
                            py-0.5
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-brand-brown/70
                          "
                        >
                          {post.category}
                        </span>

                        <span
                          className="
                            text-[9px]
                            text-brand-brown/50
                          "
                        >
                          {post.readTime}
                        </span>
                      </div>

                      <h3
                        className="
                          mb-3
                          font-serif
                          text-lg
                          font-semibold
                          leading-snug
                          text-brand-brown
                          transition-colors
                          group-hover:text-brand-red
                          sm:text-xl
                        "
                      >
                        {post.title}
                      </h3>

                      <p
                        className="
                          mb-6
                          line-clamp-2
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
                        border-brand-brown/5
                        pt-4
                        text-[10px]
                        text-brand-brown/50
                      "
                    >
                      <span>{post.date}</span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          font-semibold
                          text-brand-red
                          transition-all
                          group-hover:gap-1.5
                        "
                      >
                        Read
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
