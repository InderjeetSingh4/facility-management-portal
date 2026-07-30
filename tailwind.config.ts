import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        
        "bg-page": "var(--bg-page)",
        "bg-surface": "var(--bg-surface)",
        "bg-surface-raised": "var(--bg-surface-raised)",

        accent: {
          DEFAULT: "var(--accent)",
          dim: "var(--accent-dim)",
          on: "var(--accent-on)",
        },

        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          hairline: "var(--border-hairline)",
          dashed: "var(--border-dashed)",
        },
        
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
          border: "var(--success-border)",
        },
        
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
          border: "var(--warning-border)",
        },
        
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
          border: "var(--danger-border)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        surface: "0 10px 15px -3px var(--surface-shadow), 0 4px 6px -4px var(--surface-shadow)",
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(12deg)' },
          '100%': { transform: 'translateX(200%) skewX(12deg)' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
export default config;
