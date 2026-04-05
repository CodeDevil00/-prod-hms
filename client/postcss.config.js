// PostCSS is a tool that transforms CSS using plugins.
// Tailwind itself is a PostCSS plugin — it reads your HTML/JSX,
// generates the CSS classes you used, and PostCSS processes it.
// autoprefixer adds browser-specific prefixes like -webkit- automatically.
export default {
  plugins: {
    tailwindcss:  {},
    autoprefixer: {},
  },
}
