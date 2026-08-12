import { useState } from 'react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, FormContainer } from '@/components/Form';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';
import { Phone, Mail, MessageCircle, Instagram, Youtube, MapPin, ArrowRight } from 'lucide-react';

export default function Contact() {
  const form = useFormState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const valid = form.validate({
      name: validators.required(),
      email: validators.email(),
      message: validators.required(),
    });
    if (!valid) return;

    form.setStatus('submitting');
    try {
      const idempotencyKey = 'contact-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const res = await apiClient.createEnquiry({
        type: 'general',
        contactPerson: form.values.name,
        phone: form.values.phone ? form.values.phone : undefined,
        email: form.values.email,
        location: brand.region,
        message: `[Subject: ${form.values.subject || 'General Enquiry'}] ${form.values.message}`,
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

  const whatsappMsg = encodeURIComponent('Hello Kawad Swad, I have a question.');

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Kawad Swad. Call, WhatsApp or email us, or send a message through our contact form."
        path="/contact"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />

      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        description="We would love to hear from you. Whether you have a question, feedback or a business enquiry, reach out and we will respond."
      />

      <section className="container-max container-px py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Form */}
          <div className="card p-6 sm:p-8 bg-white border border-brand-brown/10 shadow-soft">
            <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">Send a Message</h2>
            <p className="text-sm text-brand-brown/60 mb-6">Fill in the form and we will get back to you as soon as possible.</p>

            {form.status === 'success' && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                <p className="text-sm font-semibold mb-1">Your message has been received. We'll be in touch soon.</p>
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
                  <FormField label="Name" name="name" value={form.values.name} onChange={(v) => form.setValue('name', v)} error={form.errors.name} required placeholder="Your name" />
                  <FormField label="Email" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} error={form.errors.email} required placeholder="you@domain.com" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Phone (optional)" name="phone" type="tel" value={form.values.phone} onChange={(v) => form.setValue('phone', v)} placeholder="10-digit phone" />
                  <FormField label="Subject" name="subject" type="select" value={form.values.subject} onChange={(v) => form.setValue('subject', v)} options={['General Enquiry', 'Product Question', 'Order Support', 'Business Enquiry', 'Feedback', 'Other']} />
                </div>
                <FormField label="Message" name="message" type="textarea" value={form.values.message} onChange={(v) => form.setValue('message', v)} error={form.errors.message} required rows={5} placeholder="How can we help?" />
              </FormContainer>
              <div className="mt-6">
                <SubmitButton status={form.status} label="Send Message" />
              </div>
            </form>
          </div>

          {/* Contact info */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="card p-6 bg-white border border-brand-brown/10 shadow-soft">
              <h3 className="font-serif font-semibold text-brand-brown mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a href={`tel:${brand.phoneRaw}`} className="flex items-center gap-3 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Phone</p>
                    <p className="text-2xs text-brand-brown/50">{brand.phone}</p>
                  </div>
                </a>
                <a href={`https://wa.me/${brand.phoneRaw}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-brown">WhatsApp</p>
                    <p className="text-2xs text-brand-brown/50">{brand.phone}</p>
                  </div>
                </a>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Email</p>
                    <p className="text-2xs text-brand-brown/50 break-all">{brand.email}</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-cream-dark">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Location</p>
                    <p className="text-2xs text-brand-brown/50">{brand.region}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-white border border-brand-brown/10 shadow-soft">
              <h3 className="font-serif font-semibold text-brand-brown mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <Instagram className="w-5 h-5 text-brand-red" />
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Instagram</p>
                    <p className="text-2xs text-brand-brown/50">@{brand.instagram}</p>
                  </div>
                </a>
                <a href={brand.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <Youtube className="w-5 h-5 text-brand-red" />
                  <div>
                    <p className="text-sm font-medium text-brand-brown">YouTube</p>
                    <p className="text-2xs text-brand-brown/50">{brand.youtube}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="card p-6 bg-brand-brown text-brand-cream">
              <h3 className="font-serif font-semibold text-white mb-2">Business Enquiry</h3>
              <p className="text-sm text-brand-cream/70 mb-4">Looking to partner with us? Visit our Business Hub.</p>
              <a href="/business" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-yellow hover:gap-2 transition-all">
                Visit Business Hub <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
