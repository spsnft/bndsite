import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
// 1. Импортируем шрифт Inter
import { Inter } from "next/font/google"

// 2. Настраиваем шрифт
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Эта переменная связывает шрифт с Tailwind
  display: "swap",
})

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
  const logoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_128,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    // 3. Добавляем переменную шрифта в класс <html>
    <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preload" href={logoUrl} as="image" />
      </head>
      {/* 4. Добавляем font-sans, чтобы Tailwind применил Inter ко всему body */}
      <body className="font-sans min-h-screen bg-[#193D2E] text-white antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  )
}
