"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { store, type Product, type Sale } from "@/lib/store"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"


export default function ManagerDashboard() {
  const { t } = useLanguage()

  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [salesByDay, setSalesByDay] = useState<{ date: string; total: number }[]>([])

  useEffect(() => {
    const updateData = () => {
      setProducts(store.getProducts())
      setSales(store.getSales())
      setSalesByDay(store.getSalesByDay(7))
    }

    updateData()
    const unsubscribe = store.subscribe(updateData)
    return () => unsubscribe()
  }, [])

  const todayRevenue = store.getTodayRevenue()
  const totalSales = store.getTotalSales()
  const transactionCount = store.getTransactionCount()
  const lowStockProducts = store.getLowStockProducts(10)

  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="manager" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("manager_dashboard")}</h1>
            <p className="text-muted-foreground">{t("manager_desc")}</p>
          </div>


          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title={t("today_revenue")}
              value={`$${todayRevenue.toFixed(2)}`}
              description="+12% from yesterday"
              icon={DollarSign}
              trend="up"
            />

            <StatsCard
              title={t("total_sales")}
              value={`$${totalSales.toFixed(2)}`}
              description={t("all_time_revenue")}
              icon={TrendingUp}
            />

            <StatsCard
              title={t("transactions")}
              value={transactionCount}
              description={`${sales.filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString()).length} ${t("today")}`}
              icon={ShoppingCart}
            />

            <StatsCard
              title={t("products")}
              value={products.length}
              description={`${lowStockProducts.length} ${t("low_stock").toLowerCase()}`}
              icon={Package}
              trend={lowStockProducts.length > 0 ? "down" : "neutral"}
            />

          </div>

          <div className="grid gap-4 lg:grid-cols-7 mb-8">
            <div className="lg:col-span-4">
              <SalesChart data={salesByDay} />
            </div>
            <div className="lg:col-span-3">
              <RecentSales sales={sales} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LowStockAlert products={lowStockProducts} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
