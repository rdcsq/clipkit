import { type Config } from "tailwindcss";
import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        primary: "hsl(var(--color-primary))",
        "on-primary": "hsl(var(--color-on-primary))",
        border: "hsl(var(--color-border))",
        error: "hsl(var(--color-error))",
        "on-error": "hsl(var(--color-on-error))",
        destructive: "hsl(var(--color-destructive))",
        "on-destructive": "hsl(var(--color-on-destructive))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    iconsPlugin({
      collections: getIconCollections(["lucide"]),
    }),
  ],
} satisfies Config;
