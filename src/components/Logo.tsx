import { Link } from 'react-router-dom';
import { brand } from '@/data/brand';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL BRAND LOGO SYSTEM

   Design goals:
   - Stronger brand presence
   - Controlled 3D / dimensional treatment
   - Consistent implementation across header, mobile and footer
   - Preserve the original logo artwork
   - Prevent wrapper effects from creating unnecessary layout space
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
        leading-none
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-ivory
        ${className}
      `}
    >

      {/* ======================================================================
          LOGO 3D STAGE
          =================================================================== */}

      <span
        className="
          relative
          block
          min-w-0
          leading-none
          [perspective:1000px]
          [transform-style:preserve-3d]
        "
      >

        {/* ====================================================================
            DIMENSIONAL GROUNDING SHADOW
            ================================================================= */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[-3px]
            left-[6%]
            z-0
            h-[7%]
            w-[88%]
            rounded-[50%]
            bg-brand-brown/14
            blur-[4px]
            transition-all
            duration-300
            ease-ks-standard
            group-hover:bottom-[-5px]
            group-hover:bg-brand-brown/20
            group-hover:blur-[5px]
          "
        />


        {/* ====================================================================
            SUBTLE 3D BASE
            ================================================================= */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-[3%]
            bottom-[1%]
            z-0
            h-[6%]
            rounded-[40%]
            bg-brand-green/7
            blur-[2px]
            transition-transform
            duration-300
            ease-ks-standard
            group-hover:translate-y-0.5
          "
        />


        {/* ====================================================================
            LOGO ARTWORK

            Important:
            The image keeps its natural aspect ratio.
            No fixed width + fixed height combination is used.
            ================================================================= */}

        <img
          src="/logo.png"
          alt={brand.name}
          width={300}
          height={100}
          decoding="async"
          className={`
            relative
            z-10
            block
            h-14
            w-auto
            max-w-[240px]
            shrink-0
            object-contain
            object-center
            [transform:translateZ(0)]
            transition-all
            duration-300
            ease-ks-standard
            group-hover:-translate-y-0.5
            group-hover:scale-[1.02]
            group-hover:[transform:translateZ(5px)_scale(1.02)]
            sm:h-16
            sm:max-w-[280px]
            lg:h-[72px]
            lg:max-w-[320px]
            ${imgClassName}
          `}
        />


        {/* ====================================================================
            CONTROLLED LIGHT REFLECTION
            ================================================================= */}

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
