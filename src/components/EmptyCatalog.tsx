import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

import { brand } from '@/data/brand';

interface EmptyCatalogProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyCatalog({
  title = 'Papads are on their way',
  description = 'Our Nimar kitchen catalogue is being prepared. Check back shortly, or write to us and we will help you choose.',
  actionLabel = 'Talk to us',
  actionTo = '/contact',
  onAction,
}: EmptyCatalogProps) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-brand-green/12
        bg-brand-ivory-dark
        px-6
        py-14
        text-center
        shadow-soft
        sm:px-10
        sm:py-16
      "
    >
      <div
        className="pointer-events-none absolute inset-0 bg-dots opacity-40"
        aria-hidden="true"
      />

      <div
        className="
          relative
          mx-auto
          mb-5
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-brand-green
          text-brand-mustard
        "
      >
        <Leaf className="h-7 w-7" aria-hidden="true" />
      </div>

      <p className="font-devanagari text-lg font-semibold text-brand-green">
        {brand.tagline}
      </p>

      <h2
        className="
          mt-3
          font-serif
          text-2xl
          font-bold
          text-brand-brown
          sm:text-3xl
        "
      >
        {title}
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-md
          text-sm
          leading-relaxed
          text-brand-brown-light
          sm:text-base
        "
      >
        {description}
      </p>

      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary mt-6 min-h-12 px-7"
        >
          {actionLabel}
        </button>
      ) : (
        <Link to={actionTo} className="btn-primary mt-6 min-h-12 px-7">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
