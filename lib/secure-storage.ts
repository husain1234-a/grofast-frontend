import { logger } from './logger'

// Secure token storage with encryption and expiration
const TOKEN_KEY = 'grofast_auth_token'
const TOKEN_EXPIRY_KEY = 'grofast_auth_token_expiry'
const REFRESH_TOKEN_KEY = 'grofast_refresh_token'

// Token expiration time (24 hours)
const TOKEN_EXPIRY_HOURS = 24

interface TokenData {
    token: string
    expiresAt: number
    refreshToken?: string
}

// Simple encryption/decryption (in production, use a proper encryption library)
function encryptToken(token: string): string {
    if (typeof window === 'undefined') return token

    try {
        // Simple base64 encoding with timestamp (not secure for production)
        // In production, use proper encryption like crypto-js
        const data = {
            token,
            timestamp: Date.now()
        }
        return btoa(JSON.stringify(data))
    } catch (error) {
        logger.error('Failed to encrypt token', error)
        return token
    }
}

function decryptToken(encryptedToken: string): string | null {
    if (typeof window === 'undefined') return null

    try {
        const data = JSON.parse(atob(encryptedToken))
        return data.token
    } catch (error) {
        logger.error('Failed to decrypt token', error)
        return null
    }
}

export function setSecureToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return

    try {
        const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        const encryptedToken = encryptToken(token)

        localStorage.setItem(TOKEN_KEY, encryptedToken)
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())

        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, encryptToken(refreshToken))
        }

        // Dispatch custom event for cross-component synchronization
        window.dispatchEvent(new CustomEvent('tokenChanged', {
            detail: { action: 'set', hasToken: true }
        }))

        logger.debug('Token stored securely')
    } catch (error) {
        logger.error('Failed to store token securely', error)
    }
}

export function getSecureToken(): string | undefined {
    if (typeof window === 'undefined') return undefined

    try {
        const encryptedToken = localStorage.getItem(TOKEN_KEY)
        const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)

        if (!encryptedToken || !expiryStr) {
            return undefined
        }

        const expiresAt = parseInt(expiryStr, 10)
        const now = Date.now()

        // Check if token is expired
        if (now >= expiresAt) {
            logger.debug('Token expired, clearing storage')
            clearSecureTokens()
            return undefined
        }

        const token = decryptToken(encryptedToken)
        return token || undefined
    } catch (error) {
        logger.error('Failed to retrieve secure token', error)
        clearSecureTokens()
        return undefined
    }
}

export function getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined

    try {
        const encryptedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!encryptedRefreshToken) return undefined

        return decryptToken(encryptedRefreshToken) || undefined
    } catch (error) {
        logger.error('Failed to retrieve refresh token', error)
        return undefined
    }
}

export function clearSecureTokens(): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)

        // Dispatch custom event for cross-component synchronization
        window.dispatchEvent(new CustomEvent('tokenChanged', {
            detail: { action: 'clear', hasToken: false }
        }))

        logger.debug('Tokens cleared from secure storage')
    } catch (error) {
        logger.error('Failed to clear secure tokens', error)
    }
}

export function hasValidToken(): boolean {
    if (typeof window === 'undefined') return false

    try {
        const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
        if (!expiryStr) return false

        const expiresAt = parseInt(expiryStr, 10)
        const now = Date.now()

        return now < expiresAt && !!getSecureToken()
    } catch (error) {
        logger.error('Failed to check token validity', error)
        return false
    }
}

export function getTokenExpiryTime(): number | null {
    if (typeof window === 'undefined') return null

    try {
        const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
        return expiryStr ? parseInt(expiryStr, 10) : null
    } catch (error) {
        logger.error('Failed to get token expiry time', error)
        return null
    }
}

export function refreshTokenIfNeeded(): boolean {
    if (typeof window === 'undefined') return false

    try {
        const expiryTime = getTokenExpiryTime()
        if (!expiryTime) return false

        const now = Date.now()
        const timeUntilExpiry = expiryTime - now
        const refreshThreshold = 2 * 60 * 60 * 1000 // 2 hours

        // If token expires in less than 2 hours, it needs refresh
        return timeUntilExpiry < refreshThreshold
    } catch (error) {
        logger.error('Failed to check if token needs refresh', error)
        return false
    }
}

export function tokenWillExpireSoon(): boolean {
    return refreshTokenIfNeeded()
}