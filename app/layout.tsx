import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import Providers from "./providers"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Toaster } from "@/components/Toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "GroFast - Groceries delivered in minutes",
    template: "%s | GroFast"
  },
  description: "GroFast delivers fresh groceries to your doorstep in minutes. Order from thousands of products including fruits, vegetables, dairy, snacks and more.",
  keywords: ["grocery delivery", "online grocery", "fresh groceries", "grofast", "instant delivery", "vegetables", "fruits"],
  authors: [{ name: "GroFast Team" }],
  creator: "GroFast",
  publisher: "GroFast",
  metadataBase: new URL('https://grofast.com'),
  openGraph: {
    title: "GroFast - Groceries delivered in minutes",
    description: "Order fresh groceries online and get them delivered to your doorstep in minutes.",
    type: "website",
    locale: "en_US",
    siteName: "GroFast"
  },
  twitter: {
    card: "summary_large_image",
    title: "GroFast - Groceries delivered in minutes",
    description: "Order fresh groceries online and get them delivered to your doorstep in minutes."
  },
  robots: {
    index: true,
    follow: true
  },
  generator: 'Next.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#00B761" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GroFast" />
      </head>
      <body className={`${inter.className} touch-manipulation tap-highlight-transparent`}>
        <ErrorBoundary>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
