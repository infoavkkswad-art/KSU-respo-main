import { Link } from 'react-router-dom';
import { Leaf, Shield, Award, Sparkles, ArrowRight, MapPin, Factory } from 'lucide-react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PlaceholderImage } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Kawad Swad is a premium papad brand from Nimar, Madhya Pradesh, crafting authentic traditional papads with dependable quality standards."
        path="/about"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      {/* Editorial Hero */}
      <section className="relative bg-brand-cream py-20 lg:py-28 overflow-hidden border-b border-brand-brown/5">
        <div className="container-max container-px">
          <div className="max-w-3xl">
            <span className="section-eyebrow mb-4 block">Our Brand Story</span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-brand-brown leading-[1.05] tracking-tight mb-6">
              From Nimar, with <span className="text-brand-red">tradition.</span>
            </h1>
            <p className="text-lg lg:text-xl text-brand-brown/70 leading-relaxed font-normal text-pretty">
              Kawad Swad brings the authentic taste of Nimar’s papad-making heritage to kitchens across India — uniting time-honored recipes with the reliability of modern food manufacturing.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Introduction & Nimar Connection */}
      <section className="container-max container-px py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <Reveal>
              <div>
                <span className="section-eyebrow mb-3 block">The Region</span>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown mb-6">
                  Rooted in the fertile soil of Nimar, Madhya Pradesh.
                </h2>
                <div className="space-y-4 text-base text-brand-brown/70 leading-relaxed">
                  <p>
                    Nimar is a historical region renowned for its deep agricultural roots and rich culinary craftsmanship. It is the home of Kawad Swad — established by {brand.manufacturer} to give traditional Indian papads a dependable, professional platform.
                  </p>
                  <p>
                    Our papads carry the distinct warmth and flavor of this region. We work with carefully selected local ingredients and authentic spice blends to produce papads that taste the way traditional papad should.
                  </p>
                  <blockquote className="p-4 bg-brand-cream-dark border-l-2 border-brand-red rounded-r-xl my-6 font-devanagari text-brand-brown/90 text-lg">
                    {brand.tagline}
                  </blockquote>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <Reveal delay={150}>
              <div className="rounded-3xl overflow-hidden shadow-lift border border-brand-brown/10">
                <PlaceholderImage label="Nimar region — landscape view" aspect="aspect-[4/3]" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core Values (4 Meaningful Pillars instead of generic 10-card grids) */}
      <section className="bg-brand-cream-dark py-20 border-y border-brand-brown/5">
        <div className="container-max container-px">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center mb-16">
              <span className="section-eyebrow mb-3 block">What We Stand For</span>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown text-balance">
                Built on uncompromising principles.
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Leaf, 
                title: 'Traditional Taste', 
                desc: 'Authentic regional recipes and time-tested spice formulations that preserve genuine Indian flavors.' 
              },
              { 
                icon: Shield, 
                title: 'Consistent Quality', 
                desc: 'Rigorous ingredient selection and structured manufacturing standards in every batch we produce.' 
              },
              { 
                icon: Award, 
                title: 'Food Craft', 
                desc: 'Expertise in lentil processing, dough mixing, rolling, and sun-drying techniques.' 
              },
              { 
                icon: Sparkles, 
                title: 'Customer Trust', 
                desc: 'Transparent business operations, dependable fulfillment, and clear labeling for retail and B2B partners.' 
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="card p-8 bg-white border border-brand-brown/5 shadow-soft hover:shadow-lift transition-all h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-brand-red/5 flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-brand-red" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-brand-brown mb-3">{item.title}</h3>
                  <p className="text-sm text-brand-brown/65 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage & Dietary Philosophy */}
      <section className="container-max container-px py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Reveal>
              <div className="rounded-3xl overflow-hidden shadow-lift border border-brand-brown/10">
                <PlaceholderImage label="Traditional preparation and heritage" aspect="aspect-[4/3]" />
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <Reveal delay={150}>
              <div>
                <span className="section-eyebrow mb-3 block">Heritage & Dietary Choices</span>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown mb-6">
                  Honoring traditional culinary roots.
                </h2>
                <div className="space-y-4 text-base text-brand-brown/70 leading-relaxed">
                  <p>
                    Our brand heritage is deeply intertwined with traditional vegetarian culinary practices, including offerings tailored for Jain dietary preferences. We provide dedicated non-garlic options alongside our spiced variants.
                  </p>
                  <p>
                    Because our product catalogue includes specific garlic-infused SKUs, we maintain clear, transparent labeling on every product so households and businesses can select exactly what matches their requirements.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quality-Focused Approach & Manufacturer Details */}
      <section className="bg-brand-brown text-brand-cream py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow mb-3 block">Manufacturer Credibility</span>
              <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Crafted by Kawad Swad Udhyog.
              </h2>
              <p className="text-base lg:text-lg text-brand-cream/80 leading-relaxed mb-10">
                Every packet of Kawad Swad papad reflects our dedication to proper hygiene, structured packaging, and dependable supply chains. We invite you to explore our production methods or get in touch for commercial partnerships.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6 border-t border-brand-cream/15 text-sm text-brand-cream/70">
                <span className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-brand-yellow" /> {brand.manufacturer}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-yellow" /> {brand.region}
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-yellow" /> FSSAI Licence No. {brand.fssai}
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/manufacturing" className="btn-yellow px-8 py-3">
                  View Manufacturing Process <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link to="/bulk-orders" className="btn-outline border-brand-cream/30 text-brand-cream hover:bg-white/10 px-8 py-3">
                  Explore Bulk Supply
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABanner
        title="Experience authentic Nimar taste."
        description="Browse our complete selection of premium moong, chana, and urad papads."
        primaryLabel="Shop Papads"
        primaryLink="/shop"
        secondaryLabel="Contact Us"
        secondaryLink="/contact"
      />
    </>
  );
}
