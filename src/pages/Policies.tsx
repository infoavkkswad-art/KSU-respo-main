import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';

const sections = [
  {
    title: 'Shipping Policy',
    content: [
      'We ship across India. Orders are processed and dispatched after confirmation.',
      'Shipping is ₹49 for 200g and 500g packs. Shipping is free for all 1kg packs.',
      'Delivery times vary by location and will be communicated when your order is confirmed.',
      'For any shipping-related queries, please contact us at ' + brand.phone + ' or ' + brand.email + '.',
    ],
  },
  {
    title: 'Returns & Refunds',
    content: [
      'We want you to be happy with your purchase. If you receive a damaged or incorrect product, please contact us within 48 hours of delivery.',
      'Since our products are food items, we do not accept returns for quality reasons once the packaging is opened.',
      'Refunds, where applicable, will be processed to the original payment method.',
      'To request a return or refund, contact us at ' + brand.phone + ' or ' + brand.email + ' with your order ID.',
    ],
  },
  {
    title: 'Privacy Policy',
    content: [
      'We collect personal information (name, phone, email, address) only when you place an order or submit a form.',
      'We use this information to fulfil your order and respond to your enquiries. We do not sell or share your data with third parties.',
      'You may request access to or deletion of your personal data by contacting us.',
      'This website does not currently use third-party analytics or advertising trackers.',
    ],
  },
  {
    title: 'Terms of Service',
    content: [
      'By using this website, you agree to provide accurate and truthful information when placing orders or submitting forms.',
      'All orders are subject to confirmation. Prices and availability may change without notice.',
      'Product images shown on this website are placeholders and will be replaced with actual product photography when available.',
      'All content on this website is the property of ' + brand.manufacturer + ' and may not be reproduced without permission.',
    ],
  },
  {
    title: 'FSSAI Information',
    content: [
      'FSSAI Licence Number: ' + brand.fssai,
      'Diet Type: ' + brand.dietType,
      'Manufacturer: ' + brand.manufacturer,
      'Location: ' + brand.region,
    ],
  },
  {
    title: 'Contact',
    content: [
      'Phone / WhatsApp: ' + brand.phone,
      'Email: ' + brand.email,
      'Instagram: @' + brand.instagram,
      'YouTube: ' + brand.youtube,
    ],
  },
];

export default function Policies() {
  return (
    <>
      <SEO
        title="Policies"
        description="Kawad Swad policies — shipping, returns, refunds, privacy, terms of service and FSSAI information."
        path="/policies"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Policies', path: '/policies' },
        ])}
      />

      <PageHero
        eyebrow="Information"
        title="Policies"
        description="Our shipping, returns, privacy and terms policies. If you have any questions, please contact us."
      />

      <section className="container-max container-px py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="card p-6">
                <h2 className="text-xl font-serif font-bold text-brand-brown mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-sm text-brand-brown/70 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
