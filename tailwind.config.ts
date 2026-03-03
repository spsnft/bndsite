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
      }
    },
  },
  plugins: [],
}
