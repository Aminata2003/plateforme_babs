/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#10192E",
          light: "#1F2A44",
          soft: "#2A3655",
        },
        signal: {
          DEFAULT: "#2E6FB3",
          light: "#4A8FD6",
          dark: "#1F4E80",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0C05C",
        },
        paper: "#F6F7FA",
        slate: {
          DEFAULT: "#5B6472",
          dark: "#333B47",
        },
        success: "#3F9142",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px -6px rgba(16, 25, 46, 0.12)",
        lift: "0 12px 32px -8px rgba(16, 25, 46, 0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
