"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ActivityCard } from "./activity-card"
import { Loader2 } from "lucide-react"

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

export function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          customer:customers(id, name, company),
          quotation:quotations(id, quote_number, title)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivityUpdate = () => {
    fetchActivities()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">No activities yet</h3>
          <p className="text-slate-400">Start logging your customer interactions and activities</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} onUpdate={handleActivityUpdate} />
      ))}
    </div>
  )
}
