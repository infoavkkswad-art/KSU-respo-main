import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { Link } from 'react-router-dom';

interface FAQItem {
  q: string;
  a: string;
}

const faqSections: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Products',
    items: [
      { q: 'What types of papad does Kawad Swad offer?', a: 'We offer moong, chana and urad papad in multiple flavours — including classic, garlic, jeera, pudhina, green chilli, kasuri methi, Punjabi masala, khata mitha and tomato. We also offer a combo pack.' },
      { q: 'What pack sizes are available?', a: 'Most products are available in 200g, 500g and 1kg packs. The combo pack comes in a 235g size.' },
      { q: 'Are all products 100% vegetarian?', a: 'Yes. All our papads are 100% vegetarian, crafted with authentic regional spices and quality lentils.' },
      { q: 'What is the FSSAI licence number?', a: `Our FSSAI licence number is ${brand.fssai}.` },
      { q: 'Where are the papads manufactured?', a: `Our papads are manufactured by ${brand.manufacturer} in ${brand.region}.` },
    ],
  },
  {
    title: 'Orders & Shipping',
    items: [
      { q: 'How do I place an order?', a: 'Browse our Shop or Products page, select your papad, choose a pack size and quantity, add it to your cart, then proceed to checkout.' },
      { q: 'What are the shipping charges?', a: 'Shipping is ₹49 for 200g and 500g packs. Shipping is free for all 1kg packs.' },
      { q: 'Do you ship across India?', a: 'Yes, we ship pan-India. Delivery times may vary by location.' },
      { q: 'How is my order confirmed?', a: 'When you place an order through our website, it creates an order request. We will contact you on your phone number to confirm the next steps. Online payment is not connected yet.' },
      { q: 'Can I change or cancel my order?', a: 'Since orders are confirmed manually, please contact us as soon as possible if you need to change or cancel your order.' },
    ],
  },
  {
    title: 'Business & Bulk',
    items: [
      { q: 'Do you offer bulk orders?', a: 'Yes. Visit our Bulk Orders page and fill in the enquiry form with your requirements. We will get back to you with a supply plan.' },
      { q: 'How do I become a distributor?', a: 'Visit our Distributor page and submit the enquiry form. Our team will reach out to discuss the partnership.' },
      { q: 'Do you supply to hotels and restaurants?', a: 'Yes. We work with hotels, restaurants, caterers and food businesses. Visit our Work With Us page to get in touch.' },
      { q: 'Where can I find business contact details?', a: `You can call or WhatsApp us at ${brand.phone}, or email us at ${brand.email}. You can also visit our Business Hub page.` },
    ],
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="FAQ"
        description="Frequently asked questions about Kawad Swad papads — products, orders, shipping, bulk orders and business partnerships."
        path="/faq"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />

      <PageHero
        eyebrow="Help"
        title="Frequently Asked Questions"
        description="Find answers to common questions about our products, orders and business partnerships."
      />

      <section className="container-max container-px py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {faqSections.map((section, si) => (
            <Reveal key={si} delay={si * 100}>
              <div>
                <h2 className="text-xl font-serif font-bold text-brand-brown mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((item, ii) => {
                    const id = `${si}-${ii}`;
                    const isOpen = openId === id;
                    return (
                      <div key={id} className="card overflow-hidden bg-white border border-brand-brown/5 shadow-soft">
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="w-full flex items-center justify-between gap-4 p-5 text-left"
                          aria-expanded={isOpen}
                        >
                          <span className="font-medium text-brand-brown text-sm">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-brand-brown/40 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-brand-brown/70 leading-relaxed animate-slide-down border-t border-brand-brown/5 pt-3">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal>
            <div className="card p-8 text-center bg-brand-cream-dark border border-brand-brown/5">
              <p className="text-brand-brown/70 mb-4">Still have questions? We are here to help.</p>
              <Link to="/contact" className="btn-primary">Contact Us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
