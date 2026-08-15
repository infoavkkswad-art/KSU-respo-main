import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Award } from 'lucide-react';

import { SEO, organizationSchema } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { PlaceholderImage } from '../components/Section';
import { Reveal, CTABanner } from '../components/Reveal';
import { ProductService } from '../services/product-service';
import { brand } from '../data/brand';

export default function Home() {
  const featured = ProductService.getFeaturedProducts();

  const trustItems = [
    {
      icon: Leaf,
      label: '100% Vegetarian',
    },
    {
      icon: Shield,
      label: `FSSAI Licence No. ${brand.fssai}`,
    },
    {
      icon: Award,
      label: 'Traditional Recipe',
    },
  ];

  return (
    <>
      <SEO
        title="Premium Papads from Nimar"
        description="Kawad Swad crafts premium papads with authentic ingredients, traditional taste and modern manufacturing standards. Shop moong, chana and urad papad online."
        path="/"
        structuredData={organizationSchema()}
      />

      {/* ================================================================
          HERO
      ================================================================= */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-cream
          py-12
          sm:py-16
          lg:py-24
          xl:py-28
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-brand-yellow/10
            blur-3xl
            sm:h-96
            sm:w-96
          "
          aria-hidden="true"
        />

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
              gap-10
              md:gap-12
              lg:grid-cols-12
              lg:gap-10
              xl:gap-16
            "
          >
            {/* Hero Content */}
            <div
              className="
                lg:col-span-6
                xl:col-span-6
                animate-fade-up
              "
            >
              <span
                className="
                  section-eyebrow
                  mb-3
                  block
                  text-xs
                  sm:mb-4
                  sm:text-sm
                "
              >
                Nimar Heritage
              </span>

              <h1
                className="
                  mb-5
                  max-w-3xl
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.02]
                  tracking-tight
                  text-brand-brown
                  sm:text-5xl
                  md:text-6xl
                  lg:mb-7
                  lg:text-6xl
                  xl:text-7xl
                "
              >
                The Taste of Nimar,
                <br />
                <span className="text-brand-red">
                  Authentic &amp; Pure.
                </span>
              </h1>

              <p
                className="
                  mb-7
                  max-w-xl
                  text-base
                  leading-relaxed
                  text-brand-brown/70
                  sm:mb-9
                  sm:text-lg
                  lg:mb-10
                "
              >
                Experience the heritage of authentic papads.
                Crafted with traditional recipes and dependable
                quality standards.
              </p>

              <div
                className="
                  flex
                  w-full
                  flex-col
                  gap-3
                  xs:flex-row
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-4
                "
              >
                <Link
                  to="/shop"
                  className="
                    btn-primary
                    min-h-[48px]
                    w-full
                    px-7
                    sm:w-auto
                    sm:px-8
                  "
                >
                  Shop Papads
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/about"
                  className="
                    btn-outline
                    min-h-[48px]
                    w-full
                    px-7
                    sm:w-auto
                    sm:px-8
                  "
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Hero Product */}
            <div
              className="
                relative
                lg:col-span-6
                xl:col-span-6
              "
            >
              <div
                className="
                  relative
                  mx-auto
                  w-full
                  max-w-[520px]
                  overflow-hidden
                  rounded-3xl
                  bg-brand-cream-dark
                  shadow-lift
                  aspect-[4/5]
                  sm:aspect-[5/6]
                  lg:aspect-[4/5]
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-10
                    bg-gradient-to-t
                    from-brand-brown/10
                    via-transparent
                    to-white/10
                  "
                  aria-hidden="true"
                />

                {featured[0] && (
                  <ProductImage
                    product={featured[0]}
                    variant="hero"
                    className="h-full w-full"
                  />
                )}
              </div>

              {/* Floating badge */}
              <div
                className="
                  absolute
                  -bottom-4
                  left-4
                  hidden
                  rounded-2xl
                  bg-brand-yellow
                  p-4
                  shadow-card
                  sm:block
                  sm:-bottom-5
                  sm:left-0
                  sm:p-5
                  lg:-left-5
                  lg:p-6
                "
              >
                <p
                  className="
                    font-serif
                    text-xl
                    font-bold
                    leading-tight
                    text-brand-brown
                    sm:text-2xl
                  "
                >
                  Pure
                  <br />
                  Traditional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TRUST STRIP
      ================================================================= */}

      <section
        className="
          border-y
          border-brand-brown/5
          bg-white
        "
      >
        <div
          className="
            container-max
            container-px
            py-7
            sm:py-8
            lg:py-10
          "
        >
          <div
            className="
              grid
              grid-cols-1
              divide-y
              divide-brand-brown/10
              sm:grid-cols-3
              sm:divide-x
              sm:divide-y-0
            "
          >
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="
                    flex
                    min-h-[58px]
                    items-center
                    justify-center
                    gap-3
                    py-3
                    text-center
                    sm:px-4
                    sm:py-2
                    lg:px-6
                  "
                >
                  <Icon
                    className="
                      h-5
                      w-5
                      shrink-0
                      text-brand-red
                    "
                    aria-hidden="true"
                  />

                  <span
                    className="
                      text-xs
                      font-semibold
                      leading-snug
                      text-brand-brown
                      sm:text-sm
                    "
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURED PRODUCTS
      ================================================================= */}

      <section
        className="
          container-max
          container-px
          py-14
          sm:py-16
          lg:py-20
          xl:py-24
        "
      >
        <Reveal>
          <div
            className="
              mx-auto
              mb-10
              max-w-2xl
              text-center
              sm:mb-12
              lg:mb-16
            "
          >
            <span className="section-eyebrow mb-3 block">
              From Our Kitchen
            </span>

            <h2
              className="
                mb-3
                font-serif
                text-3xl
                font-bold
                text-brand-brown
                sm:text-4xl
                lg:text-5xl
              "
            >
              Our Featured Selection
            </h2>

            <p
              className="
                mx-auto
                max-w-lg
                text-sm
                leading-relaxed
                text-brand-brown/60
                sm:text-base
              "
            >
              Explore our range of premium moong, urad,
              chana, and special masala papads.
            </p>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-5
              md:grid-cols-3
              lg:grid-cols-4
              lg:gap-6
            "
          >
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-brand-brown/15
              px-6
              py-16
              text-center
            "
          >
            <p className="text-sm text-brand-brown/60">
              Products are being prepared.
            </p>
          </div>
        )}

        <div className="mt-10 text-center sm:mt-12">
          <Link
            to="/shop"
            className="
              btn-outline
              min-h-[46px]
              px-6
              sm:px-8
            "
          >
            View All Papads
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ================================================================
          BRAND STORY
      ================================================================= */}

      <section
        className="
          overflow-hidden
          bg-brand-brown
          py-14
          sm:py-16
          lg:py-24
        "
      >
        <div className="container-max container-px">
          <div
            className="
              grid
              items-center
              gap-10
              md:gap-12
              lg:grid-cols-2
              lg:gap-16
            "
          >
            {/* Manufacturing Image */}
            <div className="order-2 lg:order-1">
              <PlaceholderImage
                label="Manufacturing facility"
                aspect="aspect-[4/3] sm:aspect-[3/2]"
                className="
                  overflow-hidden
                  rounded-2xl
                  shadow-lift
                "
              />
            </div>

            {/* Story */}
            <div
              className="
                order-1
                lg:order-2
              "
            >
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
                Our Heritage
              </span>

              <h2
                className="
                  mb-5
                  max-w-xl
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  text-brand-cream
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Built on Tradition,
                <br className="hidden sm:block" />
                Quality-Focused.
              </h2>

              <p
                className="
                  mb-7
                  max-w-xl
                  text-base
                  leading-relaxed
                  text-brand-cream/70
                  sm:mb-8
                  sm:text-lg
                "
              >
                From the Nimar region to your kitchen,
                Kawad Swad maintains high standards of food
                purity and hygiene. Our process respects
                traditional methods while ensuring dependable
                production.
              </p>

              <Link
                to="/about"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-brand-yellow
                  transition-all
                  hover:gap-3
                  sm:text-base
                "
              >
                Learn About Our Heritage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA
      ================================================================= */}

      <CTABanner
        title="Taste the Difference"
        description="Discover the authentic taste of Nimar delivered right to your door."
        primaryLabel="Shop Now"
        primaryLink="/shop"
      />
    </>
  );
}
