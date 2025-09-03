import { logger } from './logger'
import { clearSecureTokens, hasValidToken } from './secure-storage'

// Session management and security features
export class SessionManager {
    private static readonly ACTIVITY_KEY = 'grofast_last_activity'
    private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
    private static readonly WARNING_THRESHOLD = 5 * 60 * 1000 // 5 minutes before timeout

    private static activityTimer: NodeJS.Timeout | null = null
    private static warningTimer: NodeJS.Timeout | null = null

    static initializeSession(): void {
        if (typeof window === 'undefined') return

        // Check for existing session
        this.checkSessionValidity()

        // Set up activity tracking
        this.setupActivityTracking()

        // Set up periodic session checks
        this.setupSessionMonitoring()

        logger.debug('Session manager initialized')
    }

    static updateActivity(): void {
        if (typeof window === 'undefined') return

        const now = Date.now()
        localStorage.setItem(this.ACTIVITY_KEY, now.toString())

        // Reset timers
        this.resetTimers()
        this.setupSessionTimeout()
    }

    private static checkSessionValidity(): void {
        if (!hasValidToken()) return

        const lastActivity = localStorage.getItem(this.ACTIVITY_KEY)
        if (!lastActivity) {
            this.updateActivity()
            return
        }

        const lastActivityTime = parseInt(lastActivity, 10)
        const now = Date.now()
        const timeSinceActivity = now - lastActivityTime

        if (timeSinceActivity > this.SESSION_TIMEOUT) {
            logger.info('Session expired due to inactivity')
            this.expireSession()
        } else {
            this.setupSessionTimeout()
        }
    }

    private static setupActivityTracking(): void {
        if (typeof window === 'undefined') return

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        const activityHandler = () => {
            this.updateActivity()
        }

        events.forEach(event => {
            document.addEventListener(event, activityHandler, { passive: true })
        })

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateActivity()
            }
        })
    }

    private static setupSessionTimeout(): void {
        this.resetTimers()

        // Set warning timer
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning()
        }, this.SESSION_TIMEOUT - this.WARNING_THRESHOLD)

        // Set expiry timer
        this.activityTimer = setTimeout(() => {
            this.expireSession()
        }, this.SESSION_TIMEOUT)
    }

    private static setupSessionMonitoring(): void {
        // Check session validity every minute
        setInterval(() => {
            this.checkSessionValidity()
        }, 60 * 1000)
    }

    private static resetTimers(): void {
        if (this.activityTimer) {
            clearTimeout(this.activityTimer)
            this.activityTimer = null
        }

        if (this.warningTimer) {
            clearTimeout(this.warningTimer)
            this.warningTimer = null
        }
    }

    private static showSessionWarning(): void {
        logger.info('Session warning: session will expire soon')

        // Dispatch custom event for UI components to handle
        window.dispatchEvent(new CustomEvent('sessionWarning', {
            detail: {
                timeRemaining: this.WARNING_THRESHOLD,
                message: 'Your session will expire in 5 minutes due to inactivity.'
            }
        }))
    }

    private static expireSession(): void {
        logger.info('Session expired')

        clearSecureTokens()

        // Dispatch custom event for UI components to handle
        window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: {
                reason: 'inactivity',
                message: 'Your session has expired due to inactivity. Please sign in again.'
            }
        }))

        // Redirect to login if not already there
        if (!window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login'
        }
    }

    static extendSession(): void {
        logger.info('Session extended by user action')
        this.updateActivity()
    }

    static terminateSession(): void {
        logger.info('Session terminated by user')
        this.resetTimers()
        clearSecureTokens()
    }
}

// Security utilities
export class SecurityUtils {
    // Detect suspicious activity patterns
    static detectSuspiciousActivity(): boolean {
        if (typeof window === 'undefined') return false

        try {
            // Check for multiple rapid login attempts
            const loginAttempts = this.getLoginAttempts()
            if (loginAttempts.length > 5) {
                const recentAttempts = loginAttempts.filter(
                    attempt => Date.now() - attempt < 15 * 60 * 1000 // 15 minutes
                )

                if (recentAttempts.length > 3) {
                    logger.warn('Suspicious activity detected: multiple rapid login attempts')
                    return true
                }
            }

            // Check for unusual user agent changes
            const storedUserAgent = localStorage.getItem('grofast_user_agent')
            const currentUserAgent = navigator.userAgent

            if (storedUserAgent && storedUserAgent !== currentUserAgent) {
                logger.warn('Suspicious activity detected: user agent change')
                return true
            }

            return false
        } catch (error) {
            logger.error('Failed to detect suspicious activity', error)
            return false
        }
    }

    private static getLoginAttempts(): number[] {
        try {
            const attempts = localStorage.getItem('grofast_login_attempts')
            return attempts ? JSON.parse(attempts) : []
        } catch {
            return []
        }
    }

    static recordLoginAttempt(): void {
        try {
            const attempts = this.getLoginAttempts()
            attempts.push(Date.now())

            // Keep only last 10 attempts
            const recentAttempts = attempts.slice(-10)
            localStorage.setItem('grofast_login_attempts', JSON.stringify(recentAttempts))

            // Store user agent for security checks
            localStorage.setItem('grofast_user_agent', navigator.userAgent)
        } catch (error) {
            logger.error('Failed to record login attempt', error)
        }
    }

    static clearSecurityData(): void {
        try {
            localStorage.removeItem('grofast_login_attempts')
            localStorage.removeItem('grofast_user_agent')
            localStorage.removeItem('grofast_last_activity')
        } catch (error) {
            logger.error('Failed to clear security data', error)
        }
    }

    // Validate token format (basic validation)
    static isValidTokenFormat(token: string): boolean {
        if (!token || typeof token !== 'string') return false

        // Basic JWT format check (header.payload.signature)
        const parts = token.split('.')
        if (parts.length !== 3) return false

        try {
            // Try to decode the header and payload
            atob(parts[0])
            atob(parts[1])
            return true
        } catch {
            return false
        }
    }
}

// Additional security utilities
export class SecurityHeaders {
    static getHeaders(): Record<string, string> {
        return {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Version': '1.0.0',
            'X-Timestamp': Date.now().toString(),
        }
    }
}

export class SecurityValidator {
    private static rateLimitStore = new Map<string, number[]>()

    static isSecureContext(): boolean {
        if (typeof window === 'undefined') return true
        return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    }

    static checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now()
        const requests = this.rateLimitStore.get(key) || []

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs)

        if (validRequests.length >= maxRequests) {
            return false
        }

        validRequests.push(now)
        this.rateLimitStore.set(key, validRequests)
        return true
    }

    static isValidJWTStructure(token: string): boolean {
        if (!token || typeof token !== 'string') return false

        const parts = token.split('.')
        if (parts.length !== 3) return false

        try {
            atob(parts[0])
            atob(parts[1])
            return true
        } catch {
            return false
        }
    }
}

export class CSRFProtection {
    private static token: string | null = null

    static getToken(): string {
        if (!this.token) {
            this.token = this.generateToken()
        }
        return this.token
    }

    static clearToken(): void {
        this.token = null
    }

    private static generateToken(): string {
        const array = new Uint8Array(32)
        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(array)
        } else {
            // Fallback for environments without crypto
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256)
            }
        }
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }
}

// Add missing methods to SessionManager
export namespace SessionManagerExtensions {
    export function isSessionValid(): boolean {
        return SessionManager['checkSessionValidity'] ? true : hasValidToken()
    }

    export function clearSession(): void {
        SessionManager['terminateSession']?.()
    }

    export function updateActivity(): void {
        SessionManager.updateActivity()
    }
}

// Extend SessionManager with missing methods
Object.assign(SessionManager, {
    isSessionValid: SessionManagerExtensions.isSessionValid,
    clearSession: SessionManagerExtensions.clearSession,
})

