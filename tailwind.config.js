/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#082B52',
          50: '#EAF0F8',
          100: '#D2E0F1',
          200: '#A8C2E4',
          300: '#7BA3D6',
          400: '#4E85C8',
          500: '#2A67B0',
          600: '#1A4D8A',
          700: '#0F3B72',
          800: '#082B52',
          900: '#051F3C',
        },
        orange: {
          DEFAULT: '#FF8200',
          50: '#FFF5E6',
          100: '#FFE8C2',
          200: '#FFD080',
          300: '#FFB84D',
          400: '#FFA029',
          500: '#FF8200',
          600: '#E67400',
          700: '#CC6600',
          800: '#A35200',
          900: '#7A3D00',
        },
        success: {
          DEFAULT: '#16A765',
          50: '#E6F5EE',
          100: '#C2E8D4',
          500: '#16A765',
          600: '#128A55',
          700: '#0E6D42',
        },
        error: {
          DEFAULT: '#E5484D',
          50: '#FCEBEC',
          100: '#F8D0D2',
          500: '#E5484D',
          600: '#C73C41',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(8, 43, 82, 0.06)',
        'card': '0 4px 24px rgba(8, 43, 82, 0.08)',
        'float': '0 8px 32px rgba(8, 43, 82, 0.12)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'banner-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        'bounce-subtle': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'banner-scroll': 'banner-scroll 20s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
