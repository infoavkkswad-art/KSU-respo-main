import { Link } from 'react-router-dom';
import { brand } from '@/data/brand';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

export function Logo({
  className = '',
  imgClassName = '',
}: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${brand.name} home`}
      className={`
        inline-flex
        min-w-0
        shrink-0
        items-center
        rounded-md
        transition-opacity
        hover:opacity-90
        focus-visible:ring-2
        focus-visible:ring-brand-red
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-cream
        ${className}
      `}
    >
      <img
        src="/logo.png"
        alt={brand.name}
        width={240}
        height={80}
        decoding="async"
        className={`
          h-9
          w-auto
          max-w-[180px]
          object-contain
          sm:h-10
          sm:max-w-[210px]
          lg:h-11
          lg:max-w-[240px]
          ${imgClassName}
        `}
      />
    </Link>
  );
}
