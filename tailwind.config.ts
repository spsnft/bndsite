/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Заменяем Montserrat на Inter Tight
        sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
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
