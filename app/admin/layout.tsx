"use client"

import { useAuth } from "@/app/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login")
        }
        // Add admin role check here if needed
        // if (user && !user.isAdmin) {
        //   router.push("/")
        // }
    }, [isAuthenticated, user, router])

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B761]"></div>
            </div>
        )
    }

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm border-r border-gray-200">
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg grofast-gradient flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <div>
                            <div className="font-bold text-lg grofast-text-gradient">GroFast</div>
                            <div className="text-xs text-gray-500 -mt-1">Admin Panel</div>
                        </div>
                    </Link>
                </div>

                <nav className="px-4 pb-4">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-[#00B761] transition-colors"
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="px-3 py-2 text-sm text-gray-600">
                                {user?.name || user?.email || "Admin User"}
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}