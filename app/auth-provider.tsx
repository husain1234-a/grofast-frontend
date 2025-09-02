"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useAuthInternal } from "@/hooks/use-auth"

type AuthContextType = ReturnType<typeof useAuthInternal>

const AuthContext = createContext<AuthContextType | null>(null)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthInternal()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
