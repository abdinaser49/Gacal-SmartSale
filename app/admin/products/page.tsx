"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProductForm } from "@/components/products/product-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { store, type Product } from "@/lib/store"
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react"
import { useLanguage } from "@/lib/language-context"


export default function AdminProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const updateProducts = () => setProducts(store.getProducts())
    updateProducts()
    const unsubscribe = store.subscribe(updateProducts)
    return () => {
      unsubscribe()
    }

  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery),
  )

  const handleSubmit = (data: Omit<Product, "id" | "createdAt">) => {
    if (editingProduct) {
      store.updateProduct(editingProduct.id, data)
    } else {
      store.addProduct(data)
    }
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(t("confirm_delete"))) {
      store.deleteProduct(id)
    }
  }


  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("product_management")}</h1>
              <p className="text-muted-foreground">{t("product_mgmt_desc")}</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProduct(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add")} {t("products").slice(0, -1)}
                </Button>

              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? t("edit_product") : t("add_new_product")}</DialogTitle>
                </DialogHeader>

                <ProductForm
                  product={editingProduct || undefined}
                  onSubmit={handleSubmit}
                  onCancel={handleDialogClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("all_products")} ({products.length})
                </CardTitle>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={`${t("search")}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />

                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("image")}</TableHead>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead className="text-right">{t("price")}</TableHead>
                      <TableHead className="text-right">{t("stock")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>

                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img
                              src={product.image || "/placeholder.svg?height=40&width=40&query=product"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t(product.category as any)}</Badge>
                        </TableCell>

                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.stock <= 10 ? "destructive" : "outline"}>
                            {product.stock} {product.stock === 0 ? t("out_of_stock").toLowerCase() : t("left")}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
