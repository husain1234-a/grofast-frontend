type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
    level: LogLevel
    message: string
    data?: any
    timestamp: string
    url?: string
    userAgent?: string
}

class Logger {
    private isEnabled: boolean
    private logLevel: LogLevel
    private isDevelopment: boolean

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development'
        this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true' || this.isDevelopment
        this.logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info'
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.isEnabled) return false

        const levels: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        }

        return levels[level] >= levels[this.logLevel]
    }

    private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
        return {
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        }
    }

    private async sendToService(entry: LogEntry) {
        // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
        if (!this.isDevelopment && typeof window !== 'undefined') {
            try {
                // Example: Send to your logging service
                // await fetch('/api/logs', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(entry)
                // })
            } catch (error) {
                // Fallback to console if logging service fails
                console.error('Failed to send log to service:', error)
            }
        }
    }

    debug(message: string, data?: any) {
        if (!this.shouldLog('debug')) return

        const entry = this.createLogEntry('debug', message, data)

        if (this.isDevelopment) {
            console.log(`🐛 [DEBUG] ${message}`, data || '')
        }

        this.sendToService(entry)
    }

    info(message: string, data?: any) {
        if (!this.shouldLog('info')) return

        const entry = this.createLogEntry('info', message, data)

        if (this.isDevelopment) {
            console.info(`ℹ️ [INFO] ${message}`, data || '')
        }

        this.sendToService(entry)
    }

    warn(message: string, data?: any) {
        if (!this.shouldLog('warn')) return

        const entry = this.createLogEntry('warn', message, data)

        if (this.isDevelopment) {
            console.warn(`⚠️ [WARN] ${message}`, data || '')
        }

        this.sendToService(entry)
    }

    error(message: string, error?: any) {
        if (!this.shouldLog('error')) return

        const entry = this.createLogEntry('error', message, {
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        })

        if (this.isDevelopment) {
            console.error(`❌ [ERROR] ${message}`, error || '')
        }

        this.sendToService(entry)
    }

    // API specific logging methods
    apiRequest(method: string, url: string, data?: any) {
        this.debug(`API Request: ${method} ${url}`, data)
    }

    apiResponse(method: string, url: string, status: number, data?: any) {
        if (status >= 400) {
            this.error(`API Error: ${method} ${url} - ${status}`, data)
        } else {
            this.debug(`API Response: ${method} ${url} - ${status}`, data)
        }
    }

    userAction(action: string, data?: any) {
        this.info(`User Action: ${action}`, data)
    }
}

export const logger = new Logger()
export default logger