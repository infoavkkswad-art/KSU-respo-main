import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import {
  FormContainer,
  FormField,
  FormStatusMessage,
  SubmitButton,
  useFormState,
  validators,
} from '@/components/Form';
import { Reveal } from '@/components/Reveal';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';


/* ==========================================================================
   KAWAD SWAD 2.0
   CONTACT PAGE

   Conversion flow:
   HERO → ENQUIRY → DIRECT CONTACT → SOCIAL → BUSINESS

   Central design system:
   - Green   = trust / primary authority
   - Saffron = action / appetite
   - Ivory   = editorial canvas
   - Brown   = heritage / premium contrast

   FUNCTIONALITY PRESERVED:
   - Existing enquiry API
   - Existing validation
   - Existing enquiry ID
   - Existing contact information
   - Existing SEO

   SPACING / IMAGE UPDATE:
   - Hero artwork is fully visible.
   - Hero height reduced.
   - Excessive vertical spacing reduced.
   - Contact content remains responsive.
   ========================================================================== */


const CONTACT_HERO_IMAGE =
  '/images/pages/contact-hero.png';


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Contact() {
  const form = useFormState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [enquiryId, setEnquiryId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);


  /* ========================================================================
     FORM SUBMISSION
     ====================================================================== */

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);

    const valid = form.validate({
      name: validators.required(),
      email: validators.email(),
      message: validators.required(),
    });

    if (!valid) {
      return;
    }

    form.setStatus('submitting');

    try {
      const idempotencyKey =
        'contact-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .substring(2, 9);

      const res =
        await apiClient.createEnquiry({
          type: 'general',
          contactPerson: form.values.name,
          phone: form.values.phone
            ? form.values.phone
            : undefined,
          email: form.values.email,
          location: brand.region,
          message: `[Subject: ${
            form.values.subject ||
            'General Enquiry'
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
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Contact',
            path: '/contact',
          },
        ])}
      />


      {/* ======================================================================
          HERO
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-green
        "
        aria-labelledby="contact-page-title"
      >
        <div
          className="
            relative
            min-h-[340px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[400px]
            lg:min-h-[460px]
          "
        >

          {/* ==================================================================
              FULL HERO ARTWORK

              IMPORTANT:
              object-contain keeps the complete contact artwork visible.
              The green background fills any remaining area.
              ================================================================== */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              overflow-hidden
              bg-brand-green
            "
            aria-hidden="true"
          >
            <img
              src={CONTACT_HERO_IMAGE}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="
                h-full
                w-full
                object-contain
                object-center
              "
            />
          </div>


          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/95
              via-brand-green/60
              to-brand-green/5
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/40
              via-transparent
              to-transparent
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-dots
              opacity-[0.05]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              border
              border-brand-saffron/15
              sm:h-80
              sm:w-80
              lg:h-96
              lg:w-96
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              HERO CONTENT
              ================================================================== */}

          <div
            className="
              container-max
              container-px
              relative
              z-20
              flex
              min-h-[340px]
              items-center
              sm:min-h-[400px]
              lg:min-h-[460px]
            "
          >
            <Reveal>
              <div
                className="
                  max-w-4xl
                  py-9
                  sm:py-11
                  lg:py-12
                "
              >
                <span
                  className="
                    section-eyebrow
                    mb-3
                    block
                    text-brand-saffron
                  "
                >
                  Get in Touch
                </span>

                <h1
                  id="contact-page-title"
                  className="
                    text-balance
                    font-serif
                    text-display-sm
                    font-bold
                    leading-[1.02]
                    text-white
                  "
                >
                  We&apos;d love to
                  <br />
                  <span className="text-brand-saffron">
                    hear from you.
                  </span>
                </h1>

                <p
                  className="
                    text-pretty
                    mt-3
                    max-w-2xl
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

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <span className="badge bg-white/10 text-white">
                    Questions
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Order Support
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Business Enquiries
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          CONTACT CONTENT
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-ivory
          py-10
          sm:py-12
          lg:py-16
        "
        aria-labelledby="contact-form-title"
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-warm-glow
            opacity-50
          "
          aria-hidden="true"
        />

        <div className="container-max container-px relative">

          <div
            className="
              grid
              items-start
              gap-6
              lg:grid-cols-[minmax(0,1fr)_360px]
              lg:gap-8
            "
          >

            {/* ==================================================================
                CONTACT FORM
                =============================================================== */}

            <Reveal>
              <div
                className="
                  card
                  border
                  border-brand-green/10
                  bg-white
                  p-5
                  shadow-card
                  sm:p-7
                  lg:p-8
                "
              >

                <div
                  className="
                    mb-6
                    border-b
                    border-brand-green/10
                    pb-5
                    sm:mb-7
                    sm:pb-6
                  "
                >
                  <span className="section-eyebrow mb-2 block">
                    Send an Enquiry
                  </span>

                  <h2
                    id="contact-form-title"
                    className="
                      text-balance
                      font-serif
                      text-headline-sm
                      font-bold
                      text-brand-green
                      sm:text-headline-md
                    "
                  >
                    Send a Message
                  </h2>

                  <p
                    className="
                      text-pretty
                      mt-2.5
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                      sm:text-base
                    "
                  >
                    Fill in the form and we will get back
                    to you as soon as possible.
                  </p>
                </div>


                {/* ==============================================================
                    SUCCESS
                    =========================================================== */}

                {form.status === 'success' && (
                  <div
                    className="
                      mb-5
                      rounded-2xl
                      border
                      border-green-200
                      bg-green-50
                      p-4
                      shadow-soft
                    "
                    role="status"
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-green-800
                      "
                    >
                      Your message has been received.
                      We&apos;ll be in touch soon.
                    </p>

                    {enquiryId && (
                      <p
                        className="
                          mt-2
                          break-all
                          font-mono
                          text-xs
                          text-green-700
                        "
                      >
                        Enquiry ID: {enquiryId}
                      </p>
                    )}
                  </div>
                )}


                {/* ==============================================================
                    ERROR
                    =========================================================== */}

                {form.status === 'error' &&
                  errorMessage && (
                    <div className="mb-5">
                      <FormStatusMessage
                        status="error"
                        errorMsg={errorMessage}
                      />
                    </div>
                  )}


                {/* ==============================================================
                    FORM
                    =========================================================== */}

                <form
                  onSubmit={submit}
                  noValidate
                >
                  <FormContainer>

                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <FormField
                        label="Name"
                        name="name"
                        value={form.values.name}
                        onChange={(value) =>
                          form.setValue(
                            'name',
                            value,
                          )
                        }
                        error={form.errors.name}
                        required
                        placeholder="Your name"
                        autoComplete="name"
                      />

                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.values.email}
                        onChange={(value) =>
                          form.setValue(
                            'email',
                            value,
                          )
                        }
                        error={form.errors.email}
                        required
                        placeholder="you@domain.com"
                        autoComplete="email"
                      />
                    </div>


                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <FormField
                        label="Phone (optional)"
                        name="phone"
                        type="tel"
                        value={form.values.phone}
                        onChange={(value) =>
                          form.setValue(
                            'phone',
                            value,
                          )
                        }
                        placeholder="10-digit phone"
                        autoComplete="tel"
                      />

                      <FormField
                        label="Subject"
                        name="subject"
                        type="select"
                        value={form.values.subject}
                        onChange={(value) =>
                          form.setValue(
                            'subject',
                            value,
                          )
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
                        form.setValue(
                          'message',
                          value,
                        )
                      }
                      error={form.errors.message}
                      required
                      rows={5}
                      placeholder="How can we help?"
                    />

                  </FormContainer>


                  <div
                    className="
                      mt-5
                      flex
                      flex-col
                      gap-3
                      border-t
                      border-brand-green/10
                      pt-5
                      sm:mt-6
                      sm:pt-6
                    "
                  >
                    <SubmitButton
                      status={form.status}
                      label="Send Message"
                    />

                    <p
                      className="
                        text-center
                        text-[11px]
                        leading-relaxed
                        text-brand-brown/40
                        sm:text-left
                      "
                    >
                      Your enquiry will be securely sent to
                      the Kawad Swad team.
                    </p>
                  </div>
                </form>

              </div>
            </Reveal>


            {/* ==================================================================
                CONTACT INFORMATION
                =============================================================== */}

            <aside
              className="
                space-y-4
                lg:sticky
                lg:top-24
              "
              aria-label="Contact information"
            >

              {/* ================================================================
                  DIRECT CONTACT
                  ============================================================= */}

              <Reveal delay={100}>
                <div
                  className="
                    card
                    border
                    border-brand-green/10
                    bg-white
                    p-5
                    shadow-card
                    sm:p-6
                  "
                >
                  <span className="section-eyebrow mb-2 block">
                    Direct Contact
                  </span>

                  <h2
                    className="
                      mb-4
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Contact Information
                  </h2>

                  <div className="space-y-2.5">

                    {/* Phone */}

                    <a
                      href={`tel:${brand.phoneRaw}`}
                      className="
                        group
                        flex
                        min-h-[64px]
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/20
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Phone className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          Phone
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-brand-brown/50
                          "
                        >
                          {brand.phone}
                        </p>
                      </div>

                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-brand-brown/20
                          transition-transform
                          group-hover:translate-x-0.5
                          group-hover:text-brand-saffron
                        "
                        aria-hidden="true"
                      />
                    </a>


                    {/* WhatsApp */}

                    <a
                      href={`https://wa.me/${brand.phoneRaw}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[64px]
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-green-200/70
                        bg-green-50
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:bg-green-100
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-green-500
                        focus-visible:ring-offset-2
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-green-100
                          text-green-600
                        "
                        aria-hidden="true"
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          WhatsApp
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-brand-brown/50
                          "
                        >
                          {brand.phone}
                        </p>
                      </div>

                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-green-600/40
                          transition-transform
                          group-hover:translate-x-0.5
                        "
                        aria-hidden="true"
                      />
                    </a>


                    {/* Email */}

                    <a
                      href={`mailto:${brand.email}`}
                      className="
                        group
                        flex
                        min-h-[64px]
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/20
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Mail className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          Email
                        </p>

                        <p
                          className="
                            break-all
                            text-xs
                            text-brand-brown/50
                          "
                        >
                          {brand.email}
                        </p>
                      </div>

                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-brand-brown/20
                          transition-transform
                          group-hover:translate-x-0.5
                          group-hover:text-brand-saffron
                        "
                        aria-hidden="true"
                      />
                    </a>


                    {/* Location */}

                    <div
                      className="
                        flex
                        min-h-[64px]
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <MapPin className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          Location
                        </p>

                        <p
                          className="
                            text-xs
                            text-brand-brown/50
                          "
                        >
                          {brand.region}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </Reveal>


              {/* ================================================================
                  SOCIAL
                  ============================================================= */}

              <Reveal delay={150}>
                <div
                  className="
                    card
                    border
                    border-brand-green/10
                    bg-white
                    p-5
                    shadow-card
                    sm:p-6
                  "
                >
                  <span className="section-eyebrow mb-2 block">
                    Stay Connected
                  </span>

                  <h2
                    className="
                      mb-4
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Follow Us
                  </h2>

                  <div className="grid grid-cols-2 gap-2.5">

                    <a
                      href={brand.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[64px]
                        min-w-0
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/15
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >
                      <Instagram
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      />

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          Instagram
                        </p>

                        <p
                          className="
                            truncate
                            text-[10px]
                            text-brand-brown/50
                          "
                        >
                          @{brand.instagram}
                        </p>
                      </div>
                    </a>


                    <a
                      href={brand.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[64px]
                        min-w-0
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/15
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >
                      <Youtube
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      />

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-brand-green
                          "
                        >
                          YouTube
                        </p>

                        <p
                          className="
                            truncate
                            text-[10px]
                            text-brand-brown/50
                          "
                        >
                          {brand.youtube}
                        </p>
                      </div>
                    </a>

                  </div>
                </div>
              </Reveal>


              {/* ================================================================
                  BUSINESS ENQUIRY
                  ============================================================= */}

              <Reveal delay={200}>
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-5
                    shadow-lift
                    sm:p-6
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-44
                      w-44
                      rounded-full
                      border
                      border-brand-saffron/20
                    "
                    aria-hidden="true"
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-dots
                      opacity-10
                    "
                    aria-hidden="true"
                  />

                  <div className="relative">

                    <span
                      className="
                        mb-2
                        block
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-brand-saffron
                      "
                    >
                      Partnerships
                    </span>

                    <h2
                      className="
                        font-serif
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      Business Enquiry
                    </h2>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-brand-cream/70
                      "
                    >
                      Looking to partner with us?
                      Visit our Business Hub.
                    </p>

                    <Link
                      to="/business"
                      className="
                        btn-yellow
                        mt-4
                        min-h-[44px]
                        px-5
                      "
                    >
                      Visit Business Hub

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>

                  </div>
                </div>
              </Reveal>

            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
