"use client"

import type React from "react"
import { Header } from "@/components/Header"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Example: hide header on certain routes if needed
  const pathname = usePathname()
  const hideHeader = false

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  )
}
