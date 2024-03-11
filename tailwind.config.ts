import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#FF7A00",
          secondary: "#323232",
          accent: "#FF5714",
          neutral: "#B8B8B8",
          "base-100": "#F0F0F0",
          info: "#17A2B8",
          success: "#28A745",
          warning: "#FFC107",
          error: "#DC3545",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
export default config;
