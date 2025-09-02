import type React from "react"

import Providers from "@/app/providers"
import ClientLayout from "@/app/layout.client"

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ClientLayout>{children}</ClientLayout>
    </Providers>
  )
}
