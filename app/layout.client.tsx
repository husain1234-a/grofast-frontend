import type React from "react"
import ActualClientLayout from "./ClientLayout"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ActualClientLayout>{children}</ActualClientLayout>
}

// Optionally expose a named export if any import expects it elsewhere
export { default as ActualClientLayout } from "./ClientLayout"
