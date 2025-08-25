import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface RecentActivitiesProps {
  activities: any[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case "quotation_created":
        return "bg-blue-500/20 text-blue-300"
      case "customer_added":
        return "bg-green-500/20 text-green-300"
      case "quotation_sent":
        return "bg-purple-500/20 text-purple-300"
      case "quotation_accepted":
        return "bg-emerald-500/20 text-emerald-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent activities</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{activity.title}</h4>
                    <Badge className={getActivityColor(activity.type)}>{activity.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
