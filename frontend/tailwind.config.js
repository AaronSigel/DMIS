/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        surfaceAlt: "var(--color-surface-alt)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        primarySoft: "var(--color-primary-soft)",
        success: "var(--color-success)",
        successSoft: "var(--color-success-soft)",
        surfaceMuted: "var(--color-surface-muted)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        dangerSoft: "var(--color-danger-soft)",
        white: "var(--color-white)",
        overlay: "var(--color-overlay)",
      },
      boxShadow: {
        modal: "var(--shadow-modal)",
        menu: "var(--shadow-menu)",
      },
    },
  },
  plugins: [],
};
