"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Building, MapPin, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { CustomerDialog } from "./customer-dialog"
import { createClient } from "@/lib/supabase/client"

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

interface CustomerCardProps {
  customer: Customer
  onUpdate: () => void
}

export function CustomerCard({ customer, onUpdate }: CustomerCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("customers").delete().eq("id", customer.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error deleting customer:", error)
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
      case "prospect":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  {customer.name?.charAt(0)?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">{customer.name}</h3>
                {customer.company && <p className="text-sm text-slate-400">{customer.company}</p>}
              </div>
            </div>
            <Badge className={getStatusColor(customer.status)}>{customer.status || "Unknown"}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            {customer.email && (
              <div className="flex items-center text-sm text-slate-300">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center text-sm text-slate-300">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                {customer.phone}
              </div>
            )}
            {customer.company && (
              <div className="flex items-center text-sm text-slate-300">
                <Building className="w-4 h-4 mr-2 text-slate-400" />
                {customer.company}
              </div>
            )}
            {(customer.city || customer.state || customer.country) && (
              <div className="flex items-center text-sm text-slate-300">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {[customer.city, customer.state, customer.country].filter(Boolean).join(", ")}
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

      <CustomerDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        customer={customer}
        onUpdate={onUpdate}
      />
    </>
  )
}
