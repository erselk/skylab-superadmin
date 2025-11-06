import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1a1a1a',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a',
        },
        light: {
          DEFAULT: '#edecec',
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#f0f0f0',
          400: '#e5e5e5',
          500: '#d9d9d9',
          600: '#cccccc',
          700: '#b3b3b3',
          800: '#999999',
          900: '#808080',
        },
        brand: {
          DEFAULT: '#27a68e',
          50: '#e6f5f2',
          100: '#ccebe5',
          200: '#99d7cb',
          300: '#66c3b1',
          400: '#33af97',
          500: '#27a68e',
          600: '#1f8572',
          700: '#176456',
          800: '#0f433a',
          900: '#07221e',
        },
        purple: {
          DEFAULT: '#923eb9',
          50: '#f3e8f7',
          100: '#e7d1ef',
          200: '#cfa3df',
          300: '#b775cf',
          400: '#9f47bf',
          500: '#923eb9',
          600: '#753294',
          700: '#58256f',
          800: '#3a194a',
          900: '#1d0c25',
        },
        danger: {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
};

export default config;

