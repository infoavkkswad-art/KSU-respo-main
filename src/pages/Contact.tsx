import { useState } from 'react';
import { SEO, breadcrumbSchema } from '@/components/SEO';
import {
  FormField,
  FormStatusMessage,
  SubmitButton,
  useFormState,
  validators,
  FormContainer,
} from '@/components/Form';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';
import {
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Youtube,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const CONTACT_HERO_IMAGE = '/images/pages/contact-hero.png';

export default function Contact() {
  const form = useFormState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

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
      const idempotencyKey =
        'contact-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .substring(2, 9);

      const res = await apiClient.createEnquiry({
        type: 'general',
        contactPerson: form.values.name,
        phone: form.values.phone
          ? form.values.phone
          : undefined,
        email: form.values.email,
        location: brand.region,
        message: `[Subject: ${
          form.values.subject || 'General Enquiry'
        }] ${form.values.message}`,
        idempotencyKey,
      });

      setEnquiryId(res.enquiryId);
      form.setStatus('success');
      form.reset();
    } catch (err) {
      form.setStatus('error');

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again or contact us directly.',
      );
    }
  };

  const whatsappMsg = encodeURIComponent(
    'Hello Kawad Swad, I have a question.',
  );

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

      {/* ================================================================
          CONTACT HERO
      ================================================================= */}

      <section className="relative overflow-hidden">
        <div
          className="
            relative
            min-h-[340px]
            w-full
            bg-brand-brown
            sm:min-h-[420px]
            lg:min-h-[500px]
          "
        >
          <img
            src={CONTACT_HERO_IMAGE}
            alt="Kawad Swad contact and customer support"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-brown/85
              via-brand-brown/55
              to-brand-brown/15
            "
          />

          <div
            className="
              container-max
              container-px
              relative
              flex
              min-h-[340px]
              items-center
              sm:min-h-[420px]
              lg:min-h-[500px]
            "
          >
            <div className="max-w-2xl py-14 sm:py-16 lg:py-20">
              <span
                className="
                  mb-4
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-brand-yellow
                  sm:text-sm
                "
              >
                Get in Touch
              </span>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.05]
                  tracking-tight
                  text-white
                  sm:text-5xl
                  lg:text-7xl
                "
              >
                We'd love to
                <br />
                <span className="text-brand-yellow">
                  hear from you.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-white/80
                  sm:text-base
                  lg:text-lg
                "
              >
                Whether you have a question, feedback,
                order support request, or business enquiry,
                reach out and our team will be happy to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTACT CONTENT
      ================================================================= */}

      <section className="container-max container-px py-12 sm:py-16 lg:py-20">
        <div
          className="
            grid
            items-start
            gap-8
            lg:grid-cols-[minmax(0,1fr)_380px]
          "
        >
          {/* ============================================================
              CONTACT FORM
          ============================================================= */}

          <Reveal>
            <div
              className="
                card
                border
                border-brand-brown/10
                bg-white
                p-5
                shadow-soft
                sm:p-8
              "
            >
              <h2
                className="
                  mb-2
                  font-serif
                  text-2xl
                  font-bold
                  text-brand-brown
                  sm:text-3xl
                "
              >
                Send a Message
              </h2>

              <p className="mb-6 text-sm text-brand-brown/60">
                Fill in the form and we will get back to you
                as soon as possible.
              </p>

              {form.status === 'success' && (
                <div
                  className="
                    mb-6
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                    text-green-800
                  "
                >
                  <p className="mb-1 text-sm font-semibold">
                    Your message has been received. We'll be
                    in touch soon.
                  </p>

                  {enquiryId && (
                    <p className="break-all font-mono text-xs text-green-700">
                      Enquiry ID: {enquiryId}
                    </p>
                  )}
                </div>
              )}

              {form.status === 'error' &&
                errorMessage && (
                  <div className="mb-6">
                    <FormStatusMessage
                      status="error"
                      errorMsg={errorMessage}
                    />
                  </div>
                )}

              <form
                onSubmit={submit}
                noValidate
              >
                <FormContainer>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Name"
                      name="name"
                      value={form.values.name}
                      onChange={(value) =>
                        form.setValue('name', value)
                      }
                      error={form.errors.name}
                      required
                      placeholder="Your name"
                    />

                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.values.email}
                      onChange={(value) =>
                        form.setValue('email', value)
                      }
                      error={form.errors.email}
                      required
                      placeholder="you@domain.com"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Phone (optional)"
                      name="phone"
                      type="tel"
                      value={form.values.phone}
                      onChange={(value) =>
                        form.setValue('phone', value)
                      }
                      placeholder="10-digit phone"
                    />

                    <FormField
                      label="Subject"
                      name="subject"
                      type="select"
                      value={form.values.subject}
                      onChange={(value) =>
                        form.setValue('subject', value)
                      }
                      options={[
                        'General Enquiry',
                        'Product Question',
                        'Order Support',
                        'Business Enquiry',
                        'Feedback',
                        'Other',
                      ]}
                    />
                  </div>

                  <FormField
                    label="Message"
                    name="message"
                    type="textarea"
                    value={form.values.message}
                    onChange={(value) =>
                      form.setValue('message', value)
                    }
                    error={form.errors.message}
                    required
                    rows={5}
                    placeholder="How can we help?"
                  />
                </FormContainer>

                <div className="mt-6">
                  <SubmitButton
                    status={form.status}
                    label="Send Message"
                  />
                </div>
              </form>
            </div>
          </Reveal>

          {/* ============================================================
              CONTACT INFORMATION
          ============================================================= */}

          <aside className="space-y-5 lg:sticky lg:top-24">
            <Reveal delay={100}>
              <div
                className="
                  card
                  border
                  border-brand-brown/10
                  bg-white
                  p-5
                  shadow-soft
                  sm:p-6
                "
              >
                <h3 className="mb-4 font-serif font-semibold text-brand-brown">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  <a
                    href={`tel:${brand.phoneRaw}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-brand-cream-dark
                      p-3
                      transition-colors
                      hover:bg-brand-brown/10
                    "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10">
                      <Phone className="h-5 w-5 text-brand-red" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        Phone
                      </p>
                      <p className="text-2xs text-brand-brown/50">
                        {brand.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${brand.phoneRaw}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-green-50
                      p-3
                      transition-colors
                      hover:bg-green-100
                    "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        WhatsApp
                      </p>
                      <p className="text-2xs text-brand-brown/50">
                        {brand.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${brand.email}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-brand-cream-dark
                      p-3
                      transition-colors
                      hover:bg-brand-brown/10
                    "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10">
                      <Mail className="h-5 w-5 text-brand-red" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        Email
                      </p>
                      <p className="break-all text-2xs text-brand-brown/50">
                        {brand.email}
                      </p>
                    </div>
                  </a>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-brand-cream-dark
                      p-3
                    "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10">
                      <MapPin className="h-5 w-5 text-brand-red" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        Location
                      </p>
                      <p className="text-2xs text-brand-brown/50">
                        {brand.region}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ==========================================================
                SOCIAL
            ========================================================== */}

            <Reveal delay={150}>
              <div
                className="
                  card
                  border
                  border-brand-brown/10
                  bg-white
                  p-5
                  shadow-soft
                  sm:p-6
                "
              >
                <h3 className="mb-4 font-serif font-semibold text-brand-brown">
                  Follow Us
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                      rounded-xl
                      bg-brand-cream-dark
                      p-3
                      transition-colors
                      hover:bg-brand-brown/10
                    "
                  >
                    <Instagram className="h-5 w-5 shrink-0 text-brand-red" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        Instagram
                      </p>
                      <p className="truncate text-2xs text-brand-brown/50">
                        @{brand.instagram}
                      </p>
                    </div>
                  </a>

                  <a
                    href={brand.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                      rounded-xl
                      bg-brand-cream-dark
                      p-3
                      transition-colors
                      hover:bg-brand-brown/10
                    "
                  >
                    <Youtube className="h-5 w-5 shrink-0 text-brand-red" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-brown">
                        YouTube
                      </p>
                      <p className="truncate text-2xs text-brand-brown/50">
                        {brand.youtube}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* ==========================================================
                BUSINESS ENQUIRY
            ========================================================== */}

            <Reveal delay={200}>
              <div className="card bg-brand-brown p-5 text-brand-cream sm:p-6">
                <h3 className="mb-2 font-serif font-semibold text-white">
                  Business Enquiry
                </h3>

                <p className="mb-4 text-sm leading-relaxed text-brand-cream/70">
                  Looking to partner with us? Visit our
                  Business Hub.
                </p>

                <a
                  href="/business"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-brand-yellow
                    transition-all
                    hover:gap-2
                  "
                >
                  Visit Business Hub
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
