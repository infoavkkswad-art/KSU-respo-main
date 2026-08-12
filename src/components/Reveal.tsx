import { useEffect, useRef, type ReactNode } from 'react';

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function CTABanner({
  title,
  description,
  primaryLabel,
  primaryLink,
  secondaryLabel,
  secondaryLink,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel?: string;
  secondaryLink?: string;
}) {
  return (
    <section className="container-max container-px py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-4xl bg-brand-brown text-brand-cream p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white text-balance">
              {title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-brand-cream/70 max-w-2xl mx-auto text-pretty">
              {description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={primaryLink} className="btn-primary">
                {primaryLabel}
              </a>
              {secondaryLabel && secondaryLink && (
                <a href={secondaryLink} className="btn-outline border-brand-cream/30 text-brand-cream hover:bg-brand-cream hover:text-brand-brown">
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
