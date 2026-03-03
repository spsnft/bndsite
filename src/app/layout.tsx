import "@/styles/globals.css"

export const metadata = {
  title: {
    default: "BND Delivery",
    template: "%s - BND Delivery",
  },
  description: "Skateshop and Gear",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
