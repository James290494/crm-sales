"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Lead {
  id: string
  company_id?: string
  contact_id?: string
  title: string
  description?: string
  value?: number
  source?: string
  status: string
  priority: string
  notes?: string
  assigned_to?: string
  created_at: string
}

interface Company {
  id: string
  name: string
}

interface Contact {
  id: string
  first_name: string
  last_name: string
  company_id?: string
}

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead | null
  companies: Company[]
  contacts: Contact[]
  onLeadCreated: (lead: Lead) => void
  onLeadUpdated: (lead: Lead) => void
}

const leadSources = ["Website", "Social Media", "Email Campaign", "Cold Call", "Referral", "Trade Show", "Other"]

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  companies,
  contacts,
  onLeadCreated,
  onLeadUpdated,
}: LeadDialogProps) {
  const [formData, setFormData] = useState({
    company_id: "",
    contact_id: "",
    title: "",
    description: "",
    value: "",
    source: "",
    status: "new",
    priority: "medium",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter contacts based on selected company
  const filteredContacts = formData.company_id
    ? contacts.filter((contact) => contact.company_id === formData.company_id)
    : contacts

  useEffect(() => {
    if (lead) {
      setFormData({
        company_id: lead.company_id || "",
        contact_id: lead.contact_id || "",
        title: lead.title || "",
        description: lead.description || "",
        value: lead.value?.toString() || "",
        source: lead.source || "",
        status: lead.status || "new",
        priority: lead.priority || "medium",
        notes: lead.notes || "",
      })
    } else {
      setFormData({
        company_id: "",
        contact_id: "",
        title: "",
        description: "",
        value: "",
        source: "",
        status: "new",
        priority: "medium",
        notes: "",
      })
    }
  }, [lead, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = lead ? `/api/leads/${lead.id}` : "/api/leads"
      const method = lead ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          company_id: formData.company_id || null,
          contact_id: formData.contact_id || null,
          value: formData.value ? Number.parseFloat(formData.value) : null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (lead) {
          onLeadUpdated(result.lead)
        } else {
          onLeadCreated(result.lead)
        }
      } else {
        console.error("Failed to save lead")
      }
    } catch (error) {
      console.error("Error saving lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Lead Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Enterprise Software Solution"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_id">Company</Label>
              <Select
                value={formData.company_id}
                onValueChange={
                  (value) => setFormData({ ...formData, company_id: value, contact_id: "" }) // Reset contact when company changes
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a company (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="" className="text-white">
                    No Company
                  </SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id} className="text-white">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_id">Contact</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a contact (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="" className="text-white">
                    No Contact
                  </SelectItem>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id} className="text-white">
                      {contact.first_name} {contact.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
              placeholder="Describe the lead opportunity..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {leadSources.map((source) => (
                    <SelectItem key={source} value={source} className="text-white">
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="new" className="text-white">
                    New
                  </SelectItem>
                  <SelectItem value="contacted" className="text-white">
                    Contacted
                  </SelectItem>
                  <SelectItem value="qualified" className="text-white">
                    Qualified
                  </SelectItem>
                  <SelectItem value="converted" className="text-white">
                    Converted
                  </SelectItem>
                  <SelectItem value="lost" className="text-white">
                    Lost
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="low" className="text-white">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-white">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-white">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
              placeholder="Additional notes about this lead..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
