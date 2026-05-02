"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { store, type Customer } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    const updateCustomers = () => setCustomers(store.getCustomers())
    updateCustomers()
    const unsubscribe = store.subscribe(updateCustomers)
    return () => unsubscribe()
  }, [])

  const handleAddCustomer = () => {
    if (!name || !phone) return
    store.addCustomer({ name, phone, address })
    setName("")
    setPhone("")
    setAddress("")
    setIsAddOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      store.deleteCustomer(id)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="text-muted-foreground">Manage your customers and their debts</p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  <Button onClick={handleAddCustomer}>Save Customer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {customers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No customers added yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Total Debt</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address || '-'}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">${customer.totalDebt.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(customer.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
