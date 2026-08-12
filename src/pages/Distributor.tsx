import { useState } from 'react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero, PlaceholderImage } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, FormContainer } from '@/components/Form';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';
import { Store, Package, Factory, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Distributor() {
  const form = useFormState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    currentBusiness: '',
    message: '',
  });

  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const valid = form.validate({
      businessName: validators.required(),
      contactPerson: validators.required(),
      phone: validators.phone(),
      email: validators.email(),
      location: validators.required(),
    });
    if (!valid) return;

    form.setStatus('submitting');
    try {
      const idempotencyKey = 'dist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const res = await apiClient.createEnquiry({
        type: 'distributor',
        businessName: form.values.businessName,
        contactPerson: form.values.contactPerson,
        phone: form.values.phone,
        email: form.values.email,
        location: form.values.location,
        businessType: form.values.currentBusiness,
        message: form.values.message || 'Distributor partnership enquiry',
        idempotencyKey,
      });

      setEnquiryId(res.enquiryId);
      form.setStatus('success');
      form.reset();
    } catch (err) {
      form.setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again or contact us directly.');
    }
  };

  return (
    <>
      <SEO
        title="Become a Distributor"
        description="Partner with Kawad Swad as a distributor. Bring premium papads from Nimar to your region."
        path="/distributor"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Business', path: '/business' },
          { name: 'Distributor', path: '/distributor' },
        ])}
      />

      <PageHero
        eyebrow="Partnership"
        title="Become a Distributor"
        description="Bring the taste of Nimar to your region. Partner with Kawad Swad to distribute premium papads."
      />

      {/* Opportunity */}
      <section className="container-max container-px py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <p className="section-eyebrow mb-3">The Opportunity</p>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown mb-4">
                A growing brand, a trusted partnership.
              </h2>
              <div className="space-y-4 text-base text-brand-brown/70 leading-relaxed">
                <p>
                  Kawad Swad is building a network of distributors who share our commitment to quality and authentic taste. As a distributor, you bring our papads to retailers and consumers in your region.
                </p>
                <p>
                  We are looking for partners who value long-term relationships, dependable service and a genuine connection to the product. If that sounds like you, we would love to hear from you.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <PlaceholderImage label="Distributor partnership placeholder" aspect="aspect-[4/3]" />
          </Reveal>
        </div>
      </section>

      {/* What we offer */}
      <section className="bg-brand-cream-dark py-16">
        <div className="container-max container-px">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="section-eyebrow mb-3">What You Get</p>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown text-balance">
                A partnership built on quality
              </h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, title: 'Product Range', desc: 'A growing range of moong, chana, urad and combo papads.' },
              { icon: Factory, title: 'Manufacturing Capability', desc: 'Consistent supply backed by modern manufacturing.' },
              { icon: Truck, title: 'Supply Relationship', desc: 'Reliable fulfilment designed for distribution partners.' },
              { icon: Store, title: 'Brand Support', desc: 'A brand positioned for the premium Indian food market.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="card p-6 bg-white border border-brand-brown/10 shadow-soft">
                  <div className="w-12 h-12 rounded-2xl bg-brand-red/5 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-brand-red" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-brand-brown mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-brown/60">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-max container-px py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-eyebrow mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown text-balance">
              A simple enquiry process
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Submit Enquiry', desc: 'Fill in the form below with your business details and region.' },
            { step: '02', title: 'We Connect', desc: 'Our team will reach out to discuss your interest and answer questions.' },
            { step: '03', title: 'Begin Partnership', desc: 'If we are a good fit, we begin the supply relationship together.' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card p-6 text-center bg-white border border-brand-brown/10 shadow-soft">
                <span className="text-4xl font-serif font-bold text-brand-red/20 block mb-2">{item.step}</span>
                <h3 className="text-lg font-serif font-semibold text-brand-brown mb-2">{item.title}</h3>
                <p className="text-sm text-brand-brown/60">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Enquiry form */}
      <section className="bg-brand-cream-dark py-16 border-t border-brand-brown/5">
        <div className="container-max container-px">
          <div className="max-w-2xl mx-auto">
            <Reveal>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-brand-brown">Distributor Enquiry</h2>
                <p className="mt-2 text-brand-brown/60">Tell us about yourself and your region. We will get back to you.</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="card p-6 sm:p-8 bg-white border border-brand-brown/10 shadow-soft">
                {form.status === 'success' && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                    <p className="text-sm font-semibold mb-1">Your enquiry has been received. We'll be in touch soon.</p>
                    {enquiryId && (
                      <p className="text-xs font-mono text-green-700">Enquiry ID: {enquiryId}</p>
                    )}
                  </div>
                )}

                {form.status === 'error' && errorMessage && (
                  <div className="mb-6">
                    <FormStatusMessage status="error" errorMsg={errorMessage} />
                  </div>
                )}

                <form onSubmit={submit} noValidate>
                  <FormContainer>
                    <FormField label="Business Name" name="businessName" value={form.values.businessName} onChange={(v) => form.setValue('businessName', v)} error={form.errors.businessName} required placeholder="Your distribution business name" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Contact Person" name="contactPerson" value={form.values.contactPerson} onChange={(v) => form.setValue('contactPerson', v)} error={form.errors.contactPerson} required placeholder="Contact person name" />
                      <FormField label="Phone" name="phone" type="tel" value={form.values.phone} onChange={(v) => form.setValue('phone', v)} error={form.errors.phone} required placeholder="10-digit phone" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Email" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} error={form.errors.email} required placeholder="you@business.com" />
                      <FormField label="Location / Region" name="location" value={form.values.location} onChange={(v) => form.setValue('location', v)} error={form.errors.location} required placeholder="City, State" />
                    </div>
                    <FormField label="Current Business Type" name="currentBusiness" value={form.values.currentBusiness} onChange={(v) => form.setValue('currentBusiness', v)} placeholder="e.g. FMCG Distributor, Wholesaler" />
                    <FormField label="Message" name="message" type="textarea" value={form.values.message} onChange={(v) => form.setValue('message', v)} rows={4} placeholder="Why are you interested in distributing Kawad Swad?" />
                  </FormContainer>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <SubmitButton status={form.status} label="Become a Distributor" />
                    <Link to="/business" className="btn-ghost text-center py-2.5">Back to Business Hub</Link>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABanner
        title="Questions before you apply?"
        description="Reach out to us directly and we will help you understand if this partnership is right for you."
        primaryLabel="WhatsApp Us"
        primaryLink={brand.whatsappUrl}
        secondaryLabel="Call Us"
        secondaryLink={`tel:${brand.phoneRaw}`}
      />
    </>
  );
}
