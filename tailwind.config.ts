import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "green-dark": "#0D3D2E",
        "green-mid": "#0F4A38",
        "green-bright": "#4ADE80",
        "green-neon": "#22C55E",
        "black-nav": "#111111",
        "off-white": "#F9F9F9",
        "text-dark": "#1A1A2E",
        "text-grey": "#666666",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        script: ["Dancing Script", "cursive"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
