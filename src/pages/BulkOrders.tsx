import { useState } from 'react';
import { SEO, breadcrumbSchema } from '../components/SEO';
import { PageHero } from '../components/Section';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, FormContainer } from '../components/Form';
import { ProductService } from '../services/product-service';
import { CATEGORY_LABELS } from '../data/products';
import { brand } from '../data/brand';
import { apiClient } from '../services/api-client';
import { Package, Phone, Mail, MessageCircle } from 'lucide-react';

const productOptions = ProductService.getAllProducts().map((p) => `${p.name} (${p.variant})`);

export default function BulkOrders() {
  const form = useFormState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    products: '',
    quantity: '',
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
      products: validators.required(),
      quantity: validators.required(),
    });
    if (!valid) return;

    form.setStatus('submitting');
    try {
      const idempotencyKey = 'bulk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const res = await apiClient.createEnquiry({
        type: 'bulk',
        businessName: form.values.businessName,
        contactPerson: form.values.contactPerson,
        phone: form.values.phone,
        email: form.values.email,
        location: form.values.location,
        productsOfInterest: form.values.products,
        quantity: form.values.quantity,
        message: form.values.message || 'Bulk supply request',
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
        title="Bulk Orders"
        description="Request bulk papad supply for businesses, events and institutions from Kawad Swad in Nimar."
        path="/bulk-orders"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Business', path: '/business' },
          { name: 'Bulk Orders', path: '/bulk-orders' },
        ])}
      />

      <PageHero
        eyebrow="B2B"
        title="Bulk Orders"
        description="Large-quantity supply of premium papads from Nimar for businesses, events and institutions. Tell us what you need and our commercial team will prepare a supply plan."
      />

      <section className="container-max container-px py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Form */}
          <div className="card p-6 sm:p-8 bg-white border border-brand-brown/10 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-brand-brown">Bulk Supply Request</h2>
                <p className="text-sm text-brand-brown/60">Fill in your requirements and we will contact you.</p>
              </div>
            </div>

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
                <FormField label="Business Name" name="businessName" value={form.values.businessName} onChange={(v) => form.setValue('businessName', v)} error={form.errors.businessName} required placeholder="Your business name" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Contact Person" name="contactPerson" value={form.values.contactPerson} onChange={(v) => form.setValue('contactPerson', v)} error={form.errors.contactPerson} required placeholder="Contact person name" />
                  <FormField label="Phone" name="phone" type="tel" value={form.values.phone} onChange={(v) => form.setValue('phone', v)} error={form.errors.phone} required placeholder="10-digit phone" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Email" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} error={form.errors.email} required placeholder="you@business.com" />
                  <FormField label="Location" name="location" value={form.values.location} onChange={(v) => form.setValue('location', v)} error={form.errors.location} required placeholder="City, State" />
                </div>
                <FormField label="Products Interested In" name="products" type="select" value={form.values.products} onChange={(v) => form.setValue('products', v)} error={form.errors.products} required options={productOptions} />
                <FormField label="Estimated Quantity" name="quantity" value={form.values.quantity} onChange={(v) => form.setValue('quantity', v)} error={form.errors.quantity} required placeholder="e.g. 50 packs, 100kg, etc." />
                <FormField label="Message" name="message" type="textarea" value={form.values.message} onChange={(v) => form.setValue('message', v)} rows={4} placeholder="Any additional details about your requirement" />
              </FormContainer>
              <div className="mt-6">
                <SubmitButton status={form.status} label="Request Bulk Supply" />
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="card p-6 bg-white border border-brand-brown/10 shadow-soft">
              <h3 className="font-serif font-semibold text-brand-brown mb-3">Prefer to talk?</h3>
              <p className="text-sm text-brand-brown/60 mb-4">Reach out directly and we will help you with your bulk order.</p>
              <div className="space-y-3">
                <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-brand-brown">WhatsApp</p>
                    <p className="text-2xs text-brand-brown/50">{brand.phone}</p>
                  </div>
                </a>
                <a href={`tel:${brand.phoneRaw}`} className="flex items-center gap-3 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <Phone className="w-5 h-5 text-brand-red" />
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Phone</p>
                    <p className="text-2xs text-brand-brown/50">{brand.phone}</p>
                  </div>
                </a>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-brand-cream-dark hover:bg-brand-brown/10 transition-colors">
                  <Mail className="w-5 h-5 text-brand-red" />
                  <div>
                    <p className="text-sm font-medium text-brand-brown">Email</p>
                    <p className="text-2xs text-brand-brown/50">{brand.email}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="card p-6 bg-brand-brown text-brand-cream">
              <h3 className="font-serif font-semibold text-white mb-2">Product Range</h3>
              <p className="text-sm text-brand-cream/70 mb-4">Available in moong, chana, urad and combo packs.</p>
              <div className="space-y-1.5">
                {(['moong', 'chana', 'urad', 'combo'] as const).map((cat) => (
                  <div key={cat} className="flex items-center gap-2 text-sm text-brand-cream/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                    {CATEGORY_LABELS[cat]} Papad
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
