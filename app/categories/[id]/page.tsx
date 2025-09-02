"use client"

import { useProducts, useCategories } from "@/hooks/use-api"
import { ProductCard } from "@/components/ProductCard"
import { FloatingCart } from "@/components/FloatingCart"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { ArrowLeft, Filter, Grid, List, Search } from "lucide-react"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams<{ id: string }>()
  const categoryId = parseInt(params.id)
  const { data: categories } = useCategories()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // State for filters and search
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<"name" | "price" | "created_at" | "popularity">("popularity")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "")
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Find current category
  const currentCategory = categories?.categories?.find(c => c.id === categoryId)

  // Fetch products with current filters
  const { data: productsData, isLoading } = useProducts({
    page,
    size: 20,
    category_id: categoryId,
    search: searchQuery || undefined,
    min_price: minPrice,
    max_price: maxPrice,
    sort_by: sortBy,
    sort_order: sortOrder
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [categoryId, searchQuery, minPrice, maxPrice, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSortBy("popularity")
    setSortOrder("desc")
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#1A1A1A]">
                {currentCategory?.name || 'Products'}
              </h1>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Link href="/" className="hover:text-[#00B761]">Home</Link>
                <span>›</span>
                <span>{currentCategory?.name || 'Category'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${currentCategory?.name || 'products'}...`}
              className="w-full rounded-xl border-2 border-gray-100 pl-10 pr-4 py-2.5 text-sm focus:border-[#00B761] focus:outline-none transition-colors"
            />
          </form>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scroll-hidden">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="flex-shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#00B761] focus:outline-none"
            >
              <option value="popularity-desc">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="created_at-desc">Newest First</option>
            </select>

            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="flex-shrink-0 w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#00B761] focus:outline-none"
            />

            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="flex-shrink-0 w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#00B761] focus:outline-none"
            />

            {(searchQuery || minPrice || maxPrice || sortBy !== "popularity" || sortOrder !== "desc") && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-3 py-2 text-[#00B761] text-sm font-medium hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products grid/list */}
      <div className="max-w-6xl mx-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : !productsData?.products?.length ? (
          <div className="text-center py-16">
            <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : "No products available in this category"
              }
            </p>
            <button
              onClick={clearFilters}
              className="grofast-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {productsData.products.length} of {productsData.total} products
                </p>
              </div>
            </div>

            {/* Products grid */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-4"
            }>
              {productsData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#00B761] transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {productsData.total_pages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(productsData.total_pages, p + 1))}
                  disabled={page >= productsData.total_pages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#00B761] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FloatingCart />
    </div>
  )
}
