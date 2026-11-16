const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: c("bg"),
        card: c("card"),
        ink: c("ink"),
        mute: c("mute"),
        line: c("line"),
        brand: "#f2c230",
        choc: "#5a2d1e",
        ok: "#2e7d4f",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
