import { useState } from 'react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, FormContainer } from '@/components/Form';
import { apiClient } from '@/services/api-client';
import { Utensils, Hotel, ChefHat, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkWithUs() {
  const form = useFormState({
    businessName: '',
    businessType: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
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
      const idempotencyKey = 'food-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const res = await apiClient.createEnquiry({
        type: 'food-business',
        businessName: form.values.businessName,
        businessType: form.values.businessType || 'Food Business',
        contactPerson: form.values.contactPerson,
        phone: form.values.phone,
        email: form.values.email,
        location: form.values.location,
        message: form.values.message || 'Food business partnership enquiry',
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
        title="Work With Us"
        description="Hotels, restaurants, caterers and food businesses — partner with Kawad Swad for premium papads from Nimar."
        path="/work-with-us"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Business', path: '/business' },
          { name: 'Work With Us', path: '/work-with-us' },
        ])}
      />

      <PageHero
        eyebrow="Partnerships"
        title="Work With Us"
        description="Hotels, restaurants, caterers and food businesses — we supply premium papads for your kitchen. Let's discuss how we can work together."
      />

      {/* Who we work with */}
      <section className="container-max container-px py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-eyebrow mb-3">Who We Work With</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-brown text-balance">
              Food businesses of every kind
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Hotel, title: 'Hotels', desc: 'Premium papad for hotel dining and room service.' },
            { icon: Utensils, title: 'Restaurants', desc: 'Authentic papad as a side or starter for your menu.' },
            { icon: ChefHat, title: 'Caterers', desc: 'Bulk supply for events, weddings and functions.' },
            { icon: Building2, title: 'Food Businesses', desc: 'Ingredient supply for food brands and kitchens.' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card p-6 text-center bg-white border border-brand-brown/10 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-brand-brown" />
                </div>
                <h3 className="text-base font-serif font-semibold text-brand-brown mb-2">{item.title}</h3>
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
                <h2 className="text-3xl font-serif font-bold text-brand-brown">Business Enquiry</h2>
                <p className="mt-2 text-brand-brown/60">Tell us about your business and how you would like to work with us.</p>
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Business Name" name="businessName" value={form.values.businessName} onChange={(v) => form.setValue('businessName', v)} error={form.errors.businessName} required placeholder="Your business name" />
                      <FormField label="Business Type" name="businessType" type="select" value={form.values.businessType} onChange={(v) => form.setValue('businessType', v)} options={['Hotel', 'Restaurant', 'Caterer', 'Food Business', 'Other']} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Contact Person" name="contactPerson" value={form.values.contactPerson} onChange={(v) => form.setValue('contactPerson', v)} error={form.errors.contactPerson} required placeholder="Contact person name" />
                      <FormField label="Phone" name="phone" type="tel" value={form.values.phone} onChange={(v) => form.setValue('phone', v)} error={form.errors.phone} required placeholder="10-digit phone" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Email" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} error={form.errors.email} required placeholder="you@business.com" />
                      <FormField label="Location" name="location" value={form.values.location} onChange={(v) => form.setValue('location', v)} error={form.errors.location} required placeholder="City, State" />
                    </div>
                    <FormField label="Message" name="message" type="textarea" value={form.values.message} onChange={(v) => form.setValue('message', v)} rows={4} placeholder="How would you like to work with us?" />
                  </FormContainer>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <SubmitButton status={form.status} label="Send Enquiry" />
                    <Link to="/business" className="btn-ghost inline-flex items-center gap-1.5 py-2.5">Back to Business Hub <ArrowRight className="w-4 h-4" /></Link>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
