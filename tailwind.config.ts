import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        positive: { DEFAULT: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        negative: { DEFAULT: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        neutral:  { DEFAULT: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
      },
    },
  },
  plugins: [],
};
export default config;
