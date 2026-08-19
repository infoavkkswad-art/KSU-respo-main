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

   FLOW:
   HERO
   → ENQUIRY FORM
   → DIRECT CONTACT
   → SOCIAL
   → BUSINESS

   DESIGN RULES:
   - Compact hero
   - Reduced top whitespace
   - Strong form hierarchy
   - Comfortable field spacing
   - Compact contact cards
   - Mobile-first layout
   - Green = trust
   - Saffron = action
   - Ivory = canvas
   - Brown = heritage / contrast

   FUNCTIONALITY PRESERVED:
   - Existing enquiry API
   - Existing validation
   - Existing enquiry ID
   - Existing contact information
   - Existing SEO
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


  /* ==========================================================================
     FORM SUBMISSION
     ======================================================================== */

  const submit = async (
    e: FormEvent<HTMLFormElement>,
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
      {/* ======================================================================
          SEO
          =================================================================== */}

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
            min-h-[270px]
            w-full
            overflow-hidden
            bg-brand-green
            sm:min-h-[315px]
            lg:min-h-[355px]
          "
        >

          {/* ==================================================================
              COMPLETE HERO ARTWORK

              object-contain preserves the complete artwork.
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
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
                block
                h-full
                w-full
                max-h-full
                max-w-full
                object-contain
                object-center
              "
            />

          </div>


          {/* ==================================================================
              READABILITY OVERLAYS
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-gradient-to-r
              from-brand-green/95
              via-brand-green/55
              to-brand-green/5
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-gradient-to-t
              from-brand-green/30
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
              z-10
              bg-dots
              opacity-[0.04]
            "
            aria-hidden="true"
          />


          {/* ==================================================================
              DECORATIVE RING
              ================================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              z-10
              h-48
              w-48
              rounded-full
              border
              border-brand-saffron/15
              sm:h-56
              sm:w-56
              lg:h-64
              lg:w-64
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
              min-h-[270px]
              items-center
              sm:min-h-[315px]
              lg:min-h-[355px]
            "
          >

            <Reveal>

              <div
                className="
                  max-w-3xl
                  py-6
                  sm:py-7
                  lg:py-8
                "
              >

                <span
                  className="
                    section-eyebrow
                    mb-2
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
                    text-3xl
                    font-bold
                    leading-[1.03]
                    text-white
                    sm:text-4xl
                    lg:text-5xl
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
                    mt-2.5
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
                    mt-4
                    flex
                    flex-wrap
                    gap-1.5
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
          py-7
          sm:py-9
          lg:py-11
        "
        aria-labelledby="contact-form-title"
      >

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-warm-glow
            opacity-40
          "
          aria-hidden="true"
        />


        <div
          className="
            container-max
            container-px
            relative
          "
        >

          <div
            className="
              grid
              items-start
              gap-5
              lg:grid-cols-[minmax(0,1fr)_340px]
              lg:gap-7
            "
          >

            {/* ==================================================================
                FORM
                =================================================================== */}

            <Reveal>

              <div
                className="
                  card
                  border
                  border-brand-green/10
                  bg-white
                  p-4
                  shadow-card
                  sm:p-6
                  lg:p-7
                "
              >

                {/* ==============================================================
                    FORM HEADER
                    =========================================================== */}

                <div
                  className="
                    mb-5
                    border-b
                    border-brand-green/10
                    pb-4
                    sm:mb-6
                    sm:pb-5
                  "
                >

                  <span
                    className="
                      section-eyebrow
                      mb-1.5
                      block
                    "
                  >
                    Send an Enquiry
                  </span>


                  <h2
                    id="contact-form-title"
                    className="
                      text-balance
                      font-serif
                      text-2xl
                      font-bold
                      leading-tight
                      text-brand-green
                      sm:text-3xl
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


                {/* ==============================================================
                    SUCCESS MESSAGE
                    =========================================================== */}

                {form.status === 'success' && (
                  <div
                    className="
                      mb-5
                      rounded-2xl
                      border
                      border-green-200
                      bg-green-50
                      p-3.5
                      shadow-soft
                    "
                    role="status"
                    aria-live="polite"
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
                          mt-1.5
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
                    ERROR MESSAGE
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
                    FORM FIELDS
                    =========================================================== */}

                <form
                  onSubmit={submit}
                  noValidate
                >

                  <FormContainer>

                    {/* ----------------------------------------------------------
                        NAME + EMAIL
                        ------------------------------------------------------ */}

                    <div
                      className="
                        grid
                        gap-3.5
                        sm:grid-cols-2
                        sm:gap-4
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


                    {/* ----------------------------------------------------------
                        PHONE + SUBJECT
                        ------------------------------------------------------ */}

                    <div
                      className="
                        grid
                        gap-3.5
                        sm:grid-cols-2
                        sm:gap-4
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


                    {/* ----------------------------------------------------------
                        MESSAGE
                        ------------------------------------------------------ */}

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


                  {/* ============================================================
                      SUBMIT AREA
                      ========================================================= */}

                  <div
                    className="
                      mt-4
                      border-t
                      border-brand-green/10
                      pt-4
                      sm:mt-5
                      sm:pt-5
                    "
                  >

                    <SubmitButton
                      status={form.status}
                      label="Send Message"
                    />


                    <p
                      className="
                        mt-2
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
                RIGHT COLUMN
                =================================================================== */}

            <aside
              className="
                space-y-3
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
                    p-4
                    shadow-card
                    sm:p-5
                  "
                >

                  <span
                    className="
                      section-eyebrow
                      mb-1.5
                      block
                    "
                  >
                    Direct Contact
                  </span>


                  <h2
                    className="
                      mb-3
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Contact Information
                  </h2>


                  <div className="space-y-2">

                    {/* ----------------------------------------------------------
                        PHONE
                        ------------------------------------------------------ */}

                    <a
                      href={`tel:${brand.phoneRaw}`}
                      className="
                        group
                        flex
                        min-h-[58px]
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-2.5
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/20
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >

                      <ContactIcon>
                        <Phone
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </ContactIcon>


                      <ContactText
                        title="Phone"
                        value={brand.phone}
                      />


                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-brand-brown/20
                          transition-all
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:text-brand-saffron
                        "
                        aria-hidden="true"
                      />

                    </a>


                    {/* ----------------------------------------------------------
                        WHATSAPP
                        ------------------------------------------------------ */}

                    <a
                      href={`https://wa.me/${brand.phoneRaw}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group
                        flex
                        min-h-[58px]
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-green-200/70
                        bg-green-50
                        p-2.5
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-green-100
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-green-500
                        focus-visible:ring-offset-2
                      "
                    >

                      <span
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
                        <MessageCircle
                          className="h-4 w-4"
                        />
                      </span>


                      <ContactText
                        title="WhatsApp"
                        value={brand.phone}
                      />


                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-green-600/40
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                        "
                        aria-hidden="true"
                      />

                    </a>


                    {/* ----------------------------------------------------------
                        EMAIL
                        ------------------------------------------------------ */}

                    <a
                      href={`mailto:${brand.email}`}
                      className="
                        group
                        flex
                        min-h-[58px]
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-2.5
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-brand-saffron/20
                        hover:shadow-soft
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-saffron
                        focus-visible:ring-offset-2
                      "
                    >

                      <ContactIcon>
                        <Mail
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </ContactIcon>


                      <ContactText
                        title="Email"
                        value={brand.email}
                        breakValue
                      />


                      <ArrowRight
                        className="
                          ml-auto
                          h-4
                          w-4
                          shrink-0
                          text-brand-brown/20
                          transition-all
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:text-brand-saffron
                        "
                        aria-hidden="true"
                      />

                    </a>


                    {/* ----------------------------------------------------------
                        LOCATION
                        ------------------------------------------------------ */}

                    <div
                      className="
                        flex
                        min-h-[58px]
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-brand-green/5
                        bg-brand-ivory
                        p-2.5
                      "
                    >

                      <ContactIcon>
                        <MapPin
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </ContactIcon>


                      <ContactText
                        title="Location"
                        value={brand.region}
                      />

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
                    p-4
                    shadow-card
                    sm:p-5
                  "
                >

                  <span
                    className="
                      section-eyebrow
                      mb-1.5
                      block
                    "
                  >
                    Stay Connected
                  </span>


                  <h2
                    className="
                      mb-3
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Follow Us
                  </h2>


                  <div className="grid grid-cols-2 gap-2">

                    <SocialCard
                      href={brand.instagramUrl}
                      icon={
                        <Instagram
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      }
                      title="Instagram"
                      value={`@${brand.instagram}`}
                    />


                    <SocialCard
                      href={brand.youtubeUrl}
                      icon={
                        <Youtube
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      }
                      title="YouTube"
                      value={brand.youtube}
                    />

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
                    p-4
                    shadow-lift
                    sm:p-5
                  "
                >

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-40
                      w-40
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
                        mb-1.5
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
                        mt-1.5
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
                        mt-3
                        min-h-[42px]
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


/* ==========================================================================
   CONTACT ICON
   ========================================================================== */

interface ContactIconProps {
  children: React.ReactNode;
}


function ContactIcon({
  children,
}: ContactIconProps) {
  return (
    <span
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
      {children}
    </span>
  );
}


/* ==========================================================================
   CONTACT TEXT
   ========================================================================== */

interface ContactTextProps {
  title: string;
  value: string;
  breakValue?: boolean;
}


function ContactText({
  title,
  value,
  breakValue = false,
}: ContactTextProps) {
  return (
    <div className="min-w-0">

      <p
        className="
          text-sm
          font-semibold
          text-brand-green
        "
      >
        {title}
      </p>


      <p
        className={`
          text-xs
          text-brand-brown/50
          ${
            breakValue
              ? 'break-all'
              : 'truncate'
          }
        `}
      >
        {value}
      </p>

    </div>
  );
}


/* ==========================================================================
   SOCIAL CARD
   ========================================================================== */

interface SocialCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  value: string;
}


function SocialCard({
  href,
  icon,
  title,
  value,
}: SocialCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        flex
        min-h-[58px]
        min-w-0
        items-center
        gap-2
        rounded-2xl
        border
        border-brand-green/5
        bg-brand-ivory
        p-2.5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-brand-saffron/15
        hover:shadow-soft
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
      "
    >

      <span
        className="
          shrink-0
          text-brand-saffron
          transition-transform
          duration-200
          group-hover:scale-105
        "
        aria-hidden="true"
      >
        {icon}
      </span>


      <span className="min-w-0">

        <span
          className="
            block
            truncate
            text-sm
            font-semibold
            text-brand-green
          "
        >
          {title}
        </span>


        <span
          className="
            block
            truncate
            text-[10px]
            text-brand-brown/50
          "
        >
          {value}
        </span>

      </span>

    </a>
  );
}
