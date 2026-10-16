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
        // Study Haven Warm Sunset Palette: Inspired by Golden Hour Study Desk
        // #FDF8F0 (Cream paper), #F6DEBB (Warm parchment), #D97D29 (Golden hour amber), #2B1810 (Deep roast espresso)
        brand: {
          50: "#FDF8F0",
          100: "#FBF0DE",
          200: "#F6DEBB",
          300: "#EEC48C",
          400: "#E3A354",
          500: "#D97D29",
          600: "#BE6017",
          700: "#994615",
          800: "#783617",
          900: "#2B1810",
          950: "#180D08",
        },
        amber: {
          DEFAULT: "#D97D29",
          50: "#FDF8F0",
          100: "#FBF0DE",
          200: "#F6DEBB",
          300: "#EEC48C",
          400: "#E3A354",
          500: "#D97D29",
          600: "#BE6017",
          700: "#994615",
          800: "#783617",
          900: "#2B1810",
        },
        espresso: {
          DEFAULT: "#2B1810",
          50: "#FDF8F0",
          100: "#F6DEBB",
          700: "#5A3827",
          800: "#3D2418",
          900: "#2B1810",
          950: "#180D08",
        },
        plant: {
          DEFAULT: "#4E8752",
          light: "#7AA078",
          dark: "#355E38",
        },
        note: "#FEF7DA",
        mint: "#FDF8F0",
        sage: "#F6DEBB",
        meadow: "#D97D29",
        forest: {
          DEFAULT: "#2B1810",
          50: "#FDF8F0",
          100: "#F6DEBB",
          700: "#5A3827",
          800: "#3D2418",
          900: "#2B1810",
          950: "#180D08",
        },
        amoled: "#000000",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
