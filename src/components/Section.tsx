import type { ReactNode } from 'react';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL SECTION / CONTENT SYSTEM

   Responsibilities:
   - Consistent section spacing
   - Consistent section surfaces
   - Central heading hierarchy
   - Central page hero behavior
   - Complete hero artwork visibility
   - Shared placeholder system

   IMAGE RULE:
   Supplied Kawad Swad artwork must NOT be cropped.
   Hero artwork uses object-contain.
   ========================================================================== */


/* ==========================================================================
   TYPES
   ========================================================================== */

type SectionSpacing =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

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
   SECTION SYSTEM
   ========================================================================== */

const spacingClasses: Record<
  SectionSpacing,
  string
> = {
  none: '',
  sm: 'section-sm',
  md: 'section-md',
  lg: 'section-lg',
  xl: 'section-xl',
};


const surfaceClasses: Record<
  SectionSurface,
  string
> = {
  default: 'bg-brand-ivory',
  white: 'bg-white',
  soft: 'bg-brand-ivory-dark',
  green: 'bg-brand-green text-white',
  brown: 'bg-brand-brown text-white',
  transparent: 'bg-transparent',
};


/* ==========================================================================
   CENTRAL SECTION
   ========================================================================== */

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
        <div
          className={`
            container-max
            container-px
            ${containerClassName}
          `}
        >
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
        w-full
        ${center ? 'text-center' : 'text-left'}
        ${className}
      `}
    >

      {eyebrow && (
        <p
          className="
            section-eyebrow
            mb-2
            sm:mb-2.5
          "
        >
          {eyebrow}
        </p>
      )}


      <h2
        className={`
          type-h2
          text-balance
          ${titleClassName}
        `}
      >
        {title}
      </h2>


      {description && (
        <p
          className={`
            mt-3
            max-w-2xl
            text-sm
            leading-relaxed
            text-brand-brown/65
            sm:text-base
            sm:leading-7
            ${center ? 'mx-auto' : ''}
            ${descriptionClassName}
          `}
        >
          {description}
        </p>
      )}


      {children && (
        <div
          className="
            mt-5
            sm:mt-6
          "
        >
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

   IMAGE BEHAVIOR
   --------------------------------------------------------------------------

   Supplied hero artwork is generally 3:2.

   We intentionally use:
     object-fit: contain

   This means:
   - no cropping
   - no stretched artwork
   - no distorted mascot
   - no clipped logo
   - complete supplied artwork remains visible

   The remaining area is filled with brand green.

   CONTENT
   --------------------------------------------------------------------------

   Hero content sits above:
     artwork → overlay → content

   The hero is intentionally compact to remove excessive top/bottom space.
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

  const hasImage =
    surface === 'image' &&
    Boolean(imageSrc);


  return (
    <section
      className={`
        page-hero
        relative
        isolate
        overflow-hidden
        ${
          surface === 'green'
            ? 'bg-brand-green text-white'
            : ''
        }
        ${
          surface === 'image'
            ? 'bg-brand-green'
            : ''
        }
        ${
          surface === 'default'
            ? 'bg-brand-ivory'
            : ''
        }
        ${className}
      `}
    >

      {/* ====================================================================
          COMPLETE HERO ARTWORK
          ================================================================= */}

      {hasImage && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            overflow-hidden
            bg-brand-green
          "
          aria-hidden="true"
        >

          <img
            src={imageSrc}
            alt={imageAlt}
            loading="eager"
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
      )}


      {/* ====================================================================
          IMAGE READABILITY OVERLAY
          ================================================================= */}

      {hasImage && (
        <div
          className="
            page-hero-overlay
            pointer-events-none
            absolute
            inset-0
            z-10
          "
          aria-hidden="true"
        />
      )}


      {/* ====================================================================
          DECORATIVE SYSTEM
          ================================================================= */}

      {showDecoration && !hasImage && (
        <>

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
              sm:-right-24
              sm:-top-24
              sm:h-64
              sm:w-64
              lg:h-80
              lg:w-80
            "
            aria-hidden="true"
          />


          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-grid
              opacity-20
            "
            aria-hidden="true"
          />


          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-20
              h-56
              w-56
              rounded-full
              border
              border-brand-green/10
              sm:-bottom-32
              sm:-left-24
              sm:h-72
              sm:w-72
            "
            aria-hidden="true"
          />

        </>
      )}


      {/* ====================================================================
          OPTIONAL VISUAL
          ================================================================= */}

      {visual && (
        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-10
            hidden
            w-1/2
            lg:block
          "
          aria-hidden="true"
        >
          {visual}
        </div>
      )}


      {/* ====================================================================
          HERO CONTENT

          Compact responsive height:
          Mobile  : 15rem
          Tablet  : 17rem
          Desktop : 20rem

          This intentionally reduces excessive empty space while keeping
          enough room for title, description and actions.
          ================================================================= */}

      <div
        className={`
          container-max
          container-px
          relative
          z-20
          flex
          min-h-[15rem]
          items-center
          py-8
          sm:min-h-[17rem]
          sm:py-10
          lg:min-h-[20rem]
          lg:py-12
          ${
            align === 'center'
              ? 'justify-center text-center'
              : ''
          }
        `}
      >

        <div
          className={`
            max-w-4xl
            ${
              align === 'center'
                ? 'mx-auto'
                : ''
            }
            ${contentClassName}
          `}
        >

          {/* ================================================================
              EYEBROW
              ============================================================= */}

          {eyebrow && (
            <p
              className={`
                section-eyebrow
                mb-2.5
                ${
                  hasImage
                    ? 'text-brand-saffron-light'
                    : ''
                }
              `}
            >
              {eyebrow}
            </p>
          )}


          {/* ================================================================
              TITLE
              ============================================================= */}

          <h1
            className={`
              type-h1
              text-balance
              ${
                hasImage ||
                surface === 'green'
                  ? 'text-white'
                  : 'text-brand-green'
              }
            `}
          >
            {title}
          </h1>


          {/* ================================================================
              DESCRIPTION
              ============================================================= */}

          {description && (
            <p
              className={`
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                sm:text-base
                sm:leading-7
                ${
                  align === 'center'
                    ? 'mx-auto'
                    : ''
                }
                ${
                  hasImage ||
                  surface === 'green'
                    ? 'text-white/80'
                    : 'text-brand-brown/65'
                }
              `}
            >
              {description}
            </p>
          )}


          {/* ================================================================
              ACTIONS / CHILDREN
              ============================================================= */}

          {children && (
            <div
              className="
                mt-5
                sm:mt-6
              "
            >
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
      role={
        decorative
          ? undefined
          : 'img'
      }
      aria-label={
        decorative
          ? undefined
          : label
      }
      aria-hidden={
        decorative
          ? true
          : undefined
      }
    >

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-dots
          opacity-25
        "
        aria-hidden="true"
      />


      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-5
          sm:p-8
        "
      >
        <span
          className="
            max-w-[85%]
            text-center
            text-xs
            font-medium
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
