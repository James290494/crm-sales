"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SalesChartProps {
  quotations: any[]
  opportunities: any[]
}

export function SalesChart({ quotations, opportunities }: SalesChartProps) {
  // Group data by month
  const monthlyData = [...quotations, ...opportunities].reduce(
    (acc, item) => {
      const date = new Date(item.created_at)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, quotations: 0, opportunities: 0, revenue: 0 }
      }

      if (item.quote_number) {
        // It's a quotation
        acc[monthKey].quotations += 1
        acc[monthKey].revenue += item.total_amount || 0
      } else {
        // It's an opportunity
        acc[monthKey].opportunities += 1
        if (item.stage === "closed_won") {
          acc[monthKey].revenue += item.value || 0
        }
      }

      return acc
    },
    {} as Record<string, { month: string; quotations: number; opportunities: number; revenue: number }>,
  )

  const chartData = Object.values(monthlyData).slice(-6) // Last 6 months

  const chartConfig = {
    quotations: {
      label: "Quotations",
      color: "hsl(var(--chart-1))",
    },
    opportunities: {
      label: "Opportunities",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Sales Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quotations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opportunities" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
