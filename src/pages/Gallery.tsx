import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero, PlaceholderImage } from '@/components/Section';
import { Reveal } from '@/components/Reveal';

const galleryItems = [
  {
    label: 'PRODUCTS — Kawad Swad product collection',
    aspect: 'aspect-[16/9]',
    span: 'col-span-2 lg:col-span-2 row-span-2',
    category: 'Brand & Products',
    image: '/images/pages/gallery-hero.png',
  },
  {
    label: 'INGREDIENTS — Ingredient photography',
    aspect: 'aspect-[4/3]',
    span: 'col-span-1 lg:col-span-1',
    category: 'Making & Craft',
  },
  {
    label: 'MANUFACTURING — Manufacturing photography',
    aspect: 'aspect-[4/3]',
    span: 'col-span-1 lg:col-span-1',
    category: 'Making & Craft',
  },
  {
    label: 'PROCESS — Papad making process',
    aspect: 'aspect-square',
    span: 'col-span-1 lg:col-span-1',
    category: 'Making & Craft',
  },
  {
    label: 'PROCESS — Traditional preparation',
    aspect: 'aspect-[16/9]',
    span: 'col-span-2 lg:col-span-2',
    category: 'Making & Craft',
  },
  {
    label: 'QUALITY — Quality and hygiene',
    aspect: 'aspect-square',
    span: 'col-span-1 lg:col-span-1',
    category: 'Quality',
  },
  {
    label: 'PACKAGING — Kawad Swad packaging',
    aspect: 'aspect-[4/3]',
    span: 'col-span-2 lg:col-span-2',
    category: 'Packaging',
  },
  {
    label: 'NIMAR — Nimar heritage and food culture',
    aspect: 'aspect-[16/9]',
    span: 'col-span-2 lg:col-span-2',
    category: 'Food Culture',
  },
];

export default function Gallery() {
  return (
    <>
      <SEO
        title="Gallery"
        description="Explore the Kawad Swad visual story through products, ingredients, manufacturing, packaging and Nimar heritage."
        path="/gallery"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
        ])}
      />

      <PageHero
        eyebrow="Visual Story"
        title="The Kawad Swad Gallery"
        description="A visual journey through our products, craft, packaging and the Nimar roots behind Kawad Swad."
      />

      <section className="container-max container-px py-12 sm:py-16 lg:py-24">
        <div
          className="
            grid
            grid-cols-2
            gap-3
            auto-rows-[180px]
            sm:gap-4
            sm:auto-rows-[220px]
            lg:gap-6
            lg:auto-rows-[260px]
          "
        >
          {galleryItems.map((item, index) => (
            <Reveal
              key={item.label}
              delay={Math.min(index * 60, 300)}
              className={item.span}
            >
              <div className="group h-full">
                <div
                  className="
                    relative
                    h-full
                    overflow-hidden
                    rounded-2xl
                    border
                    border-brand-brown/10
                    bg-brand-cream-dark
                    shadow-soft
                    transition-all
                    duration-300
                    hover:shadow-lift
                    sm:rounded-3xl
                  "
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.label}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="
                        block
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <PlaceholderImage
                      label={item.label}
                      aspect={item.aspect}
                      className="
                        h-full
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  )}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      bottom-0
                      bg-gradient-to-t
                      from-black/30
                      to-transparent
                      opacity-0
                      transition-opacity
                      duration-300
                      group-hover:opacity-100
                    "
                  />

                  <span
                    className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      bg-white/90
                      px-2.5
                      py-1
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-brand-brown
                      shadow-sm
                      backdrop-blur-sm
                      sm:left-4
                      sm:top-4
                      sm:px-3
                    "
                  >
                    {item.category}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div
            className="
              mx-auto
              mt-12
              max-w-2xl
              rounded-2xl
              border
              border-brand-brown/10
              bg-brand-cream-dark
              p-6
              text-center
              sm:mt-16
              sm:p-8
            "
          >
            <p className="text-sm font-medium leading-relaxed text-brand-brown/70">
              More real Kawad Swad photography will be added
              to the gallery as our visual library grows.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
