import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 — My Prediction',
  description: 'Predict the 2026 World Cup and generate your bracket image',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#060b18] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
