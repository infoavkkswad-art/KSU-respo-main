/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FE330E',
          'red-dark': '#D42A0C',
          'red-light': '#FF5A3C',
          yellow: '#FBEC0A',
          'yellow-dark': '#E5D800',
          'yellow-light': '#FFF85F',
          cyan: '#09E4FD',
          cream: '#FFFDF7',
          'cream-dark': '#FBF5E8',
          brown: '#4E342E',
          'brown-light': '#6D4C41',
          'brown-dark': '#3E2723',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(78, 52, 46, 0.08), 0 4px 16px -4px rgba(78, 52, 46, 0.06)',
        card: '0 4px 24px -6px rgba(78, 52, 46, 0.12), 0 2px 8px -2px rgba(78, 52, 46, 0.08)',
        lift: '0 12px 40px -8px rgba(78, 52, 46, 0.18), 0 4px 12px -4px rgba(78, 52, 46, 0.1)',
        glow: '0 0 24px -4px rgba(254, 51, 14, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
