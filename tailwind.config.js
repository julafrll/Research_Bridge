/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f7fb',
          100: '#e6edf6',
          200: '#d4dfed',
          300: '#b9c9df',
          400: '#9aafd0',
          500: '#7895be',
          600: '#5e7eaf',
          700: '#45689f',
          800: '#365b94',
          900: '#2f568f',
          950: '#203f73',
        },
        blue: {
          50: '#f3f6fb',
          100: '#e3ebf6',
          200: '#ccd9eb',
          300: '#aec1dc',
          400: '#91a9cb',
          500: '#7190bb',
          600: '#597cad',
          700: '#42679d',
          800: '#35588e',
          900: '#2f568f',
        },
        muted: {
          50: '#fbfbfa',
          100: '#f3f3f1',
          200: '#e4e5e4',
          300: '#d2d5d7',
          400: '#aeb5bd',
          500: '#747e89',
          600: '#56616d',
          700: '#3d4854',
          800: '#29333f',
          900: '#18232f',
        },
        success: {
          50: '#f0f7f5',
          100: '#dceee9',
          500: '#3e8b78',
          600: '#2f7463',
          700: '#245b4e',
        },
        warning: {
          50: '#fbf8ef',
          100: '#f1e9cc',
          500: '#b18a3d',
          600: '#94712d',
          700: '#745823',
        },
        error: {
          50: '#fbf3f3',
          100: '#f2dddd',
          500: '#bd5b61',
          600: '#a8464d',
          700: '#87373d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(31 63 115 / 0.06), 0 1px 2px 0 rgb(31 63 115 / 0.03)',
        'card-hover': '0 8px 24px 0 rgb(31 63 115 / 0.10), 0 2px 6px 0 rgb(31 63 115 / 0.05)',
        elevated: '0 16px 40px 0 rgb(31 63 115 / 0.14), 0 4px 12px 0 rgb(31 63 115 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
