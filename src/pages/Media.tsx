import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero, PlaceholderImage } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { Youtube, Instagram, ArrowRight } from 'lucide-react';

export default function Media() {
  return (
    <>
      <SEO
        title="Media"
        description="Kawad Swad in the media — brand content, social channels and press resources. Follow us on Instagram and YouTube."
        path="/media"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Media', path: '/media' },
        ])}
      />

      <PageHero
        eyebrow="Press & Social"
        title="Media"
        description="Follow Kawad Swad across our social channels. Brand content, product highlights and more — all in one place."
      />

      <section className="container-max container-px py-12">
        {/* Social channels */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Reveal>
            <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="card p-8 hover:shadow-lift transition-shadow block group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red to-brand-yellow flex items-center justify-center mb-4">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-brown mb-2">Instagram</h2>
              <p className="text-sm text-brand-brown/60 mb-4">Follow @{brand.instagram} for product updates, recipes and behind-the-scenes content.</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red group-hover:gap-2 transition-all">
                Follow Us <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Reveal>
          <Reveal delay={100}>
            <a href={brand.youtubeUrl} target="_blank" rel="noopener noreferrer" className="card p-8 hover:shadow-lift transition-shadow block group">
              <div className="w-14 h-14 rounded-2xl bg-brand-brown flex items-center justify-center mb-4">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-brown mb-2">YouTube</h2>
              <p className="text-sm text-brand-brown/60 mb-4">Subscribe to {brand.youtube} for videos, product showcases and brand stories.</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red group-hover:gap-2 transition-all">
                Subscribe <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Reveal>
        </div>

        {/* Media gallery */}
        <Reveal>
          <h2 className="text-2xl font-serif font-bold text-brand-brown mb-6">Brand Content</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Product highlight',
            'Recipe video',
            'Manufacturing tour',
            'Brand story',
            'Customer feature',
            'Event coverage',
          ].map((label, i) => (
            <Reveal key={i} delay={i * 60}>
              <PlaceholderImage label={label} aspect="aspect-video" />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 card p-6 text-center bg-brand-cream-dark">
          <p className="text-sm text-brand-brown/60">
            These are placeholder images. Real Kawad Swad media content will replace them as it becomes available.
          </p>
        </div>
      </section>

      {/* Press contact */}
      <section className="bg-brand-brown text-brand-cream py-16">
        <div className="container-max container-px">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-bold text-white mb-3">Press & Media Enquiries</h2>
              <p className="text-brand-cream/70 mb-6">
                For press, media or collaboration enquiries, reach out to us directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`mailto:${brand.email}`} className="btn-yellow">{brand.email}</a>
                <a href={`tel:${brand.phoneRaw}`} className="btn-outline border-brand-cream/30 text-brand-cream hover:bg-brand-cream hover:text-brand-brown">{brand.phone}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
