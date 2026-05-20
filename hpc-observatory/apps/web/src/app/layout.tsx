import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { DemoBanner } from '@/components/DemoBanner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Safe Vercel Deploys via MCP with Grok • Live Demo',
  description: 'Professional live demonstration for the Vercel deployment skill with Grok. This site is deployed on Vercel and serves as the Documentation URL for the companion Agensi skill.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-slate-100">
        <DemoBanner />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
