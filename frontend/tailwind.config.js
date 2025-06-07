/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
      "bg-gray-400",
      "bg-green-500",
      "bg-yellow-400",
      "bg-yellow-300",
      "bg-red-500",
      "text-white",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  