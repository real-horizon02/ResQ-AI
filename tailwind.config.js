/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E63946',
          orange: '#F4A261',
          yellow: '#E9C46A',
          green: '#2A9D8F',
          blue: '#457B9D',
          dark: '#1D3557',
          light: '#F1FAEE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
