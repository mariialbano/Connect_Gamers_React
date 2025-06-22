/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightbg: "#f7f7fa",
        lightcontent: "#e5e7eb",
        lightfooter: "#f3f4f6",
        lightfooterDark: "#e0e1e6", // nova cor, um pouco mais escura
      },
    },
  },
  plugins: [],
}
