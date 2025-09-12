'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <div className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
        {children}
      </div>
    </ChakraProvider>
  )
}