import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["'Instrument Serif'", "Georgia", "serif"],
      },
      colors: {
        brain: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a4b8fd",
          400: "#7c93fa",
          500: "#5c6ef5",
          600: "#4550e8",
          700: "#3840cf",
          800: "#2f36a7",
          900: "#2b3384",
          950: "#1a1f55",
        },
        sage: {
          50: "#f2f7f4",
          100: "#e0ece4",
          200: "#c2d9ca",
          300: "#98bfa6",
          400: "#699f7e",
          500: "#478261",
          600: "#35674d",
          700: "#2b533e",
          800: "#244333",
          900: "#1e382b",
        },
        amber: {
          warm: "#f59e0b",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
