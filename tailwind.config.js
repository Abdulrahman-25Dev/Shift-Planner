/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}" // أضف هذا لضمان قراءة صف الايام
  ],
  // ... الإعدادات السابقة
  theme: {
  extend: {
    colors: {
      study: {
        // الوضع الفاتح (Light Mode)
        primary: '#4f46e5',
        secondary: '#6366f1',
        accent: '#e0e7ff',
        bg: '#f8fafc',
        
        // الوضع الداكن (Dark Mode)
        dark: {
          primary: '#818cf8',
          secondary: '#a5b4fc',
          accent: '#1e1b4b',
          bg: '#0f172a',
        }
      },
      coding: {
        // الوضع الفاتح (Light Mode)
        primary: '#064e3b',
        secondary: '#047857',
        accent: '#d1fae5',
        bg: '#f0fdf4',
        
        // الوضع الداكن (Dark Mode)
        dark: {
          primary: '#34d399',
          secondary: '#6ee7b7',
          accent: '#064e3b',
          bg: '#022c22',
        }
      },
    },
  },
  darkMode: 'class', 
}
}
