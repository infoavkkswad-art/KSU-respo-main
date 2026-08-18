import { useEffect } from 'react';
import {
  ExternalLink,
  Instagram,
} from 'lucide-react';

import { SEO, breadcrumbSchema } from '@/components/SEO';
import { PageHero } from '@/components/Section';
import { Reveal } from '@/components/Reveal';


/* ==========================================================================
   KAWAD SWAD 2.0
   GALLERY

   Design flow:
   HERO → SOCIAL PROOF → DISCOVERY → FOLLOW

   Instagram remains the source of truth.
   The surrounding experience follows the central design system.
   ========================================================================== */


const INSTAGRAM_EMBED_SCRIPT =
  'https://www.instagram.com/embed.js';


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
   INSTAGRAM EMBED SYSTEM
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
  useEffect(() => {
    loadInstagramEmbeds();

    /*
     * Instagram's embed processor can finish before React has
     * completely painted all cards. A second processing pass makes
     * navigation back to this page more reliable.
     */
    const retryId = window.setTimeout(
      processInstagramEmbeds,
      600,
    );

    return () => {
      window.clearTimeout(retryId);
    };
  }, []);


  return (
    <>
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
      />


      {/* ======================================================================
          GALLERY CONTENT
          =================================================================== */}

      <section
        className="
          bg-brand-ivory
          py-12
          sm:py-16
          lg:py-24
        "
        aria-labelledby="gallery-intro-title"
      >
        <div className="container-max container-px">


          {/* ==================================================================
              INTRO
              =================================================================== */}

          <Reveal>
            <div
              className="
                mx-auto
                mb-10
                max-w-2xl
                text-center
                sm:mb-14
              "
            >
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-brand-saffron/10
                  text-brand-saffron
                  shadow-soft
                "
                aria-hidden="true"
              >
                <Instagram className="h-6 w-6" />
              </div>

              <span className="section-eyebrow mb-2 block">
                Real Social Proof
              </span>

              <h2
                id="gallery-intro-title"
                className="
                  text-balance
                  font-serif
                  text-headline-sm
                  font-bold
                  text-brand-green
                  sm:text-headline-md
                "
              >
                From our real Instagram journey
              </h2>

              <p
                className="
                  text-pretty
                  mx-auto
                  mt-3
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-brand-brown/65
                  sm:text-base
                "
              >
                Products, people, moments and stories
                directly from Kawad Swad&apos;s Instagram.
              </p>
            </div>
          </Reveal>


          {/* ==================================================================
              INSTAGRAM GRID
              =================================================================== */}

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              lg:gap-6
            "
          >
            {instagramPosts.map(
              (url, index) => (
                <Reveal
                  key={url}
                  delay={Math.min(
                    index * 40,
                    300,
                  )}
                >
                  <article
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-brand-green/10
                      bg-white
                      p-3
                      shadow-card
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-lift
                    "
                  >
                    {/* ========================================================
                        INSTAGRAM EMBED
                        ===================================================== */}

                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        bg-brand-ivory
                      "
                    >
                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={url}
                        data-instgrm-version="14"
                        style={{
                          background: '#FFFDF7',
                          border: 0,
                          borderRadius: '16px',
                          boxShadow: 'none',
                          margin: 0,
                          maxWidth: '100%',
                          minWidth: '100%',
                          padding: 0,
                          width: '100%',
                        }}
                      >
                        <div
                          className="
                            flex
                            min-h-[280px]
                            items-center
                            justify-center
                            p-6
                            text-center
                          "
                        >
                          <div>
                            <Instagram
                              className="
                                mx-auto
                                mb-3
                                h-8
                                w-8
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
                        CARD ACTION
                        ===================================================== */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        px-2
                        pb-1
                        pt-3
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
                          tracking-wider
                          text-brand-brown/45
                        "
                      >
                        <Instagram
                          className="
                            h-3.5
                            w-3.5
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
                          min-h-[36px]
                          shrink-0
                          items-center
                          gap-1
                          rounded-full
                          px-3
                          py-1.5
                          text-[10px]
                          font-semibold
                          text-brand-saffron
                          transition-all
                          duration-200
                          hover:bg-brand-saffron/10
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
              FOLLOW CTA
              =================================================================== */}

          <Reveal>
            <div
              className="
                mx-auto
                mt-14
                max-w-2xl
                rounded-3xl
                border
                border-brand-green/10
                bg-brand-ivory-dark
                p-7
                text-center
                shadow-soft
                sm:mt-20
                sm:p-9
              "
            >
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-saffron/10
                  text-brand-saffron
                "
                aria-hidden="true"
              >
                <Instagram className="h-5 w-5" />
              </div>

              <span className="section-eyebrow mb-2 block">
                Stay Connected
              </span>

              <h2
                className="
                  text-balance
                  font-serif
                  text-headline-sm
                  font-bold
                  text-brand-green
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
                  text-brand-brown/65
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
                  btn-primary
                  mt-6
                  min-h-[46px]
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
          </Reveal>

        </div>
      </section>
    </>
  );
}
