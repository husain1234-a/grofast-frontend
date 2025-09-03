"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { api } from "@/lib/api-client"
import {
  getSecureToken,
  setSecureToken,
  clearSecureTokens,
  hasValidToken
} from "@/lib/secure-storage"
import { SessionManager } from "@/lib/auth-security"
import { logger } from "@/lib/logger"
import { signInWithGoogle, signOut as firebaseSignOut } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export type UserProfile = {
  id: number
  firebase_uid?: string
  email?: string
  name?: string
  phone?: string
  address?: string
}

export function useAuthInternal() {
  const [token, setToken] = useState<string | undefined>(() => getSecureToken())
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
    token ? "/auth/me" : null,
    () => api.me() as Promise<UserProfile>,
    {
      revalidateOnFocus: false,
      onError: (error) => {
        logger.error('Failed to fetch user profile', error)
        // If auth fails, clear tokens
        if (error?.status === 401) {
          clearSecureTokens()
          setToken(undefined)
        }
      }
    },
  )

  // Initialize session management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      SessionManager.initializeSession()
    }
  }, [])

  // Listen for token changes
  useEffect(() => {
    function onTokenChange(e: CustomEvent) {
      const { action, hasToken } = e.detail
      logger.debug('Token change detected', { action, hasToken })

      if (action === 'set' && hasToken) {
        setToken(getSecureToken())
        mutate()
      } else if (action === 'clear') {
        setToken(undefined)
        mutate(null, { revalidate: false })
      }
    }

    // Listen for custom token change events
    window.addEventListener('tokenChanged', onTokenChange as EventListener)

    // Also listen for storage events (cross-tab synchronization)
    function onStorage(e: StorageEvent) {
      if (e.key?.includes('grofast_auth_token')) {
        const newToken = getSecureToken()
        setToken(newToken)
        if (newToken) {
          mutate()
        } else {
          mutate(null, { revalidate: false })
        }
      }
    }
    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener('tokenChanged', onTokenChange as EventListener)
      window.removeEventListener("storage", onStorage)
    }
  }, [mutate])

  const loginWithToken = async (firebaseToken: string) => {
    try {
      logger.info('Logging in with Firebase token')

      // Store token securely
      setSecureToken(firebaseToken)
      setToken(firebaseToken)

      // Initialize session
      SessionManager.updateActivity()

      // Fetch user profile
      await mutate()

      logger.info('Login successful')
    } catch (error) {
      logger.error('Login failed', error)
      // Clear tokens on login failure
      clearSecureTokens()
      setToken(undefined)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      logger.info('Starting Google authentication')

      const result = await signInWithGoogle()
      const { idToken } = result

      // Call the correct backend Google login endpoint
      const response = await api.googleLogin({ google_id_token: idToken })

      // Store the Firebase token for future API calls
      setSecureToken(idToken)
      setToken(idToken)

      // Initialize session
      SessionManager.updateActivity()

      // Fetch user profile
      await mutate()

      logger.info('Google login successful', { userId: response.id })

      toast({
        variant: "success",
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      })

      return result
    } catch (error: any) {
      logger.error('Google authentication failed', error)

      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
      })

      throw error
    }
  }

  const logout = async () => {
    try {
      logger.info('Logging out user')

      // Call backend logout endpoint if we have a token
      if (token) {
        try {
          await api.logout(token)
          logger.info('Backend logout successful')
        } catch (error) {
          logger.warn('Backend logout failed, continuing with local logout', error)
        }
      }

      // Sign out from Firebase
      await firebaseSignOut()

      // Clear all secure storage
      clearSecureTokens()
      setToken(undefined)

      // Clear user data
      mutate(null, { revalidate: false })

      logger.info('Logout completed')

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      logger.error('Logout failed', error)

      // Force logout even if Firebase signout fails
      clearSecureTokens()
      setToken(undefined)
      mutate(null, { revalidate: false })

      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "There was an issue signing out, but you have been logged out locally.",
      })
    }
  }

  // Check if user is authenticated
  const isAuthenticated = Boolean(token && data)

  // Check if token is valid
  const hasValidAuth = hasValidToken()

  return {
    token,
    user: data ?? null,
    isLoading,
    error,
    isAuthenticated,
    hasValidAuth,
    loginWithToken,
    loginWithGoogle,
    logout,
    refetch: mutate,
  }
}
