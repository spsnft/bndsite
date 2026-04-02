/** @type {import('tailwindcss').Config} */
module.exports = {
  // Включаем строгий режим поиска классов, чтобы билд был максимально легким
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
      // Прямо здесь мы можем задать очередность шрифтов, 
      // чтобы системные подменяли кастомные без задержки
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      // Если ты используешь тяжелые тени, лучше вынести их в утилиты
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  // Отключаем неиспользуемые базовые стили для уменьшения CSS-бандла
  corePlugins: {
    float: false,
    objectFit: true,
  },
  plugins: [],
}
