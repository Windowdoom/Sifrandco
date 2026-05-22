import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tayba — the Prophet's ﷺ Madinah
        tayba: {
          50:  "#EAF3EC",
          100: "#CFE3D4",
          200: "#9FC7AA",
          300: "#6BAA82",
          400: "#3D8E5E",
          500: "#1B7A4F", // madinah green
          600: "#0A5C36", // tayba green
          700: "#08482B",
          800: "#063521",
          900: "#0B1F17", // night
        },
        // Tasneem gold — the spring of the muqarrabun
        gold: {
          50:  "#FBF6E8",
          100: "#F2E6BD",
          200: "#E5D08A",
          300: "#D6BB6A",
          400: "#C9A961", // primary gold
          500: "#B8860B", // deep gold
          600: "#8E6709",
          700: "#664A07",
        },
        paper: {
          50:  "#FAFAF7", // warm white
          100: "#F2F0E8",
          200: "#E8E5DA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        arabic: ["var(--font-amiri)", "Amiri", "Scheherazade New", "Noto Naskh Arabic", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,92,54,0.06), 0 4px 16px rgba(10,92,54,0.08)",
        gold: "0 0 0 1px rgba(201,169,97,0.4), 0 2px 12px rgba(201,169,97,0.18)",
      },
      backgroundImage: {
        "tasneem-radial":
          "radial-gradient(ellipse at top, #0A5C36 0%, #08482B 45%, #0B1F17 100%)",
        "tasneem-light":
          "radial-gradient(ellipse at top, #EAF3EC 0%, #FAFAF7 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
