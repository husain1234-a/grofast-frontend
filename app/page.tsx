"use client"

import { useCategories, useProducts } from "@/hooks/use-api"
import { CategoryGrid } from "@/components/CategoryGrid"
import { ProductCard } from "@/components/ProductCard"
import { FloatingCart } from "@/components/FloatingCart"
import { Clock, Star, Truck, Shield } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { data: cats } = useCategories()
  const { data: prod } = useProducts({ page: 1, size: 12, sort_by: "popularity", sort_order: "desc" })

  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#E8F5E8] to-[#FFF8DC] relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">
                  India's last minute app
                  <span className="block grofast-text-gradient">GroFast</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  Get groceries, medicines, and essentials delivered to your doorstep in minutes!
                </p>
              </div>
              
              {/* Key features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-[#00B761] flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">10-15 min delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-[#F8CB46] flex items-center justify-center">
                    <Star className="h-4 w-4 text-[#1A1A1A]" />
                  </div>
                  <span className="font-medium text-gray-700">Best prices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-[#00B761] flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Free delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-[#F8CB46] flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#1A1A1A]" />
                  </div>
                  <span className="font-medium text-gray-700">100% quality</span>
                </div>
              </div>
            </div>
            
            {/* Hero image */}
            <div className="relative h-64 md:h-80">
              <Image
                src="/assorted-grocery-products.png"
                alt="Fresh groceries delivered fast"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-[#F8CB46] opacity-20 animate-bounce-subtle"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-[#00B761] opacity-20 animate-bounce-subtle" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Categories Section */}
      {cats?.categories && (
        <section className="bg-white py-6">
          <CategoryGrid categories={cats.categories} />
        </section>
      )}

      {/* Trending Products */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Trending Now</h2>
            <p className="text-sm text-gray-600 mt-1">Most popular items this week</p>
          </div>
          <button className="text-[#00B761] font-medium text-sm hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {prod?.products?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Why Choose GroFast */}
      <section className="bg-white py-12 mt-8">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center text-[#1A1A1A] mb-8">Why choose GroFast?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full grofast-gradient flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-[#1A1A1A]">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Get your groceries delivered in just 10-15 minutes</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-[#F8CB46] flex items-center justify-center">
                <Star className="h-8 w-8 text-[#1A1A1A]" />
              </div>
              <h3 className="font-semibold text-lg text-[#1A1A1A]">Fresh Quality</h3>
              <p className="text-gray-600 text-sm">Hand-picked fresh products with quality guarantee</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full grofast-gradient flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-[#1A1A1A]">Safe & Secure</h3>
              <p className="text-gray-600 text-sm">Contactless delivery with secure payment options</p>
            </div>
          </div>
        </div>
      </section>

      <FloatingCart />
    </main>
  )
}
