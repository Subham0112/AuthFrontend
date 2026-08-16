/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Iowan Old Style", "Georgia", "serif"],
      },
      colors: {
        ivory: {
          50: "#FCFAF6",
          100: "#F8F6F1",
          200: "#F1EFE9",
          300: "#EAE6DA",
          400: "#E7E3DA",
          500: "#DBD6CA",
        },
        ink: {
          900: "#1F1D1A",
          800: "#26241F",
          700: "#3A3833",
          600: "#5C5850",
          500: "#8A8578",
          400: "#9C978A",
          300: "#B2AC9C",
          200: "#C4BFB0",
        },
        sage: {
          700: "#435B52",
          600: "#4C6658",
          500: "#5C7969",
          400: "#7A9487",
          300: "#A5B8AE",
          200: "#D6E0DB",
          100: "#E9EEEA",
          50: "#F3F6F4",
        },
        gold: {
          700: "#8A6A2F",
          600: "#A6813C",
          500: "#C29A55",
          100: "#F3E9DA",
          50: "#F7F3E9",
        },
        clay: {
          700: "#6E3E38",
          600: "#7B3F3F",
          500: "#8A4F46",
          100: "#F7EEEC",
          50: "#FBF5F4",
        },
        line: "#EAE6DA",
      },
      boxShadow: {
        luxe: "0 1px 2px rgba(31,29,26,0.04), 0 8px 28px rgba(31,29,26,0.06)",
        lift: "0 2px 6px rgba(31,29,26,0.06), 0 18px 44px rgba(31,29,26,0.12)",
        glow: "0 0 0 3px rgba(76,102,88,0.18)",
        hairline: "0 1px 2px rgba(31,29,26,0.03)",
      },
      borderRadius: {
        xl2: "18px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "toast-in": "toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
}