"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CustomerCard } from "./customer-card"
import { Loader2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  address: string
  city: string
  state: string
  country: string
  created_at: string
  updated_at: string
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerUpdate = () => {
    fetchCustomers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">No customers yet</h3>
          <p className="text-slate-400">Start by adding your first customer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} onUpdate={handleCustomerUpdate} />
      ))}
    </div>
  )
}
