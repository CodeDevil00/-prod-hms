/** @type {import('tailwindcss').Config} */
export default {
  // 'content' tells Tailwind which files to scan for class names.
  // At build time, Tailwind reads every file listed here,
  // finds every className="..." used, and ONLY includes those
  // CSS classes in the final bundle. Unused classes are removed.
  // This keeps your CSS tiny in production.
  content: [
    './index.html',
    './src/**/*.{js,jsx}',  // every .js and .jsx file inside src/
  ],

  theme: {
    extend: {
      // You can add custom colours, fonts, sizes here.
      // 'extend' means you ADD to Tailwind's defaults, not replace them.
      colors: {
        primary: {
          50:  '#EEEDFE',
          100: '#CECBF6',
          500: '#7F77DD',
          600: '#534AB7',
          700: '#3C3489',
          900: '#26215C',
        },
        brand: {
          teal:  '#085041',
          amber: '#633806',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
}
