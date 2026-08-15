import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  className = '',
}: SectionHeadingProps) {
  return (
    <div
      className={`
        w-full
        ${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
        ${className}
      `}
    >
      {eyebrow && (
        <p className="section-eyebrow mb-2.5 text-xs sm:mb-3 sm:text-sm">
          {eyebrow}
        </p>
      )}

      <h2
        className="
          text-balance
          font-serif font-bold leading-tight
          text-brand-green
          text-3xl sm:text-4xl lg:text-5xl
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            text-pretty mx-auto mt-3 max-w-2xl
            text-sm leading-relaxed text-brand-brown/65
            sm:mt-4 sm:text-base lg:text-lg
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section
      className="
        relative overflow-hidden
        bg-brand-ivory
        py-10 sm:py-12 lg:py-16
      "
    >
      <div
        className="
          pointer-events-none absolute
          -right-24 -top-24
          h-56 w-56 rounded-full
          border border-brand-saffron/15
          sm:h-72 sm:w-72
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute inset-0
          bg-grid opacity-25
        "
        aria-hidden="true"
      />

      <div className="container-max container-px relative">
        <div className="max-w-4xl">
          {eyebrow && (
            <p className="section-eyebrow mb-2.5 text-xs sm:mb-3 sm:text-sm">
              {eyebrow}
            </p>
          )}

          <h1
            className="
              text-balance max-w-4xl
              font-serif font-bold leading-[1.05]
              text-brand-green
              text-4xl sm:text-5xl lg:text-6xl
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                text-pretty mt-3 max-w-2xl
                text-sm leading-relaxed text-brand-brown/65
                sm:mt-4 sm:text-base lg:text-lg
              "
            >
              {description}
            </p>
          )}

          {children && (
            <div className="mt-5 sm:mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface PlaceholderImageProps {
  label: string;
  aspect?: string;
  className?: string;
}

export function PlaceholderImage({
  label,
  aspect = 'aspect-video',
  className = '',
}: PlaceholderImageProps) {
  return (
    <div
      className={`
        relative ${aspect} w-full overflow-hidden rounded-2xl
        bg-gradient-to-br
        from-brand-ivory-dark
        via-brand-ivory
        to-brand-saffron/10
        ${className}
      `}
      role="img"
      aria-label={`${label} placeholder image`}
    >
      <div
        className="
          pointer-events-none absolute inset-0
          bg-dots opacity-30
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute inset-0 flex items-center
          justify-center p-5 sm:p-8
        "
      >
        <span
          className="
            max-w-[85%] text-center
            text-xs font-medium leading-relaxed
            text-brand-brown/40 sm:text-sm
          "
        >
          {label}
        </span>
      </div>

      <div className="absolute bottom-2 right-3 sm:bottom-3 sm:right-4">
        <span
          className="
            text-[9px] font-medium uppercase
            tracking-[0.12em] text-brand-brown/25
            sm:text-2xs sm:tracking-wider
          "
        >
          Placeholder
        </span>
      </div>
    </div>
  );
}
