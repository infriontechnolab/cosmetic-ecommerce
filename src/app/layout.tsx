import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk, Geist } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
})

export const metadata: Metadata = {
  title: 'MAISON — Luxury Beauty',
  description: 'Science-backed formulas. Expert-curated edits. 2000+ luxury brands.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(jakarta.variable, grotesk.variable, "font-sans", geist.variable)}>
      <body className="font-sans bg-void text-chalk">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
