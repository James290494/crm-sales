"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  TrendingUp,
  Building2,
  User,
  DollarSign,
  Calendar,
  Activity,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Percent,
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

interface OpportunityCardProps {
  opportunity: Opportunity
  onEdit: (opportunity: Opportunity) => void
  onDelete: (id: string) => void
}

export function OpportunityCard({ opportunity, onEdit, onDelete }: OpportunityCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(opportunity.id)
        setShowDeleteDialog(false)
      } else {
        console.error("Failed to delete opportunity")
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "prospecting":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "qualification":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "proposal":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "negotiation":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "closed_won":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "closed_lost":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-400"
    if (probability >= 60) return "text-yellow-400"
    if (probability >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const activitiesCount = opportunity.activities?.[0]?.count || 0
  const quotationsCount = opportunity.quotations?.[0]?.count || 0

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white truncate">{opportunity.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => onEdit(opportunity)} className="text-gray-300 hover:text-white">
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
          {/* Opportunity Details */}
          <div className="space-y-2">
            {opportunity.companies && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{opportunity.companies.name}</span>
              </div>
            )}
            {opportunity.contacts && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <User className="h-4 w-4" />
                <span className="truncate">
                  {opportunity.contacts.first_name} {opportunity.contacts.last_name}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">${opportunity.value.toLocaleString()}</span>
            </div>
            {opportunity.expected_close_date && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Calendar className="h-4 w-4" />
                <span>Expected: {formatDate(opportunity.expected_close_date)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {opportunity.description && <p className="text-sm text-gray-400 line-clamp-2">{opportunity.description}</p>}

          {/* Stage and Probability */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={getStageColor(opportunity.stage)}>
              {opportunity.stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
              <Percent className="h-3 w-3 mr-1" />
              <span className={getProbabilityColor(opportunity.probability)}>{opportunity.probability}%</span>
            </Badge>
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
            <AlertDialogTitle className="text-white">Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{opportunity.name}"? This action cannot be undone and will also delete
              all related activities and quotations.
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
