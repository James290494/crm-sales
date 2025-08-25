"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { QuotationCard } from "./quotation-card"
import { Loader2 } from "lucide-react"

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

export function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          customer:customers(id, name, email, company)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error("Error fetching quotations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuotationUpdate = () => {
    fetchQuotations()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (quotations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">No quotations yet</h3>
          <p className="text-slate-400">Create your first quotation to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {quotations.map((quotation) => (
        <QuotationCard key={quotation.id} quotation={quotation} onUpdate={handleQuotationUpdate} />
      ))}
    </div>
  )
}
