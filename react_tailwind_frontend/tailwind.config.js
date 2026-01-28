/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          secondary: "#F59E0B",
          surface: "#ffffff",
          background: "#f9fafb",
          text: "#111827"
        }
      },
      boxShadow: {
        samsung: "0 10px 30px rgba(17,24,39,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
