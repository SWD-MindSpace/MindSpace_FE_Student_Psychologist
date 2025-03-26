import type { Config } from "tailwindcss";
import {heroui} from "@heroui/react"; 

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-blue": "var(--primary-blue)",
        "secondary-blue": "var(--secondary-blue)",
        "white": "var(--white)",
        "black": "var(--black)",
        "bg-gray": "var(--bg-gray)",
        "txt-gray": "var(--txt-gray)",
        "first-color": "var(--first-color)",
        "second-color": "var(--second-color)",
        "third-color": "var(--third-color)",
        "fourth-color": "var(--fourth-color)",
        "fifth-color": "var(--fifth-color)",
      },
      fontFamily: {
        'bevnpro': ['Be Vietnam Pro'], // Big headings
        'noto-sans': ['Noto Sans'], // Text
      },
      screens: {
        sm: "576px",    
        md: "768px",    
        lg: "992px",    
        xl: "1200px",   
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
} satisfies Config;

/*
1. Responsiveness
- Phones (small + large) & Small tablets will have the same layout
- Large tablet will have a separate layout
- Laptop (small + large) & Desktop will have the same layout

Small phones: 0 -> 576 (layout A)
Lare phones + Small tablets: 576 -> 768 (layout A, bigger font sizes and spacing and...)
Large tablets: 768 -> 992 (layout B)
Small laptop: 992 -> 1200 (layout C)
Large laptop + Desktop: > 1200 (layout C + bigger font sizes and spacing and...)

*/