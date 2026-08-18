import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Package,
  Phone,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import {
  FormContainer,
  FormField,
  FormStatusMessage,
  SubmitButton,
  useFormState,
  validators,
} from '@/components/Form';
import { ProductService } from '@/services/product-service';
import { CATEGORY_LABELS } from '@/data/products';
import { brand } from '@/data/brand';
import { apiClient } from '@/services/api-client';


/* ==========================================================================
   KAWAD SWAD 2.0
   BULK ORDERS

   Conversion flow:
   HERO → REQUIREMENT FORM → DIRECT SUPPORT → PRODUCT RANGE

   Central design system:
   - Green   = trust / authority
   - Saffron = action / commercial energy
   - Ivory   = editorial canvas
   - Brown   = heritage / premium contrast

   FUNCTIONALITY PRESERVED:
   - Existing bulk enquiry API
   - Existing validation
   - Existing enquiry ID
   - Existing ProductService
   - Existing category system
   ========================================================================== */


const productOptions =
  ProductService.getAllProducts().map(
    (p) => `${p.name} (${p.variant})`,
  );


/* ==========================================================================
   PAGE
   ========================================================================== */

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
      products: validators.required(),
      quantity: validators.required(),
    });

    if (!valid) {
      return;
    }

    form.setStatus('submitting');

    try {
      const idempotencyKey =
        'bulk-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .substring(2, 9);

      const res =
        await apiClient.createEnquiry({
          type: 'bulk',
          businessName:
            form.values.businessName,
          contactPerson:
            form.values.contactPerson,
          phone: form.values.phone,
          email: form.values.email,
          location: form.values.location,
          productsOfInterest:
            form.values.products,
          quantity: form.values.quantity,
          message:
            form.values.message ||
            'Bulk supply request',
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
        title="Bulk Orders"
        description="Request bulk papad supply for businesses, events and institutions from Kawad Swad in Nimar."
        path="/bulk-orders"
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
            name: 'Bulk Orders',
            path: '/bulk-orders',
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
          py-14
          sm:py-18
          lg:py-24
        "
        aria-labelledby="bulk-orders-title"
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-grid
            opacity-[0.08]
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
            border-brand-saffron/20
            sm:h-80
            sm:w-80
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-100px]
            left-[-80px]
            h-64
            w-64
            rounded-full
            border
            border-white/5
          "
          aria-hidden="true"
        />

        <div className="container-max container-px relative">

          <Reveal>
            <div className="max-w-4xl">

              <span
                className="
                  section-eyebrow
                  mb-4
                  block
                  text-brand-saffron
                "
              >
                B2B Supply
              </span>

              <h1
                id="bulk-orders-title"
                className="
                  text-balance
                  font-serif
                  text-display-sm
                  font-bold
                  leading-[1.02]
                  text-white
                "
              >
                Bulk supply,
                <br />
                <span className="text-brand-saffron">
                  made straightforward.
                </span>
              </h1>

              <p
                className="
                  text-pretty
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-white/75
                  sm:text-base
                  lg:text-lg
                "
              >
                Large-quantity Kawad Swad papad supply
                for businesses, events and institutions.
                Tell us what you need and our commercial
                team will prepare the right supply plan.
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
                  Bulk Supply
                </span>

                <span className="badge bg-white/10 text-white">
                  Business Orders
                </span>

                <span className="badge bg-white/10 text-white">
                  Institutional Supply
                </span>
              </div>

            </div>
          </Reveal>

        </div>
      </section>


      {/* ======================================================================
          MAIN CONTENT
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
        aria-labelledby="bulk-form-title"
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
              items-start
              gap-8
              lg:grid-cols-[minmax(0,1fr)_360px]
              lg:gap-10
            "
          >

            {/* ==================================================================
                FORM
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
                  lg:p-10
                "
              >

                {/* Form heading */}

                <div
                  className="
                    mb-7
                    border-b
                    border-brand-green/10
                    pb-6
                    sm:mb-8
                    sm:pb-7
                  "
                >
                  <div
                    className="
                      mb-4
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
                    <Package className="h-6 w-6" />
                  </div>

                  <span className="section-eyebrow mb-2 block">
                    Supply Request
                  </span>

                  <h2
                    id="bulk-form-title"
                    className="
                      text-balance
                      font-serif
                      text-headline-sm
                      font-bold
                      text-brand-green
                      sm:text-headline-md
                    "
                  >
                    Tell us what your business needs
                  </h2>

                  <p
                    className="
                      text-pretty
                      mt-3
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                      sm:text-base
                    "
                  >
                    Share your requirements below and
                    our commercial team will contact you
                    to discuss supply details.
                  </p>
                </div>


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
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
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
                          Your bulk enquiry has been
                          received.
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
                          requirement and get in touch
                          with you.
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
                      placeholder="Your business name"
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
                        value={form.values.phone}
                        onChange={(value) =>
                          form.setValue(
                            'phone',
                            value,
                          )
                        }
                        error={form.errors.phone}
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
                        value={form.values.email}
                        onChange={(value) =>
                          form.setValue(
                            'email',
                            value,
                          )
                        }
                        error={form.errors.email}
                        required
                        placeholder="you@business.com"
                        autoComplete="email"
                      />

                      <FormField
                        label="Location"
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
                      label="Products Interested In"
                      name="products"
                      type="select"
                      value={
                        form.values.products
                      }
                      onChange={(value) =>
                        form.setValue(
                          'products',
                          value,
                        )
                      }
                      error={
                        form.errors.products
                      }
                      required
                      options={productOptions}
                    />


                    <FormField
                      label="Estimated Quantity"
                      name="quantity"
                      value={
                        form.values.quantity
                      }
                      onChange={(value) =>
                        form.setValue(
                          'quantity',
                          value,
                        )
                      }
                      error={
                        form.errors.quantity
                      }
                      required
                      placeholder="e.g. 50 packs, 100kg, etc."
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
                      placeholder="Tell us anything else about your requirement..."
                    />

                  </FormContainer>


                  <div
                    className="
                      mt-6
                      border-t
                      border-brand-green/10
                      pt-6
                      sm:mt-7
                      sm:pt-7
                    "
                  >
                    <SubmitButton
                      status={form.status}
                      label="Request Bulk Supply"
                      className="btn-primary"
                    />

                    <p
                      className="
                        mt-3
                        text-center
                        text-[11px]
                        leading-relaxed
                        text-brand-brown/40
                        sm:text-left
                      "
                    >
                      Your requirement will be sent
                      securely to the Kawad Swad commercial
                      team.
                    </p>
                  </div>
                </form>

              </div>
            </Reveal>


            {/* ==================================================================
                SIDEBAR
                =============================================================== */}

            <aside
              className="
                space-y-5
                lg:sticky
                lg:top-24
              "
              aria-label="Bulk order support"
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
                    Direct Support
                  </span>

                  <h2
                    className="
                      font-serif
                      text-xl
                      font-bold
                      text-brand-green
                    "
                  >
                    Prefer to talk?
                  </h2>

                  <p
                    className="
                      text-pretty
                      mt-2
                      text-sm
                      leading-relaxed
                      text-brand-brown/60
                    "
                  >
                    Reach out directly and our team
                    will help you with your bulk
                    requirement.
                  </p>


                  <div className="mt-5 space-y-3">

                    {/* WhatsApp */}

                    <a
                      href={brand.whatsappUrl}
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

                  </div>
                </div>
              </Reveal>


              {/* ================================================================
                  PRODUCT RANGE
                  ============================================================= */}

              <Reveal delay={150}>
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-brand-brown
                    p-6
                    text-brand-cream
                    shadow-lift
                    sm:p-7
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
                      Product Range
                    </span>

                    <h2
                      className="
                        font-serif
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      What can we supply?
                    </h2>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-brand-cream/70
                      "
                    >
                      Explore our range across the major
                      papad categories.
                    </p>

                    <div className="mt-5 space-y-2">

                      {(
                        [
                          'moong',
                          'chana',
                          'urad',
                          'combo',
                        ] as const
                      ).map((cat) => (
                        <div
                          key={cat}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            bg-white/5
                            px-3
                            py-2.5
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

                          <span>
                            {CATEGORY_LABELS[cat]} Papad
                          </span>
                        </div>
                      ))}

                    </div>

                  </div>
                </div>
              </Reveal>


              {/* ================================================================
                  TRUST NOTE
                  ============================================================= */}

              <Reveal delay={200}>
                <div
                  className="
                    rounded-2xl
                    border
                    border-brand-green/10
                    bg-brand-ivory-dark
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-brand-green/10
                        text-brand-green
                      "
                      aria-hidden="true"
                    >
                      <Package className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-brand-green
                        "
                      >
                        Tell us your requirement
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-relaxed
                          text-brand-brown/55
                        "
                      >
                        Quantity, products and location
                        help us understand the right supply
                        arrangement for your business.
                      </p>
                    </div>

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
