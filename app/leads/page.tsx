import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LeadList } from "@/components/leads/lead-list"

export default async function LeadsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch leads with related data
  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      *,
      companies(id, name, industry),
      contacts(id, first_name, last_name, email),
      activities(count),
      opportunities(count)
    `)
    .order("created_at", { ascending: false })

  // Fetch companies and contacts for the lead form
  const [{ data: companies }, { data: contacts }] = await Promise.all([
    supabase.from("companies").select("id, name").order("name", { ascending: true }),
    supabase.from("contacts").select("id, first_name, last_name, company_id").order("first_name", { ascending: true }),
  ])

  if (error) {
    console.error("Error fetching leads:", error)
  }

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
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
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
              <a href="/leads" className="flex items-center px-4 py-3 text-white bg-white/10 rounded-lg font-medium">
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Leads</h2>
              <p className="text-gray-300">Track and manage your sales leads and prospects.</p>
            </div>
          </div>

          <LeadList leads={leads || []} companies={companies || []} contacts={contacts || []} />
        </div>
      </div>
    </div>
  )
}
