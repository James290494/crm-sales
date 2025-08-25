import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TopCustomersProps {
  companies: any[]
  quotations: any[]
}

export function TopCustomers({ companies, quotations }: TopCustomersProps) {
  // Calculate company value based on quotations
  const companyValues = companies.map((company) => {
    const companyQuotations = quotations.filter((q) => q.company_id === company.id)
    const totalValue = companyQuotations.reduce((sum, q) => sum + (q.total_amount || 0), 0)
    return {
      ...company,
      totalValue,
      quotationCount: companyQuotations.length,
    }
  })

  // Sort by total value and take top 5
  const topCompanies = companyValues.sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Top Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCompanies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No companies yet</p>
          ) : (
            topCompanies.map((company, index) => (
              <div key={company.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    {company.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{company.name}</h4>
                  <p className="text-gray-400 text-sm">{company.industry || company.website}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${company.totalValue.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{company.quotationCount} quotes</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
