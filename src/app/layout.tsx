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
  // Прямая ссылка на логотип для предзагрузки
  const logoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_128,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* Устанавливаем соединение с сервером картинок заранее */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Предзагружаем логотип, чтобы он не ждал очереди */}
        <link rel="preload" href={logoUrl} as="image" />
      </head>
      <body className="min-h-screen bg-[#193D2E] text-white antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  )
}
