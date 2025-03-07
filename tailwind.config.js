/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              "--tw-prose-links": "var(--color-blue-700)",
              color: "var(--color-blue-700)",
            },
            "--tw-prose-links": "var(--color-blue-700)",
            "--tw-prose-active-links": "var(--color-blue-500)",
            code: {
              fontWeight: "400",
            },
            // These code before/after elements are hard coded to remove the backticks, "`", that are in by default.
            "code::before": {
              content: "",
            },
            "code::after": {
              content: "",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            li: {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
            "li > p, dd > p, header > p, footer > p": {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
            // Tailwind doesn't style h5 or h6 at all so this makes them look like headers
            "h5, h6": {
              color: "var(--tw-prose-headings)",
              fontWeight: "500",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
