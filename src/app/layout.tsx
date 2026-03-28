import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#193D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://app.bnd.delivery"),
  title: "BND Delivery | Phuket",
  description: "Premium Delivery Service in Phuket",
  other: {
    "dns-prefetch": "https://res.cloudinary.com",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen bg-[#193D2E] text-white antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  )
}
