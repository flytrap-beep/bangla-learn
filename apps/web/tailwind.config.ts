import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bangladesh flag colors
        green: {
          50: "#f0faf5",
          100: "#d6f5e6",
          200: "#a8e9cc",
          300: "#6dd4aa",
          400: "#2eb882",
          500: "#006A4E", // Bangladesh green
          600: "#00523c",
          700: "#003d2d",
          800: "#002a1f",
          900: "#001a13",
        },
        bdred: {
          50: "#fef2f4",
          100: "#fce0e4",
          400: "#f76b7e",
          500: "#F42A41", // Bangladesh red
          600: "#c01f31",
        },
        gold: {
          400: "#E8B84B",
          500: "#d4a030",
        },
      },
      fontFamily: {
        bengali: ["Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
