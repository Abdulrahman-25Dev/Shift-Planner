/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global screen backgrounds (all modes)
        screen: {
          light: "#F2F2F2", // slate-200
          dark: "#1E293B", // slate-800
        },
        // Dev Mode
        dev: {
          header: "#07191E", // Deep Onyx
          accent: "#02F5A1", // Medium Spring Green
          accentSoft: "#E0FBF2", // Light Spring Green tint
          dark: {
            card: "#13252C", // Dark Slate / Onyx
            interactive: "#02F5A1", // Vibrant Spring Green
            accentSoft: "#12312E", // Dark Spring Green tint
          },
        },
        // Study Mode
        study: {
          header: "#240A30", // Blacklist Purple
          accent: "#FFDCEF", // Transparent Pink
          accentSoft: "#FFF1F8", // Light Pink tint
          dark: {
            card: "#1D0B29", // Deep Dark Purple
            interactive: "#FFCBE7", // Light Pink / Lavender
            accentSoft: "#2B103A", // Dark Purple tint
          },
        },
        // Faith Mode
        faith: {
          header: "#003152", // Prestige Mauve / Navy
          accent: "#ADDFF1", // Gabriella Soft Blue
          accentSoft: "#EAF6FB", // Light Blue tint
          dark: {
            card: "#003152", // Deep Navy
            interactive: "#ADDFF1", // Soft Blue
            accentSoft: "#0C3A58", // Dark Navy tint
          },
        },
      },
    },
  },
  darkMode: "class",
};