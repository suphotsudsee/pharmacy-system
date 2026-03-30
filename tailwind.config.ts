import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: false, // Disable dark mode - single theme only
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // สีหลักของระบบ - Modern Pharmacy Theme
      colors: {
        // Primary - สีฟ้าสดใส (Modern Blue)
        primary: {
          DEFAULT: "var(--primary)",
          50: "var(--primary-50, var(--primary))",
          100: "var(--primary-100, var(--primary))",
          200: "var(--primary-200, var(--primary))",
          300: "var(--primary-300, var(--primary))",
          400: "var(--primary-400, var(--primary))",
          500: "var(--primary-500, var(--primary))",
          600: "var(--primary-600, var(--primary))",
          700: "var(--primary-700, var(--primary))",
          800: "var(--primary-800, var(--primary))",
          900: "var(--primary-900, var(--primary))",
          light: "var(--primary-light, var(--primary))",
          dark: "var(--primary-dark, var(--primary))",
          bg: "var(--primary-bg)",
        },
        // Secondary - สีเขียวสำหรับความสำเร็จ (Healthcare Green)
        secondary: {
          DEFAULT: "var(--secondary)",
          50: "var(--secondary-50, var(--secondary))",
          100: "var(--secondary-100, var(--secondary))",
          200: "var(--secondary-200, var(--secondary))",
          300: "var(--secondary-300, var(--secondary))",
          400: "var(--secondary-400, var(--secondary))",
          500: "var(--secondary-500, var(--secondary))",
          600: "var(--secondary-600, var(--secondary))",
          700: "var(--secondary-700, var(--secondary))",
          800: "var(--secondary-800, var(--secondary))",
          900: "var(--secondary-900, var(--secondary))",
          light: "var(--secondary-light, var(--secondary))",
          dark: "var(--secondary-dark, var(--secondary))",
          bg: "var(--secondary-bg)",
        },
        // Accent - สีม่วงสำหรับเน้น (Purple Accent)
        accent: {
          DEFAULT: "var(--accent)",
          50: "var(--accent-50, var(--accent))",
          100: "var(--accent-100, var(--accent))",
          200: "var(--accent-200, var(--accent))",
          300: "var(--accent-300, var(--accent))",
          400: "var(--accent-400, var(--accent))",
          500: "var(--accent-500, var(--accent))",
          600: "var(--accent-600, var(--accent))",
          700: "var(--accent-700, var(--accent))",
          800: "var(--accent-800, var(--accent))",
          900: "var(--accent-900, var(--accent))",
          light: "var(--accent-light, var(--accent))",
          dark: "var(--accent-dark, var(--accent))",
          bg: "var(--accent-bg)",
        },
        // Semantic Colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        // Background & Foreground
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        border: "var(--border)",
        separator: "var(--separator)",
        // Text Colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          quaternary: "var(--text-quaternary)",
          inverse: "var(--text-inverse)",
        },
      },
      // Box Shadows - เพิ่มความลึก
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "card": "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.15)",
        "elevated": "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      // Border Radius
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      // Animations
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      // Transition
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  plugins: [],
};

export default config;