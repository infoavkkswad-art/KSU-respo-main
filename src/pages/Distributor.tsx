import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Factory,
  MessageCircle,
  Package,
  Phone,
  Store,
  Truck,
  Users,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal, CTABanner } from '@/components/Reveal';
import {
  FormContainer,
  FormField,
  FormStatusMessage,
  SubmitButton,
  useFormState,
  validators,
} from '@/components/Form';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';


/* ==========================================================================
   KAWAD SWAD 2.0
   DISTRIBUTOR PARTNERSHIP

   Conversion flow:
   HERO
   → OPPORTUNITY
   → PARTNERSHIP BENEFITS
   → HOW IT WORKS
   → DISTRIBUTOR ENQUIRY
   → DIRECT CTA

   CENTRAL DESIGN SYSTEM
   - Green   = trust / authority
   - Saffron = action / commercial energy
   - Ivory   = editorial canvas
   - Brown   = heritage / premium contrast

   FUNCTIONALITY PRESERVED:
   - Distributor enquiry API
   - Existing validation
   - Existing enquiry ID
   - Existing brand data
   - Existing business route
   ========================================================================== */


/* ==========================================================================
   ASSETS
   ========================================================================== */

const DISTRIBUTOR_HERO_IMAGE =
  '/images/pages/business-hero.png';


/* ==========================================================================
   PARTNERSHIP BENEFITS
   ========================================================================== */

const partnershipBenefits = [
  {
    icon: Package,
    title: 'Product Range',
    description:
      'A growing range of moong, chana, urad and combo papads.',
  },
  {
    icon: Factory,
    title: 'Manufacturing Capability',
    description:
      'Consistent supply backed by structured manufacturing and quality processes.',
  },
  {
    icon: Truck,
    title: 'Supply Relationship',
    description:
      'Reliable fulfilment designed around long-term distribution partnerships.',
  },
  {
    icon: Store,
    title: 'Brand Support',
    description:
      'A differentiated regional food brand positioned for the Indian food market.',
  },
];


/* ==========================================================================
   PROCESS
   ========================================================================== */

const processSteps = [
  {
    step: '01',
    title: 'Submit Enquiry',
    description:
      'Share your business details, location and distribution interests.',
  },
  {
    step: '02',
    title: 'We Connect',
    description:
      'Our team will contact you to understand your market and answer your questions.',
  },
  {
    step: '03',
    title: 'Begin Partnership',
    description:
      'If we are a good fit, we begin building the supply relationship together.',
  },
];


/* ==========================================================================
   PAGE
   ========================================================================== */

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
      businessName: validators.required(),
      contactPerson: validators.required(),
      phone: validators.phone(),
      email: validators.email(),
      location: validators.required(),
    });

    if (!valid) {
      return;
    }

    form.setStatus('submitting');

    try {
      const idempotencyKey =
        'dist-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .substring(2, 9);

      const res =
        await apiClient.createEnquiry({
          type: 'distributor',
          businessName:
            form.values.businessName,
          contactPerson:
            form.values.contactPerson,
          phone: form.values.phone,
          email: form.values.email,
          location: form.values.location,
          businessType:
            form.values.currentBusiness,
          message:
            form.values.message ||
            'Distributor partnership enquiry',
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


  return (
    <>
      <SEO
        title="Become a Distributor"
        description="Partner with Kawad Swad as a distributor. Bring premium papads from Nimar to your region."
        path="/distributor"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Business',
            path: '/business',
          },
          {
            name: 'Distributor',
            path: '/distributor',
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
        "
        aria-labelledby="distributor-page-title"
      >
        <div
          className="
            relative
            min-h-[400px]
            w-full
            bg-brand-green
            sm:min-h-[480px]
            lg:min-h-[560px]
          "
        >
          <img
            src={DISTRIBUTOR_HERO_IMAGE}
            alt="Kawad Swad distributor partnership"
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
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-brand-green/95
              via-brand-green/65
              to-brand-green/10
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-brand-green/50
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
              -right-28
              -top-28
              h-72
              w-72
              rounded-full
              border
              border-brand-saffron/15
              sm:h-96
              sm:w-96
            "
            aria-hidden="true"
          />

          <div
            className="
              container-max
              container-px
              relative
              flex
              min-h-[400px]
              items-center
              sm:min-h-[480px]
              lg:min-h-[560px]
            "
          >
            <Reveal>
              <div
                className="
                  max-w-4xl
                  py-14
                  sm:py-16
                  lg:py-20
                "
              >
                <span
                  className="
                    section-eyebrow
                    mb-4
                    block
                    text-brand-saffron
                  "
                >
                  Distribution Partnership
                </span>

                <h1
                  id="distributor-page-title"
                  className="
                    text-balance
                    font-serif
                    text-display-sm
                    font-bold
                    leading-[1.02]
                    text-white
                  "
                >
                  Bring the taste of Nimar
                  <br />
                  <span className="text-brand-saffron">
                    to your region.
                  </span>
                </h1>

                <p
                  className="
                    text-pretty
                    mt-5
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-white/80
                    sm:text-base
                    lg:text-lg
                  "
                >
                  Partner with Kawad Swad to distribute
                  premium papads through your regional
                  retail and food network.
                </p>

                <div
                  className="
                    mt-7
                    flex
                    flex-wrap
                    gap-2.5
                  "
                >
                  <span className="badge bg-white/10 text-white">
                    Regional Distribution
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Growing Product Range
                  </span>

                  <span className="badge bg-white/10 text-white">
                    Long-Term Partnership
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ======================================================================
          OPPORTUNITY
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-ivory
          py-14
          sm:py-18
          lg:py-24
        "
        aria-labelledby="opportunity-title"
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

        <div className="container-max container-px relative">

          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-12
              lg:gap-12
            "
          >

            <div className="lg:col-span-7">
              <Reveal>
                <div>

                  <span className="section-eyebrow mb-3 block">
                    The Opportunity
                  </span>

                  <h2
                    id="opportunity-title"
                    className="
                      text-balance
                      max-w-3xl
                      font-serif
                      text-headline-lg
                      font-bold
                      leading-tight
                      text-brand-green
                    "
                  >
                    A growing brand,
                    <br />
                    a trusted partnership.
                  </h2>

                  <div
                    className="
                      mt-5
                      max-w-2xl
                      space-y-4
                      text-sm
                      leading-relaxed
                      text-brand-brown/70
                      sm:text-base
                    "
                  >
                    <p>
                      Kawad Swad is building a network of
                      distributors who share our commitment
                      to quality and authentic taste. As a
                      distributor, you bring our papads to
                      retailers and consumers in your region.
                    </p>

                    <p>
                      We are looking for partners who value
                      long-term relationships, dependable
                      service and a genuine connection to the
                      product. If that sounds like you, we
                      would love to hear from you.
                    </p>
                  </div>

                  <div
                    className="
                      mt-7
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:flex-wrap
                    "
                  >
                    <a
                      href="#distributor-enquiry"
                      className="
                        btn-primary
                        justify-center
                        px-7
                      "
                    >
                      Start Enquiry

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </a>

                    <Link
                      to="/business"
                      className="
                        btn-outline
                        justify-center
                        px-7
                      "
                    >
                      Business Hub
                    </Link>
                  </div>

                </div>
              </Reveal>
            </div>


            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-6
                    shadow-lift
                    sm:p-8
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

                    <div
                      className="
                        mb-6
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-brand-saffron/15
                        text-brand-saffron
                      "
                      aria-hidden="true"
                    >
                      <Users className="h-7 w-7" />
                    </div>

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
                      Partnership Mindset
                    </span>

                    <h3
                      className="
                        font-serif
                        text-2xl
                        font-bold
                        text-white
                      "
                    >
                      Grow together.
                    </h3>

                    <p
                      className="
                        mt-3
                        text-sm
                        leading-relaxed
                        text-brand-cream/70
                      "
                    >
                      We are interested in relationships
                      that grow over time, not simply
                      one-time transactions.
                    </p>

                    <div className="mt-6 space-y-2.5">

                      {[
                        'Quality-first approach',
                        'Dependable supply',
                        'Regional market focus',
                      ].map((item) => (
                        <div
                          key={item}
                          className="
                            flex
                            items-center
                            gap-3
                            text-sm
                            text-brand-cream/85
                          "
                        >
                          <span
                            className="
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-brand-saffron/15
                              text-brand-saffron
                            "
                            aria-hidden="true"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>

                          {item}
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>


      {/* ======================================================================
          WHAT YOU GET
          =================================================================== */}

      <section
        className="
          border-y
          border-brand-green/10
          bg-brand-ivory-dark
          py-16
          sm:py-20
          lg:py-24
        "
        aria-labelledby="benefits-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div
              className="
                mx-auto
                mb-10
                max-w-3xl
                text-center
                sm:mb-14
              "
            >
              <span className="section-eyebrow mb-3 block">
                What You Get
              </span>

              <h2
                id="benefits-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                A partnership built on quality
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                The foundation of a strong distribution
                relationship starts with a product and
                supply system that can support your market.
              </p>
            </div>
          </Reveal>


          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {partnershipBenefits.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal
                    key={item.title}
                    delay={index * 60}
                  >
                    <article
                      className="
                        card
                        h-full
                        border
                        border-brand-green/10
                        bg-white
                        p-6
                        shadow-card
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lift
                        sm:p-7
                      "
                    >
                      <div
                        className="
                          mb-5
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-brand-saffron/10
                          text-brand-saffron
                        "
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <h3
                        className="
                          text-balance
                          font-serif
                          text-lg
                          font-semibold
                          text-brand-green
                        "
                      >
                        {item.title}
                      </h3>

                      <p
                        className="
                          text-pretty
                          mt-2
                          text-sm
                          leading-relaxed
                          text-brand-brown/60
                        "
                      >
                        {item.description}
                      </p>
                    </article>
                  </Reveal>
                );
              },
            )}
          </div>

        </div>
      </section>


      {/* ======================================================================
          PROCESS
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-16
          sm:py-20
          lg:py-24
        "
        aria-labelledby="process-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div
              className="
                mx-auto
                mb-10
                max-w-3xl
                text-center
                sm:mb-14
              "
            >
              <span className="section-eyebrow mb-3 block">
                How It Works
              </span>

              <h2
                id="process-title"
                className="
                  text-balance
                  font-serif
                  text-headline-md
                  font-bold
                  text-brand-green
                "
              >
                A simple enquiry process
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-4
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                Three straightforward steps from first
                conversation to a potential partnership.
              </p>
            </div>
          </Reveal>


          <div
            className="
              relative
              grid
              gap-5
              sm:grid-cols-3
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                left-[16.66%]
                right-[16.66%]
                top-10
                hidden
                h-px
                bg-brand-green/10
                sm:block
              "
              aria-hidden="true"
            />

            {processSteps.map(
              (item, index) => (
                <Reveal
                  key={item.step}
                  delay={index * 80}
                >
                  <article
                    className="
                      card
                      relative
                      z-10
                      h-full
                      border
                      border-brand-green/10
                      bg-white
                      p-6
                      text-center
                      shadow-card
                      sm:p-7
                    "
                  >
                    <div
                      className="
                        mx-auto
                        mb-5
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-brand-saffron/20
                        bg-brand-ivory
                      "
                    >
                      <span
                        className="
                          font-serif
                          text-2xl
                          font-bold
                          text-brand-saffron
                        "
                      >
                        {item.step}
                      </span>
                    </div>

                    <h3
                      className="
                        font-serif
                        text-lg
                        font-semibold
                        text-brand-green
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-brand-brown/60
                      "
                    >
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ),
            )}

          </div>
        </div>
      </section>


      {/* ======================================================================
          ENQUIRY FORM
          =================================================================== */}

      <section
        id="distributor-enquiry"
        className="
          relative
          overflow-hidden
          border-t
          border-brand-green/10
          bg-brand-ivory-dark
          py-16
          sm:py-20
          lg:py-24
        "
        aria-labelledby="enquiry-title"
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

        <div className="container-max container-px relative">

          <div
            className="
              mx-auto
              max-w-3xl
            "
          >

            <Reveal>
              <div
                className="
                  mb-8
                  text-center
                  sm:mb-10
                "
              >
                <span className="section-eyebrow mb-3 block">
                  Start a Conversation
                </span>

                <h2
                  id="enquiry-title"
                  className="
                    text-balance
                    font-serif
                    text-headline-md
                    font-bold
                    text-brand-green
                  "
                >
                  Distributor Enquiry
                </h2>

                <p
                  className="
                    text-pretty
                    mx-auto
                    mt-3
                    max-w-xl
                    text-sm
                    leading-relaxed
                    text-brand-brown/60
                    sm:text-base
                  "
                >
                  Tell us about yourself and your region.
                  We will get back to you to understand
                  your requirements.
                </p>
              </div>
            </Reveal>


            <Reveal delay={100}>
              <div
                className="
                  card
                  border
                  border-brand-green/10
                  bg-white
                  p-5
                  shadow-card
                  sm:p-8
                  lg:p-10
                "
              >

                {/* ==============================================================
                    SUCCESS
                    =========================================================== */}

                {form.status === 'success' && (
                  <div
                    className="
                      mb-6
                      rounded-2xl
                      border
                      border-green-200
                      bg-green-50
                      p-4
                      shadow-soft
                    "
                    role="status"
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-green-100
                          text-green-700
                        "
                        aria-hidden="true"
                      >
                        <Check className="h-4 w-4" />
                      </div>

                      <div>
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-green-800
                          "
                        >
                          Your distributor enquiry has
                          been received.
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-relaxed
                            text-green-700
                          "
                        >
                          Our team will review your
                          details and get in touch.
                        </p>

                        {enquiryId && (
                          <p
                            className="
                              mt-2
                              break-all
                              font-mono
                              text-[11px]
                              text-green-700
                            "
                          >
                            Enquiry ID: {enquiryId}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                )}


                {/* ==============================================================
                    ERROR
                    =========================================================== */}

                {form.status === 'error' &&
                  errorMessage && (
                    <div className="mb-6">
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

                    <FormField
                      label="Business Name"
                      name="businessName"
                      value={
                        form.values.businessName
                      }
                      onChange={(value) =>
                        form.setValue(
                          'businessName',
                          value,
                        )
                      }
                      error={
                        form.errors.businessName
                      }
                      required
                      placeholder="Your distribution business name"
                      autoComplete="organization"
                    />


                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <FormField
                        label="Contact Person"
                        name="contactPerson"
                        value={
                          form.values.contactPerson
                        }
                        onChange={(value) =>
                          form.setValue(
                            'contactPerson',
                            value,
                          )
                        }
                        error={
                          form.errors.contactPerson
                        }
                        required
                        placeholder="Contact person name"
                        autoComplete="name"
                      />

                      <FormField
                        label="Phone"
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
                        error={
                          form.errors.phone
                        }
                        required
                        placeholder="10-digit phone"
                        autoComplete="tel"
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
                        placeholder="you@business.com"
                        autoComplete="email"
                      />

                      <FormField
                        label="Location / Region"
                        name="location"
                        value={
                          form.values.location
                        }
                        onChange={(value) =>
                          form.setValue(
                            'location',
                            value,
                          )
                        }
                        error={
                          form.errors.location
                        }
                        required
                        placeholder="City, State"
                        autoComplete="address-level2"
                      />
                    </div>


                    <FormField
                      label="Current Business Type"
                      name="currentBusiness"
                      value={
                        form.values.currentBusiness
                      }
                      onChange={(value) =>
                        form.setValue(
                          'currentBusiness',
                          value,
                        )
                      }
                      placeholder="e.g. FMCG Distributor, Wholesaler"
                    />


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
                      rows={5}
                      placeholder="Why are you interested in distributing Kawad Swad?"
                    />

                  </FormContainer>


                  <div
                    className="
                      mt-6
                      flex
                      flex-col
                      gap-3
                      border-t
                      border-brand-green/10
                      pt-6
                      sm:mt-7
                      sm:flex-row
                      sm:items-center
                      sm:pt-7
                    "
                  >
                    <SubmitButton
                      status={form.status}
                      label="Become a Distributor"
                    />

                    <Link
                      to="/business"
                      className="
                        btn-ghost
                        justify-center
                        text-center
                        sm:w-auto
                      "
                    >
                      Back to Business Hub
                    </Link>
                  </div>

                </form>

              </div>
            </Reveal>

          </div>
        </div>
      </section>


      {/* ======================================================================
          DIRECT SUPPORT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-12
          sm:py-16
        "
        aria-labelledby="direct-support-title"
      >
        <div className="container-max container-px">

          <Reveal>
            <div
              className="
                mx-auto
                max-w-3xl
                rounded-3xl
                border
                border-brand-green/10
                bg-white
                p-6
                shadow-card
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >

                <div className="max-w-xl">

                  <span className="section-eyebrow mb-2 block">
                    Direct Support
                  </span>

                  <h2
                    id="direct-support-title"
                    className="
                      font-serif
                      text-2xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Questions before you apply?
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                    "
                  >
                    Speak with us directly if you would
                    like to understand the opportunity before
                    submitting your enquiry.
                  </p>

                </div>


                <div
                  className="
                    grid
                    w-full
                    gap-3
                    sm:grid-cols-2
                    lg:w-auto
                  "
                >

                  <a
                    href={brand.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      inline-flex
                      min-h-[48px]
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-green-600
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-green-700
                      hover:shadow-lift
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-green-500
                      focus-visible:ring-offset-2
                    "
                  >
                    <MessageCircle className="h-4 w-4" />

                    WhatsApp

                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <a
                    href={`tel:${brand.phoneRaw}`}
                    className="
                      btn-outline
                      min-h-[48px]
                      justify-center
                    "
                  >
                    <Phone className="h-4 w-4" />

                    Call Us

                    <ArrowRight className="h-4 w-4" />
                  </a>

                </div>

              </div>
            </div>
          </Reveal>

        </div>
      </section>


      {/* ======================================================================
          CTA
          =================================================================== */}

      <CTABanner
        title="Ready to explore the partnership?"
        description="Tell us about your business and region. We will start the conversation and see if Kawad Swad is the right fit for your market."
        primaryLabel="Start Distributor Enquiry"
        primaryLink="#distributor-enquiry"
        secondaryLabel="Business Hub"
        secondaryLink="/business"
      />
    </>
  );
}