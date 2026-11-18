/** Thème Tailwind basé sur la charte graphique NovaBridge v1.0 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F3A', 900: '#071528', 700: '#13305A' },
        gold: { DEFAULT: '#C9A24B', light: '#E9D9AE', deep: '#8C6A1F' },
        atlantic: '#1D4E89',
        ivory: '#F6F2E9',
        slate: '#334155',
        steel: '#64748B',
        mist: '#E3E8EF',
        cloud: '#F5F7FA',
        success: '#1F7A5A',
        warning: '#B7791F',
        danger: '#B42318',
      },
      fontFamily: {
        display: ['Montserrat', 'Segoe UI', 'Arial', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'Arial', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
      },
      boxShadow: {
        'nb-sm': '0 1px 2px rgba(11, 31, 58, .08)',
        nb: '0 8px 24px rgba(11, 31, 58, .10)',
        'nb-lg': '0 20px 48px rgba(11, 31, 58, .16)',
      },
    },
  },
  plugins: [],
};
