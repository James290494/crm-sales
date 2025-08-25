"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Edit, Trash2, Package, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import { ProductDialog } from "./product-dialog"
import { createBrowserClient } from "@/lib/supabase/client"

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

interface ProductCardProps {
  product: Product
  onUpdate: () => void
}

export function ProductCard({ product, onUpdate }: ProductCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createBrowserClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "discontinued":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    ]
    const hash = category?.split("").reduce((a, b) => a + b.charCodeAt(0), 0) || 0
    return colors[hash % colors.length]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const profitMargin = product.price && product.cost ? ((product.price - product.cost) / product.price) * 100 : 0
  const isProfit = profitMargin > 0

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white text-sm">{product.name}</h3>
                <p className="text-xs text-slate-400">{product.sku}</p>
              </div>
            </div>
            <Badge className={getStatusColor(product.status)}>{product.status || "Active"}</Badge>
          </div>

          {product.category && (
            <Badge className={getCategoryColor(product.category)} variant="outline">
              {product.category}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {product.description && <p className="text-sm text-slate-300 line-clamp-2">{product.description}</p>}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Selling Price:</span>
              <div className="flex items-center text-lg font-bold text-white">
                <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                {formatCurrency(product.price)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Cost:</span>
              <span className="text-sm text-slate-300">{formatCurrency(product.cost)}</span>
            </div>

            {product.price && product.cost && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Margin:</span>
                <div className="flex items-center">
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${isProfit ? "text-green-400" : "text-red-400"}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        product={product}
        onUpdate={onUpdate}
      />
    </>
  )
}
