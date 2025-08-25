import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Package, TrendingUp, Building, Target, UserCheck } from "lucide-react"

interface DashboardStatsProps {
  companies: any[]
  contacts: any[]
  quotations: any[]
  products: any[]
  leads: any[]
  opportunities: any[]
}

export function DashboardStats({
  companies,
  contacts,
  quotations,
  products,
  leads,
  opportunities,
}: DashboardStatsProps) {
  const totalRevenue = quotations.reduce((sum, quote) => sum + (quote.total_amount || 0), 0)
  const activeQuotations = quotations.filter((q) => q.status === "sent" || q.status === "draft").length
  const wonOpportunities = opportunities.filter((o) => o.stage === "closed_won").length
  const activeLeads = leads.filter((l) => l.status === "new" || l.status === "contacted").length

  const stats = [
    {
      title: "Companies",
      value: companies.length.toString(),
      icon: Building,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Contacts",
      value: contacts.length.toString(),
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Leads",
      value: activeLeads.toString(),
      icon: UserCheck,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Won Opportunities",
      value: wonOpportunities.toString(),
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Active Quotations",
      value: activeQuotations.toString(),
      icon: FileText,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Products",
      value: products.length.toString(),
      icon: Package,
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-black/20 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
