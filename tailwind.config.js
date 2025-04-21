/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        hraDark: "#1e3a8a",
        hraPrimary: "#2563eb",
        hraPrimaryDark: "#1e40af",
        hraPink: "#ec4899",
        hraLight: "#f3f4f6",
        hraDark: "#1F2937",
      },
      hra: {
        dark: "#1E1E2F",
        pink: "#EC4899",
        blue: "#3B82F6",
      },
      fontFamily: {
        inter: ["Inter", "sans‑serif"],
      },
    },
  },
  plugins: [],
};
