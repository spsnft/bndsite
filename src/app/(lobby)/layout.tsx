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
  // Базовые метаданные наследуются из корневого layout, здесь пишем только дополнения
  title: {
    default: "BND Delivery",
    template: "%s - BND Delivery",
  },
  description: "Premium Delivery Service",
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
    apple: "/apple-touch-icon.png",
  },
}

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
  return (
    // Здесь не нужно снова оборачивать в <html> и <body>, так как это вложенный layout. 
    // Оставляем только контент.
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  )
}
