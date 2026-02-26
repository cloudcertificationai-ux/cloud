import type { Metadata, Viewport } from 'next'
import './globals.css'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cloud Certification Admin Panel',
  description: 'Administrative dashboard for Cloud Certification',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        {children}
      </body>
    </html>
  )
}