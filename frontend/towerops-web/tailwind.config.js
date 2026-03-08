/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        blue: "#00C2FF",
        orange: "#FF6B00",
        green: "#00E896",
        amber: "#FFB800",
        red: "#FF4444",
        "d-bg": "#0A1628",
        "d-surface": "#0F1E35",
        "d-surface2": "#152640",
        "d-border": "#1E3A5F",
        "d-text": "#E8F4FF",
        "d-muted": "#6B8BAE",
        "l-bg": "#F4F7FB",
        "l-surface": "#FFFFFF",
        "l-surface2": "#EEF3F9",
        "l-border": "#D0DCE9",
        "l-text": "#0A1628",
        "l-muted": "#5A7A9A",
      },
      fontFamily: {
        sans: ["Barlow", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        arabic: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
