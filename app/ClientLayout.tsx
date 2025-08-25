"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { Navigation } from "@/components/ui/navigation"
import { usePathname } from "next/navigation"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")
  const isHomePage = pathname === "/"

  if (isAuthPage || isHomePage) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LayoutContent>{children}</LayoutContent>
      <Toaster />
    </ThemeProvider>
  )
}
