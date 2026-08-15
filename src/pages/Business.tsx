import { Link } from 'react-router-dom';
import {
  Package,
  Store,
  Utensils,
  Factory,
  Users,
  ArrowRight,
  Check,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';

const BUSINESS_HERO_IMAGE = '/images/pages/business-hero.png';

export default function Business() {
  return (
    <>
      <SEO
        title="Business Hub"
        description="B2B papad supply and partnerships from Nimar. Explore bulk orders, distribution, manufacturing, and commercial collaborations with Kawad Swad."
        path="/business"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Business', path: '/business' },
        ])}
      />

      {/* ================================================================
          BUSINESS HERO
      ================================================================= */}

      <section className="relative overflow-hidden">
        <div
          className="
            relative
            min-h-[360px]
            w-full
            bg-brand-brown
            sm:min-h-[430px]
            lg:min-h-[520px]
          "
        >
          <img
            src={BUSINESS_HERO_IMAGE}
            alt="Kawad Swad business partnerships and commercial supply"
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
              from-brand-brown/85
              via-brand-brown/55
              to-brand-brown/10
            "
          />

          <div className="container-max container-px relative flex min-h-[360px] items-center sm:min-h-[430px] lg:min-h-[520px]">
            <div className="max-w-2xl py-14 sm:py-16 lg:py-20">
              <span
                className="
                  mb-4
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-brand-yellow
                  sm:text-sm
                "
              >
                B2B Partnerships
              </span>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.05]
                  tracking-tight
                  text-white
                  sm:text-5xl
                  lg:text-7xl
                "
              >
                Built for Consumers.
                <br />
                <span className="text-brand-yellow">
                  Ready for Business.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-white/80
                  sm:text-base
                  lg:text-lg
                "
              >
                Business partnerships for retailers,
                wholesalers, distributors and food
                businesses. Find the right commercial
                pathway for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          BUSINESS HUB PATHWAYS
      ================================================================= */}

      <section className="container-max container-px py-12 sm:py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Primary Pathway: Bulk Orders */}
          <div className="lg:col-span-8">
            <Reveal className="h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-brand-brown p-6 text-brand-cream shadow-lift sm:rounded-3xl sm:p-8 lg:p-12">
                <div>
                  <span className="mb-6 inline-block rounded-md bg-brand-yellow px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-brown">
                    Primary Pathway
                  </span>

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Package className="h-7 w-7 text-brand-yellow" />
                  </div>

                  <h3 className="mb-4 font-serif text-2xl font-bold text-white sm:text-3xl">
                    Bulk Orders & Institutional Supply
                  </h3>

                  <p className="mb-8 max-w-xl text-sm leading-relaxed text-brand-cream/80 sm:text-base">
                    Large-quantity supply designed for
                    businesses, events, hotels, caterers,
                    and institutional requirements. Access
                    our full catalogue and discuss supply
                    requirements with our team.
                  </p>
                </div>

                <div>
                  <Link
                    to="/bulk-orders"
                    className="btn-yellow inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 sm:w-auto sm:px-8"
                  >
                    Request Bulk Supply
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Secondary Pathway: Distributor */}
          <div className="lg:col-span-4">
            <Reveal delay={100} className="h-full">
              <div className="card flex h-full flex-col justify-between border border-brand-brown/10 bg-white p-6 shadow-soft transition-all hover:shadow-lift sm:p-8">
                <div>
                  <span className="mb-6 inline-block rounded-md bg-brand-red/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-brand-red">
                    Regional Growth
                  </span>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/5">
                    <Store className="h-6 w-6 text-brand-red" />
                  </div>

                  <h3 className="mb-3 font-serif text-xl font-semibold text-brand-brown">
                    Become a Distributor
                  </h3>

                  <p className="mb-6 text-sm leading-relaxed text-brand-brown/70">
                    Partner with Kawad Swad to bring our
                    premium Nimar papads to retailers and
                    consumers in your region.
                  </p>
                </div>

                <Link
                  to="/distributor"
                  className="inline-flex items-center gap-2 border-t border-brand-brown/5 pt-4 text-sm font-semibold text-brand-red transition-all hover:gap-3"
                >
                  Explore Distribution
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Supporting Pathways */}
          {[
            {
              icon: Utensils,
              title: 'Hotels & Restaurants',
              desc: 'Dedicated supply for professional kitchens, dining rooms, and food service partners.',
              link: '/work-with-us',
              cta: 'Work With Us',
            },
            {
              icon: Factory,
              title: 'Manufacturing Standards',
              desc: 'Explore our manufacturing approach, quality controls, and FSSAI licensing.',
              link: '/manufacturing',
              cta: 'View Manufacturing',
            },
            {
              icon: Users,
              title: 'General Business Enquiry',
              desc: 'For custom collaborations, trade queries, and general partnership discussions.',
              link: '/contact',
              cta: 'Contact Us',
            },
          ].map((item, index) => (
            <div key={item.title} className="lg:col-span-4">
              <Reveal
                delay={150 + index * 50}
                className="h-full"
              >
                <div className="card flex h-full flex-col justify-between border border-brand-brown/10 bg-white p-6 shadow-soft transition-all hover:shadow-lift sm:p-8">
                  <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-brown/5 bg-brand-cream-dark">
                      <item.icon className="h-6 w-6 text-brand-red" />
                    </div>

                    <h3 className="mb-3 font-serif text-xl font-semibold text-brand-brown">
                      {item.title}
                    </h3>

                    <p className="mb-6 text-sm leading-relaxed text-brand-brown/70">
                      {item.desc}
                    </p>
                  </div>

                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-2 border-t border-brand-brown/5 pt-4 text-sm font-semibold text-brand-red transition-all hover:gap-3"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          WHO WE SERVE
      ================================================================= */}

      <section className="border-y border-brand-brown/5 bg-brand-cream-dark py-16 sm:py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <span className="section-eyebrow mb-3 block">
                Who We Serve
              </span>

              <h2 className="font-serif text-3xl font-bold text-brand-brown sm:text-4xl">
                Partners across the food ecosystem
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {[
              'Retailers',
              'Wholesalers',
              'Distributors',
              'Hotels',
              'Restaurants',
              'Food Businesses',
            ].map((target, index) => (
              <Reveal
                key={target}
                delay={index * 50}
              >
                <div className="card border border-brand-brown/10 bg-white p-4 text-center shadow-soft sm:p-6">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10">
                    <Check className="h-5 w-5 text-brand-red" />
                  </div>

                  <p className="text-xs font-semibold text-brand-brown sm:text-sm">
                    {target}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY PARTNER
      ================================================================= */}

      <section className="container-max container-px py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <span className="section-eyebrow mb-3 block">
                Why Partner With Us
              </span>

              <h2 className="mb-6 font-serif text-3xl font-bold leading-tight text-brand-brown sm:text-4xl lg:text-5xl">
                A brand built for lasting partnerships.
              </h2>

              <ul className="mb-8 space-y-4">
                {[
                  'Authentic papad with broad consumer appeal',
                  'Quality craftsmanship from Nimar traditions',
                  'Growing product range across moong, chana and urad varieties',
                  'Flexible supply options for businesses of different sizes',
                  'Responsive communication and dedicated commercial support',
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm leading-relaxed text-brand-brown/75"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/bulk-orders"
                  className="btn-primary justify-center px-8"
                >
                  Request Bulk Supply
                </Link>

                <Link
                  to="/distributor"
                  className="btn-outline justify-center px-8"
                >
                  Become a Distributor
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-2xl bg-brand-brown p-6 text-brand-cream shadow-lift sm:rounded-3xl sm:p-8 lg:p-10">
              <h3 className="mb-4 font-serif text-2xl font-bold text-white">
                Direct Commercial Support
              </h3>

              <p className="mb-8 text-sm leading-relaxed text-brand-cream/80">
                Tell us about your business requirements.
                Our commercial team will connect with you
                to discuss pricing, logistics, and
                partnership terms.
              </p>

              <div className="space-y-3 text-sm font-medium">
                <a
                  href={`tel:${brand.phoneRaw}`}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-brand-cream transition-colors hover:text-brand-yellow"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                    📞
                  </span>
                  <span className="break-all">
                    {brand.phone}
                  </span>
                </a>

                <a
                  href={brand.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-brand-cream transition-colors hover:text-brand-yellow"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    💬
                  </span>
                  <span>WhatsApp Commercial Desk</span>
                </a>

                <a
                  href={`mailto:${brand.email}`}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-brand-cream transition-colors hover:text-brand-yellow"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-brown">
                    ✉️
                  </span>
                  <span className="break-all">
                    {brand.email}
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================
          CTA
      ================================================================= */}

      <CTABanner
        title="Let's build something together."
        description="Whether you need bulk supply, a distribution partnership or a custom collaboration, we would love to hear from you."
        primaryLabel="Request Bulk Supply"
        primaryLink="/bulk-orders"
        secondaryLabel="Become a Distributor"
        secondaryLink="/distributor"
      />
    </>
  );
}
