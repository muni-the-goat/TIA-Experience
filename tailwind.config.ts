import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── TIA Brand Palette (TIA_LOGO_GUIDELINES V1.0) ──
        gold: {
          DEFAULT: "#D6A63A", // TIA Gold — primary brand color
          1: "#D6A63A",
          2: "#DCB55F",
          3: "#E2C384",
          4: "#E7D2A9",
          5: "#EDE1CE",
        },
        brown: {
          DEFAULT: "#876C51",
          1: "#876C51",
          2: "#755E50",
          3: "#775134",
          4: "#7D654D",
          5: "#917654",
        },
        teal: {
          DEFAULT: "#093B3F", // Teal Dark — default text / dark sections
          1: "#093B3F",
          2: "#3C6669",
          3: "#6F9293",
          4: "#A1BDBE",
          5: "#D4E8E8",
        },
        sand: {
          1: "#CABBA3",
          2: "#D5CAB8",
          3: "#E1D9CC",
          4: "#ECE7E1",
          5: "#F7F6F5",
        },
        ink: "#093B3F",
        offwhite: "#F8F8F9",
      },
      fontFamily: {
        display: ['"Titillium Web"', "system-ui", "sans-serif"],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Inter"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        ultra: "0.4em",
        mega: "0.6em",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        spinslow: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        spinslow: "spinslow 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
