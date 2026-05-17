export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        graphite: "#536176",
        line: "#dde5ef",
        mist: "#f4f7fb",
        brand: "#1769e0",
        cyanx: "#16b8c5",
        success: "#16a34a",
        warning: "#d99a10",
        danger: "#dc2626"
      },
      boxShadow: {
        glow: "0 24px 70px rgba(23, 105, 224, 0.14)",
        panel: "0 12px 38px rgba(23, 32, 51, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
