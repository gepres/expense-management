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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'ios-bounce': {
          '0%, 80%, 100%': {
            transform: 'scale(0.6) translateY(0)',
            opacity: '0.5'
          },
          '40%': {
            transform: 'scale(1) translateY(-8px)',
            opacity: '1'
          },
        },
        'ios-bounce-v2': {
          '0%, 80%, 100%': {
            transform: 'scale(0)',
            opacity: '0.5'
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
        'ios-bounce-v3': {
          '0%, 80%, 100%': {
            transform: 'scale(0.6)',
            opacity: '0.5'
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.1)',
            opacity: '0.7',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'scale-in': {
          from: {
            transform: 'scale(0)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
      animation: {
        'ios-bounce': 'ios-bounce 1.4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'ios-bounce-v2': 'ios-bounce-v2 1.2s ease-in-out infinite',
        'ios-bounce-v3': 'ios-bounce-v3 1.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
