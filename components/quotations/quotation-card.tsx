"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Edit, Trash2, Eye, Send } from "lucide-react"
import { useState } from "react"
import { QuotationDialog } from "./quotation-dialog"
import { createClient } from "@/lib/supabase/client"

interface Quotation {
  id: string
  quote_number: string
  title: string
  description: string
  status: string
  total_amount: number
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  valid_until: string
  created_at: string
  updated_at: string
  customer: {
    id: string
    name: string
    email: string
    company: string
  }
}

interface QuotationCardProps {
  quotation: Quotation
  onUpdate: () => void
}

export function QuotationCard({ quotation, onUpdate }: QuotationCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quotation?")) return

    setIsDeleting(true)
    try {
      // Delete quotation items first
      await supabase.from("quotation_items").delete().eq("quotation_id", quotation.id)

      // Then delete the quotation
      const { error } = await supabase.from("quotations").delete().eq("id", quotation.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error deleting quotation:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      case "sent":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "expired":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpired = new Date(quotation.valid_until) < new Date()

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white text-lg">{quotation.quote_number}</h3>
              <p className="text-sm text-slate-400">{quotation.title}</p>
            </div>
            <Badge className={getStatusColor(quotation.status)}>{quotation.status || "Draft"}</Badge>
          </div>

          <div className="text-sm text-slate-300">
            <p className="font-medium">{quotation.customer?.name}</p>
            {quotation.customer?.company && <p className="text-slate-400">{quotation.customer.company}</p>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-2xl font-bold text-white">
              <DollarSign className="w-5 h-5 mr-1 text-green-400" />
              {formatCurrency(quotation.total_amount)}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span>{formatCurrency(quotation.subtotal)}</span>
            </div>
            {quotation.discount_amount > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Discount:</span>
                <span className="text-red-400">-{formatCurrency(quotation.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Tax ({quotation.tax_rate}%):</span>
              <span>{formatCurrency(quotation.tax_amount)}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-slate-400 pt-2 border-t border-slate-700">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Valid until: {formatDate(quotation.valid_until)}</span>
            {isExpired && <span className="ml-2 text-red-400">(Expired)</span>}
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-700">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="text-slate-400 hover:text-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="flex space-x-2">
              {quotation.status === "draft" && (
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
              )}
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
          </div>
        </CardContent>
      </Card>

      <QuotationDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        quotation={quotation}
        onUpdate={onUpdate}
      />
    </>
  )
}
