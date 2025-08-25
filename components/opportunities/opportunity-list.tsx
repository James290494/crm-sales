"use client"

import { useState } from "react"
import { OpportunityCard } from "./opportunity-card"
import { OpportunityDialog } from "./opportunity-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

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
  leads?: {
    id: string
    title: string
    status: string
  }
  activities?: { count: number }[]
  quotations?: { count: number }[]
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

interface OpportunityListProps {
  opportunities: Opportunity[]
  companies: Company[]
  contacts: Contact[]
  leads: Lead[]
}

export function OpportunityList({
  opportunities: initialOpportunities,
  companies,
  contacts,
  leads,
}: OpportunityListProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = selectedStage === "all" || opportunity.stage === selectedStage

    return matchesSearch && matchesStage
  })

  const handleOpportunityCreated = (newOpportunity: Opportunity) => {
    setOpportunities([newOpportunity, ...opportunities])
    setIsDialogOpen(false)
  }

  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    setOpportunities(opportunities.map((o) => (o.id === updatedOpportunity.id ? updatedOpportunity : o)))
    setSelectedOpportunity(null)
    setIsDialogOpen(false)
  }

  const handleOpportunityDeleted = (deletedId: string) => {
    setOpportunities(opportunities.filter((o) => o.id !== deletedId))
  }

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Stages
            </SelectItem>
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
        <Button
          onClick={() => {
            setSelectedOpportunity(null)
            setIsDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onEdit={handleEditOpportunity}
            onDelete={handleOpportunityDeleted}
          />
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No opportunities found.</p>
          <Button
            onClick={() => {
              setSelectedOpportunity(null)
              setIsDialogOpen(true)
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Opportunity
          </Button>
        </div>
      )}

      {/* Opportunity Dialog */}
      <OpportunityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        opportunity={selectedOpportunity}
        companies={companies}
        contacts={contacts}
        leads={leads}
        onOpportunityCreated={handleOpportunityCreated}
        onOpportunityUpdated={handleOpportunityUpdated}
      />
    </div>
  )
}
