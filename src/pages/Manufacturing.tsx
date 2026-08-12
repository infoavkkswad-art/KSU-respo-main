import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero, PlaceholderImage } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { Leaf, Shield, Factory, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { 
    num: '01', 
    title: 'Raw Material Selection', 
    desc: 'Premium quality moong, chana, and urad dal flours are sourced alongside authentic regional spices, ensuring the foundational purity and flavor profile of every batch.' 
  },
  { 
    num: '02', 
    title: 'Dough Mixing & Shaping', 
    desc: 'Flours and spice blends are combined with water, kneaded to consistent texture, and shaped into traditional papads following established regional recipes.' 
  },
  { 
    num: '03', 
    title: 'Traditional Drying', 
    desc: 'Shaped papads are dried under standard facility conditions to achieve appropriate moisture levels, structural integrity, and shelf stability.' 
  },
  { 
    num: '04', 
    title: 'Quality Inspection', 
    desc: 'Every production lot is reviewed for uniform thickness, texture consistency, and general appearance before final approval.' 
  },
  { 
    num: '05', 
    title: 'Sealed Packaging', 
    desc: 'Finished papads are packed securely in food-grade packaging to preserve authentic flavor and crunch from our Nimar facility to your kitchen.' 
  },
];

export default function Manufacturing() {
  return (
    <>
      <SEO
        title="Manufacturing Process"
        description="Explore the Kawad Swad manufacturing process at Kawad Swad Udhyog in Nimar — from raw material sourcing and shaping to quality checks and sealed packaging."
        path="/manufacturing"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Manufacturing', path: '/manufacturing' },
        ])}
      />

      <PageHero
        eyebrow="Our Process"
        title="Crafted with precision, grounded in tradition."
        description="A structured manufacturing workflow designed to preserve authentic Nimar papad recipes while maintaining rigorous quality and hygiene standards."
      />

      {/* Editorial Process Steps */}
      <section className="container-max container-px py-20 lg:py-28">
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, i) => (
            <Reveal key={i}>
              <div className={`grid lg:grid-cols-12 gap-8 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={`lg:col-span-6 ${i % 2 === 1 ? 'lg:col-start-7' : ''}`}>
                  <div className="rounded-3xl overflow-hidden shadow-lift border border-brand-brown/10">
                    <PlaceholderImage label={`${step.title} — process view`} aspect="aspect-[4/3]" />
                  </div>
                </div>
                <div className={`lg:col-span-6 ${i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <span className="text-6xl font-serif font-bold text-brand-red/20 block mb-3">{step.num}</span>
                  <h2 className="text-2xl lg:text-4xl font-serif font-bold text-brand-brown mb-4">{step.title}</h2>
                  <p className="text-base lg:text-lg text-brand-brown/70 leading-relaxed font-normal text-pretty">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Manufacturing Philosophy */}
      <section className="bg-brand-brown text-brand-cream py-20">
        <div className="container-max container-px">
          <Reveal>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow mb-3 block">Manufacturing Philosophy</span>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-6 text-balance">
                Honoring tradition through structured execution.
              </h2>
              <p className="text-base lg:text-lg text-brand-cream/80 leading-relaxed text-pretty mb-10">
                At Kawad Swad Udhyog, we believe that exceptional papad requires respect for traditional culinary methods combined with structured operational hygiene and careful ingredient sourcing.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-brand-cream/15">
                {[
                  { icon: Leaf, title: 'Authentic Recipes', desc: 'Rooted in Nimar traditions' },
                  { icon: Shield, title: 'FSSAI Licence', desc: `Licence No. ${brand.fssai}` },
                  { icon: Factory, title: 'Commercial Supply', desc: 'Consistent production capacity' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <item.icon className="w-6 h-6 text-brand-yellow mb-3" />
                    <h3 className="text-sm font-serif font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-brand-cream/60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Operational Standards */}
      <section className="container-max container-px py-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-eyebrow mb-3 block">Quality Assurance</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown text-balance">
              Standards built into every batch
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'FSSAI Licence No. 21425890001224',
            '100% vegetarian production line',
            'Dedicated dietary variant options',
            'Sealed food-grade packaging',
            'Regular batch quality reviews',
            'Authentic regional spice blends',
            'Careful lentil flour sourcing',
            'Standardized quality control steps',
          ].map((point, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="card p-6 bg-white border border-brand-brown/5 shadow-soft flex items-start gap-3 h-full">
                <Check className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-brand-brown/80">{point}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* B2B Commercial Call to Action */}
      <section className="bg-brand-cream-dark py-16 border-t border-brand-brown/5">
        <div className="container-max container-px text-center">
          <Reveal>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-brand-brown mb-4">
                Ready to partner with Kawad Swad?
              </h2>
              <p className="text-base text-brand-brown/70 mb-8">
                Whether you are looking for bulk supply for your business or regional distribution partnerships, our team is ready to assist you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/bulk-orders" className="btn-primary px-8 py-3">
                  Request Bulk Supply <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link to="/distributor" className="btn-outline px-8 py-3">
                  Become a Distributor
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABanner
        title="Questions about our manufacturing?"
        description="Get in touch with our commercial and operations team for direct assistance."
        primaryLabel="Contact Us"
        primaryLink="/contact"
        secondaryLabel="Explore Products"
        secondaryLink="/products"
      />
    </>
  );
}
