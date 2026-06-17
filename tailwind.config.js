/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './electron/**/*.{js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          mid: '#DBEAFE',
          dark: '#1D4ED8'
        },
        green: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669'
        },
        red: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626'
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        md: '8px',
        lg: '12px'
      },
      boxShadow: {
        DEFAULT: '0 1px 3px rgba(0,0,0,0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      width: {
        'sidebar': '240px'
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out'
      }
    }
  },
  plugins: []
}
