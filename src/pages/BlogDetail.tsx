import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { SEO, articleSchema, breadcrumbSchema } from '@/components/SEO';
import { PlaceholderImage } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { blogService } from '@/data/blog';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogService.getBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="container-max container-px py-20 text-center">
        <SEO title="Article Not Found" description="The article you are looking for could not be found." />
        <h1 className="text-3xl font-serif font-bold text-brand-brown mb-4">Article not found</h1>
        <Link to="/blog" className="btn-primary">Back to Journal</Link>
      </div>
    );
  }

  const related = blogService.getAll().filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        structuredData={{
          ...articleSchema(post.title, post.excerpt, post.date, post.author),
          ...breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        }}
      />

      {/* Breadcrumb */}
      <div className="container-max container-px pt-8">
        <nav className="flex items-center gap-2 text-xs text-brand-brown/60" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/blog" className="hover:text-brand-red transition-colors">Journal</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-brown font-medium truncate">{post.title}</span>
        </nav>
      </div>

      {/* Article header & content */}
      <article className="container-max container-px py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="mb-4">
              <span className="px-3 py-1 rounded-md bg-brand-red/10 text-brand-red font-semibold text-xs tracking-wider uppercase">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-brown leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-brand-brown/60 pb-8 border-b border-brand-brown/10">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-red" /> {post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> {post.readTime}</span>
              <span>By {post.author}</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="my-10 rounded-3xl overflow-hidden shadow-lift border border-brand-brown/10">
              <PlaceholderImage label={post.category} aspect="aspect-[16/9]" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <p className="text-lg lg:text-xl text-brand-brown/80 leading-relaxed font-serif italic mb-8 p-6 bg-brand-cream-dark rounded-2xl border-l-4 border-brand-red">
                {post.excerpt}
              </p>
              {post.content.map((para, i) => (
                <p key={i} className="text-base lg:text-lg text-brand-brown/75 leading-relaxed font-normal">
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 pt-8 border-t border-brand-brown/10">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-brown hover:text-brand-red transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Journal
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-brand-cream-dark py-16 lg:py-24 border-t border-brand-brown/5">
          <div className="container-max container-px">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-brand-brown mb-10">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link to={`/blog/${p.slug}`} className="group flex flex-col h-full card bg-white border border-brand-brown/10 overflow-hidden hover:shadow-lift transition-all">
                    <div className="overflow-hidden bg-brand-cream-dark">
                      <PlaceholderImage label={p.category} aspect="aspect-video" className="transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-brand-brown/5 text-brand-brown/70 mb-3 inline-block">
                          {p.category}
                        </span>
                        <h3 className="text-base font-serif font-semibold text-brand-brown group-hover:text-brand-red transition-colors mb-2 leading-snug">
                          {p.title}
                        </h3>
                      </div>
                      <div className="pt-4 border-t border-brand-brown/5 text-2xs text-brand-brown/50">
                        {p.readTime}
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
