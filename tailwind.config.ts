import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      'brand': ['Pacifico', 'cursive'],
      'sans': ['Inter', 'system-ui', 'sans-serif'],
      'display': ['Inter', 'system-ui', 'sans-serif'], // For headings
      'body': ['Inter', 'system-ui', 'sans-serif'], // For body text
    },
    fontSize: {
      // Custom typography scale
      'brand-lg': ['2.5rem', { lineHeight: '1.2', fontWeight: '400' }], // 40px for large brand
      'brand-md': ['2rem', { lineHeight: '1.2', fontWeight: '400' }],   // 32px for medium brand
      'brand-sm': ['1.5rem', { lineHeight: '1.2', fontWeight: '400' }], // 24px for small brand
      'display-xl': ['3rem', { lineHeight: '1.1', fontWeight: '700' }], // 48px for hero headings
      'display-lg': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }], // 36px for page titles
      'display-md': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }], // 30px for section titles
      'display-sm': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // 24px for subsections
      'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px for large body
      'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],     // 16px for regular body
      'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px for small body
      'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],  // 12px for captions
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      backgroundImage: {
        'work-environment': "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')",
      },
    },
  },
  plugins: [],
} satisfies Config