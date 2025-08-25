"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Mail, Phone, Globe, Users, Target, FileText, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface CompanyCardProps {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (id: string) => void
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(company.id)
        setShowDeleteDialog(false)
      } else {
        console.error("Failed to delete company")
      }
    } catch (error) {
      console.error("Error deleting company:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const contactsCount = company.contacts?.[0]?.count || 0
  const leadsCount = company.leads?.[0]?.count || 0
  const opportunitiesCount = company.opportunities?.[0]?.count || 0
  const quotationsCount = company.quotations?.[0]?.count || 0

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white truncate">{company.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => onEdit(company)} className="text-gray-300 hover:text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Details */}
          <div className="space-y-2">
            {company.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="truncate">{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Globe className="h-4 w-4" />
                <span className="truncate">{company.website}</span>
              </div>
            )}
          </div>

          {/* Industry and Size */}
          <div className="flex flex-wrap gap-2">
            {company.industry && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {company.industry}
              </Badge>
            )}
            {company.company_size && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {company.company_size}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">{contactsCount} Contacts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">{leadsCount} Leads</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">{opportunitiesCount} Opportunities</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">{quotationsCount} Quotes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Company</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{company.name}"? This action cannot be undone and will also delete all
              related contacts, leads, and opportunities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-gray-300 hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
