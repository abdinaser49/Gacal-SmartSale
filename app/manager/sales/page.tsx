"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { store, type Sale } from "@/lib/store"

export default function ManagerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    const updateSales = () => setSales(store.getSales())
    updateSales()
    const unsubscribe = store.subscribe(updateSales)
    return () => unsubscribe()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="manager" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Sales Reports</h1>
            <p className="text-muted-foreground">View all transactions and analyze sales data</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No sales recorded yet</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {sales.map((sale) => (
                    <AccordionItem key={sale.id} value={sale.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full items-center justify-between pr-4">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">#{sale.id.slice(0, 8)}</span>
                            <span className="text-muted-foreground">{sale.userName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">${sale.total.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(sale.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sale.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.qty}</TableCell>
                                <TableCell className="text-right">${(item.price * item.qty).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
