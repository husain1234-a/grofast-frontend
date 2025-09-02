"use client"

import Link from "next/link"
import Image from "next/image"
import type { CategoryResponse } from "@/lib/api-client"

export function CategoryGrid({ categories }: { categories: CategoryResponse[] }) {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A]">Shop by Category</h2>
          <button className="text-[#00B761] font-medium text-sm hover:underline">
            View All
          </button>
        </div>
        
        {/* Scrollable category pills */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scroll-hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex-shrink-0 group"
            >
              <div className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-[#E8F5E8] rounded-2xl transition-all duration-200">
                {/* Category icon */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#E8F5E8] to-white border border-gray-100 flex items-center justify-center group-hover:grofast-shadow transition-all duration-200">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={`${category.name} icon`}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  ) : (
                    <img 
                      src="/category-icon.png" 
                      alt={category.name} 
                      className="h-7 w-7 object-contain" 
                    />
                  )}
                </div>
                
                {/* Category name */}
                <span className="text-xs font-medium text-[#1A1A1A] text-center leading-tight">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
