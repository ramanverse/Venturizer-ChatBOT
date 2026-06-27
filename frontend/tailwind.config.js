/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['Space Mono', 'Courier New', 'monospace'],
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        bg: {
          0: '#0c0c0c',
          1: '#111111',
          2: '#161616',
          3: '#1e1e1e',
        },
        border: {
          0: '#1a1a1a',
          1: '#222222',
          2: '#2e2e2e',
        },
        text: {
          0: '#ffffff',
          1: '#aaaaaa',
          2: '#666666',
          3: '#444444',
        },
      },
    },
  },
  plugins: [],
}
