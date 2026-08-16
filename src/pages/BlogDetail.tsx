import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  SEO,
  articleSchema,
  breadcrumbSchema,
} from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import { blogService } from '@/data/blog';

const BLOG_HERO_IMAGE = '/images/pages/blog-hero.png';
const FEATURED_ARTICLE_IMAGE =
  '/images/pages/featured-article.png';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug
    ? blogService.getBySlug(slug)
    : undefined;

  if (!post) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO
          title="Article Not Found"
          description="The article you are looking for could not be found."
        />

        <h1 className="mb-4 font-serif text-3xl font-bold text-brand-green">
          Article not found
        </h1>

        <Link to="/blog" className="btn-primary">
          Back to Journal
        </Link>
      </div>
    );
  }

  const related = blogService
    .getAll()
    .filter(
      (p) =>
        p.slug !== post.slug &&
        p.category === post.category,
    )
    .slice(0, 3);

  const isFeaturedArticle =
    blogService.getAll()[0]?.slug === post.slug;

  const articleImage = isFeaturedArticle
    ? FEATURED_ARTICLE_IMAGE
    : BLOG_HERO_IMAGE;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        image={`${window.location.origin}${articleImage}`}
        structuredData={{
          ...articleSchema(
            post.title,
            post.excerpt,
            post.date,
            post.author,
          ),
          ...breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            {
              name: post.title,
              path: `/blog/${post.slug}`,
            },
          ]),
        }}
      />

      {/* Breadcrumb */}
      <div className="container-max container-px pt-8">
        <nav
          className="
            flex items-center gap-2
            text-xs text-brand-brown/60
          "
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="transition-colors hover:text-brand-saffron"
          >
            Home
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <Link
            to="/blog"
            className="transition-colors hover:text-brand-saffron"
          >
            Journal
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="truncate font-medium text-brand-brown">
            {post.title}
          </span>
        </nav>
      </div>

      {/* Article */}
      <article className="container-max container-px py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mb-4">
              <span
                className="
                  inline-flex rounded-md
                  bg-brand-saffron/10
                  px-3 py-1
                  text-xs font-semibold
                  uppercase tracking-wider
                  text-brand-saffron
                "
              >
                {post.category}
              </span>
            </div>

            <h1
              className="
                mb-6
                font-serif font-bold
                leading-tight
                text-brand-green
                text-3xl
                sm:text-4xl
                lg:text-5xl
              "
            >
              {post.title}
            </h1>

            <div
              className="
                flex flex-wrap items-center gap-x-6 gap-y-2
                border-b border-brand-brown/10
                pb-8
                text-sm text-brand-brown/60
              "
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-brand-saffron" />
                {post.date}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-saffron" />
                {post.readTime}
              </span>

              <span>
                By {post.author}
              </span>
            </div>
          </Reveal>

          {/* Real article image */}
          <Reveal delay={100}>
            <figure
              className="
                my-10 overflow-hidden
                rounded-3xl
                border border-brand-brown/10
                bg-brand-ivory
                shadow-lift
              "
            >
              <img
                src={articleImage}
                alt={`${post.title} - Kawad Swad`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="
                  block
                  aspect-[16/9]
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.015]
                "
              />
            </figure>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <p
                className="
                  mb-8 rounded-2xl
                  border-l-4 border-brand-saffron
                  bg-brand-ivory-dark
                  p-6
                  font-serif italic
                  leading-relaxed
                  text-brand-brown/80
                  text-lg
                  lg:text-xl
                "
              >
                {post.excerpt}
              </p>

              {post.content.map((para, index) => (
                <p
                  key={index}
                  className="
                    text-base
                    font-normal
                    leading-relaxed
                    text-brand-brown/75
                    lg:text-lg
                  "
                >
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <div
            className="
              mt-12 border-t
              border-brand-brown/10
              pt-8
            "
          >
            <Link
              to="/blog"
              className="
                inline-flex items-center gap-2
                text-sm font-semibold
                text-brand-brown
                transition-colors
                hover:text-brand-saffron
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Journal
            </Link>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section
          className="
            border-t border-brand-brown/5
            bg-brand-ivory-dark
            py-16
            lg:py-24
          "
        >
          <div className="container-max container-px">
            <h2
              className="
                mb-10
                font-serif font-bold
                text-brand-green
                text-2xl
                lg:text-3xl
              "
            >
              Related Articles
            </h2>

            <div className="grid gap-8 sm:grid-cols-3">
              {related.map((relatedPost, index) => (
                <Reveal
                  key={relatedPost.slug}
                  delay={index * 60}
                >
                  <Link
                    to={`/blog/${relatedPost.slug}`}
                    className="
                      group flex h-full
                      flex-col overflow-hidden
                      rounded-2xl
                      border border-brand-brown/10
                      bg-white
                      shadow-card
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:shadow-lift
                    "
                  >
                    <div className="overflow-hidden bg-brand-ivory">
                      <img
                        src={BLOG_HERO_IMAGE}
                        alt={`${relatedPost.title} - Kawad Swad`}
                        loading="lazy"
                        decoding="async"
                        className="
                          block
                          aspect-video
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
                        flex flex-1
                        flex-col justify-between
                        p-6
                      "
                    >
                      <div>
                        <span
                          className="
                            mb-3 inline-block
                            rounded
                            bg-brand-saffron/10
                            px-2 py-0.5
                            text-2xs font-semibold
                            uppercase tracking-wider
                            text-brand-saffron
                          "
                        >
                          {relatedPost.category}
                        </span>

                        <h3
                          className="
                            mb-2
                            font-serif font-semibold
                            leading-snug
                            text-brand-green
                            transition-colors
                            group-hover:text-brand-saffron
                            text-base
                          "
                        >
                          {relatedPost.title}
                        </h3>
                      </div>

                      <div
                        className="
                          border-t border-brand-brown/5
                          pt-4
                          text-2xs
                          text-brand-brown/50
                        "
                      >
                        {relatedPost.readTime}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
