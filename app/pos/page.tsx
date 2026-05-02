"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { ProductGrid } from "@/components/pos/product-grid"
import { ProductForm } from "@/components/products/product-form"
import { Cart, type CartItem } from "@/components/pos/cart"
import { useAuth } from "@/lib/auth-context"
import { store, type Product } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, LogOut, CheckCircle, Printer, Package, Plus, Pencil, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Sidebar } from "@/components/dashboard/sidebar"


export default function POSPage() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [payments, setPayments] = useState<{ method: string; amount: string }[]>([{ method: "Cash", amount: "" }])
  const [customerId, setCustomerId] = useState<string>("none")
  const [customers, setCustomers] = useState<any[]>([])
  const [settings, setSettings] = useState(() => store.getSettings())
  const [lastSale, setLastSale] = useState<any>(null)
  const [isProductListOpen, setIsProductListOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    const updateProducts = () => setProducts(store.getProducts())
    const updateCustomers = () => setCustomers(store.getCustomers())
    const updateSettings = () => setSettings(store.getSettings())
    updateProducts()
    updateCustomers()
    updateSettings()
    const unsubscribe1 = store.subscribe(updateProducts)
    const unsubscribe2 = store.subscribe(updateCustomers)
    const unsubscribe3 = store.subscribe(updateSettings)
    return () => {
      unsubscribe1()
      unsubscribe2()
      unsubscribe3()
    }
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.barcode?.includes(searchQuery)
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, categoryFilter])

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        if (existing.qty >= product.stock) return prev
        return prev.map((item) => (item.productId === product.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          qty: 1,
          maxStock: product.stock,
        },
      ]
    })
  }

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)))
  }

  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleUpdatePrice = (productId: string, price: number) => {
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, price } : item)))
  }

  const handleCheckoutClick = () => {
    if (!user || cart.length === 0) return
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    setPayments([{ method: "Cash", amount: total.toFixed(2) }])
    setCustomerId("none")
    setShowCheckout(true)
  }

  const handleProcessSale = async () => {
    if (!user || cart.length === 0) return

    setIsProcessing(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const saleItems = cart.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      qty: item.qty,
      price: item.price,
    }))

    const parsedPayments = payments.map(p => ({ method: p.method, amount: parseFloat(p.amount) || 0 }))
    const sale = store.addSale(user.id, user.name, saleItems, parsedPayments, customerId)

    if (sale) {
      setLastSale(sale)
      setCart([])
      setShowCheckout(false)
      setShowSuccess(true)
    }

    setIsProcessing(false)
  }

  const handleProductSubmit = (data: Omit<Product, "id" | "createdAt" | "userId">) => {
    if (editingProduct) {
      store.updateProduct(editingProduct.id, data)
    } else {
      store.addProduct(data)
    }
    setIsAddProductOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm(t("confirm_delete"))) {
      store.deleteProduct(id)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
      <div className="min-h-screen bg-background">
        <Sidebar role={user?.role as any || "admin"} />
        <main className="md:ml-64 flex h-screen flex-col bg-muted/30">
          <style dangerouslySetInnerHTML={{__html: `
            @page { size: auto; margin: 0mm; }
            @media print {
              [role="dialog"], [data-state="open"], aside, header { display: none !important; }
              body { background: white !important; margin: 0; padding: 0; }
              main { margin-left: 0 !important; }
            }
          `}} />
          {/* Header */}
          <header className="flex items-center justify-between border-b bg-card px-4 py-3 print:hidden">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary truncate md:hidden">{settings.name || "GacalSolution"}</h1>
              <span className="hidden sm:inline-block text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full border">
                POS Terminal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden lg:inline-block text-sm text-muted-foreground">
                {t("welcome")}, <span className="font-medium text-foreground">{user?.name}</span>
              </span>
              <LanguageSwitcher />
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsProductListOpen(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  Inventory
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAddProductOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden print:hidden">
          {/* Products section */}
          <div className="flex-1 overflow-auto p-4">
            {/* Search and filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`${t("search")}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />

              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? t("all_categories") : t(cat as any)}
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </div>

            {/* Products grid */}
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
          </div>

          {/* Cart section */}
          <div className="w-full max-w-sm border-l bg-card p-4">
            <Cart
              items={cart}
              onUpdateQty={handleUpdateQty}
              onUpdatePrice={handleUpdatePrice}
              onRemove={handleRemove}
              onCheckout={handleCheckoutClick}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Checkout dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Sale</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-between font-bold text-lg border-b pb-2">
                <span>Grand Total:</span>
                <span>${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">Payments</label>
                {payments.map((p, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={p.method} onValueChange={(val) => {
                      const newP = [...payments]; newP[index].method = val; setPayments(newP);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="EVC Plus">EVC Plus</SelectItem>
                        <SelectItem value="Edahab">Edahab</SelectItem>
                        <SelectItem value="Jeeb">Jeeb</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      value={p.amount}
                      onChange={(e) => {
                        const newP = [...payments]; newP[index].amount = e.target.value; setPayments(newP);
                      }}
                      className="flex-1"
                      placeholder="0.00"
                    />
                    {payments.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newP = [...payments]; newP.splice(index, 1); setPayments(newP);
                      }}>X</Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPayments([...payments, { method: "Cash", amount: "" }])}>
                  + Add Split Payment
                </Button>
              </div>

              {(() => {
                const grandTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
                const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                const remaining = grandTotal - totalPaid;

                return (
                  <>
                    {remaining > 0.01 && (
                      <div className="flex flex-col gap-2 mt-2 p-3 bg-red-50 text-red-900 rounded-md border border-red-200">
                        <div className="flex justify-between font-bold text-sm">
                          <span>Remaining (Debt):</span>
                          <span>${remaining.toFixed(2)}</span>
                        </div>
                        <label className="text-sm font-medium mt-1">Assign to Customer</label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Walk-in (No Debt Allowed) --</SelectItem>
                            {customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {remaining < -0.01 && (
                      <div className="flex justify-between font-bold text-green-600 border-t pt-2 mt-2">
                        <span>Change to Return:</span>
                        <span>${Math.abs(remaining).toFixed(2)}</span>
                      </div>
                    )}

                    <Button 
                      onClick={handleProcessSale} 
                      disabled={isProcessing || (remaining > 0.01 && customerId === "none")} 
                      className="mt-4 w-full"
                    >
                      {isProcessing ? t("processing") : (remaining > 0.01 ? "Confirm Payment & Record Debt" : "Confirm Payment")}
                    </Button>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Success dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-6 w-6" />
                {t("sale_complete")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground mb-4">{t("transaction_recorded")}</p>
            <div className="flex gap-4">
               <Button onClick={() => window.print()} className="flex-1"><Printer className="w-4 h-4 mr-2" /> Print Receipt</Button>
               <Button variant="outline" onClick={() => setShowSuccess(false)} className="flex-1">New Sale</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Printable Receipt (Hidden from screen) */}
        {lastSale && (
           <div className="hidden print:flex justify-center w-full absolute top-0 left-0 bg-white z-[9999] min-h-screen pt-8">
             <div className="text-gray-800 p-6 text-[13px] font-sans w-[80mm] mx-auto bg-[#f5f5f5] shadow-sm">
               <div className="text-center mb-4">
                 <div className="flex justify-center mb-2">
                   {settings.logo ? (
                     <img src={settings.logo} alt="Logo" className="w-12 h-12 rounded-full object-contain bg-white" />
                   ) : (
                     <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-xl">
                       {settings.name ? settings.name.substring(0, 2).toUpperCase() : "GS"}
                     </div>
                   )}
                 </div>
                 <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">{settings.name || "GacalSolution"}</h2>
                 {settings.address && <p className="text-[11px] text-gray-500">{settings.address}</p>}
                 {settings.phone && <p className="text-[11px] text-gray-500 mb-2">{settings.phone}</p>}
                 <h3 className="text-2xl font-bold tracking-widest text-gray-800 mt-2">RECEIPT</h3>
               </div>

               <div className="border-t-2 border-dashed border-gray-400 mb-1"></div>
               <div className="border-t-2 border-dashed border-gray-400 mb-6"></div>

               <div className="flex flex-col gap-2 mb-6">
                 {lastSale.items.map((item: any) => (
                   <div key={item.id} className="flex justify-between text-gray-600">
                     <span className="truncate max-w-[160px]">{item.qty}x {item.productName}</span>
                     <span>$ {(item.price * item.qty).toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="border-t border-solid border-gray-300 mb-4"></div>

               <div className="flex justify-between font-bold text-gray-800 mb-4">
                 <span>TOTAL AMOUNT</span>
                 <span>${lastSale.total.toFixed(2)}</span>
               </div>

               <div className="border-t border-dashed border-gray-400 mb-4"></div>

               <div className="flex flex-col gap-1 text-gray-500 mb-12 text-sm">
                 {(lastSale.payments || [{method: lastSale.paymentMethod, amount: lastSale.amountPaid}]).map((p: any, idx: number) => (
                   <div key={idx} className="flex justify-between uppercase">
                     <span>{p.method}</span>
                     <span>${p.amount.toFixed(2)}</span>
                   </div>
                 ))}
                 {lastSale.customerId && lastSale.customerId !== 'none' && lastSale.total > lastSale.amountPaid && (
                   <div className="flex justify-between uppercase font-bold text-gray-800 mt-1">
                     <span>DEBT (UNPAID)</span>
                     <span>${(lastSale.total - lastSale.amountPaid).toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between mt-1 pt-1 border-t border-dashed border-gray-300">
                   <span>CHANGE</span>
                   <span>$ {lastSale.changeReturned.toFixed(2)}</span>
                 </div>
               </div>

               <div className="text-center mb-8">
                 <h3 className="text-xl font-bold text-gray-800">{settings.receiptFooter || "THANK YOU"}</h3>
               </div>

               <div className="text-center">
                 {/* Fake Barcode */}
                 <div className="flex justify-center mb-2">
                   <div className="font-barcode text-5xl tracking-tighter text-gray-800 scale-y-150">
                     ||| |||| || ||| | ||| ||||
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}
        {/* Product List Dialog */}
        <Dialog open={isProductListOpen} onOpenChange={setIsProductListOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Product Inventory</span>
                <Button size="sm" onClick={() => { setIsProductListOpen(false); setIsAddProductOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setIsAddProductOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isAddProductOpen} onOpenChange={(open) => { setIsAddProductOpen(open); if (!open) setEditingProduct(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct || undefined} 
              onSubmit={handleProductSubmit} 
              onCancel={() => setIsAddProductOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}
