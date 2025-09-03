"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    DollarSign,
    Tag,
    Image as ImageIcon
} from "lucide-react"
import { adminApi } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth-provider"

interface Product {
    id: number
    name: string
    description: string
    price: number
    category: string
    stock: number
    image_url?: string
    is_active: boolean
}

export default function AdminProducts() {
    const { token } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    useEffect(() => {
        if (token) {
            loadProducts()
        }
    }, [token])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const response = await adminApi.getProducts({}, token)
            setProducts(response.products || [])
            logger.info('Products loaded successfully')
        } catch (error) {
            logger.error('Failed to load products', error)

            // Fallback demo data
            setProducts([
                {
                    id: 1,
                    name: "Fresh Apples",
                    description: "Crispy red apples from Kashmir",
                    price: 120,
                    category: "Fruits",
                    stock: 50,
                    image_url: "/api/placeholder/150/150",
                    is_active: true
                },
                {
                    id: 2,
                    name: "Organic Bananas",
                    description: "Fresh organic bananas",
                    price: 60,
                    category: "Fruits",
                    stock: 30,
                    image_url: "/api/placeholder/150/150",
                    is_active: true
                },
                {
                    id: 3,
                    name: "Whole Milk",
                    description: "Fresh whole milk 1L",
                    price: 55,
                    category: "Dairy",
                    stock: 25,
                    image_url: "/api/placeholder/150/150",
                    is_active: true
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
            await adminApi.deleteProduct(productId, token)
            setProducts(products.filter(p => p.id !== productId))

            toast({
                variant: "success",
                title: "Product Deleted",
                description: "Product has been successfully deleted.",
            })

            logger.info('Product deleted successfully', { productId })
        } catch (error) {
            logger.error('Failed to delete product', error)

            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Failed to delete product. Please try again.",
            })
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B761]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#00B761] text-white px-4 py-2 rounded-lg hover:bg-[#009653] transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none">
                        <option value="">All Categories</option>
                        <option value="fruits">Fruits</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="dairy">Dairy</option>
                        <option value="snacks">Snacks</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ImageIcon className="h-12 w-12 text-gray-400" />
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                        <DollarSign className="h-3 w-3" />
                                        Price
                                    </span>
                                    <span className="font-semibold">₹{product.price}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                        <Package className="h-3 w-3" />
                                        Stock
                                    </span>
                                    <span className={`font-semibold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {product.stock}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                        <Tag className="h-3 w-3" />
                                        Category
                                    </span>
                                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
                    </p>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {(showAddModal || editingProduct) && (
                <ProductModal
                    product={editingProduct}
                    token={token}
                    onClose={() => {
                        setShowAddModal(false)
                        setEditingProduct(null)
                    }}
                    onSave={(product) => {
                        if (editingProduct) {
                            setProducts(products.map(p => p.id === product.id ? product : p))
                        } else {
                            setProducts([...products, { ...product, id: Date.now() }])
                        }
                        setShowAddModal(false)
                        setEditingProduct(null)
                        loadProducts() // Reload products after save
                    }}
                />
            )}
        </div>
    )
}

// Product Modal Component
function ProductModal({
    product,
    token,
    onClose,
    onSave
}: {
    product: Product | null
    token: string
    onClose: () => void
    onSave: (product: Product) => void
}) {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || 0,
        category: product?.category || "",
        stock: product?.stock || 0,
        image_url: product?.image_url || "",
        is_active: product?.is_active ?? true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (product) {
                // Update existing product
                await adminApi.updateProduct(product.id, formData, token)
                toast({
                    variant: "success",
                    title: "Product Updated",
                    description: "Product has been successfully updated.",
                })
            } else {
                // Create new product
                await adminApi.createProduct(formData, token)
                toast({
                    variant: "success",
                    title: "Product Created",
                    description: "Product has been successfully created.",
                })
            }

            onSave({ ...formData, id: product?.id || Date.now() } as Product)
        } catch (error) {
            logger.error('Failed to save product', error)
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Failed to save product. Please try again.",
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {product ? "Edit Product" : "Add New Product"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded border-gray-300 text-[#00B761] focus:ring-[#00B761]"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Active Product
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#00B761] text-white rounded-lg hover:bg-[#009653] transition-colors"
                            >
                                {product ? "Update" : "Create"} Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}