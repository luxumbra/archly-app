/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        yore: {
          primary: '#8B9A47', // Green from logo
          secondary: '#7A8EC4', // Blue-gray from design
          dark: '#2D3748',
          light: '#F7FAFC',
          explore: '#7B8C55',
          log: '#786556', 
          social: '#B7613B',
          discover: '#5C7E9B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}