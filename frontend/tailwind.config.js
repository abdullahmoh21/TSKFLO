/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        background: "moveBackground 20s infinite linear",
      },
      keyframes: {
        moveBackground: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      },
    },
  },
  plugins: [],
};
