import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101615",
        coal: "#1D2422",
        forest: "#123C35",
        emerald: "#176B58",
        mist: "#F4F7F5",
        line: "#DDE5DF"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 22, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
