import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        typing: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        'typing1': 'typing 1s ease-in-out infinite',
        'typing2': 'typing 1s ease-in-out 0.3s infinite',
        'typing3': 'typing 1s ease-in-out 0.6s infinite'
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
      {
        zineb: {
          "primary": "#fda4af",
          "base-200": "#ffe4e6",
          "base-100": "#fecdd3",
        }
      }, {
        adam: {
          "primary": "#9333ea",
          "base-100": "#1c1917",
          "base-200": "#121212",
        }
      },
      {
        love: {
          "primary": "#E94057",     // Rouge vif chaleureux
          "base-100": "#FFF0F3",    // Rose très pâle pour le fond
          "base-200": "#FFE4E8",    // Rose légèrement plus foncé pour les éléments
          "primary-content": "#FFFFFF", // Texte blanc sur le rouge primaire
          "base-content": "#4A4A4A"    // Texte gris foncé pour la lisibilité
        }
      }
    ],
  },
};