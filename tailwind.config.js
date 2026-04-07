/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm dark terminal palette
        bg: {
          DEFAULT: "#09090b", // zinc-950
          elev: "#111113",
          panel: "#161618",
          card: "#1a1a1d",
        },
        line: {
          DEFAULT: "#27272a", // zinc-800
          soft: "#1f1f23",
          bright: "#3f3f46",
        },
        fg: {
          DEFAULT: "#e4e4e7", // zinc-200
          dim: "#a1a1aa", // zinc-400
          muted: "#71717a", // zinc-500
          faint: "#52525b", // zinc-600
        },
        amber: {
          DEFAULT: "#fbbf24", // amber-400
          dim: "#d97706",
          bright: "#fde047",
        },
        term: {
          green: "#34d399",
          red: "#f87171",
          yellow: "#fbbf24",
          blue: "#60a5fa",
          purple: "#c084fc",
        },
      },
      fontFamily: {
        sans: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      maxWidth: {
        prose: "72ch",
      },
      keyframes: {
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
