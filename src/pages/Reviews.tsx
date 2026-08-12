import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal, CTABanner } from '@/components/Reveal';
import { FormField, FormStatusMessage, SubmitButton, useFormState, validators, simulateSubmit, FormContainer } from '@/components/Form';
import { Star, MessageSquare } from 'lucide-react';

export default function Reviews() {
  const form = useFormState({
    name: '',
    email: '',
    rating: '',
    product: '',
    message: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = form.validate({
      name: validators.required(),
      message: validators.required(),
    });
    if (!valid) return;
    form.setStatus('submitting');
    await simulateSubmit(form.values);
    form.setStatus('success');
    form.reset();
  };

  return (
    <>
      <SEO
        title="Customer Reviews"
        description="Read and share customer reviews of Kawad Swad premium papads from Nimar. Honest, authentic feedback."
        path="/reviews"
        structuredData={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Reviews', path: '/reviews' },
        ])}
      />

      <PageHero
        eyebrow="Community & Feedback"
        title="Customer Reviews"
        description="We believe in authentic feedback. Customer reviews will appear here as orders are delivered and experiences are shared."
      />

      {/* Reviews Empty State */}
      <section className="container-max container-px py-16 lg:py-24">
        <Reveal>
          <div className="card max-w-2xl mx-auto p-10 lg:p-14 text-center bg-brand-cream-dark border border-brand-brown/10 shadow-soft">
            <div className="flex justify-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-brand-brown/15" />
              ))}
            </div>
            <h2 className="text-2xl font-serif font-bold text-brand-brown mb-3">
              No reviews published yet
            </h2>
            <p className="text-sm lg:text-base text-brand-brown/70 leading-relaxed max-w-md mx-auto">
              Customer reviews will appear here as they are shared. We do not use fabricated testimonials or placeholder reviews—every word here reflects real customer experiences.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Review Form Section */}
      <section className="bg-brand-cream-dark py-20 border-t border-brand-brown/5">
        <div className="container-max container-px">
          <div className="max-w-2xl mx-auto">
            <Reveal>
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-red/5 flex items-center justify-center mx-auto mb-4 border border-brand-brown/5">
                  <MessageSquare className="w-6 h-6 text-brand-red" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-brown">Share Your Experience</h2>
                <p className="mt-2 text-sm text-brand-brown/70">Tried Kawad Swad papads? Tell us about your experience.</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card p-8 sm:p-10 bg-white border border-brand-brown/10 shadow-soft">
                {form.status === 'success' && (
                  <div className="mb-6">
                    <FormStatusMessage status="success" successMsg="Thank you for your review. Submitted reviews are reviewed before publication." />
                  </div>
                )}
                <form onSubmit={submit} noValidate>
                  <FormContainer>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField label="Your Name" name="name" value={form.values.name} onChange={(v) => form.setValue('name', v)} error={form.errors.name} required />
                      <FormField label="Email (optional)" name="email" type="email" value={form.values.email} onChange={(v) => form.setValue('email', v)} />
                    </div>

                    <div>
                      <label id="rating-label" className="label-field block mb-2 font-medium text-brand-brown">
                        Rating <span className="text-brand-red">*</span>
                      </label>
                      <div className="flex items-center gap-2" role="group" aria-labelledby="rating-label">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => form.setValue('rating', String(star))}
                            className="p-1.5 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-red"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                Number(form.values.rating) >= star
                                  ? 'fill-brand-yellow text-brand-yellow'
                                  : 'text-brand-brown/20'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField label="Product (optional)" name="product" value={form.values.product} onChange={(v) => form.setValue('product', v)} placeholder="Which papad variety did you try?" />
                    <FormField label="Your Review" name="message" type="textarea" value={form.values.message} onChange={(v) => form.setValue('message', v)} error={form.errors.message} required rows={5} placeholder="Share your experience regarding taste, texture, and crispness..." />
                  </FormContainer>

                  <div className="mt-8">
                    <SubmitButton status={form.status} label="Submit Review" />
                  </div>

                  <p className="mt-4 text-xs text-brand-brown/50 text-center leading-relaxed">
                    Submitted reviews are reviewed before publication.
                  </p>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABanner
        title="Haven't tried our papads yet?"
        description="Browse our range and taste the tradition of Nimar for yourself."
        primaryLabel="Shop Papads"
        primaryLink="/shop"
        secondaryLabel="Contact Us"
        secondaryLink="/contact"
      />
    </>
  );
}
