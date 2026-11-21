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
  surface: { DEFAULT: ['#ffffff', '#141c29'] },
  // Neutral greys keyed to the logo grey #D9D9D8.
  muted: {
    50: ['#f5f5f4', '#0d131d'],
    100: ['#ececeb', '#151d2a'],
    200: ['#e1e1e0', '#222c3c'],
    300: ['#d0d0cf', '#323e52'],
    400: ['#a9aaad', '#66738a'],
    500: ['#74777d', '#939eb0'],
    600: ['#575b63', '#b0b9c7'],
    700: ['#40444c', '#c8cfda'],
    800: ['#2c3038', '#dde2e9'],
    900: ['#1d2027', '#eef1f5'],
    950: ['#12141a', '#f8f9fb'],
  },
  // Text and heading blues, built around Bridge blue #2A4D88.
  navy: {
    50: ['#f2f5fa', '#121b2b'],
    100: ['#e3e9f3', '#182439'],
    200: ['#c9d4e6', '#213352'],
    300: ['#b1bbcb', '#2f4672'],
    400: ['#93a3bf', '#4d6698'],
    500: ['#7c94b8', '#7c94b8'],
    600: ['#56709c', '#9fb2d1'],
    700: ['#3d5c90', '#b8c6de'],
    800: ['#2f528b', '#cfd9ea'],
    900: ['#26344d', '#e3e9f3'],
    950: ['#1e3866', '#f2f5fa'],
  },
  // Accent scale (name kept for existing classes): Bridge blue in light mode,
  // periwinkle in dark mode.
  teal: {
    50: ['#eef2f8', '#141d2e'],
    100: ['#dce4f0', '#18243a'],
    200: ['#c3d0e4', '#22345a'],
    300: ['#9fb2d1', '#2e4677'],
    400: ['#7c94b8', '#4d6aa0'],
    500: ['#3e5f95', '#7c94b8'],
    600: ['#2a4d88', '#9fb2d1'],
    700: ['#223f70', '#b8c6de'],
    800: ['#1b3259', '#d0dbea'],
    900: ['#132441', '#e6ecf5'],
  },
  // Secondary scale (name kept): the logo's periwinkle and steel blues.
  gold: {
    50: ['#f3f5f8', '#161c26'],
    100: ['#e6eaf1', '#1c2431'],
    200: ['#cfd6e2', '#28334a'],
    300: ['#b1bbcb', '#3a4863'],
    400: ['#93a1b8', '#5d6d8a'],
    500: ['#7a8aa5', '#93a1b8'],
    600: ['#5f6f8b', '#b1bbcb'],
    700: ['#4b5a74', '#cfd6e2'],
    800: ['#3a475d', '#e6eaf1'],
    900: ['#2c3748', '#f3f5f8'],
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
  // Bridge blue surfaces (hero, footer, primary buttons); same in both themes.
  ink: { DEFAULT: '#2a4d88', 2: '#223f70', 3: '#1b3259' },
  // Navy that stays navy in dark mode (solid brand surfaces).
  brand: {
    50: '#f2f5fa',
    100: '#e3e9f3',
    200: '#c9d4e6',
    300: '#b1bbcb',
    400: '#9aaacb',
    500: '#7c94b8',
    600: '#56709c',
    700: '#3e5f95',
    800: '#2f528b',
    900: '#2a4d88',
    950: '#1e3866',
  },
  // Teal that stays bright on navy surfaces in both themes.
  aqua: {
    200: '#c9d4e6',
    300: '#b1bbcb',
  },
  blue: {
    50: '#f2f5fa',
    100: '#e3e9f3',
    200: '#c9d4e6',
    300: '#b1bbcb',
    400: '#9aaacb',
    500: '#7c94b8',
    600: '#56709c',
    700: '#3e5f95',
    800: '#2f528b',
    900: '#2a4d88',
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
        // Poppins is the logo's typeface; it carries headings and text alike.
        sans: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // Soft, round geometry to match the circular logo.
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(30 56 102 / 0.04)',
        'card-hover': '0 18px 40px -18px rgb(30 56 102 / 0.28), 0 2px 6px -2px rgb(30 56 102 / 0.06)',
        elevated: '0 40px 80px -32px rgb(30 56 102 / 0.45), 0 8px 20px -8px rgb(30 56 102 / 0.12)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
