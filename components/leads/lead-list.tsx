"use client"

import { useState } from "react"
import { LeadCard } from "./lead-card"
import { LeadDialog } from "./lead-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

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
  companies?: {
    id: string
    name: string
    industry?: string
  }
  contacts?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
  activities?: { count: number }[]
  opportunities?: { count: number }[]
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

interface LeadListProps {
  leads: Lead[]
  companies: Company[]
  contacts: Contact[]
}

export function LeadList({ leads: initialLeads, companies, contacts }: LeadListProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || lead.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleLeadCreated = (newLead: Lead) => {
    setLeads([newLead, ...leads])
    setIsDialogOpen(false)
  }

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)))
    setSelectedLead(null)
    setIsDialogOpen(false)
  }

  const handleLeadDeleted = (deletedId: string) => {
    setLeads(leads.filter((l) => l.id !== deletedId))
  }

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Status
            </SelectItem>
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
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Priority
            </SelectItem>
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
        <Button
          onClick={() => {
            setSelectedLead(null)
            setIsDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onEdit={handleEditLead} onDelete={handleLeadDeleted} />
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No leads found.</p>
          <Button
            onClick={() => {
              setSelectedLead(null)
              setIsDialogOpen(true)
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Lead
          </Button>
        </div>
      )}

      {/* Lead Dialog */}
      <LeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lead={selectedLead}
        companies={companies}
        contacts={contacts}
        onLeadCreated={handleLeadCreated}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  )
}
