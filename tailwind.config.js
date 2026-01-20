/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // The Forge - Dark Mode Defaults (Primary)
        forge: {
          // Backgrounds
          background: {
            DEFAULT: '#09090b', // Zinc 950 - The Void
            light: '#fafafa',   // Zinc 50
          },
          surface: {
            DEFAULT: '#18181b', // Zinc 900
            light: '#ffffff',
          },
          'surface-highlight': {
            DEFAULT: '#27272a', // Zinc 800
            light: '#f4f4f5',   // Zinc 100
          },
          'surface-elevated': {
            DEFAULT: '#3f3f46', // Zinc 700
            light: '#e4e4e7',   // Zinc 200
          },

          // Primary - The Spark (Electric Yellow)
          primary: {
            DEFAULT: '#ffd801', // Electric Yellow
            light: '#ca8a04',   // Yellow 600
            dark: '#b39700',
            dim: 'rgba(255, 216, 1, 0.15)',
          },

          // Typography
          text: {
            DEFAULT: '#ffffff',
            light: '#09090b',   // Zinc 950
          },
          'text-secondary': {
            DEFAULT: '#e4e4e7', // Zinc 200
            light: '#27272a',   // Zinc 800
          },
          'text-muted': {
            DEFAULT: '#a1a1aa', // Zinc 400
            light: '#71717a',   // Zinc 500
          },
          'text-disabled': {
            DEFAULT: '#52525b', // Zinc 600
            light: '#a1a1aa',   // Zinc 400
          },
          'text-on-primary': {
            DEFAULT: '#000000',
            light: '#ffffff',
          },

          // Borders
          border: {
            DEFAULT: '#27272a', // Zinc 800
            light: '#e4e4e7',   // Zinc 200
          },
          'border-highlight': {
            DEFAULT: '#3f3f46', // Zinc 700
            light: '#d4d4d8',   // Zinc 300
          },

          // Semantic States
          danger: {
            DEFAULT: '#ef4444', // Red 500
            light: '#dc2626',   // Red 600
            dim: 'rgba(239, 68, 68, 0.15)',
          },
          success: {
            DEFAULT: '#22c55e', // Green 500
            light: '#16a34a',   // Green 600
            dim: 'rgba(34, 197, 94, 0.15)',
          },
          warning: {
            DEFAULT: '#f59e0b', // Amber 500
            light: '#d97706',   // Amber 600
            dim: 'rgba(245, 158, 11, 0.15)',
          },
          info: {
            DEFAULT: '#3b82f6', // Blue 500 (also Protein color)
            light: '#2563eb',   // Blue 600
            dim: 'rgba(59, 130, 246, 0.15)',
          },

          // Glassmorphism
          glass: {
            DEFAULT: 'rgba(24, 24, 27, 0.8)',
            light: 'rgba(255, 255, 255, 0.85)',
            border: 'rgba(255, 255, 255, 0.1)',
            'border-light': 'rgba(0, 0, 0, 0.08)',
          },

          // Macro Chart Colors
          macro: {
            protein: '#3b82f6', // Blue 500
            carbs: '#22c55e',   // Green 500
            fat: '#ffd801',     // Primary Yellow
          },
        },
      },
      fontFamily: {
        // Heading font - Bold, aggressive
        heading: ['Oswald', 'system-ui', 'sans-serif'],
        // Body font - Clean, readable
        body: ['Inter', 'system-ui', 'sans-serif'],
        // Mono font - Numbers, timers
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Custom sizes for The Forge
        'hero': ['40px', { lineHeight: '0.9', letterSpacing: '-0.02em', fontWeight: '800' }],
        'title-lg': ['28px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'section': ['12px', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '700' }],
      },
      borderRadius: {
        'forge': '12px',
        'forge-lg': '24px',
      },
      spacing: {
        'safe': '20px', // Safe area padding
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 216, 1, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
