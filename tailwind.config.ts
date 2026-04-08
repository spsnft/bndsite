/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Устанавливаем Montserrat как шрифт по умолчанию для класса font-sans
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          green: "#193D2E",
          emerald: "#34D399",
          gold: "#FEC107",
        }
      }
    },
  },
  plugins: [],
}
