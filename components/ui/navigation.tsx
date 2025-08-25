"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Package, Activity, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Products", href: "/products", icon: Package },
  { name: "Activities", href: "/activities", icon: Activity },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="bg-slate-800/50 border-r border-slate-700 w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">Sales CRM</h2>
        <p className="text-sm text-slate-400">Manage your business</p>
      </div>

      <div className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
