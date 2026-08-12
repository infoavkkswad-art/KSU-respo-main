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

  return (
    <>
      <SEO
        title="Premium Papads from Nimar"
        description="Kawad Swad crafts premium papads with authentic ingredients, traditional taste and modern manufacturing standards. Shop moong, chana and urad papad online."
        path="/"
        structuredData={organizationSchema()}
      />

      {/* HERO - Premium Editorial Layout */}
      <section className="relative bg-brand-cream py-16 lg:py-24 overflow-hidden">
        <div className="container-max container-px relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 animate-fade-up">
              <span className="section-eyebrow mb-4 block">Nimar Heritage</span>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-brand-brown leading-[0.95] tracking-tight mb-8">
                The Taste of Nimar, <br />
                <span className="text-brand-red">Authentic & Pure.</span>
              </h1>
              <p className="text-lg text-brand-brown/70 max-w-lg mb-10 leading-relaxed">
                Experience the heritage of authentic papads. Crafted with traditional recipes and dependable quality standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="btn-primary px-8">Shop Papads</Link>
                <Link to="/about" className="btn-outline px-8">Our Story</Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lift bg-brand-cream-dark">
                <div className="absolute inset-0 bg-brand-brown/5" />
                {featured[0] && (
                  <ProductImage product={featured[0]} variant="hero" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-brand-yellow p-6 rounded-2xl shadow-card hidden sm:block">
                <p className="font-serif font-bold text-brand-brown text-2xl leading-tight">Pure<br />Traditional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP - Minimalist */}
      <section className="bg-white border-y border-brand-brown/5">
        <div className="container-max container-px py-10">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {[{ icon: Leaf, label: '100% Vegetarian' }, { icon: Shield, label: `FSSAI Licence No. ${brand.fssai}` }, { icon: Award, label: 'Traditional Recipe' }].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-brand-red" />
                <span className="text-sm font-semibold text-brand-brown">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS - Clean Grid */}
      <section className="container-max container-px py-20">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-brown mb-4">Our Featured Selection</h2>
            <p className="text-brand-brown/60 max-w-lg mx-auto">Explore our range of premium moong, urad, and special masala papads.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* BRAND STORY - Editorial */}
      <section className="bg-brand-brown text-brand-cream py-24">
        <div className="container-max container-px">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <PlaceholderImage label="Manufacturing facility" aspect="aspect-[3/2]" className="rounded-2xl" />
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Built on Tradition, Quality-Focused.</h2>
              <p className="text-lg text-brand-cream/70 mb-8 leading-relaxed">
                From the Nimar region to your kitchen, Kawad Swad maintains high standards of food purity and hygiene. Our process respects traditional methods while ensuring dependable production.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-brand-yellow font-bold hover:gap-3 transition-all">
                Learn About Our Heritage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <CTABanner
        title="Taste the Difference"
        description="Discover the authentic taste of Nimar delivered right to your door."
        primaryLabel="Shop Now"
        primaryLink="/shop"
      />
    </>
  );
}
