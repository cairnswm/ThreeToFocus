import Color from "color";

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

function mixColors(color1, color2, weight) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const w1 = weight / 100;
  const w2 = 1 - w1;

  const mixed = rgb1.map((c1, i) => Math.round(c1 * w1 + rgb2[i] * w2));
  return rgbToHex(mixed);
}

function tintColor(baseColor, weight) {
  return mixColors('#ffffff', baseColor, weight);
}

function shadeColor(baseColor, weight) {
  return mixColors('#000000', baseColor, weight);
}

/** @type {import('tailwindcss').Config} */
const generateShades = (baseColor) => ({
  DEFAULT: baseColor,
  50: tintColor(baseColor, 95),
  100: tintColor(baseColor, 80),
  400: Color(baseColor).lighten(0.2).hex(),
  500: baseColor,
  600: Color(baseColor).darken(0.2).hex(),
  800: Color(baseColor).darken(0.5).hex(),
});

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    ...[
      "primary",
      "secondary",
      "danger",
      "success",
      "warning",
      "info",
      "light",
      "dark",
    ].flatMap((v) => [
      `btn-${v}`,
      `btn-outline-${v}`,
      `alert-${v}`,
      `badge-${v}`,
      `text-${v}`,
      `bg-${v}`,
      `bg-${v}-50`,
      `bg-${v}-100`,
      `bg-${v}-800`,
      `hover:bg-${v}-800`,
    ]),
    { pattern: /^col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/ },
    { pattern: /^sm:col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/ },
    { pattern: /^md:col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/ },
    { pattern: /^lg:col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/ },
    { pattern: /^xl:col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/ },
  ],
  theme: {
    fontFamily: {
      sans: [
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
    extend: {
      backgroundColor: (theme) => {
        const colors = {};
        [
          "primary",
          "secondary",
          "danger",
          "success",
          "warning",
          "info",
          "light",
          "dark",
        ].forEach((variant) => {
          colors[`${variant}-100`] = theme(`colors.${variant}.100`);
          colors[`${variant}-800`] = theme(`colors.${variant}.800`);
        });
        return colors;
      },
      colors: {
        primary: generateShades("#0d6efd"),
        secondary: generateShades("#6c757d"),
        success: generateShades("#198754"),
        info: generateShades("#0dcaf0"),
        warning: generateShades("#ffc107"),
        danger: generateShades("#dc3545"),
        light: generateShades("#f8f9fa"),
        dark: generateShades("#212529"),
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.dark.500"),
            a: {
              color: theme("colors.primary.500"),
              textDecoration: "underline",
            },
            h1: { fontWeight: "500" },
            h2: { fontWeight: "500" },
            h3: { fontWeight: "500" },
            strong: { fontWeight: "600" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
