import { Link } from 'react-router-dom';
import { brand } from '@/data/brand';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL BRAND LOGO SYSTEM

   The logo is a primary brand asset, not a decorative image.

   Design goals:
   - Larger visual presence
   - Consistent dimensional treatment
   - One reusable implementation across header/mobile/footer
   - Preserve the actual logo artwork
   - Avoid excessive effects that compete with the logo
   ========================================================================== */

export function Logo({
  className = '',
  imgClassName = '',
}: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${brand.name} home`}
      className={`
        group
        inline-flex
        min-w-0
        shrink-0
        items-center
        rounded-xl
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
          relative
          block
          [perspective:1000px]
          [transform-style:preserve-3d]
        "
      >
        {/* ==================================================================
            DIMENSIONAL GROUNDING
            ================================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[-4px]
            left-[5%]
            z-0
            h-[9%]
            w-[90%]
            rounded-[50%]
            bg-brand-brown/16
            blur-[5px]
            transition-all
            duration-300
            ease-ks-standard
            group-hover:bottom-[-6px]
            group-hover:bg-brand-brown/22
            group-hover:blur-[6px]
          "
        />

        {/* ==================================================================
            SUBTLE 3D BASE
            ================================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-[2%]
            bottom-[1%]
            z-0
            h-[8%]
            rounded-[40%]
            bg-brand-green/8
            blur-[2px]
            transition-all
            duration-300
            group-hover:translate-y-0.5
          "
        />

        {/* ==================================================================
            LOGO ARTWORK
            ================================================================== */}

        <img
          src="/logo.png"
          alt={brand.name}
          width={300}
          height={100}
          decoding="async"
          className={`
            relative
            z-10
            h-14
            w-auto
            max-w-[240px]
            object-contain
            [transform:translateZ(0)]
            transition-all
            duration-300
            ease-ks-standard
            group-hover:-translate-y-0.5
            group-hover:scale-[1.025]
            group-hover:[transform:translateZ(6px)_scale(1.025)]
            sm:h-16
            sm:max-w-[280px]
            lg:h-[72px]
            lg:max-w-[320px]
            ${imgClassName}
          `}
        />

        {/* ==================================================================
            CONTROLLED HIGHLIGHT
            ================================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            rounded-lg
            bg-gradient-to-br
            from-white/10
            via-transparent
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />
      </span>
    </Link>
  );
}
