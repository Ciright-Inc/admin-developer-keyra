import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          canvas: "var(--ds-canvas)",
          "canvas-soft": "var(--ds-canvas-soft)",
          card: "var(--ds-surface-card)",
          strong: "var(--ds-surface-strong)",
          dark: "var(--ds-surface-dark)",
          ink: "var(--ds-ink)",
          body: "var(--ds-body)",
          muted: "var(--ds-muted)",
          primary: "var(--ds-primary)",
          link: "var(--ds-text-link)",
          success: "var(--ds-success)",
          error: "var(--ds-error)",
          warning: "var(--ds-warning)",
          hairline: "var(--ds-hairline)",
          "hairline-strong": "var(--ds-hairline-strong)",
        },
        keyra: {
          panel: "var(--keyra-panel)",
          canvas: "var(--keyra-canvas)",
          accent: "var(--keyra-accent)",
          glow: "var(--keyra-glow)",
        },
      },
      borderRadius: {
        "ds-xs": "var(--ds-radius-xs)",
        "ds-sm": "var(--ds-radius-sm)",
        "ds-md": "var(--ds-radius-md)",
        "ds-lg": "var(--ds-radius-lg)",
        "ds-xl": "var(--ds-radius-xl)",
        "ds-pill": "var(--ds-radius-pill)",
      },
      boxShadow: {
        "ds-soft": "var(--ds-shadow-soft)",
        "ds-glow": "var(--ds-shadow-glow)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        accent: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
