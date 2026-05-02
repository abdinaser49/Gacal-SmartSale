import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { Product } from "@/lib/store"
import { useLanguage } from "@/lib/language-context"


interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const { t } = useLanguage()

  return (

    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <CardTitle>{t("low_stock_alerts")}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("all_well_stocked")}</p>
          ) : (

            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{t(product.category as any)}</p>
                </div>

                <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>{product.stock} {t("left")}</Badge>
              </div>

            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
