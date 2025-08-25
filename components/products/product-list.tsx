"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ProductCard } from "./product-card"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  sku: string
  category: string
  price: number
  cost: number
  status: string
  created_at: string
  updated_at: string
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductUpdate = () => {
    fetchProducts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
          <p className="text-slate-400">Start by adding your first product to the catalog</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onUpdate={handleProductUpdate} />
      ))}
    </div>
  )
}
