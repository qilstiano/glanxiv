// providers/ThemeProvider.tsx
'use client'

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "@/components/ui/color-mode"

import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <style jsx global>{`
          :root {
            --font-geist: ${geist.style.fontFamily};
            --font-geist-mono: ${geistMono.style.fontFamily};
            --font-instrument-serif: ${instrumentSerif.style.fontFamily};
          }

          .instrument-serif {
            font-family: var(--font-instrument-serif);
          }
        `}</style>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  )
}
