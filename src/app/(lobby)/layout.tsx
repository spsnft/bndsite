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
  title: {
    default: "BND Delivery",
    template: "%s - BND Delivery",
  },
  description: "Premium Delivery Service",
  // Добавляем preconnect для ускорения загрузки картинок
  other: {
    "dns-prefetch": "https://res.cloudinary.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.bnd.delivery",
    title: "BND Delivery",
    description: "Premium Delivery Service",
    siteName: "BND Delivery",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "BND Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BND Delivery",
    description: "Premium Delivery Service",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Лучше использовать стандартное имя для Apple
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* Ручной коннект к Cloudinary для максимальной скорости */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen bg-[#193D2E] text-white antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  )
}
