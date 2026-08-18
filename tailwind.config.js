/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      /*
       * =========================================================================
       * KAWAD SWAD 2.0
       * CENTRAL TAILWIND DESIGN SYSTEM
       * =========================================================================
       *
       * This configuration is the Tailwind-side foundation of the central
       * design system.
       *
       * index.css = semantic/component system
       * tailwind.config.js = Tailwind utility system
       *
       * Both must use the same visual language.
       */

      /* =======================================================================
         BRAND COLOR SYSTEM
         ======================================================================= */

      colors: {
        brand: {
          /* Primary brand palette */
          ivory: '#F7F2E8',
          'ivory-light': '#FCFAF5',
          'ivory-dark': '#EDE3D2',

          green: '#173C32',
          'green-light': '#2E5A4D',
          'green-dark': '#0F2A23',

          saffron: '#C88A2A',
          'saffron-light': '#DDA84B',
          'saffron-dark': '#A96F18',

          /* Appetite / attention accent */
          red: '#A93624',
          'red-dark': '#842719',
          'red-light': '#C95742',

          /* Heritage / editorial accent */
          brown: '#5A4035',
          'brown-light': '#765B4E',
          'brown-dark': '#3D2A23',

          /* Compatibility aliases */
          cream: '#F7F2E8',
          'cream-dark': '#EDE3D2',

          yellow: '#C88A2A',
          'yellow-dark': '#A96F18',
          'yellow-light': '#DDA84B',

          white: '#FFFFFF',
          black: '#11110F',
        },

        /*
         * Semantic aliases.
         *
         * These allow future pages/components to express intent rather than
         * repeatedly choosing raw brand colors.
         */
        surface: {
          page: '#F7F2E8',
          soft: '#F2EADB',
          card: '#FFFFFF',
          elevated: '#FFFDF8',
          dark: '#173C32',
          brown: '#5A4035',
        },

        text: {
          primary: '#3F291D',
          secondary: '#674C3A',
          muted: '#846F5F',
          subtle: '#A18F80',
          inverse: '#FFFFFF',
          brand: '#173C32',
          accent: '#9F6918',
        },

        border: {
          soft: 'rgba(23, 60, 50, 0.10)',
          DEFAULT: 'rgba(23, 60, 50, 0.15)',
          strong: 'rgba(23, 60, 50, 0.25)',
          saffron: 'rgba(200, 138, 42, 0.25)',
        },
      },

      /* =======================================================================
         TYPOGRAPHY SYSTEM
         ======================================================================= */

      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],

        serif: ['"Playfair Display"', 'Georgia', 'serif'],

        devanagari: ['"Noto Sans Devanagari"', '"Noto Sans"', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],

        /* Large editorial / brand hierarchy */
        display: [
          'clamp(3rem, 7vw, 6.5rem)',
          {
            lineHeight: '0.95',
            letterSpacing: '-0.035em',
          },
        ],

        'display-sm': [
          'clamp(2.5rem, 5vw, 5rem)',
          {
            lineHeight: '0.98',
            letterSpacing: '-0.03em',
          },
        ],

        'headline-lg': [
          'clamp(2.25rem, 4vw, 4rem)',
          {
            lineHeight: '1.05',
            letterSpacing: '-0.025em',
          },
        ],

        'headline-md': [
          'clamp(1.75rem, 3vw, 3rem)',
          {
            lineHeight: '1.08',
            letterSpacing: '-0.02em',
          },
        ],

        'headline-sm': [
          'clamp(1.4rem, 2vw, 2rem)',
          {
            lineHeight: '1.15',
            letterSpacing: '-0.015em',
          },
        ],

        /* Behavioral hierarchy */
        'body-lg': [
          '1.125rem',
          {
            lineHeight: '2rem',
          },
        ],

        'body-sm': [
          '0.875rem',
          {
            lineHeight: '1.5rem',
          },
        ],

        caption: [
          '0.75rem',
          {
            lineHeight: '1.25rem',
          },
        ],
      },

      /* =======================================================================
         SPACING SYSTEM
         8-point rhythm + extended editorial spacing
         ======================================================================= */

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        36: '9rem',
        44: '11rem',
        52: '13rem',
        60: '15rem',
        72: '18rem',
        88: '22rem',
        104: '26rem',
        120: '30rem',

        /* Named design-system values */
        section: 'clamp(4rem, 8vw, 8rem)',
        'section-sm': 'clamp(2.5rem, 5vw, 4rem)',
        'section-lg': 'clamp(5rem, 10vw, 10rem)',
      },

      /* =======================================================================
         RADIUS SYSTEM
         ======================================================================= */

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',

        'ks-sm': '0.5rem',
        'ks-md': '0.75rem',
        'ks-lg': '1rem',
        'ks-xl': '1.25rem',
        'ks-2xl': '1.5rem',
        'ks-3xl': '1.875rem',
        'ks-4xl': '2.5rem',
        'ks-pill': '9999px',
      },

      /* =======================================================================
         SHADOW / ELEVATION SYSTEM
         ======================================================================= */

      boxShadow: {
        soft:
          '0 2px 10px -3px rgba(23, 60, 50, 0.08), 0 8px 24px -8px rgba(23, 60, 50, 0.08)',

        card:
          '0 10px 30px rgba(63, 41, 29, 0.08)',

        'card-hover':
          '0 18px 45px rgba(63, 41, 29, 0.13)',

        lift:
          '0 18px 48px -12px rgba(23, 60, 50, 0.20), 0 6px 16px -6px rgba(23, 60, 50, 0.10)',

        product:
          '0 22px 38px rgba(63, 41, 29, 0.17)',

        floating:
          '0 24px 60px rgba(23, 60, 50, 0.15)',

        modal:
          '0 30px 90px rgba(23, 60, 50, 0.20)',

        glow:
          '0 0 28px -6px rgba(200, 138, 42, 0.28)',

        'green-glow':
          '0 12px 35px rgba(23, 60, 50, 0.20)',

        'inner-soft':
          'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(23,60,50,0.04)',
      },

      /* =======================================================================
         3D SYSTEM
         ======================================================================= */

      perspective: {
        1000: '1000px',
        1200: '1200px',
        1400: '1400px',
        1800: '1800px',
      },

      /* =======================================================================
         TRANSFORM / 3D DEPTH
         ======================================================================= */

      translate: {
        'z-1': '4px',
        'z-2': '8px',
        'z-3': '16px',
        'z-4': '24px',
      },

      /* =======================================================================
         Z-INDEX SYSTEM
         ======================================================================= */

      zIndex: {
        content: '10',
        decoration: '20',
        sticky: '100',
        header: '200',
        dropdown: '300',
        modal: '500',
        toast: '700',
        max: '999',
      },

      /* =======================================================================
         KEYFRAMES
         ======================================================================= */

      keyframes: {
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'fade-in': {
          '0%': {
            opacity: '0',
          },

          '100%': {
            opacity: '1',
          },
        },

        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.97)',
          },

          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },

        'slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-8px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'soft-rise': {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'arc-drift': {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0) rotate(0deg)',
          },

          '50%': {
            transform: 'translate3d(0, -6px, 0) rotate(1deg)',
          },
        },

        'ks-float': {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0)',
          },

          '50%': {
            transform: 'translate3d(0, -8px, 0)',
          },
        },

        'ks-pulse-soft': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },

          '50%': {
            opacity: '0.94',
            transform: 'scale(1.015)',
          },
        },

        marquee: {
          '0%': {
            transform: 'translateX(0)',
          },

          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },

      /* =======================================================================
         ANIMATION SYSTEM
         ======================================================================= */

      animation: {
        'fade-up':
          'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',

        'fade-in':
          'fade-in 0.5s ease-out forwards',

        'scale-in':
          'scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',

        'slide-down':
          'slide-down 0.35s ease-out forwards',

        'soft-rise':
          'soft-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',

        'arc-drift':
          'arc-drift 6s ease-in-out infinite',

        'ks-float':
          'ks-float 5s ease-in-out infinite',

        'ks-float-slow':
          'ks-float 7s ease-in-out infinite',

        'ks-pulse-soft':
          'ks-pulse-soft 3s ease-in-out infinite',

        marquee:
          'marquee 30s linear infinite',
      },

      /* =======================================================================
         TRANSITION SYSTEM
         ======================================================================= */

      transitionTimingFunction: {
        'ks-standard': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'ks-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ks-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        ks-fast: '160ms',
        ks-normal: '280ms',
        ks-slow: '500ms',
        ks-reveal: '700ms',
      },

      /* =======================================================================
         CONTENT WIDTH SYSTEM
         ======================================================================= */

      maxWidth: {
        'content-sm': '42rem',
        'content-md': '56rem',
        'content-lg': '72rem',
        'content-xl': '80rem',
      },
    },
  },

  plugins: [],
};
