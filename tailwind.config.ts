/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#193D2E",
          emerald: "#34D399",
          gold: "#FEC107",
        }
      },
      fontFamily: {
        // Указываем Tailwind использовать нашу переменную из Next.js
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  corePlugins: {
    float: false,
    objectFit: true,
  },
  plugins: [],
}
