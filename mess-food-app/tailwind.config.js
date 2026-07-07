/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        husk: {
          950: '#152019',
          900: '#1C2A22',
          800: '#26382D',
          700: '#33493C',
          100: '#F4F1E8',
          50: '#FBF9F2',
        },
        saffron: {
          600: '#D9891C',
          500: '#E8A33D',
          400: '#F0BB6A',
          100: '#FBE9CC',
        },
        clay: {
          600: '#B5502F',
          500: '#C96843',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
      },
    },
  },
  plugins: [],
}
