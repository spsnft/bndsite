/** @type {import('tailwindcss').Config} */
module.exports = {
  // ВАЖНО: Мы заставляем Tailwind искать классы во ВСЕХ папках
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Твои цвета теперь жестко вшиты в Tailwind
        brand: {
          green: "#193D2E",
          emerald: "#34D399",
          gold: "#FEC107",
          silver: "#C1C1C1",
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
