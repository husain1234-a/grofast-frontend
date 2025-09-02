"use client"

import type React from "react"
import { SWRConfig } from "swr"
import { swrConfig } from "@/lib/swr"
import AuthProvider from "./auth-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  )
}
