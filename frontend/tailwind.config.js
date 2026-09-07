/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#022c22",
        },
        sand: {
          50: "#FFFBF5",
          100: "#F5F0E8",
          200: "#F0EAD8",
          300: "#E6DFD0",
          400: "#E0D4B0",
        },
        terracotta: {
          500: "#C2622D",
          600: "#a8521f",
        },
        charcoal: "#1C2520",
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      height: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};
