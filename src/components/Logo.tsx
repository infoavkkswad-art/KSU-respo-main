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
        group inline-flex min-w-0 shrink-0 items-center
        rounded-md
        transition-transform duration-300
        hover:-translate-y-0.5
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-ivory
        ${className}
      `}
    >
      <span
        className="
          relative block
          transition-all duration-300
          drop-shadow-[0_4px_3px_rgba(62,39,35,0.14)]
          group-hover:drop-shadow-[0_7px_7px_rgba(62,39,35,0.20)]
        "
      >
        {/* Subtle dimensional base */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[4%] bottom-[-3px]
            h-[10%]
            rounded-[50%]
            bg-brand-brown/15
            blur-[4px]
            transition-all duration-300
            group-hover:bottom-[-5px]
            group-hover:bg-brand-brown/20
          "
        />

        <img
          src="/logo.png"
          alt={brand.name}
          width={300}
          height={100}
          decoding="async"
          className={`
            relative z-10
            h-12
            w-auto
            max-w-[220px]
            object-contain
            transition-transform duration-300
            group-hover:scale-[1.025]
            sm:h-14
            sm:max-w-[260px]
            lg:h-16
            lg:max-w-[300px]
            ${imgClassName}
          `}
        />
      </span>
    </Link>
  );
}
