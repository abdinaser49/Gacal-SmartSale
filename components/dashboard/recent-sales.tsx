import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Sale } from "@/lib/store"
import { useLanguage } from "@/lib/language-context"


interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { t } = useLanguage()

  return (

    <Card>
      <CardHeader>
        <CardTitle>{t("recent_sales")}</CardTitle>

      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_sales_yet")}</p>
          ) : (

            sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{sale.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{sale.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.items.length} {t("items").toLowerCase()}
                  </p>

                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${sale.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
