import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-montserrat',
})

export const viewport: Viewport = {
  themeColor: "#193D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://bnd.delivery"),
  title: "BND Delivery | Phuket",
  description: "Premium Delivery Service in Phuket",
  openGraph: {
    title: "BND Delivery | Phuket",
    description: "Premium Delivery Service in Phuket",
    url: "https://bnd.delivery",
    siteName: "BND Delivery",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BND Delivery Phuket",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BND Delivery | Phuket",
    description: "Premium Delivery Service in Phuket",
    images: ["/og-image.png"],
  },
  other: {
    "dns-prefetch": "https://res.cloudinary.com",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${montserrat.variable}`} style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans min-h-screen bg-[#193D2E] text-white antialiased selection:bg-emerald-500/30">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
