/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--color-base-950) / <alpha-value>)',
          900: 'rgb(var(--color-base-900) / <alpha-value>)',
          800: 'rgb(var(--color-base-800) / <alpha-value>)',
          700: 'rgb(var(--color-base-700) / <alpha-value>)',
          600: 'rgb(var(--color-base-600) / <alpha-value>)',
          500: 'rgb(var(--color-base-500) / <alpha-value>)',
        },
        ember: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#ffc9aa',
          300: '#ffa674',
          400: '#ff7a3c',
          500: '#f9591a',
          600: '#ea3f0c',
          700: '#c2300d',
          800: '#9a2913',
          900: '#7c2513',
        },
        ash: {
          100: 'rgb(var(--color-ash-100) / <alpha-value>)',
          200: 'rgb(var(--color-ash-200) / <alpha-value>)',
          300: 'rgb(var(--color-ash-300) / <alpha-value>)',
          400: 'rgb(var(--color-ash-400) / <alpha-value>)',
          500: 'rgb(var(--color-ash-500) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        ember: '0 0 24px -4px rgba(249, 89, 26, 0.45)',
        'ember-sm': '0 0 12px -2px rgba(249, 89, 26, 0.35)',
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #f9591a 0%, #ea3f0c 50%, #c2300d 100%)',
        'subtle-glow': 'radial-gradient(circle at 50% 0%, rgba(249,89,26,0.08), transparent 60%)',
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 1.5rem))' },
        },
      },
    },
  },
  plugins: [],
}
