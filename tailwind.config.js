/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cold modern color palette
        claude: {
          // Light mode colors
          bg: '#F8F9FB',              // Cool gray-white background
          surface: '#FFFFFF',          // Cards, inputs
          surfaceHover: '#F0F1F4',     // Hover state
          surfaceMuted: '#F3F4F6',     // Subtle area distinction
          surfaceInset: '#EBEDF0',     // Inset areas (e.g., input inner)
          border: '#E0E2E7',           // Default border
          borderLight: '#EBEDF0',      // Subtle dividers
          text: '#1A1D23',             // Primary text, near-black
          textSecondary: '#6B7280',    // Secondary text
          // Dark mode colors
          darkBg: '#0F1117',           // Dark background, near-black
          darkSurface: '#1A1D27',      // Dark cards
          darkSurfaceHover: '#242830', // Dark hover
          darkSurfaceMuted: '#151820', // Subtle dark area
          darkSurfaceInset: '#0C0E14', // Dark inset areas
          darkBorder: '#2A2E38',       // Dark borders
          darkBorderLight: '#1F232B',  // Subtle dark dividers
          darkText: '#E4E5E9',         // Dark primary text
          darkTextSecondary: '#8B8FA3', // Dark secondary text
          // Accent (tech blue)
          accent: '#3B82F6',           // Blue primary
          accentHover: '#2563EB',      // Blue hover
          accentLight: '#60A5FA',      // Light blue for badges
          accentMuted: 'rgba(59,130,246,0.10)', // Very faint blue background
        },
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB'
        },
        secondary: {
          DEFAULT: '#6B7280',
          dark: '#2A2E38'
        }
      },
      boxShadow: {
        // Fluent 2 — ultra-flat elevation, shadows hug the surface tightly
        'elevation-1': '0 0.5px 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        'elevation-2': '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        'elevation-4': '0 2px 4px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
        'elevation-8': '0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)',
        'elevation-16': '0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.03)',
        'elevation-32': '0 16px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
        'elevation-64': '0 32px 64px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.04)',
        // Legacy aliases mapped to Fluent elevations
        subtle: '0 0.5px 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        elevated: '0 2px 4px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
        modal: '0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.03)',
        popover: '0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)',
        'glow-accent': '0 0 16px rgba(59,130,246,0.12)',
      },
      borderWidth: {
        'stroke': '1px',
        'stroke-2': '1.5px',
      },
      divideWidth: {
        'stroke': '1px',
      },
      outlineWidth: {
        'focus': '1.5px',
      },
      outlineOffset: {
        'focus': '0px',
      },
      borderRadius: {
        'fluent-sm': '4px',
        'fluent': '8px',
        'fluent-lg': '8px',
      },
      backdropBlur: {
        'acrylic': '20px',
        'acrylic-heavy': '40px',
      },
      transitionDuration: {
        'fluent': '167ms',
        'fluent-fast': '83ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fluent-press': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(0.98)' },
        },
        'fluent-hover-lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-1px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 167ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fade-in-up 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-down': 'fade-in-down 167ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 167ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fluent-press': 'fluent-press 83ms cubic-bezier(0, 0, 0, 1) forwards',
        'fluent-hover-lift': 'fluent-hover-lift 167ms cubic-bezier(0, 0, 0, 1) forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      fontFamily: {
        'fluent': [
          '"Segoe UI Variable"',
          '"Segoe UI"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      scale: {
        'pressed': '0.98',
        'fluent-hover': '1.01',
      },
      opacity: {
        'disabled': '0.36',
        'subtle': '0.6',
        'ghost': '0.04',
      },
      ringWidth: {
        'focus': '1.5px',
      },
      ringOffsetWidth: {
        'focus': '0px',
      },
      backgroundImage: {
        'acrylic-light': 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(249,249,249,0.85) 100%)',
        'acrylic-dark': 'linear-gradient(180deg, rgba(32,32,32,0.85) 0%, rgba(28,28,28,0.85) 100%)',
      },
      zIndex: {
        'flyout': '100',
        'tooltip': '200',
        'acrylic': '300',
        'modal': '400',
      },
      minHeight: {
        'control': '32px',
        'control-lg': '40px',
      },
      maxWidth: {
        'flyout': '320px',
        'dialog': '540px',
        'panel': '340px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'fluent-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'fluent-decelerate': 'cubic-bezier(0, 0, 0, 1)',
        'fluent-accelerate': 'cubic-bezier(0.7, 0, 1, 0.5)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1A1D23',
            a: {
              color: '#3B82F6',
              '&:hover': {
                color: '#2563EB',
              },
            },
            code: {
              color: '#1A1D23',
              backgroundColor: 'rgba(224, 226, 231, 0.5)',
              padding: '0.2em 0.4em',
              borderRadius: '4px',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#F0F1F4',
              color: '#1A1D23',
              padding: '1em',
              borderRadius: '8px',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#3B82F6',
              color: '#6B7280',
            },
            h1: {
              color: '#1A1D23',
            },
            h2: {
              color: '#1A1D23',
            },
            h3: {
              color: '#1A1D23',
            },
            h4: {
              color: '#1A1D23',
            },
            strong: {
              color: '#1A1D23',
            },
          },
        },
        dark: {
          css: {
            color: '#E4E5E9',
            a: {
              color: '#60A5FA',
              '&:hover': {
                color: '#93BBFD',
              },
            },
            code: {
              color: '#E4E5E9',
              backgroundColor: 'rgba(42, 46, 56, 0.5)',
              padding: '0.2em 0.4em',
              borderRadius: '4px',
              fontWeight: '400',
            },
            pre: {
              backgroundColor: '#1A1D27',
              color: '#E4E5E9',
              padding: '1em',
              borderRadius: '8px',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#3B82F6',
              color: '#8B8FA3',
            },
            h1: {
              color: '#E4E5E9',
            },
            h2: {
              color: '#E4E5E9',
            },
            h3: {
              color: '#E4E5E9',
            },
            h4: {
              color: '#E4E5E9',
            },
            strong: {
              color: '#E4E5E9',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('./src/renderer/theme/tailwind/plugin.cjs'),
  ],
}
