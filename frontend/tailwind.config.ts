import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#F5F2ED",
        surface: "#FDFBF8",
        sidebar: "#1C1917",
        border:  "#E4DED6",
        accent:  "#2E8B57",
        muted:   "#78716C",
        faint:   "#A8A29E",
      },
      fontFamily: {
        sans:  ["Geist", "Helvetica Neue", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      borderRadius: { sm: "4px", md: "6px", lg: "10px", xl: "14px" },
    },
  },
  plugins: [],
};
export default config;
