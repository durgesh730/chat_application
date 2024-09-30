/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin'),
  function ({ addUtilities }) {
    addUtilities({
      '.hide-scrollbar': {
        /* Hide the scrollbar */
        '::-webkit-scrollbar': { display: 'none' },
        '-ms-overflow-style': 'none',  /* Internet Explorer 10+ */
        'scrollbar-width': 'none',    /* Firefox */
      }
    })
  }],
}