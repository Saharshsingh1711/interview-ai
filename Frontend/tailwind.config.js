/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Keep preflight disabled to avoid reset conflicts with existing premium Sass styles
  },
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "#a855f7",
        background: "#050505",
        foreground: "#f4f4f5",
        primary: {
          DEFAULT: "#a855f7", // Purple/pink theme color
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#111111",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
}
