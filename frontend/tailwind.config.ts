import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#0A0E1A",
          1: "#0F1424",
          2: "#161B30",
          3: "#1E2440",
        },
        ink: {
          0: "#F5F7FF",
          1: "#C7CCE0",
          2: "#8A91AB",
          3: "#5A6180",
        },
        brand: {
          violet: "#8B7DFB",
          "violet-2": "#6E5BF0",
          blue: "#4F7CFF",
          teal: "#2DD4BF",
          "teal-2": "#14B8A6",
          mint: "#6EE7B7",
        },
        status: {
          ok: "#34D399",
          warn: "#FBBF24",
          bad: "#F87171",
          crit: "#FB7185",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      borderRadius: {
        r1: "6px",
        r2: "10px",
        r3: "14px",
        r4: "20px",
        r5: "28px",
      },
      boxShadow: {
        "glow-v": "0 0 0 1px rgba(139,125,251,0.45), 0 0 40px -10px rgba(139,125,251,0.55)",
        "glow-t": "0 0 0 1px rgba(45,212,191,0.45), 0 0 40px -10px rgba(45,212,191,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
