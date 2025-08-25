import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopCustomers } from "@/components/dashboard/top-customers"
import { QuotationStatus } from "@/components/dashboard/quotation-status"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch dashboard data
  const [
    companiesResult,
    contactsResult,
    quotationsResult,
    productsResult,
    activitiesResult,
    leadsResult,
    opportunitiesResult,
  ] = await Promise.all([
    supabase.from("companies").select("*").limit(100),
    supabase.from("contacts").select("*, companies(name)").limit(100),
    supabase.from("quotations").select("*, companies(name), contacts(first_name, last_name)").limit(100),
    supabase.from("products").select("*").limit(100),
    supabase
      .from("activities")
      .select("*, companies(name), contacts(first_name, last_name), quotations(quote_number)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("leads").select("*").limit(100),
    supabase.from("opportunities").select("*, companies(name), contacts(first_name, last_name)").limit(100),
  ])

  const companies = companiesResult.data || []
  const contacts = contactsResult.data || []
  const quotations = quotationsResult.data || []
  const products = productsResult.data || []
  const activities = activitiesResult.data || []
  const leads = leadsResult.data || []
  const opportunities = opportunitiesResult.data || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">Sales CRM</h1>
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="flex items-center px-4 py-3 text-white bg-white/10 rounded-lg font-medium"
              >
                Dashboard
              </a>
              <a
                href="/companies"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Companies
              </a>
              <a
                href="/contacts"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Contacts
              </a>
              <a
                href="/leads"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Leads
              </a>
              <a
                href="/opportunities"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Opportunities
              </a>
              <a
                href="/quotations"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Quotations
              </a>
              <a
                href="/products"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Products
              </a>
              <a
                href="/activities"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Activities
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-300">Welcome back! Here's what's happening with your sales.</p>
          </div>

          {/* Stats Cards */}
          <DashboardStats
            companies={companies}
            contacts={contacts}
            quotations={quotations}
            products={products}
            leads={leads}
            opportunities={opportunities}
          />

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SalesChart quotations={quotations} opportunities={opportunities} />
            <QuotationStatus quotations={quotations} />
          </div>

          {/* Recent Activities and Top Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivities activities={activities} />
            <TopCustomers companies={companies} quotations={quotations} />
          </div>
        </div>
      </div>
    </div>
  )
}
