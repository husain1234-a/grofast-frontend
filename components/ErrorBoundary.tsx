"use client"

import React from 'react'
import { logger } from '@/lib/logger'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error('React Error Boundary caught an error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        })

        this.setState({
            error,
            errorInfo,
        })
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return <FallbackComponent error={this.state.error!} retry={this.retry} />
            }

            return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
        }

        return this.props.children
    }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>

                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h1>

                <p className="text-gray-600 mb-6">
                    We're sorry, but something unexpected happened. Our team has been notified.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                            Error Details (Development Only)
                        </summary>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                            {error.message}
                            {error.stack}
                        </pre>
                    </details>
                )}

                <div className="space-y-3">
                    <button
                        onClick={retry}
                        className="w-full flex items-center justify-center gap-2 bg-[#00B761] text-white px-4 py-2 rounded-lg hover:bg-[#009954] transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ErrorBoundary