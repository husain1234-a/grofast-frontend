"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { api, getStoredToken, setStoredToken, clearStoredToken } from "@/lib/api-client"

export type UserProfile = {
  id: number
  firebase_uid?: string
  email?: string
  name?: string
  phone?: string
  address?: string
}

export function useAuthInternal() {
  const [token, setToken] = useState<string | undefined>(() => getStoredToken())
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
    token ? "/auth/me" : null,
    () => api.me() as Promise<UserProfile>,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "firebase_token") {
        setToken(getStoredToken())
        mutate()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [mutate])

  const loginWithToken = async (firebaseToken: string) => {
    setStoredToken(firebaseToken)
    setToken(firebaseToken)
    await mutate()
  }

  const logout = () => {
    clearStoredToken()
    setToken(undefined)
    mutate(null, { revalidate: false })
  }

  return {
    token,
    user: data ?? null,
    isLoading,
    error,
    loginWithToken,
    logout,
    refetch: mutate,
  }
}
