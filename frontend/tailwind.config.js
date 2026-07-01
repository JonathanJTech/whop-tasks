/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'whop-orange': '#FA4616',
        'whop-charcoal': '#151515',
        'whop-off-white': '#F1F1F1',
        'whop-indigo': '#354B98',
        'whop-cerulean': '#6196C1',
        'whop-chartreuse': '#C1FA81',
        'whop-dust': '#B6B5B0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

