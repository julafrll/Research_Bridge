import plugin from 'tailwindcss/plugin.js';

/*
 * Theme palette.
 *
 * Every scale listed in THEMED has a light and a dark value per step. Tailwind
 * classes point at CSS variables, so `text-navy-900` or `bg-muted-50` switch
 * automatically when <html> has the `dark` class — pages don't need `dark:`
 * variants for ordinary colors.
 *
 * `brand` and `blue` never switch: use them for the solid navy surfaces
 * (hero, footer, sidebar, primary buttons) that stay navy in both themes.
 * `surface` is the card/panel background (white in light mode).
 */
const THEMED = {
  surface: { DEFAULT: ['#ffffff', '#131c26'] },
  muted: {
    50: ['#fbfbfa', '#0c1219'],
    100: ['#f3f3f1', '#18222d'],
    200: ['#e4e5e4', '#263240'],
    300: ['#d2d5d7', '#36445a'],
    400: ['#aeb5bd', '#6b7a8c'],
    500: ['#747e89', '#93a0ae'],
    600: ['#56616d', '#aeb8c3'],
    700: ['#3d4854', '#c6ced6'],
    800: ['#29333f', '#dbe1e7'],
    900: ['#18232f', '#eef1f4'],
    950: ['#0f1720', '#f8f9fa'],
  },
  navy: {
    50: ['#f4f7fb', '#121c2c'],
    100: ['#e6edf6', '#18253c'],
    200: ['#d4dfed', '#213453'],
    300: ['#b9c9df', '#2f4a75'],
    400: ['#9aafd0', '#4d6b9d'],
    500: ['#7895be', '#7593c2'],
    600: ['#5e7eaf', '#93acd5'],
    700: ['#45689f', '#adc2e3'],
    800: ['#365b94', '#c2d2ec'],
    900: ['#2f568f', '#d6e2f4'],
    950: ['#203f73', '#eaf0fa'],
  },
  teal: {
    50: ['#effaf8', '#0d2422'],
    100: ['#d6f1ed', '#11312e'],
    200: ['#ade2db', '#17504a'],
    300: ['#7ccbc2', '#1f6e66'],
    400: ['#4daea5', '#2f948b'],
    500: ['#2f928a', '#3fb0a6'],
    600: ['#237670', '#5cc5bb'],
    700: ['#1f5f5b', '#82d4cb'],
    800: ['#1c4c4a', '#a9e3dc'],
    900: ['#183f3e', '#d0f1ed'],
  },
  gold: {
    50: ['#fcf8ec', '#261f0e'],
    100: ['#f7edcc', '#382c11'],
    200: ['#efd994', '#5a4516'],
    300: ['#e6c25c', '#87681c'],
    400: ['#dcab36', '#c69221'],
    500: ['#c69221', '#dcab36'],
    600: ['#a5731a', '#e6c25c'],
    700: ['#825518', '#efd48a'],
    800: ['#6c451a', '#f5e3b0'],
    900: ['#5c3a1a', '#faf0d3'],
  },
  success: {
    50: ['#f0f7f5', '#0f221d'],
    100: ['#dceee9', '#153028'],
    200: ['#bfdfd6', '#22564a'],
    500: ['#3e8b78', '#4fa58f'],
    600: ['#2f7463', '#6fbfa9'],
    700: ['#245b4e', '#93d3c1'],
    800: ['#1c483e', '#b6e3d6'],
  },
  warning: {
    50: ['#fbf8ef', '#261f0f'],
    100: ['#f1e9cc', '#372d14'],
    200: ['#e6d7a6', '#594a1f'],
    500: ['#b18a3d', '#c9a256'],
    600: ['#94712d', '#dcbb74'],
    700: ['#745823', '#e8cf97'],
  },
  error: {
    50: ['#fbf3f3', '#2a1517'],
    100: ['#f2dddd', '#3b1c1f'],
    200: ['#e8c3c4', '#58292d'],
    300: ['#d99a9d', '#7a3a3f'],
    500: ['#bd5b61', '#d06f75'],
    600: ['#a8464d', '#dd8a8f'],
    700: ['#87373d', '#e8a9ad'],
  },
};

const STATIC = {
  // Navy that stays navy in dark mode (solid brand surfaces).
  brand: {
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
  // Teal that stays bright on navy surfaces in both themes.
  aqua: {
    200: '#ade2db',
    300: '#7ccbc2',
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
};

const channels = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const varName = (scale, step) => `--c-${scale}${step === 'DEFAULT' ? '' : `-${step}`}`;

const themeColors = { ...STATIC };
const lightVars = {};
const darkVars = {};
for (const [scale, steps] of Object.entries(THEMED)) {
  themeColors[scale] = {};
  for (const [step, [light, dark]] of Object.entries(steps)) {
    const v = varName(scale, step);
    themeColors[scale][step] = `rgb(var(${v}) / <alpha-value>)`;
    lightVars[v] = channels(light);
    darkVars[v] = channels(dark);
  }
}

const themeVariables = plugin(({ addBase }) => {
  addBase({
    ':root': { ...lightVars, colorScheme: 'light' },
    '.dark': { ...darkVars, colorScheme: 'dark' },
  });
});

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
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
  plugins: [themeVariables],
};
