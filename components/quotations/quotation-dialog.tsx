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
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  company: string
}

interface Product {
  id: string
  name: string
  price: number
  sku: string
}

interface QuotationItem {
  id?: string
  product_id: string
  product_name?: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Quotation {
  id: string
  quote_number: string
  title: string
  description: string
  status: string
  customer_id: string
  total_amount: number
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  valid_until: string
  terms_conditions: string
  notes: string
}

interface QuotationDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation?: Quotation
  onUpdate?: () => void
}

export function QuotationDialog({ isOpen, onClose, quotation, onUpdate }: QuotationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customer_id: "",
    status: "draft",
    tax_rate: 10,
    discount_amount: 0,
    valid_until: "",
    terms_conditions: "",
    notes: "",
  })
  const [items, setItems] = useState<QuotationItem[]>([
    {
      product_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    },
  ])

  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
      fetchProducts()
    }
  }, [isOpen])

  useEffect(() => {
    if (quotation) {
      setFormData({
        title: quotation.title || "",
        description: quotation.description || "",
        customer_id: quotation.customer_id || "",
        status: quotation.status || "draft",
        tax_rate: quotation.tax_rate || 10,
        discount_amount: quotation.discount_amount || 0,
        valid_until: quotation.valid_until || "",
        terms_conditions: quotation.terms_conditions || "",
        notes: quotation.notes || "",
      })
      fetchQuotationItems(quotation.id)
    } else {
      setFormData({
        title: "",
        description: "",
        customer_id: "",
        status: "draft",
        tax_rate: 10,
        discount_amount: 0,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        terms_conditions: "",
        notes: "",
      })
      setItems([
        {
          product_id: "",
          description: "",
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ])
    }
  }, [quotation, isOpen])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("id, name, email, company").order("name")
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("id, name, price, sku").order("name")
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchQuotationItems = async (quotationId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotation_items")
        .select(`
          *,
          product:products(name)
        `)
        .eq("quotation_id", quotationId)

      if (error) throw error

      const formattedItems =
        data?.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product?.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })) || []

      setItems(
        formattedItems.length > 0
          ? formattedItems
          : [
              {
                product_id: "",
                description: "",
                quantity: 1,
                unit_price: 0,
                total_price: 0,
              },
            ],
      )
    } catch (error) {
      console.error("Error fetching quotation items:", error)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-calculate total price
    if (field === "quantity" || field === "unit_price") {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price
    }

    // Auto-fill product details
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index].description = product.name
        updatedItems[index].unit_price = product.price
        updatedItems[index].total_price = updatedItems[index].quantity * product.price
      }
    }

    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const discountAmount = formData.discount_amount || 0
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * (formData.tax_rate || 0)) / 100
    const totalAmount = taxableAmount + taxAmount

    return {
      subtotal,
      taxAmount,
      totalAmount,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { subtotal, taxAmount, totalAmount } = calculateTotals()

      if (quotation) {
        // Update existing quotation
        const { error: quotationError } = await supabase
          .from("quotations")
          .update({
            ...formData,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", quotation.id)

        if (quotationError) throw quotationError

        // Delete existing items
        await supabase.from("quotation_items").delete().eq("quotation_id", quotation.id)

        // Insert updated items
        const itemsToInsert = items
          .filter((item) => item.description && item.quantity > 0)
          .map((item) => ({
            quotation_id: quotation.id,
            product_id: item.product_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase.from("quotation_items").insert(itemsToInsert)
          if (itemsError) throw itemsError
        }
      } else {
        // Create new quotation
        const quoteNumber = `QUO-${Date.now()}`

        const { data: newQuotation, error: quotationError } = await supabase
          .from("quotations")
          .insert({
            ...formData,
            quote_number: quoteNumber,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            created_by: user.id,
          })
          .select()
          .single()

        if (quotationError) throw quotationError

        // Insert items
        const itemsToInsert = items
          .filter((item) => item.description && item.quantity > 0)
          .map((item) => ({
            quotation_id: newQuotation.id,
            product_id: item.product_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase.from("quotation_items").insert(itemsToInsert)
          if (itemsError) throw itemsError
        }
      }

      onUpdate?.()
      onClose()
    } catch (error) {
      console.error("Error saving quotation:", error)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {quotation ? "Edit Quotation" : "Create New Quotation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_id" className="text-slate-300">
                Customer *
              </Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-slate-300">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valid_until" className="text-slate-300">
                Valid Until *
              </Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
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

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Line Items</h3>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="col-span-3">
                    <Label className="text-slate-300 text-xs">Product</Label>
                    <Select
                      value={item.product_id || "default"}
                      onValueChange={(value) => updateItem(index, "product_id", value)}
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="default">Custom Item</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <Label className="text-slate-300 text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-slate-300 text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-300 text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-slate-300 text-xs">Total</Label>
                    <div className="text-sm text-white bg-slate-600 border border-slate-500 rounded px-3 py-2">
                      ${item.total_price.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount_amount" className="text-slate-300">
                  Discount Amount
                </Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
              <div>
                <Label htmlFor="tax_rate" className="text-slate-300">
                  Tax Rate (%)
                </Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: Number.parseFloat(e.target.value) || 0 })}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {formData.discount_amount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Discount:</span>
                    <span>-${formData.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-slate-600 pt-2">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="terms_conditions" className="text-slate-300">
                Terms & Conditions
              </Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-slate-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>
          </div>

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
              {quotation ? "Update Quotation" : "Create Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
