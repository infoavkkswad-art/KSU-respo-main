import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero, PlaceholderImage } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { blogService, blogCategories } from '@/data/blog';

export default function Blog() {
  const [category, setCategory] = useState<string>('All');

  const allPosts = useMemo(() => blogService.getAll(), []);
  const filteredPosts = useMemo(() => blogService.getByCategory(category), [category]);

  // Featured article is the most recent post when viewing 'All' or when no category filter overrides it
  const featuredPost = category === 'All' ? allPosts[0] : null;
  const standardPosts = category === 'All' ? allPosts.slice(1) : filteredPosts;

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

      <PageHero
        eyebrow="Kawad Swad Journal"
        title="Stories, Recipes & Tradition"
        description="Explorations into papad craftsmanship, Indian thali traditions, kitchen tips and brand updates from our team in Nimar."
      />

      <section className="container-max container-px py-16 lg:py-24">
        {/* Category filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                category === cat
                  ? 'bg-brand-red text-white shadow-soft'
                  : 'bg-brand-brown/5 text-brand-brown/70 hover:bg-brand-brown/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Hero (Shown on 'All') */}
        {featuredPost && category === 'All' && (
          <Reveal className="mb-16">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group grid lg:grid-cols-12 gap-8 items-center card p-6 lg:p-10 bg-white border border-brand-brown/10 shadow-soft hover:shadow-lift transition-all"
            >
              <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-brand-cream-dark">
                <PlaceholderImage label={`FEATURED — ${featuredPost.category}`} aspect="aspect-[16/9]" className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-md bg-brand-red/10 text-brand-red font-semibold text-xs tracking-wider uppercase">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-brand-brown/50 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-brand-brown group-hover:text-brand-red transition-colors mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-base text-brand-brown/70 leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-brand-brown/10 text-xs text-brand-brown/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {featuredPost.date}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-red group-hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Standard Posts Grid */}
        {standardPosts.length === 0 ? (
          <div className="card p-12 text-center bg-brand-cream-dark">
            <p className="text-brand-brown/60">No articles in this category yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {standardPosts.map((post, i) => (
              <Reveal key={post.slug} delay={Math.min(i * 60, 300)}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col h-full card bg-white border border-brand-brown/10 overflow-hidden hover:shadow-lift transition-all"
                >
                  <div className="overflow-hidden bg-brand-cream-dark">
                    <PlaceholderImage label={post.category} aspect="aspect-video" className="transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-brand-brown/5 text-brand-brown/70">
                          {post.category}
                        </span>
                        <span className="text-2xs text-brand-brown/50">{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-brand-brown group-hover:text-brand-red transition-colors mb-3 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-brand-brown/65 leading-relaxed line-clamp-2 mb-6">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-brand-brown/5 flex items-center justify-between text-2xs text-brand-brown/50">
                      <span>{post.date}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-red group-hover:gap-1.5 transition-all">
                        Read <ArrowRight className="w-3.5 h-3.5" />
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
