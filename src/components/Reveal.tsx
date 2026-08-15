import { useEffect, useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    // Respect users who prefer reduced motion.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      element.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const timeoutId = window.setTimeout(() => {
            element.classList.add('is-visible');
          }, Math.max(0, delay));

          observer.unobserve(element);

          // Store timeout on the element so cleanup can cancel it.
          (
            element as HTMLDivElement & {
              __revealTimeout?: number;
            }
          ).__revealTimeout = timeoutId;
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -32px 0px',
      },
    );

    observer.observe(element);

    return () => {
      const timeoutId = (
        element as HTMLDivElement & {
          __revealTimeout?: number;
        }
      ).__revealTimeout;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`reveal w-full ${className}`}
    >
      {children}
    </div>
  );
}

interface CTABannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel?: string;
  secondaryLink?: string;
}

export function CTABanner({
  title,
  description,
  primaryLabel,
  primaryLink,
  secondaryLabel,
  secondaryLink,
}: CTABannerProps) {
  return (
    <section
      className="
        container-max
        container-px
        py-10
        sm:py-14
        lg:py-20
      "
    >
      <Reveal>
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            bg-brand-brown
            px-5
            py-10
            text-center
            text-brand-cream
            sm:rounded-4xl
            sm:px-8
            sm:py-12
            lg:px-16
            lg:py-16
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

          {/* Decorative glow */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-56
              w-56
              rounded-full
              bg-brand-yellow/10
              blur-3xl
              sm:h-72
              sm:w-72
            "
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <h2
              className="
                text-balance
                font-serif
                text-3xl
                font-bold
                leading-tight
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              {title}
            </h2>

            <p
              className="
                text-pretty
                mx-auto
                mt-4
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

            <div
              className="
                mt-7
                flex
                w-full
                flex-col
                gap-3
                sm:mt-8
                sm:flex-row
                sm:justify-center
              "
            >
              <a
                href={primaryLink}
                className="
                  btn-primary
                  min-h-[48px]
                  w-full
                  px-7
                  sm:w-auto
                "
              >
                {primaryLabel}
              </a>

              {secondaryLabel && secondaryLink && (
                <a
                  href={secondaryLink}
                  className="
                    btn-outline
                    min-h-[48px]
                    w-full
                    border-brand-cream/30
                    text-brand-cream
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
