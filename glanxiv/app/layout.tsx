// app/layout.tsx
import type { Metadata } from 'next'
import { ThemeProvider } from './ThemeProvider'

export const metadata: Metadata = {
  title: 'glanxiv | arXiv modernised',
  description: 'A modern interface for browsing arXiv papers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}