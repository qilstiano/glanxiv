// theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        gray: {
          50: { value: "#fafafa" },
          100: { value: "#f4f4f5" },
          200: { value: "#e4e4e7" },
          300: { value: "#d4d4d8" },
          400: { value: "#a1a1aa" },
          500: { value: "#71717a" },
          600: { value: "#52525b" },
          700: { value: "#3f3f46" },
          800: { value: "#27272a" },
          900: { value: "#18181b" },
        },
        orange: {
          50: { value: "#fff7ed" },
          100: { value: "#ffedd5" },
          200: { value: "#fed7aa" },
          300: { value: "#fdba74" },
          400: { value: "#fb923c" },
          500: { value: "#f97316" },
          600: { value: "#ea580c" },
          700: { value: "#c2410c" },
          800: { value: "#9a3412" },
          900: { value: "#7c2d12" },
        },
      },
      fonts: {
        body: { value: "var(--font-geist)" },
        heading: { value: "var(--font-geist)" },
        mono: { value: "var(--font-geist-mono)" },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          50: { value: "{colors.orange.50}" },
          100: { value: "{colors.orange.100}" },
          200: { value: "{colors.orange.200}" },
          300: { value: "{colors.orange.300}" },
          400: { value: "{colors.orange.400}" },
          500: { value: "{colors.orange.500}" },
          600: { value: "{colors.orange.600}" },
          700: { value: "{colors.orange.700}" },
          800: { value: "{colors.orange.800}" },
          900: { value: "{colors.orange.900}" },
        },
      },
    },
  },
})
