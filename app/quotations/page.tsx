import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QuotationList } from "@/components/quotations/quotation-list"
import { QuotationHeader } from "@/components/quotations/quotation-header"

export default async function QuotationsPage() {
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
        <QuotationHeader />
        <Suspense fallback={<div className="text-white">Loading quotations...</div>}>
          <QuotationList />
        </Suspense>
      </div>
    </div>
  )
}
