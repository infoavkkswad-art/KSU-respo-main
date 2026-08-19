import type { ReactNode } from 'react';

/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL SECTION / CONTENT SYSTEM

   Purpose:
   - One consistent section language across the entire website
   - Central control of heading hierarchy
   - Central control of page heroes
   - Consistent responsive spacing
   - Behavioral hierarchy: eyebrow → title → description → action
   - Removes page-by-page visual improvisation

   Important:
   Existing exports are preserved:
   - SectionHeading
   - PageHero
   - PlaceholderImage

   New reusable exports:
   - Section
   - SectionHeader

   Hero image behavior:
   - Full image remains visible
   - 3:2 artwork is not cropped
   - Image is centered responsively
   - Brand-green background fills remaining space
   ========================================================================== */


/* ==========================================================================
   TYPES
   ========================================================================== */

type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

type SectionSurface =
  | 'default'
  | 'white'
  | 'soft'
  | 'green'
  | 'brown'
  | 'transparent';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  spacing?: SectionSpacing;
  surface?: SectionSurface;
  container?: boolean;
  containerClassName?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  ariaLabel?: string;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  visual?: ReactNode;
  align?: 'left' | 'center';
  surface?: 'default' | 'green' | 'image';
  imageSrc?: string;
  imageAlt?: string;
  showDecoration?: boolean;
}

interface PlaceholderImageProps {
  label: string;
  aspect?: string;
  className?: string;
  /** Kept for compatibility. */
  decorative?: boolean;
}


/* ==========================================================================
   CENTRAL SECTION
   ========================================================================== */

const spacingClasses: Record<SectionSpacing, string> = {
  none: '',
  sm: 'section-sm',
  md: 'section-md',
  lg: 'section-lg',
  xl: 'section-xl',
};

const surfaceClasses: Record<SectionSurface, string> = {
  default: 'bg-brand-ivory',
  white: 'bg-white',
  soft: 'bg-brand-ivory-dark',
  green: 'bg-brand-green text-white',
  brown: 'bg-brand-brown text-white',
  transparent: 'bg-transparent',
};

export function Section({
  children,
  className = '',
  id,
  spacing = 'lg',
  surface = 'default',
  container = true,
  containerClassName = '',
  as: Component = 'section',
  ariaLabel,
}: SectionProps) {
  return (
    <Component
      id={id}
      aria-label={ariaLabel}
      className={`
        section
        ${spacingClasses[spacing]}
        ${surfaceClasses[surface]}
        ${className}
      `}
    >
      {container ? (
        <div className={`container-max container-px ${containerClassName}`}>
          {children}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}


/* ==========================================================================
   CENTRAL SECTION HEADER
   ========================================================================== */

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = true,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={`
        section-header
        ${center ? 'text-center' : 'section-header-left'}
        ${className}
      `}
    >
      {eyebrow && (
        <p className="section-eyebrow mb-2.5 sm:mb-3">
          {eyebrow}
        </p>
      )}

      <h2
        className={`
          type-h2
          text-balance
          text-brand-green
          ${titleClassName}
        `}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`
            type-body-lg
            text-pretty
            mt-4
            max-w-2xl
            text-brand-brown/65
            ${center ? 'mx-auto' : ''}
            ${descriptionClassName}
          `}
        >
          {description}
        </p>
      )}

      {children && (
        <div className="mt-6 sm:mt-7">
          {children}
        </div>
      )}
    </div>
  );
}


/* ==========================================================================
   BACKWARD-COMPATIBLE SECTION HEADING
   ========================================================================== */

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  children,
}: SectionHeadingProps) {
  return (
    <SectionHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      center={center}
      className={className}
      titleClassName={titleClassName}
      descriptionClassName={descriptionClassName}
    >
      {children}
    </SectionHeader>
  );
}


/* ==========================================================================
   CENTRAL PAGE HERO

   Image strategy:
   - Hero artwork is NOT cropped.
   - The image uses object-contain.
   - The image occupies the complete available hero area.
   - Brand-green fills any remaining space.
   - This is especially important for the supplied 3:2 hero artwork.
   ========================================================================== */

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className = '',
  contentClassName = '',
  visual,
  align = 'left',
  surface = 'default',
  imageSrc,
  imageAlt = '',
  showDecoration = true,
}: PageHeroProps) {
  const hasImage = surface === 'image' && Boolean(imageSrc);

  return (
    <section
      className={`
        page-hero
        relative
        overflow-hidden
        ${surface === 'green' ? 'bg-brand-green text-white' : ''}
        ${surface === 'image' ? 'bg-brand-green' : ''}
        ${surface === 'default' ? 'bg-brand-ivory' : ''}
        ${className}
      `}
    >
      {hasImage && (
        <>
          {/* ================================================================
             FULL HERO IMAGE

             object-contain is intentional.

             Do NOT use object-cover here because the supplied hero artwork
             contains important mascot/logo/composition details that must
             remain completely visible.
             ================================================================ */}
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
              src={imageSrc}
              alt={imageAlt}
              className="
                h-full
                w-full
                object-contain
                object-center
              "
              loading="eager"
              decoding="async"
            />
          </div>

          {/* ================================================================
             IMAGE OVERLAY

             Kept as a separate layer so the existing overlay styling can
             continue to control readability without affecting image ratio.
             ================================================================ */}
          <div
            className="
              page-hero-overlay
              absolute
              inset-0
              z-10
            "
            aria-hidden="true"
          />
        </>
      )}

      {showDecoration && !hasImage && (
        <>
          <div
            className="
              pointer-events-none absolute
              -right-24 -top-24
              h-56 w-56 rounded-full
              border border-brand-saffron/15
              sm:h-72 sm:w-72
              lg:h-96 lg:w-96
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

          <div
            className="
              pointer-events-none absolute
              -bottom-32 -left-24
              h-72 w-72 rounded-full
              border border-brand-green/10
              sm:h-96 sm:w-96
            "
            aria-hidden="true"
          />
        </>
      )}

      {visual && (
        <div
          className="
            pointer-events-none absolute
            inset-y-0 right-0
            hidden w-1/2
            lg:block
          "
          aria-hidden="true"
        >
          {visual}
        </div>
      )}

      <div
        className={`
          container-max container-px
          relative z-content
          flex min-h-[18rem] items-center
          py-12 sm:min-h-[20rem] sm:py-16
          lg:min-h-[24rem] lg:py-20
          ${align === 'center' ? 'justify-center text-center' : ''}
        `}
      >
        <div
          className={`
            max-w-4xl
            ${align === 'center' ? 'mx-auto' : ''}
            ${contentClassName}
          `}
        >
          {eyebrow && (
            <p
              className={`
                section-eyebrow
                mb-3
                ${hasImage ? 'text-brand-saffron-light' : ''}
              `}
            >
              {eyebrow}
            </p>
          )}

          <h1
            className={`
              type-h1
              text-balance
              ${hasImage || surface === 'green'
                ? 'text-white'
                : 'text-brand-green'
              }
            `}
          >
            {title}
          </h1>

          {description && (
            <p
              className={`
                type-body-lg
                text-pretty
                mt-4
                max-w-2xl
                ${align === 'center' ? 'mx-auto' : ''}
                ${hasImage || surface === 'green'
                  ? 'text-white/80'
                  : 'text-brand-brown/65'
                }
              `}
            >
              {description}
            </p>
          )}

          {children && (
            <div className="mt-6 sm:mt-7">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/* ==========================================================================
   CENTRAL IMAGE PLACEHOLDER / FALLBACK

   This remains available because existing pages may still import it.

   It is intentionally visually neutral and should be treated as a temporary
   development fallback. Once real assets exist, pages should use the central
   image system instead.
   ========================================================================== */

export function PlaceholderImage({
  label,
  aspect = 'aspect-video',
  className = '',
  decorative = false,
}: PlaceholderImageProps) {
  return (
    <div
      className={`
        image-adaptive-surface
        relative
        ${aspect}
        w-full
        overflow-hidden
        rounded-3xl
        ${className}
      `}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      <div
        className="
          pointer-events-none absolute inset-0
          bg-dots opacity-25
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute inset-0
          flex items-center justify-center
          p-5 sm:p-8
        "
      >
        <span
          className="
            max-w-[85%]
            text-center
            text-xs font-medium
            leading-relaxed
            text-brand-brown/40
            sm:text-sm
          "
        >
          {label}
        </span>
      </div>

      <span className="sr-only">
        {label}
      </span>
    </div>
  );
}
