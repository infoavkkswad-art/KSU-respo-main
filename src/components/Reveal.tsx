import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { ArrowRight } from 'lucide-react';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL MOTION + CTA SYSTEM

   Behavioral sequence:
   NOTICE → REVEAL → UNDERSTAND → ACT

   Rules:
   - Motion supports hierarchy.
   - Reduced-motion users see content immediately.
   - Reveal runs once by default.
   - CTA presentation stays centralized.
   - Reveal itself does not introduce intentional layout spacing.
   - CTA spacing is compact and responsive.
   ========================================================================== */


/* ==========================================================================
   REVEAL
   ========================================================================== */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}


export function Reveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.08,
  once = true,
}: RevealProps) {
  const ref =
    useRef<HTMLDivElement>(null);

  const timeoutRef =
    useRef<number | null>(null);


  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }


    /* ------------------------------------------------------------------------
       REDUCED MOTION
       ------------------------------------------------------------------------ */

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefersReducedMotion) {
      element.classList.add(
        'is-visible',
      );

      return;
    }


    /* ------------------------------------------------------------------------
       SAFE VALUES
       ------------------------------------------------------------------------ */

    const safeDelay = Math.max(
      0,
      Math.min(delay, 1500),
    );

    const safeThreshold = Math.min(
      1,
      Math.max(0, threshold),
    );


    /* ------------------------------------------------------------------------
       INTERSECTION OBSERVER
       ------------------------------------------------------------------------ */

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }


              if (
                timeoutRef.current !==
                null
              ) {
                window.clearTimeout(
                  timeoutRef.current,
                );
              }


              timeoutRef.current =
                window.setTimeout(
                  () => {
                    element.classList.add(
                      'is-visible',
                    );

                    timeoutRef.current =
                      null;
                  },
                  safeDelay,
                );


              if (once) {
                observer.unobserve(
                  element,
                );
              }
            },
          );
        },
        {
          threshold:
            safeThreshold,

          rootMargin:
            '0px 0px -32px 0px',
        },
      );


    observer.observe(element);


    /* ------------------------------------------------------------------------
       CLEANUP
       ------------------------------------------------------------------------ */

    return () => {
      if (
        timeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current = null;
      }

      observer.disconnect();
    };
  }, [
    delay,
    threshold,
    once,
  ]);


  return (
    <div
      ref={ref}
      className={`
        reveal
        w-full
        ${className}
      `}
    >
      {children}
    </div>
  );
}


/* ==========================================================================
   CTA BANNER
   ========================================================================== */

interface CTABannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel?: string;
  secondaryLink?: string;
  eyebrow?: string;
  className?: string;
}


export function CTABanner({
  title,
  description,
  primaryLabel,
  primaryLink,
  secondaryLabel,
  secondaryLink,
  eyebrow = 'Kawad Swad',
  className = '',
}: CTABannerProps) {
  return (
    <section
      className={`
        container-max
        container-px
        py-7
        sm:py-9
        lg:py-11
        ${className}
      `}
    >

      <Reveal>

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            bg-brand-brown
            px-5
            py-8
            text-center
            text-brand-cream
            shadow-lift
            sm:px-8
            sm:py-9
            lg:px-14
            lg:py-11
          "
        >

          {/* ================================================================
              BACKGROUND TEXTURE
              ============================================================= */}

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


          {/* ================================================================
              SAFFRON GLOW
              ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-brand-saffron/10
              blur-3xl
              transition-transform
              duration-700
              group-hover:translate-x-3
              group-hover:-translate-y-3
              sm:h-60
              sm:w-60
            "
            aria-hidden="true"
          />


          {/* ================================================================
              DECORATIVE ARC
              ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-20
              h-44
              w-44
              rounded-full
              border
              border-brand-saffron/10
              sm:h-56
              sm:w-56
            "
            aria-hidden="true"
          />


          {/* ================================================================
              CONTENT
              ============================================================= */}

          <div
            className="
              relative
              z-10
              mx-auto
              max-w-3xl
            "
          >

            {/* ==============================================================
                EYEBROW
                ============================================================== */}

            {eyebrow && (
              <p
                className="
                  section-eyebrow
                  mb-2
                  text-brand-saffron-light
                "
              >
                {eyebrow}
              </p>
            )}


            {/* ==============================================================
                TITLE
                ============================================================== */}

            <h2
              className="
                text-balance
                font-serif
                text-2xl
                font-bold
                leading-tight
                text-white
                sm:text-3xl
                lg:text-4xl
              "
            >
              {title}
            </h2>


            {/* ==============================================================
                DESCRIPTION
                ============================================================== */}

            <p
              className="
                text-pretty
                mx-auto
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-brand-cream/70
                sm:text-base
                lg:text-lg
              "
            >
              {description}
            </p>


            {/* ==============================================================
                CTA ACTIONS
                ============================================================== */}

            <div
              className="
                mt-5
                flex
                w-full
                flex-col
                gap-2.5
                sm:mt-6
                sm:flex-row
                sm:justify-center
              "
            >

              {/* Primary CTA */}

              <a
                href={primaryLink}
                className="
                  btn-primary
                  group/primary
                  min-h-[46px]
                  w-full
                  px-6
                  shadow-lift
                  sm:w-auto
                "
              >
                <span>
                  {primaryLabel}
                </span>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover/primary:translate-x-1
                  "
                  aria-hidden="true"
                />
              </a>


              {/* Secondary CTA */}

              {secondaryLabel &&
                secondaryLink && (
                  <a
                    href={secondaryLink}
                    className="
                      btn-outline
                      min-h-[46px]
                      w-full
                      border-brand-cream/25
                      px-6
                      text-brand-cream
                      hover:border-brand-cream/50
                      hover:bg-brand-cream
                      hover:text-brand-brown
                      sm:w-auto
                    "
                  >
                    {secondaryLabel}
                  </a>
                )}

            </div>

          </div>

        </div>

      </Reveal>

    </section>
  );
}
