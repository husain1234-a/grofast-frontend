"use client"

import Link from "next/link"
import { useCart } from "@/hooks/use-api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { Search, ShoppingCart, User, Phone } from "lucide-react"
import LocationSelector from "./LocationSelector"
import { useLocation } from "@/hooks/use-location"

export function Header() {
  const { data: cart } = useCart()
  const [q, setQ] = useState("")
  const router = useRouter()
  const { user, logout, token } = useAuth()
  const { location, setLocation } = useLocation()

  return (
    <header className="w-full bg-white sticky top-0 z-50 grofast-shadow">
      {/* Top bar with location */}
      <div className="bg-[#00B761] text-white px-4 py-1">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs">
          <LocationSelector
            currentLocation={location}
            onLocationChange={setLocation}
          />
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="tel:+918001234567"
              className="flex items-center gap-1 hover:underline transition-colors"
              aria-label="Call customer care"
            >
              <Phone className="h-3 w-3" />
              <span>Customer Care: 1800-123-4567</span>
            </a>
            <span>⏰ Delivery in 10-15 mins</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-10 w-10 rounded-xl grofast-gradient flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-xl grofast-text-gradient">GroFast</div>
            <div className="text-xs text-gray-500 -mt-1">groceries in minutes</div>
          </div>
        </Link>

        {/* Search bar */}
        <form
          className="flex-1 max-w-lg mx-4"
          onSubmit={(e) => {
            e.preventDefault()
            const term = q.trim()
            if (term.length >= 2) router.push(`/search?q=${encodeURIComponent(term)}`)
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for fruits, vegetables, snacks..."
              className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-sm focus:border-[#00B761] focus:outline-none transition-colors"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile phone number */}
          <a
            href="tel:+918001234567"
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#00B761] text-white hover:bg-[#009653] transition-colors"
            aria-label="Call customer care"
          >
            <Phone className="h-4 w-4" />
          </a>

          {!token ? (
            <Link
              href="/auth/login"
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#00B761] transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/profile"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#00B761] transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Profile"}
                </span>
              </Link>
              <Link
                href="/delivery/partner"
                className="hidden sm:inline text-sm text-gray-700 hover:text-[#00B761] transition-colors"
              >
                Partner
              </Link>
              <Link
                href="/admin"
                className="hidden sm:inline text-sm text-gray-700 hover:text-[#00B761] transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline text-sm text-gray-700 hover:text-[#00B761] transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {/* Cart button */}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 grofast-gradient text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity grofast-shadow"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cart?.total_items && cart.total_items > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F8CB46] text-[#1A1A1A] px-1 text-xs font-bold animate-bounce-subtle">
                {cart.total_items}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
