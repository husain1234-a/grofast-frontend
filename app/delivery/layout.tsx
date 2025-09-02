import type React from "react"

import Providers from "@/app/providers"
import ClientLayout from "@/app/ClientLayout"

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ClientLayout>{children}</ClientLayout>
    </Providers>
  )
}
