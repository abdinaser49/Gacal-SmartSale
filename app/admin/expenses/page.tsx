"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { store, type Expense } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("General")

  useEffect(() => {
    const updateExpenses = () => setExpenses(store.getExpenses())
    updateExpenses()
    const unsubscribe = store.subscribe(updateExpenses)
    return () => unsubscribe()
  }, [])

  const handleAddExpense = () => {
    if (!title || !amount) return
    store.addExpense({ title, amount: parseFloat(amount), category, date: new Date() })
    setTitle("")
    setAmount("")
    setCategory("General")
    setIsAddOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      store.deleteExpense(id)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Expenses</h1>
              <p className="text-muted-foreground">Manage your shop expenses</p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Input placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <Input placeholder="Category (e.g., Rent, Bills)" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <Button onClick={handleAddExpense}>Save Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No expenses recorded yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">${expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(expense.id)}>Delete</Button>
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
