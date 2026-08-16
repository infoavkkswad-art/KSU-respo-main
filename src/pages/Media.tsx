import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import {
  Youtube,
  Instagram,
  ArrowRight,
  ExternalLink,
  Play,
  Images,
} from 'lucide-react';

const instagramPosts = [
  'https://www.instagram.com/p/DY6L2CWIGUA/',
  'https://www.instagram.com/p/DY1qUpyIJA6/',
  'https://www.instagram.com/p/DYzIxAZIeBF/',
  'https://www.instagram.com/p/DYR2S3IIlJR/',
  'https://www.instagram.com/p/DYMz7OdImRo/',
  'https://www.instagram.com/p/DYCqkF5IAB2/',
];

const mediaSections = [
  {
    title: 'Instagram',
    description:
      'Real products, Reels, behind-the-scenes moments and the everyday Kawad Swad journey.',
    icon: Instagram,
    href: brand.instagramUrl,
    action: 'Visit Instagram',
    image: '/images/pages/gallery-hero.png',
  },
  {
    title: 'YouTube',
    description:
      'Watch Kawad Swad videos, product showcases, brand stories and longer-form content.',
    icon: Youtube,
    href: brand.youtubeUrl,
    action: 'Visit YouTube',
    image: '/images/pages/blog-hero.png',
  },
];

export default function Media() {
  return (
    <>
      <SEO
        title="Media"
        description="Discover Kawad Swad across Instagram and YouTube, including real brand content, Reels, videos, product stories and behind-the-scenes moments."
        path="/media"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Media', path: '/media' },
        ])}
      />

      <PageHero
        eyebrow="Press & Social"
        title="Kawad Swad in Media"
        description="Explore our real social content, videos and visual stories across Instagram and YouTube."
      />

      <section className="container-max container-px py-12 sm:py-16 lg:py-20">
        {/* Social channels */}
        <div className="grid gap-6 sm:grid-cols-2">
          {mediaSections.map((channel, index) => {
            const Icon = channel.icon;

            return (
              <Reveal
                key={channel.title}
                delay={index * 100}
              >
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group relative block overflow-hidden
                    rounded-3xl
                    border border-brand-brown/10
                    bg-white
                    shadow-card
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-lift
                  "
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-brand-ivory">
                    <img
                      src={channel.image}
                      alt={`${channel.title} - Kawad Swad`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="
                        h-full w-full object-cover
                        transition-transform duration-700
                        group-hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute inset-0
                        bg-gradient-to-t
                        from-brand-brown/70
                        via-brand-brown/10
                        to-transparent
                      "
                    />

                    <div
                      className="
                        absolute bottom-5 left-5
                        flex h-12 w-12
                        items-center justify-center
                        rounded-2xl
                        bg-white/95
                        text-brand-saffron
                        shadow-lift
                        backdrop-blur-sm
                      "
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-brand-green">
                          {channel.title}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-brand-brown/65">
                          {channel.description}
                        </p>
                      </div>

                      <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-brand-brown/30 transition-colors group-hover:text-brand-saffron" />
                    </div>

                    <span
                      className="
                        mt-5 inline-flex items-center gap-2
                        text-sm font-semibold
                        text-brand-saffron
                      "
                    >
                      {channel.action}
                      <ArrowRight
                        className="
                          h-4 w-4
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        {/* Instagram content */}
        <Reveal>
          <div className="mt-16 mb-8 flex items-end justify-between gap-4 sm:mt-20">
            <div>
              <p className="section-eyebrow mb-2 text-xs sm:text-sm">
                Real Content
              </p>

              <h2 className="font-serif text-2xl font-bold text-brand-green sm:text-3xl">
                From our Instagram
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-brown/60">
                A selection of recent Kawad Swad posts and Reels.
              </p>
            </div>

            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                hidden shrink-0 items-center gap-2
                rounded-full
                border border-brand-brown/10
                bg-white
                px-4 py-2
                text-xs font-semibold
                text-brand-brown
                shadow-soft
                transition-all
                hover:-translate-y-0.5
                hover:shadow-card
                sm:inline-flex
              "
            >
              View All
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {instagramPosts.map((url, index) => (
            <Reveal
              key={url}
              delay={Math.min(index * 60, 300)}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group relative block
                  overflow-hidden
                  rounded-3xl
                  border border-brand-brown/10
                  bg-brand-ivory
                  shadow-card
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-lift
                "
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={
                      index === 0
                        ? '/images/pages/gallery-hero.png'
                        : index === 1
                          ? '/images/pages/featured-article.png'
                          : '/images/pages/blog-hero.png'
                    }
                    alt={`Kawad Swad Instagram content ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="
                      h-full w-full object-cover
                      transition-transform duration-700
                      group-hover:scale-105
                    "
                  />

                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-t
                      from-black/65
                      via-transparent
                      to-transparent
                    "
                  />

                  <div
                    className="
                      absolute left-4 top-4
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-white/90
                      text-brand-saffron
                      shadow-card
                      backdrop-blur-sm
                    "
                  >
                    <Instagram className="h-5 w-5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <span className="text-xs font-semibold text-white">
                      Kawad Swad
                    </span>

                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        bg-white/90
                        px-3 py-1.5
                        text-[10px] font-semibold
                        text-brand-brown
                        shadow-sm
                      "
                    >
                      <Play className="h-3 w-3 fill-current" />
                      View
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Gallery connection */}
        <Reveal>
          <div
            className="
              mt-14 flex flex-col
              items-center justify-between
              gap-5 rounded-3xl
              border border-brand-brown/10
              bg-brand-ivory-dark
              p-6
              text-center
              sm:flex-row
              sm:p-8
              sm:text-left
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-brand-saffron/10
                  text-brand-saffron
                "
              >
                <Images className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-brand-green">
                  Want to see more?
                </h3>

                <p className="mt-1 text-sm text-brand-brown/60">
                  Explore our complete visual gallery.
                </p>
              </div>
            </div>

            <a
              href="/gallery"
              className="btn-primary shrink-0"
            >
              Open Gallery
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Press contact */}
      <section className="bg-brand-brown py-16 text-brand-cream lg:py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                Press & Media
              </p>

              <h2 className="mb-3 font-serif text-3xl font-bold text-white sm:text-4xl">
                Press & Media Enquiries
              </h2>

              <p className="mb-7 text-sm leading-relaxed text-brand-cream/70 sm:text-base">
                For press, media, content or collaboration enquiries,
                reach out to Kawad Swad directly.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={`mailto:${brand.email}`}
                  className="btn-yellow"
                >
                  {brand.email}
                </a>

                <a
                  href={`tel:${brand.phoneRaw}`}
                  className="
                    btn-outline
                    border-brand-cream/30
                    text-brand-cream
                    hover:bg-brand-cream
                    hover:text-brand-brown
                  "
                >
                  {brand.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
