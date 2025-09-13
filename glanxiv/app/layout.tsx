// app/layout.tsx
import type { Metadata } from 'next'
import { ThemeProvider } from './ThemeProvider'

export const metadata: Metadata = {
  title: 'glanxiv/library',
  description: 'a modern interface for browsing research papers',
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