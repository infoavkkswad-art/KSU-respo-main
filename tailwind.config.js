/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        brand: {
          /* Primary palette: Heritage × Appetite × Precision */
          ivory: '#F7F2E8',
          'ivory-light': '#FCFAF5',
          'ivory-dark': '#EDE3D2',

          green: '#173C32',
          'green-light': '#2E5A4D',
          'green-dark': '#0F2A23',

          saffron: '#C88A2A',
          'saffron-light': '#DDA84B',
          'saffron-dark': '#A96F18',

          /* Controlled appetite accents */
          red: '#A93624',
          'red-dark': '#842719',
          'red-light': '#C95742',

          brown: '#5A4035',
          'brown-light': '#765B4E',
          'brown-dark': '#3D2A23',

          /* Compatibility aliases for existing components */
          cream: '#F7F2E8',
          'cream-dark': '#EDE3D2',
          yellow: '#C88A2A',
          'yellow-dark': '#A96F18',
          'yellow-light': '#DDA84B',

          white: '#FFFFFF',
          black: '#11110F',
        },
      },

      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],

        /* Premium editorial hierarchy */
        display: [
          'clamp(3rem, 7vw, 6.5rem)',
          { lineHeight: '0.95', letterSpacing: '-0.035em' },
        ],
        'display-sm': [
          'clamp(2.5rem, 5vw, 5rem)',
          { lineHeight: '0.98', letterSpacing: '-0.03em' },
        ],
        'headline-lg': [
          'clamp(2.25rem, 4vw, 4rem)',
          { lineHeight: '1.05', letterSpacing: '-0.025em' },
        ],
        'headline-md': [
          'clamp(1.75rem, 3vw, 3rem)',
          { lineHeight: '1.08', letterSpacing: '-0.02em' },
        ],
        'headline-sm': [
          'clamp(1.4rem, 2vw, 2rem)',
          { lineHeight: '1.15', letterSpacing: '-0.015em' },
        ],
      },

      /* 8-point spacing rhythm */
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
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        soft:
          '0 2px 10px -3px rgba(23, 60, 50, 0.08), 0 8px 24px -8px rgba(23, 60, 50, 0.08)',

        card:
          '0 6px 28px -8px rgba(23, 60, 50, 0.14), 0 2px 8px -2px rgba(23, 60, 50, 0.08)',

        lift:
          '0 18px 48px -12px rgba(23, 60, 50, 0.20), 0 6px 16px -6px rgba(23, 60, 50, 0.10)',

        glow:
          '0 0 28px -6px rgba(200, 138, 42, 0.28)',

        'inner-soft':
          'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(23,60,50,0.04)',
      },

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
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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

        marquee: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-down': 'slide-down 0.35s ease-out forwards',
        'soft-rise': 'soft-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'arc-drift': 'arc-drift 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },

  plugins: [],
};
