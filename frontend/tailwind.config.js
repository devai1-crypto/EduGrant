/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        riselogic: {
          blue: "#0066FF",
          offwhite: "#FAFAF7",
        }
      }
    },
  },
  plugins: [],
}
