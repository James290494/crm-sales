"use client"

import { useState } from "react"
import { CompanyCard } from "./company-card"
import { CompanyDialog } from "./company-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

interface Company {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  industry?: string
  company_size?: string
  notes?: string
  created_at: string
  contacts?: { count: number }[]
  leads?: { count: number }[]
  opportunities?: { count: number }[]
  quotations?: { count: number }[]
}

interface CompanyListProps {
  companies: Company[]
}

export function CompanyList({ companies: initialCompanies }: CompanyListProps) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies([newCompany, ...companies])
    setIsDialogOpen(false)
  }

  const handleCompanyUpdated = (updatedCompany: Company) => {
    setCompanies(companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)))
    setSelectedCompany(null)
    setIsDialogOpen(false)
  }

  const handleCompanyDeleted = (deletedId: string) => {
    setCompanies(companies.filter((c) => c.id !== deletedId))
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedCompany(null)
            setIsDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.id} company={company} onEdit={handleEditCompany} onDelete={handleCompanyDeleted} />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No companies found.</p>
          <Button
            onClick={() => {
              setSelectedCompany(null)
              setIsDialogOpen(true)
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Company
          </Button>
        </div>
      )}

      {/* Company Dialog */}
      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={selectedCompany}
        onCompanyCreated={handleCompanyCreated}
        onCompanyUpdated={handleCompanyUpdated}
      />
    </div>
  )
}
