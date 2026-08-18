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
  ArrowRight,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';


/* ==========================================================================
   KAWAD SWAD 2.0
   CONTACT PAGE

   Flow:
   HERO → ENQUIRY → DIRECT CONTACT → SOCIAL → BUSINESS

   Important:
   The enquiry/API workflow remains unchanged.
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

  const submit = async (
    e: React.FormEvent,
  ) => {
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
          contactPerson:
            form.values.name,
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

      setEnquiryId(
        res.enquiryId,
      );

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


  const whatsappMsg =
    encodeURIComponent(
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
        className="relative overflow-hidden"
        aria-labelledby="contact-page-title"
      >
        <div
          className="
            relative
            min-h-[340px]
            w-full
            bg-brand-green
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

          {/* Primary readable overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/90
              via-brand-green/60
              to-brand-green/15
            "
            aria-hidden="true"
          />

          {/* Bottom depth */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/35
              via-transparent
              to-transparent
            "
            aria-hidden="true"
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
            <Reveal>
              <div
                className="
                  max-w-3xl
                  py-14
                  sm:py-16
                  lg:py-20
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
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          CONTACT CONTENT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-12
          sm:py-16
          lg:py-20
        "
      >
        <div className="container-max container-px">

          <div
            className="
              grid
              items-start
              gap-8
              lg:grid-cols-[minmax(0,1fr)_380px]
              lg:gap-10
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
                  sm:p-8
                  lg:p-9
                "
              >
                <div className="mb-7">
                  <span className="section-eyebrow mb-2 block">
                    Send an Enquiry
                  </span>

                  <h2
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
                      mt-2
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                    "
                  >
                    Fill in the form and we will get back
                    to you as soon as possible.
                  </p>
                </div>


                {/* --------------------------------------------------------------
                    SUCCESS
                    ----------------------------------------------------------- */}

                {form.status === 'success' && (
                  <div
                    className="
                      mb-6
                      rounded-2xl
                      border
                      border-green-200
                      bg-green-50
                      p-4
                      text-green-800
                    "
                    role="status"
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                      "
                    >
                      Your message has been received.
                      We&apos;ll be in touch soon.
                    </p>

                    {enquiryId && (
                      <p
                        className="
                          mt-1
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


                {/* --------------------------------------------------------------
                    ERROR
                    ----------------------------------------------------------- */}

                {form.status === 'error' &&
                  errorMessage && (
                    <div className="mb-6">
                      <FormStatusMessage
                        status="error"
                        errorMsg={errorMessage}
                      />
                    </div>
                  )}


                {/* --------------------------------------------------------------
                    FORM
                    ----------------------------------------------------------- */}

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
                        value={
                          form.values.name
                        }
                        onChange={(value) =>
                          form.setValue(
                            'name',
                            value,
                          )
                        }
                        error={
                          form.errors.name
                        }
                        required
                        placeholder="Your name"
                      />

                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={
                          form.values.email
                        }
                        onChange={(value) =>
                          form.setValue(
                            'email',
                            value,
                          )
                        }
                        error={
                          form.errors.email
                        }
                        required
                        placeholder="you@domain.com"
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
                        value={
                          form.values.phone
                        }
                        onChange={(value) =>
                          form.setValue(
                            'phone',
                            value,
                          )
                        }
                        placeholder="10-digit phone"
                      />

                      <FormField
                        label="Subject"
                        name="subject"
                        type="select"
                        value={
                          form.values.subject
                        }
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
                      value={
                        form.values.message
                      }
                      onChange={(value) =>
                        form.setValue(
                          'message',
                          value,
                        )
                      }
                      error={
                        form.errors.message
                      }
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


            {/* ==================================================================
                CONTACT INFORMATION
                =============================================================== */}

            <aside
              className="
                space-y-5
                lg:sticky
                lg:top-24
              "
              aria-label="Contact information"
            >

              {/* --------------------------------------------------------------
                  DIRECT CONTACT
                  ----------------------------------------------------------- */}

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
                      mb-5
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Contact Information
                  </h2>

                  <div className="space-y-3">

                    {/* Phone */}
                    <a
                      href={`tel:${brand.phoneRaw}`}
                      className="
                        group
                        flex
                        min-h-[68px]
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
                        hover:border-brand-green/10
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
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Phone className="h-5 w-5" />
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
                    </a>


                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${brand.phoneRaw}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[68px]
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
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-green-100
                          text-green-600
                        "
                        aria-hidden="true"
                      >
                        <MessageCircle className="h-5 w-5" />
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
                    </a>


                    {/* Email */}
                    <a
                      href={`mailto:${brand.email}`}
                      className="
                        group
                        flex
                        min-h-[68px]
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
                        hover:border-brand-green/10
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
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Mail className="h-5 w-5" />
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
                    </a>


                    {/* Location */}
                    <div
                      className="
                        flex
                        min-h-[68px]
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
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <MapPin className="h-5 w-5" />
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


              {/* --------------------------------------------------------------
                  SOCIAL
                  ----------------------------------------------------------- */}

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
                      mb-5
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Follow Us
                  </h2>

                  <div className="grid grid-cols-2 gap-3">

                    <a
                      href={brand.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[68px]
                        min-w-0
                        items-center
                        gap-2
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
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
                        min-h-[68px]
                        min-w-0
                        items-center
                        gap-2
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-3
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
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


              {/* --------------------------------------------------------------
                  BUSINESS ENQUIRY
                  ----------------------------------------------------------- */}

              <Reveal delay={200}>
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-5
                    shadow-card
                    sm:p-6
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-12
                      -top-12
                      h-32
                      w-32
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
                        mb-2
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
                        mb-4
                        text-sm
                        leading-relaxed
                        text-brand-cream/70
                      "
                    >
                      Looking to partner with us?
                      Visit our Business Hub.
                    </p>

                    <a
                      href="/business"
                      className="
                        inline-flex
                        min-h-[38px]
                        items-center
                        gap-1
                        rounded-full
                        bg-brand-saffron
                        px-4
                        py-2
                        text-xs
                        font-semibold
                        text-white
                        transition-all
                        duration-300
                        hover:bg-brand-saffron-dark
                        hover:gap-2
                        hover:shadow-glow
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-brand-brown
                      "
                    >
                      Visit Business Hub

                      <ArrowRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
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
