"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
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
}

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  onUpdate?: () => void
}

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Software",
  "Hardware",
  "Services",
  "Consulting",
  "Training",
  "Support",
  "Accessories",
  "Other",
]

export function ProductDialog({ isOpen, onClose, product, onUpdate }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    price: 0,
    cost: 0,
    status: "active",
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price || 0,
        cost: product.cost || 0,
        status: product.status || "active",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        category: "",
        price: 0,
        cost: 0,
        status: "active",
      })
    }
  }, [product, isOpen])

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `PRD-${randomStr}-${timestamp}`
  }

  const handleGenerateSKU = () => {
    setFormData({ ...formData, sku: generateSKU() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert({
          ...formData,
          created_by: user.id,
        })

        if (error) throw error
      }

      onUpdate?.()
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  const profitMargin = formData.price && formData.cost ? ((formData.price - formData.cost) / formData.price) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-slate-300">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku" className="text-slate-300">
                SKU
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Product SKU"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateSKU}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-slate-300">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost" className="text-slate-300">
                Cost Price
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-slate-300">
                Selling Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          {formData.price > 0 && formData.cost > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-slate-400 text-sm">Cost</p>
                  <p className="text-white font-semibold">${formData.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Price</p>
                  <p className="text-white font-semibold">${formData.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Margin</p>
                  <p
                    className={`font-semibold ${
                      profitMargin > 0 ? "text-green-400" : profitMargin < 0 ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
