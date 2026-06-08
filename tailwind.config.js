/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg-default)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        card: 'var(--card)',
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent-2)',
        },
        muted: 'var(--muted)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        highlight: {
          DEFAULT: 'var(--highlight-bg)',
        },
        text: {
          DEFAULT: 'var(--text-default)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
