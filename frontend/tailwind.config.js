/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores pastel personalizados
        'pastel-blue': '#bfdbfe', // blue-200
        'pastel-green': '#a7f3d0', // green-200
        'pastel-red': '#fecaca', // red-200
        'pastel-yellow': '#fef3c7', // yellow-200
        'pastel-purple': '#e9d5ff', // purple-200
        'pastel-pink': '#fbcfe8', // pink-200
      },
    },
  },
  plugins: [],
}
