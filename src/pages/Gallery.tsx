import { useEffect } from 'react';

import {
  ExternalLink,
  Instagram,
} from 'lucide-react';

import {
  SEO,
  breadcrumbSchema,
} from '@/components/SEO';

import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';


/* ==========================================================================
   KAWAD SWAD 2.0
   GALLERY PAGE

   FLOW:
   HERO
   → SOCIAL PROOF
   → INSTAGRAM GRID
   → DISCOVERY NOTE
   → FOLLOW CTA

   DESIGN RULES:
   - Compact hero
   - Reduced unnecessary vertical spacing
   - Instagram remains the source of truth
   - No artificial image cropping
   - Consistent card rhythm
   - Mobile-first layout
   - Strong green / saffron / ivory hierarchy
   ========================================================================== */


const INSTAGRAM_EMBED_SCRIPT =
  'https://www.instagram.com/embed.js';


/* ==========================================================================
   INSTAGRAM POSTS
   ========================================================================== */

const instagramPosts = [
  'https://www.instagram.com/p/DY6L2CWIGUA/',
  'https://www.instagram.com/p/DY1qUpyIJA6/',
  'https://www.instagram.com/p/DYzIxAZIeBF/',
  'https://www.instagram.com/p/DYR2S3IIlJR/',
  'https://www.instagram.com/p/DYMz7OdImRo/',
  'https://www.instagram.com/p/DYCqkF5IAB2/',
  'https://www.instagram.com/p/DX9klsyoX2a/',
  'https://www.instagram.com/p/DX7IW-1zbOF/',
  'https://www.instagram.com/p/DXrYF7GCAxQ/',
  'https://www.instagram.com/p/DXkFaZ_k94a/',
  'https://www.instagram.com/p/DXbeh_5k8UA/',
  'https://www.instagram.com/p/DXTcMeViGj7/',
  'https://www.instagram.com/p/DXRd8fGiJRV/',
  'https://www.instagram.com/p/DXPTEDukzB-/',
  'https://www.instagram.com/p/DXJskkgk7oO/',
  'https://www.instagram.com/p/DWrAtuSCBFe/',
  'https://www.instagram.com/p/DWorut8iDtM/',
  'https://www.instagram.com/p/DWHGbsTiNMV/',
  'https://www.instagram.com/p/DV2cIzYCMbI/',
  'https://www.instagram.com/p/DU5Y7ziCEWY/',
  'https://www.instagram.com/p/DUuVdj5CLpl/',
  'https://www.instagram.com/p/DTnag6ciDYj/',
];


declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}


/* ==========================================================================
   INSTAGRAM EMBED ENGINE
   ========================================================================== */

function processInstagramEmbeds() {
  window.instgrm?.Embeds?.process();
}


function loadInstagramEmbeds() {
  const existingScript =
    document.querySelector<HTMLScriptElement>(
      `script[src="${INSTAGRAM_EMBED_SCRIPT}"]`,
    );

  if (existingScript) {
    processInstagramEmbeds();
    return;
  }

  const script =
    document.createElement('script');

  script.src =
    INSTAGRAM_EMBED_SCRIPT;

  script.async = true;

  script.onload =
    processInstagramEmbeds;

  document.body.appendChild(script);
}


/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Gallery() {

  /* ------------------------------------------------------------------------
     LOAD INSTAGRAM
     ------------------------------------------------------------------------ */

  useEffect(() => {

    loadInstagramEmbeds();

    /*
     * Instagram can sometimes process before every
     * embed has finished mounting inside the SPA.
     *
     * Two lightweight retry passes improve reliability
     * without repeatedly loading the external script.
     */

    const retryIds = [
      window.setTimeout(
        processInstagramEmbeds,
        500,
      ),

      window.setTimeout(
        processInstagramEmbeds,
        1400,
      ),
    ];

    return () => {
      retryIds.forEach((id) => {
        window.clearTimeout(id);
      });
    };

  }, []);


  return (
    <>
      {/* ======================================================================
          SEO
          =================================================================== */}

      <SEO
        title="Gallery"
        description="Explore the Kawad Swad visual story through real Instagram posts, Reels, products, craftsmanship and the journey of our brand."
        path="/gallery"
        structuredData={breadcrumbSchema([
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'Gallery',
            path: '/gallery',
          },
        ])}
      />


      {/* ======================================================================
          HERO
          =================================================================== */}

      <PageHero
        eyebrow="Visual Story"
        title="The Kawad Swad Gallery"
        description="Real moments from the Kawad Swad journey, shared through our Instagram posts and Reels."
        className="
          [&>div]:min-h-[13rem]
          [&>div]:py-6
          sm:[&>div]:min-h-[15rem]
          sm:[&>div]:py-8
          lg:[&>div]:min-h-[17rem]
          lg:[&>div]:py-9
        "
      />


      {/* ======================================================================
          GALLERY SECTION
          =================================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-brand-ivory
          py-8
          sm:py-10
          lg:py-12
        "
        aria-labelledby="gallery-intro-title"
      >

        {/* --------------------------------------------------------------------
            BACKGROUND DECORATION
            ------------------------------------------------------------------ */}

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

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            top-16
            h-52
            w-52
            rounded-full
            border
            border-brand-saffron/10
            sm:-right-28
            sm:h-64
            sm:w-64
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

          {/* ==================================================================
              INTRO
              ================================================================= */}

          <Reveal>

            <div
              className="
                mx-auto
                mb-6
                max-w-3xl
                text-center
                sm:mb-8
              "
            >

              {/* Instagram icon */}

              <div
                className="
                  mx-auto
                  mb-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-brand-saffron/15
                  bg-white
                  text-brand-saffron
                  shadow-soft
                  sm:h-11
                  sm:w-11
                "
                aria-hidden="true"
              >
                <Instagram className="h-5 w-5" />
              </div>


              <span
                className="
                  section-eyebrow
                  mb-2
                  block
                "
              >
                Real Social Proof
              </span>


              <h2
                id="gallery-intro-title"
                className="
                  text-balance
                  font-serif
                  text-2xl
                  font-bold
                  leading-tight
                  text-brand-green
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                From our real Instagram journey
              </h2>


              <p
                className="
                  text-pretty
                  mx-auto
                  mt-2.5
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                Products, people, moments and stories
                directly from Kawad Swad&apos;s Instagram.
                No stock gallery. Just the real journey.
              </p>


              <div
                className="
                  mx-auto
                  mt-3
                  h-px
                  w-12
                  bg-brand-saffron/40
                "
                aria-hidden="true"
              />

            </div>

          </Reveal>


          {/* ==================================================================
              INSTAGRAM GRID
              ================================================================= */}

          <div
            className="
              grid
              items-start
              gap-3
              sm:grid-cols-2
              sm:gap-4
              lg:grid-cols-3
              lg:gap-4
              xl:grid-cols-4
              xl:gap-5
            "
          >

            {instagramPosts.map(
              (url, index) => (

                <Reveal
                  key={url}
                  delay={Math.min(
                    index * 30,
                    240,
                  )}
                  className="h-full"
                >

                  <article
                    className="
                      group
                      flex
                      h-full
                      flex-col
                      overflow-hidden
                      rounded-3xl
                      border
                      border-brand-green/10
                      bg-white
                      p-2
                      shadow-card
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-brand-saffron/20
                      hover:shadow-lift
                      sm:p-2.5
                    "
                  >

                    {/* ========================================================
                        INSTAGRAM EMBED
                        ===================================================== */}

                    <div
                      className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        bg-brand-ivory
                      "
                    >

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-x-0
                          top-0
                          z-10
                          h-1
                          bg-brand-saffron/30
                        "
                        aria-hidden="true"
                      />


                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={url}
                        data-instgrm-version="14"
                        style={{
                          background: '#FFFDF7',
                          border: 0,
                          borderRadius: '14px',
                          boxShadow: 'none',
                          margin: 0,
                          maxWidth: '100%',
                          minWidth: '100%',
                          padding: 0,
                          width: '100%',
                        }}
                      >

                        {/* ----------------------------------------------------
                            LOADING STATE
                            ------------------------------------------------ */}

                        <div
                          className="
                            flex
                            min-h-[250px]
                            items-center
                            justify-center
                            p-4
                            text-center
                            sm:min-h-[270px]
                          "
                        >

                          <div>

                            <Instagram
                              className="
                                mx-auto
                                mb-2
                                h-6
                                w-6
                                text-brand-saffron
                              "
                              aria-hidden="true"
                            />

                            <p
                              className="
                                text-xs
                                font-medium
                                text-brand-brown/50
                              "
                            >
                              Loading Instagram post…
                            </p>

                          </div>

                        </div>

                      </blockquote>

                    </div>


                    {/* ========================================================
                        CARD FOOTER
                        ===================================================== */}

                    <div
                      className="
                        mt-auto
                        flex
                        min-h-[38px]
                        items-center
                        justify-between
                        gap-2
                        border-t
                        border-brand-green/10
                        px-1.5
                        pt-2
                      "
                    >

                      <span
                        className="
                          inline-flex
                          min-w-0
                          items-center
                          gap-1.5
                          truncate
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.13em]
                          text-brand-brown/45
                        "
                      >

                        <Instagram
                          className="
                            h-3
                            w-3
                            shrink-0
                          "
                          aria-hidden="true"
                        />

                        Kawad Swad

                      </span>


                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open Instagram post ${index + 1}`}
                        className="
                          inline-flex
                          min-h-[32px]
                          shrink-0
                          items-center
                          gap-1
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          text-brand-green
                          transition-all
                          duration-200
                          hover:bg-brand-green/5
                          hover:text-brand-saffron
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-brand-saffron
                          focus-visible:ring-offset-2
                        "
                      >

                        Open

                        <ExternalLink
                          className="h-3 w-3"
                          aria-hidden="true"
                        />

                      </a>

                    </div>

                  </article>

                </Reveal>

              ),
            )}

          </div>


          {/* ==================================================================
              DISCOVERY NOTE
              ================================================================= */}

          <Reveal>

            <div
              className="
                mx-auto
                mt-6
                max-w-3xl
                rounded-2xl
                border
                border-brand-green/10
                bg-white/70
                px-4
                py-3
                text-center
                shadow-soft
                sm:mt-8
                sm:px-6
                sm:py-3.5
              "
            >

              <p
                className="
                  text-xs
                  leading-relaxed
                  text-brand-brown/60
                  sm:text-sm
                "
              >
                New moments are added through our Instagram
                journey. Visit the original posts to explore
                the complete story.
              </p>

            </div>

          </Reveal>


          {/* ==================================================================
              FOLLOW CTA
              ================================================================= */}

          <Reveal>

            <div
              className="
                relative
                mx-auto
                mt-6
                max-w-2xl
                overflow-hidden
                rounded-3xl
                bg-brand-brown
                p-5
                text-center
                shadow-lift
                sm:mt-8
                sm:p-7
              "
            >

              {/* Background texture */}

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


              {/* Decorative ring */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  border
                  border-brand-saffron/15
                  sm:h-52
                  sm:w-52
                "
                aria-hidden="true"
              />


              <div className="relative">

                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-saffron
                    text-white
                    shadow-glow
                    sm:h-11
                    sm:w-11
                  "
                  aria-hidden="true"
                >
                  <Instagram className="h-5 w-5" />
                </div>


                <span
                  className="
                    section-eyebrow
                    mb-1.5
                    block
                    text-brand-saffron
                  "
                >
                  Stay Connected
                </span>


                <h2
                  className="
                    text-balance
                    font-serif
                    text-2xl
                    font-bold
                    leading-tight
                    text-white
                    sm:text-3xl
                  "
                >
                  Follow the journey
                </h2>


                <p
                  className="
                    text-pretty
                    mx-auto
                    mt-2
                    max-w-lg
                    text-sm
                    leading-relaxed
                    text-brand-cream/75
                    sm:text-base
                  "
                >
                  Follow Kawad Swad on Instagram for new
                  products, Reels, behind-the-scenes moments
                  and updates.
                </p>


                <a
                  href="https://www.instagram.com/kawadswad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    btn-yellow
                    mt-4
                    min-h-[44px]
                    px-6
                  "
                >

                  <Instagram
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Follow @kawadswad

                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                </a>

              </div>

            </div>

          </Reveal>

        </div>

      </section>
    </>
  );
}
