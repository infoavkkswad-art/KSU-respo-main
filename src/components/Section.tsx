import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? 'text-center mx-auto max-w-2xl' : ''} ${className}`}>
      {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-brown text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-brand-brown/70 text-pretty leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-brand-cream-dark to-brand-cream pt-12 pb-10 lg:pt-16 lg:pb-12">
      <div className="container-max container-px">
        <div className="max-w-3xl">
          {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-brown text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg text-brand-brown/70 text-pretty leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function PlaceholderImage({
  label,
  aspect = 'aspect-video',
  className = '',
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-2xl bg-gradient-to-br from-brand-cream-dark via-brand-cream to-brand-brown/5 ${className}`}
      role="img"
      aria-label={`${label} placeholder image`}
    >
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="text-sm font-medium text-brand-brown/40 text-center">{label}</span>
      </div>
      <div className="absolute bottom-2 right-3">
        <span className="text-2xs font-medium uppercase tracking-wider text-brand-brown/25">
          Placeholder
        </span>
      </div>
    </div>
  );
}
