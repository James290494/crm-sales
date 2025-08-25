"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, Mail, FileText, CheckSquare, Edit, Trash2, User, Quote } from "lucide-react"
import { useState } from "react"
import { ActivityDialog } from "./activity-dialog"
import { createBrowserClient } from "@/lib/supabase/client"

interface Activity {
  id: string
  title: string
  description: string
  type: string
  created_at: string
  customer: {
    id: string
    name: string
    company: string
  } | null
  quotation: {
    id: string
    quote_number: string
    title: string
  } | null
}

interface ActivityCardProps {
  activity: Activity
  onUpdate: () => void
}

export function ActivityCard({ activity, onUpdate }: ActivityCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createBrowserClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this activity?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("activities").delete().eq("id", activity.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error deleting activity:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "call":
        return <Phone className="w-5 h-5 text-green-400" />
      case "meeting":
        return <Calendar className="w-5 h-5 text-blue-400" />
      case "email":
        return <Mail className="w-5 h-5 text-purple-400" />
      case "note":
        return <FileText className="w-5 h-5 text-yellow-400" />
      case "task":
        return <CheckSquare className="w-5 h-5 text-orange-400" />
      default:
        return <FileText className="w-5 h-5 text-slate-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "call":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "meeting":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "email":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "note":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "task":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white">{activity.title}</h3>
                  <Badge className={getActivityColor(activity.type)}>{activity.type}</Badge>
                </div>
                <p className="text-sm text-slate-400">{formatDate(activity.created_at)}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {activity.description && <p className="text-slate-300">{activity.description}</p>}

          <div className="flex flex-wrap gap-3">
            {activity.customer && (
              <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-700/50 rounded-full px-3 py-1">
                <User className="w-4 h-4 text-slate-400" />
                <span>
                  {activity.customer.name}
                  {activity.customer.company && ` (${activity.customer.company})`}
                </span>
              </div>
            )}

            {activity.quotation && (
              <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-700/50 rounded-full px-3 py-1">
                <Quote className="w-4 h-4 text-slate-400" />
                <span>
                  {activity.quotation.quote_number} - {activity.quotation.title}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ActivityDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        activity={activity}
        onUpdate={onUpdate}
      />
    </>
  )
}
