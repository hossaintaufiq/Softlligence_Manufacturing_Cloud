/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        elevated: '#FFFFFF',
        ink: '#0F172A',
        mute: '#64748B',
        accent: '#0284C7',
        'accent-strong': '#0369A1',
        ok: '#059669',
        bad: '#DC2626',
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
        display: ['var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
      },
      maxWidth: {
        shell: '42rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
