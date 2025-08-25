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

interface Customer {
  id: string
  name: string
  company: string
}

interface Quotation {
  id: string
  quote_number: string
  title: string
}

interface Activity {
  id: string
  title: string
  description: string
  type: string
  customer_id: string
  quotation_id: string
}

interface ActivityDialogProps {
  isOpen: boolean
  onClose: () => void
  activity?: Activity
  onUpdate?: () => void
}

const ACTIVITY_TYPES = [
  { value: "call", label: "Phone Call" },
  { value: "meeting", label: "Meeting" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
  { value: "task", label: "Task" },
]

export function ActivityDialog({ isOpen, onClose, activity, onUpdate }: ActivityDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "note",
    customer_id: "",
    quotation_id: "",
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
      fetchQuotations()
    }
  }, [isOpen])

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        type: activity.type || "note",
        customer_id: activity.customer_id || "",
        quotation_id: activity.quotation_id || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        type: "note",
        customer_id: "",
        quotation_id: "",
      })
    }
  }, [activity, isOpen])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("id, name, company").order("name")
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("id, quote_number, title")
        .order("created_at", { ascending: false })
      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error("Error fetching quotations:", error)
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

      const activityData = {
        ...formData,
        customer_id: formData.customer_id || null,
        quotation_id: formData.quotation_id || null,
      }

      if (activity) {
        // Update existing activity
        const { error } = await supabase.from("activities").update(activityData).eq("id", activity.id)

        if (error) throw error
      } else {
        // Create new activity
        const { error } = await supabase.from("activities").insert({
          ...activityData,
          created_by: user.id,
        })

        if (error) throw error
      }

      onUpdate?.()
      onClose()
    } catch (error) {
      console.error("Error saving activity:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{activity ? "Edit Activity" : "Log New Activity"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Activity title"
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-slate-300">
                Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
              placeholder="Describe the activity details..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_id" className="text-slate-300">
                Related Customer
              </Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none">No customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quotation_id" className="text-slate-300">
                Related Quotation
              </Label>
              <Select
                value={formData.quotation_id}
                onValueChange={(value) => setFormData({ ...formData, quotation_id: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select quotation (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none">No quotation</SelectItem>
                  {quotations.map((quotation) => (
                    <SelectItem key={quotation.id} value={quotation.id}>
                      {quotation.quote_number} - {quotation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {activity ? "Update Activity" : "Log Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
