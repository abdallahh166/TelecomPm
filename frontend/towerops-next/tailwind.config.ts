import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A1628',
          blue: '#00C2FF',
          orange: '#FF6B00',
          green: '#00E896',
          amber: '#FFB800',
          red: '#FF4444',
        },
      },
    },
  },
  plugins: [],
};

export default config;
