import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductList } from "@/components/products/product-list"
import { ProductHeader } from "@/components/products/product-header"

export default async function ProductsPage() {
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
        <ProductHeader />
        <Suspense fallback={<div className="text-white">Loading products...</div>}>
          <ProductList />
        </Suspense>
      </div>
    </div>
  )
}
