/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Apple system colors (dark appearance)
        brand: {
          50: '#0d2414',
          100: '#123a1e',
          500: '#30D158',
          600: '#28B84C',
          700: '#1F9A3E',
        },
        safe: '#30D158',
        danger: '#FF453A',
        warning: '#FF9F0A',
        surface: {
          DEFAULT: '#1C1C1E',
          raised: '#2C2C2E',
          line: '#38383A',
        },
        muted: '#8E8E93',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { top: '0%' },
          '50%': { top: 'calc(100% - 2px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '70%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        scanline: 'scanline 2.4s ease-in-out infinite',
        'pop-in': 'pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 0.35s ease-out both',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
