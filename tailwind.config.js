/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: v("bg"),
          elev: v("bg-elev"),
          panel: v("bg-panel"),
          card: v("bg-card"),
        },
        line: {
          DEFAULT: v("line"),
          soft: v("line-soft"),
          bright: v("line-bright"),
        },
        fg: {
          DEFAULT: v("fg"),
          dim: v("fg-dim"),
          muted: v("fg-muted"),
          faint: v("fg-faint"),
        },
        amber: {
          DEFAULT: v("amber"),
          dim: v("amber-dim"),
          bright: v("amber-bright"),
        },
        term: {
          green: v("term-green"),
          red: v("term-red"),
          yellow: v("term-yellow"),
          blue: v("term-blue"),
          purple: v("term-purple"),
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
