import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { ShieldCheck, Sparkles, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Discover the story of Kawad Swad, bringing authentic traditional papads from Nimar to your table."
        path="/about"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <section className="bg-brand-cream py-16 lg:py-24 border-b border-brand-brown/5">
        <div className="container-max container-px">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-eyebrow mb-3">Our Heritage</p>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-brown mb-6">
              Rooted in Nimar, crafted with tradition.
            </h1>
            <p className="text-lg text-brand-brown/70 leading-relaxed">
              {brand.name} brings the rich culinary heritage of Nimar straight to modern kitchens. We combine time-honored recipes with rigorous quality standards to deliver exceptional papads.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container-max container-px">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <p className="section-eyebrow mb-3">Our Story</p>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown mb-6">
                  A passion for authentic flavor and premium quality.
                </h2>
                <div className="space-y-4 text-brand-brown/70 leading-relaxed">
                  <p>
                    Established in the fertile lands of Nimar, {brand.name} started with a simple vision: to preserve the authentic crunch and robust spice blends of traditional papad-making.
                  </p>
                  <p>
                    Every batch is carefully formulated using selected pulses, spices, and natural ingredients, ensuring uncompromised quality and taste in every single bite.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-6 bg-brand-cream border border-brand-brown/10 text-center">
                  <ShieldCheck className="w-8 h-8 text-brand-red mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-brand-brown mb-1">Pure Quality</h3>
                  <p className="text-xs text-brand-brown/60">Strict hygiene and quality checks.</p>
                </div>
                <div className="card p-6 bg-brand-cream border border-brand-brown/10 text-center">
                  <Sparkles className="w-8 h-8 text-brand-red mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-brand-brown mb-1">Authentic Spice</h3>
                  <p className="text-xs text-brand-brown/60">Traditional Nimar spice profiles.</p>
                </div>
                <div className="card p-6 bg-brand-cream border border-brand-brown/10 text-center">
                  <Heart className="w-8 h-8 text-brand-red mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-brand-brown mb-1">Made with Care</h3>
                  <p className="text-xs text-brand-brown/60">Handcrafted precision & recipe balance.</p>
                </div>
                <div className="card p-6 bg-brand-cream border border-brand-brown/10 text-center">
                  <Award className="w-8 h-8 text-brand-red mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-brand-brown mb-1">Trusted Brand</h3>
                  <p className="text-xs text-brand-brown/60">Loved by households and businesses.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
