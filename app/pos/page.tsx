"use client"

import { useEffect, useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { ProductGrid } from "@/components/pos/product-grid"
import { Cart, type CartItem } from "@/components/pos/cart"
import { useAuth } from "@/lib/auth-context"
import { store, type Product } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, LogOut, CheckCircle, Printer } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"


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
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [amountPaid, setAmountPaid] = useState("")
  const [lastSale, setLastSale] = useState<any>(null)

  useEffect(() => {
    const updateProducts = () => setProducts(store.getProducts())
    updateProducts()
    const unsubscribe = store.subscribe(updateProducts)
    return () => unsubscribe()
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
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.1
    setAmountPaid(total.toFixed(2))
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

    const paid = parseFloat(amountPaid) || 0
    const sale = store.addSale(user.id, user.name, saleItems, paymentMethod, paid)

    if (sale) {
      setLastSale(sale)
      setCart([])
      setShowCheckout(false)
      setShowSuccess(true)
    }

    setIsProcessing(false)
  }

  return (
    <ProtectedRoute allowedRoles={["cashier"]}>
      <div className="flex h-screen flex-col bg-muted/30">
        <style dangerouslySetInnerHTML={{__html: `
          @page { size: auto; margin: 0mm; }
          @media print {
            [role="dialog"], [data-state="open"] { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
          }
        `}} />
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 print:hidden">
          <h1 className="text-xl font-bold text-primary">GacalSolution POS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t("welcome")}, <span className="font-medium text-foreground">{user?.name}</span>
            </span>
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={logout}>
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
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
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
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Amount Received ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <Button onClick={handleProcessSale} disabled={isProcessing} className="mt-2 w-full">
                {isProcessing ? t("processing") : "Confirm Payment"}
              </Button>
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
                   <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-xl">
                     GS
                   </div>
                 </div>
                 <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">GacalSolution</h2>
                 <p className="text-[11px] text-gray-500 mb-4">Business Management System</p>
                 <h3 className="text-2xl font-bold tracking-widest text-gray-800">RECEIPT</h3>
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
                 <div className="flex justify-between uppercase">
                   <span>{lastSale.paymentMethod === 'Cash' ? 'Cash' : lastSale.paymentMethod}</span>
                   <span>${lastSale.amountPaid.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>CHANGE</span>
                   <span>$ {lastSale.changeReturned.toFixed(2)}</span>
                 </div>
               </div>

               <div className="text-center mb-8">
                 <h3 className="text-2xl font-bold tracking-widest text-gray-800">THANK YOU</h3>
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
      </div>
    </ProtectedRoute>
  )
}
