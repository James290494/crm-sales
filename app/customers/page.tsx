import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomerList } from "@/components/customers/customer-list"
import { CustomerHeader } from "@/components/customers/customer-header"

export default async function CustomersPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <CustomerHeader />
        <Suspense fallback={<div className="text-white">Loading customers...</div>}>
          <CustomerList />
        </Suspense>
      </div>
    </div>
  )
}
