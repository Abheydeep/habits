import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#fff1f8",
        cotton: "#ffe4f1",
        ribbon: "#ff4fa3",
        roseInk: "#51223d",
        sugar: "#fffafd",
        lilac: "#b88cff",
        mint: "#83d8bc",
        lemon: "#ffd76b",
        line: "#f5a6ce"
      },
      boxShadow: {
        sticker: "0 18px 38px rgba(255, 79, 163, 0.22)",
        panel: "0 20px 60px rgba(121, 31, 84, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
