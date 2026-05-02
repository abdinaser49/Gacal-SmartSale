"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { store } from "@/lib/store"
import { BarChart, DollarSign, TrendingUp, PackageMinus } from "lucide-react"

export default function ReportsPage() {
  const [metrics, setMetrics] = useState({
    todayRevenue: 0,
    totalSales: 0,
    totalExpenses: 0,
    lowStockCount: 0
  })

  useEffect(() => {
    const updateMetrics = () => {
      const expenses = store.getExpenses()
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      setMetrics({
        todayRevenue: store.getTodayRevenue(),
        totalSales: store.getTotalSales(),
        totalExpenses: totalExpenses,
        lowStockCount: store.getLowStockProducts(10).length
      })
    }
    updateMetrics()
    const unsubscribe = store.subscribe(updateMetrics)
    return () => { unsubscribe() }
  }, [])

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Business Reports</h1>
            <p className="text-muted-foreground">Detailed financial insights</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.todayRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalSales.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <BarChart className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">-${metrics.totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${(metrics.totalSales - metrics.totalExpenses).toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
             <Card>
               <CardHeader>
                 <CardTitle>System Warnings</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center gap-4 p-4 bg-warning/20 text-warning-foreground rounded-lg border border-warning/50">
                    <PackageMinus className="w-6 h-6" />
                    <div>
                       <p className="font-semibold">{metrics.lowStockCount} Products are running out of stock.</p>
                       <p className="text-sm">Please check the inventory to restock these items.</p>
                    </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
