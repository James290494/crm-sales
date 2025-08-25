"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Target,
  Building2,
  User,
  DollarSign,
  Activity,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"
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

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(lead.id)
        setShowDeleteDialog(false)
      } else {
        console.error("Failed to delete lead")
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "contacted":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "qualified":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "converted":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "lost":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const activitiesCount = lead.activities?.[0]?.count || 0
  const opportunitiesCount = lead.opportunities?.[0]?.count || 0

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white truncate">{lead.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => onEdit(lead)} className="text-gray-300 hover:text-white">
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
          {/* Lead Details */}
          <div className="space-y-2">
            {lead.companies && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{lead.companies.name}</span>
              </div>
            )}
            {lead.contacts && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <User className="h-4 w-4" />
                <span className="truncate">
                  {lead.contacts.first_name} {lead.contacts.last_name}
                </span>
              </div>
            )}
            {lead.value && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <DollarSign className="h-4 w-4" />
                <span>${lead.value.toLocaleString()}</span>
              </div>
            )}
            {lead.source && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">{lead.source}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {lead.description && <p className="text-sm text-gray-400 line-clamp-2">{lead.description}</p>}

          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={getStatusColor(lead.status)}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(lead.priority)}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">{activitiesCount} Activities</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">{opportunitiesCount} Opportunities</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{lead.title}"? This action cannot be undone and will also delete all
              related activities and opportunities.
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
