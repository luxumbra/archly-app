import type { Config } from "tailwindcss";

const flowbite = require("flowbite-react/tailwind");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content()
  ],
  theme: {
    extend: {
        colors: {
          yore: {
            primary: '#99A873', // Green from logo
            secondary: '#7A8EC4', // Blue-gray from design
            dark: '#1F2732',
            light: '#F7FAFC',
            explore: '#7B8C55',
            log: '#786556',
            social: '#B7613B',
            discover: '#5C7E9B'
          }
        },
        fontFamily: {
          sans: ['Open Sans', 'system-ui', 'sans-serif'],
          serif: ['Playfair Display', 'serif'],
          body: ['Open Sans', 'system-ui', 'sans-serif']
        }
      },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    flowbite.plugin()
  ],
};

export default config;