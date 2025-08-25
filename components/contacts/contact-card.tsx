"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, Mail, Phone, Building2, Briefcase, Activity, FileText, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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

interface ContactCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(contact.id)
        setShowDeleteDialog(false)
      } else {
        console.error("Failed to delete contact")
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const activitiesCount = contact.activities?.[0]?.count || 0
  const quotationsCount = contact.quotations?.[0]?.count || 0

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white truncate">
              {contact.first_name} {contact.last_name}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => onEdit(contact)} className="text-gray-300 hover:text-white">
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
          {/* Contact Details */}
          <div className="space-y-2">
            {contact.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.companies && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{contact.companies.name}</span>
              </div>
            )}
          </div>

          {/* Position and Department */}
          <div className="flex flex-wrap gap-2">
            {contact.position && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Briefcase className="h-3 w-3 mr-1" />
                {contact.position}
              </Badge>
            )}
            {contact.department && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {contact.department}
              </Badge>
            )}
            {contact.companies?.industry && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {contact.companies.industry}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">{activitiesCount} Activities</span>
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
            <AlertDialogTitle className="text-white">Delete Contact</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{contact.first_name} {contact.last_name}"? This action cannot be undone
              and will also delete all related activities and quotations.
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
