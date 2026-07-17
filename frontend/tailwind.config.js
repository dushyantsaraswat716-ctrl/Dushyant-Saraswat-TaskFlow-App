/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgba(30, 41, 59, 0.06), 0 1px 2px 0 rgba(30,41,59,0.04)",
        card: "0 4px 24px -4px rgba(30, 41, 59, 0.08), 0 2px 8px -2px rgba(30,41,59,0.04)",
        glow: "0 8px 30px -6px rgba(79, 70, 229, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        fadeIn: "fadeIn .2s ease-out",
        slideUp: "slideUp .25s ease-out",
      },
    },
  },
  plugins: [],
};
