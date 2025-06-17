/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',                  // 如果用 Vite，别忘了加这一行
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      /* ① 你的自定义颜色保持不变 */
      colors: {
        primary: {
          50:  '#feffff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },

      /* ② 额外加入 spacing 扩展 */
      spacing: {
        '84': '21rem',   // 84 × 4px = 336px
      },

      /* ③ 添加自定义断点 */
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
        '2xl': '1920px',
      },
    },
  },
  plugins: [],
};
