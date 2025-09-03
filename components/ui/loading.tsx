import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    }

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-gray-300 border-t-[#00B761]",
                sizeClasses[size],
                className
            )}
        />
    )
}

export function LoadingCard() {
    return (
        <div className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
    )
}

export function LoadingProductGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <LoadingCard key={i} />
            ))}
        </div>
    )
}

export function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    )
}