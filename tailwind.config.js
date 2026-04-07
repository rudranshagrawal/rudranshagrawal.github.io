/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#111111",
          800: "#1c1c1c",
          700: "#2a2a2a",
          600: "#4a4a4a",
          500: "#6b6b6b",
          400: "#8a8a8a",
          300: "#b8b5ad",
        },
        paper: {
          50: "#fbfaf6",
          100: "#f5f3ec",
          200: "#ece9df",
          300: "#ddd9cb",
        },
        amber: {
          DEFAULT: "#b45309",
          soft: "#f3e9d5",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        serif: ['"Fraunces"', '"Iowan Old Style"', "Georgia", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
