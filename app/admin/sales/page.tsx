"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { store, type Sale } from "@/lib/store"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    const updateSales = () => setSales(store.getSales())
    updateSales()
    const unsubscribe = store.subscribe(updateSales)
    return () => { unsubscribe() }
  }, [])

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className="text-muted-foreground">View all transactions and sale details</p>
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
                            <Badge variant={sale.paymentStatus === 'paid' ? 'success' : 'secondary' as any} className="capitalize">{sale.paymentStatus}</Badge>
                            <Badge variant="outline">{sale.paymentMethod}</Badge>
                            <span className="font-bold text-primary">${sale.total.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground w-[150px] text-right">
                              {new Date(sale.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/10 p-4 rounded-md mt-2">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="font-semibold text-lg">Transaction Details</h4>
                           <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2"/> Print Receipt</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                           <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Amount Paid</span>
                              <span className="font-medium">${sale.amountPaid?.toFixed(2) || sale.total.toFixed(2)}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Change Returned</span>
                              <span className="font-medium">${sale.changeReturned?.toFixed(2) || '0.00'}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Cashier</span>
                              <span className="font-medium">{sale.userName}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Reference</span>
                              <span className="font-medium">#{sale.id.slice(0, 8).toUpperCase()}</span>
                           </div>
                        </div>
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
