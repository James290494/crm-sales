"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Opportunity {
  id: string
  company_id?: string
  contact_id?: string
  lead_id?: string
  name: string
  description?: string
  value: number
  stage: string
  probability: number
  expected_close_date?: string
  actual_close_date?: string
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

interface Lead {
  id: string
  title: string
  company_id?: string
  contact_id?: string
}

interface OpportunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity | null
  companies: Company[]
  contacts: Contact[]
  leads: Lead[]
  onOpportunityCreated: (opportunity: Opportunity) => void
  onOpportunityUpdated: (opportunity: Opportunity) => void
}

export function OpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  companies,
  contacts,
  leads,
  onOpportunityCreated,
  onOpportunityUpdated,
}: OpportunityDialogProps) {
  const [formData, setFormData] = useState({
    company_id: "",
    contact_id: "",
    lead_id: "",
    name: "",
    description: "",
    value: "",
    stage: "prospecting",
    probability: "10",
    expected_close_date: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter contacts and leads based on selected company
  const filteredContacts = formData.company_id
    ? contacts.filter((contact) => contact.company_id === formData.company_id)
    : contacts

  const filteredLeads = formData.company_id ? leads.filter((lead) => lead.company_id === formData.company_id) : leads

  useEffect(() => {
    if (opportunity) {
      setFormData({
        company_id: opportunity.company_id || "",
        contact_id: opportunity.contact_id || "",
        lead_id: opportunity.lead_id || "",
        name: opportunity.name || "",
        description: opportunity.description || "",
        value: opportunity.value?.toString() || "",
        stage: opportunity.stage || "prospecting",
        probability: opportunity.probability?.toString() || "10",
        expected_close_date: opportunity.expected_close_date
          ? new Date(opportunity.expected_close_date).toISOString().split("T")[0]
          : "",
        notes: opportunity.notes || "",
      })
    } else {
      setFormData({
        company_id: "",
        contact_id: "",
        lead_id: "",
        name: "",
        description: "",
        value: "",
        stage: "prospecting",
        probability: "10",
        expected_close_date: "",
        notes: "",
      })
    }
  }, [opportunity, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = opportunity ? `/api/opportunities/${opportunity.id}` : "/api/opportunities"
      const method = opportunity ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          company_id: formData.company_id || null,
          contact_id: formData.contact_id || null,
          lead_id: formData.lead_id || null,
          value: Number.parseFloat(formData.value),
          probability: Number.parseInt(formData.probability),
          expected_close_date: formData.expected_close_date || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (opportunity) {
          onOpportunityUpdated(result.opportunity)
        } else {
          onOpportunityCreated(result.opportunity)
        }
      } else {
        console.error("Failed to save opportunity")
      }
    } catch (error) {
      console.error("Error saving opportunity:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Opportunity Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Enterprise Software Deal"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_id">Company</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value, contact_id: "", lead_id: "" })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select company" />
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
                  <SelectValue placeholder="Select contact" />
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
            <div className="space-y-2">
              <Label htmlFor="lead_id">Related Lead</Label>
              <Select value={formData.lead_id} onValueChange={(value) => setFormData({ ...formData, lead_id: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="" className="text-white">
                    No Lead
                  </SelectItem>
                  {filteredLeads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id} className="text-white">
                      {lead.title}
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
              placeholder="Describe the opportunity..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($) *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="prospecting" className="text-white">
                    Prospecting
                  </SelectItem>
                  <SelectItem value="qualification" className="text-white">
                    Qualification
                  </SelectItem>
                  <SelectItem value="proposal" className="text-white">
                    Proposal
                  </SelectItem>
                  <SelectItem value="negotiation" className="text-white">
                    Negotiation
                  </SelectItem>
                  <SelectItem value="closed_won" className="text-white">
                    Closed Won
                  </SelectItem>
                  <SelectItem value="closed_lost" className="text-white">
                    Closed Lost
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Win Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                max="100"
                step="5"
              />
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
              placeholder="Additional notes about this opportunity..."
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
              {isSubmitting ? "Saving..." : opportunity ? "Update Opportunity" : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
