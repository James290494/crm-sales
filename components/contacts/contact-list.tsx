"use client"

import { useState } from "react"
import { ContactCard } from "./contact-card"
import { ContactDialog } from "./contact-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

interface Contact {
  id: string
  company_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  position?: string
  department?: string
  notes?: string
  created_at: string
  companies?: {
    id: string
    name: string
    industry?: string
  }
  activities?: { count: number }[]
  quotations?: { count: number }[]
}

interface Company {
  id: string
  name: string
}

interface ContactListProps {
  contacts: Contact[]
  companies: Company[]
}

export function ContactList({ contacts: initialContacts, companies }: ContactListProps) {
  const [contacts, setContacts] = useState(initialContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCompany = selectedCompany === "all" || contact.company_id === selectedCompany

    return matchesSearch && matchesCompany
  })

  const handleContactCreated = (newContact: Contact) => {
    setContacts([newContact, ...contacts])
    setIsDialogOpen(false)
  }

  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts(contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)))
    setSelectedContact(null)
    setIsDialogOpen(false)
  }

  const handleContactDeleted = (deletedId: string) => {
    setContacts(contacts.filter((c) => c.id !== deletedId))
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Companies
            </SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id} className="text-white">
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setSelectedContact(null)
            setIsDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} onEdit={handleEditContact} onDelete={handleContactDeleted} />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No contacts found.</p>
          <Button
            onClick={() => {
              setSelectedContact(null)
              setIsDialogOpen(true)
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Contact
          </Button>
        </div>
      )}

      {/* Contact Dialog */}
      <ContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contact={selectedContact}
        companies={companies}
        onContactCreated={handleContactCreated}
        onContactUpdated={handleContactUpdated}
      />
    </div>
  )
}
