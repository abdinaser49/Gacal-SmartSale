import { supabase } from './supabase'

export type Role = "admin" | "manager" | "cashier"

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: Role
}

export interface Customer {
  id: string
  name: string
  phone: string
  address?: string
  totalDebt: number
  createdAt: Date
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: Date
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  image: string
  category: string
  barcode?: string
  createdAt: Date
}

export interface Sale {
  id: string
  userId: string
  userName: string
  total: number
  paymentMethod: string
  paymentStatus: string
  amountPaid: number
  changeReturned: number
  items: SaleItem[]
  createdAt: Date
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  productName: string
  qty: number
  price: number
}

// Initial mock data
const initialUsers: User[] = [
  { id: "1", name: "Admin", email: "admin@gacal.com", password: "admin123", role: "admin" },
  { id: "2", name: "Manager", email: "manager@gacal.com", password: "manager123", role: "manager" },
  { id: "3", name: "Cashier", email: "cashier@gacal.com", password: "cashier123", role: "cashier" },
]

const initialProducts: Product[] = [
  { id: "p1", name: "Laptop HP", price: 500, stock: 10, category: "cat_electronics", image: "", barcode: "123456789", createdAt: new Date() },
  { id: "p2", name: "Wireless Mouse", price: 20, stock: 50, category: "cat_accessories", image: "", barcode: "987654321", createdAt: new Date() },
  { id: "p3", name: "Notebook", price: 5, stock: 100, category: "cat_stationery", image: "", barcode: "111222333", createdAt: new Date() }
]

const initialCustomers: Customer[] = [
  { id: "c1", name: "Ahmed Ali", phone: "0612345678", address: "Mogadishu", totalDebt: 0, createdAt: new Date() },
  { id: "c2", name: "Fatima Noor", phone: "0618765432", address: "Hargeisa", totalDebt: 50, createdAt: new Date() }
]

const initialExpenses: Expense[] = [
  { id: "e1", title: "Office Rent", amount: 200, category: "Rent", date: new Date(), createdAt: new Date() },
  { id: "e2", title: "Electricity", amount: 30, category: "Utilities", date: new Date(), createdAt: new Date() }
]

// Global state management connected to Supabase
class Store {
  private users: User[] = initialUsers
  private products: Product[] = initialProducts
  private sales: Sale[] = []
  private customers: Customer[] = initialCustomers
  private expenses: Expense[] = initialExpenses
  private listeners: Set<() => void> = new Set()
  public isInitialized = false

  private get isMockMode() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co'
    return supabaseUrl.includes('placeholder')
  }

  constructor() {
    // Initialize data from Supabase asynchronously if on client side
    if (typeof window !== 'undefined') {
      if (!this.isMockMode) {
        this.initSupabase()
      } else {
        // Mock mode initialization
        this.isInitialized = true
        this.notify()
      }
    }
  }

  private async initSupabase() {
    await Promise.all([
      this.fetchProducts(),
      this.fetchSales()
    ])
    this.isInitialized = true
    this.notify()

    // Realtime subscriptions
    supabase.channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        this.fetchProducts()
      })
      .subscribe()

    supabase.channel('public:sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        this.fetchSales()
      })
      .subscribe()
  }

  private async fetchProducts() {
    if (this.isMockMode) return
    const { data } = await supabase.from('products').select('*')
    if (data) {
      this.products = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.selling_price),
        stock: p.stock_quantity,
        category: 'cat_electronics', // fallback category since real categories are UUID linked in db
        barcode: p.barcode || '',
        image: p.image_url || '',
        createdAt: new Date(p.created_at)
      }))
      this.notify()
    }
  }

  private async fetchSales() {
    if (this.isMockMode) return
    const { data: salesData } = await supabase.from('sales').select('*, sale_items(*)')
    if (salesData) {
      this.sales = salesData.map((s: any) => ({
        id: s.id,
        userId: s.user_id || 'unknown',
        userName: 'User',
        total: Number(s.total_amount),
        items: (s.sale_items || []).map((i: any) => ({
          id: i.id,
          saleId: i.sale_id,
          productId: i.product_id,
          productName: 'Product', // You would typically join to get the real name
          qty: i.quantity,
          price: Number(i.price)
        })),
        createdAt: new Date(s.created_at)
      }))
      this.notify()
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  // Auth
  authenticate(email: string, password?: string): User | null {
    if (this.isMockMode || true) { // Using mock users until Supabase Auth UI is fully integrated
      return this.users.find((u) => u.email === email && u.password === password) || null
    }
    return null
  }

  getUsers(): User[] {
    return [...this.users]
  }

  addUser(user: Omit<User, "id">): User {
    const newUser = { ...user, id: crypto.randomUUID() }
    this.users.push(newUser)
    this.notify()
    return newUser
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return null
    this.users[index] = { ...this.users[index], ...data }
    this.notify()
    return this.users[index]
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return false
    this.users.splice(index, 1)
    this.notify()
    return true
  }

  // Products
  getProducts(): Product[] {
    return [...this.products]
  }

  getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  addProduct(product: Omit<Product, "id" | "createdAt">): Product {
    const newProduct = { ...product, id: crypto.randomUUID(), createdAt: new Date() }
    this.products.push(newProduct) // optimistic update
    this.notify()

    if (!this.isMockMode) {
      supabase.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        selling_price: newProduct.price,
        stock_quantity: newProduct.stock,
        barcode: newProduct.barcode,
        image_url: newProduct.image
      }).then(({ error }) => {
        if (error) console.error("Error adding product", error)
        else this.fetchProducts()
      })
    }
    
    return newProduct
  }

  updateProduct(id: string, data: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.products[index] = { ...this.products[index], ...data }
    this.notify() // optimistic update

    if (!this.isMockMode) {
      const updatePayload: any = {}
      if (data.name) updatePayload.name = data.name
      if (data.price !== undefined) updatePayload.selling_price = data.price
      if (data.stock !== undefined) updatePayload.stock_quantity = data.stock
      if (data.barcode) updatePayload.barcode = data.barcode
      if (data.image) updatePayload.image_url = data.image

      supabase.from('products').update(updatePayload).eq('id', id).then(({ error }) => {
        if (error) console.error("Error updating product", error)
      })
    }

    return this.products[index]
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return false
    this.products.splice(index, 1)
    this.notify()

    if (!this.isMockMode) {
      supabase.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.error("Error deleting product", error)
      })
    }

    return true
  }

  reduceStock(productId: string, qty: number): boolean {
    const product = this.products.find((p) => p.id === productId)
    if (!product || product.stock < qty) return false
    product.stock -= qty
    this.notify()
    
    if (!this.isMockMode) {
      // Handled by database trigger reduce_stock_after_sale in most cases
      // but if we call this directly, we update here too.
      supabase.rpc('reduce_stock_manual', { p_id: productId, p_qty: qty }).then()
    }

    return true
  }

  // Customers
  getCustomers(): Customer[] {
    return [...this.customers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addCustomer(customer: Omit<Customer, "id" | "createdAt" | "totalDebt">): Customer {
    const newCustomer = { ...customer, id: crypto.randomUUID(), totalDebt: 0, createdAt: new Date() }
    this.customers.push(newCustomer)
    this.notify()
    if (!this.isMockMode) {
      supabase.from('customers').insert({
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        total_debt: 0
      }).then()
    }
    return newCustomer
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer | null {
    const index = this.customers.findIndex((c) => c.id === id)
    if (index === -1) return null
    this.customers[index] = { ...this.customers[index], ...data }
    this.notify()
    if (!this.isMockMode) {
      supabase.from('customers').update({
        name: data.name,
        phone: data.phone,
        address: data.address,
        total_debt: data.totalDebt
      }).eq('id', id).then()
    }
    return this.customers[index]
  }

  deleteCustomer(id: string): boolean {
    const index = this.customers.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.customers.splice(index, 1)
    this.notify()
    if (!this.isMockMode) {
      supabase.from('customers').delete().eq('id', id).then()
    }
    return true
  }

  // Expenses
  getExpenses(): Expense[] {
    return [...this.expenses].sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
    const newExpense = { ...expense, id: crypto.randomUUID(), createdAt: new Date() }
    this.expenses.push(newExpense)
    this.notify()
    if (!this.isMockMode) {
      supabase.from('expenses').insert({
        id: newExpense.id,
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        date: newExpense.date.toISOString().split('T')[0]
      }).then()
    }
    return newExpense
  }

  deleteExpense(id: string): boolean {
    const index = this.expenses.findIndex((e) => e.id === id)
    if (index === -1) return false
    this.expenses.splice(index, 1)
    this.notify()
    if (!this.isMockMode) {
      supabase.from('expenses').delete().eq('id', id).then()
    }
    return true
  }

  // Sales
  getSales(): Sale[] {
    return [...this.sales].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addSale(userId: string, userName: string, items: Omit<SaleItem, "id" | "saleId">[], paymentMethod: string = "Cash", amountPaid?: number): Sale | null {
    for (const item of items) {
      const product = this.products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.qty) return null
    }

    const saleId = crypto.randomUUID()
    const saleItems: SaleItem[] = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      saleId,
    }))

    const total = saleItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const finalAmountPaid = amountPaid !== undefined ? amountPaid : total
    const changeReturned = finalAmountPaid > total ? finalAmountPaid - total : 0
    const paymentStatus = finalAmountPaid >= total ? 'paid' : (finalAmountPaid > 0 ? 'partial' : 'pending')

    for (const item of items) {
      this.reduceStock(item.productId, item.qty)
    }

    const sale: Sale = {
      id: saleId,
      userId,
      userName,
      total,
      paymentMethod,
      paymentStatus,
      amountPaid: finalAmountPaid,
      changeReturned,
      items: saleItems,
      createdAt: new Date(),
    }

    this.sales.push(sale)
    this.notify()

    if (!this.isMockMode) {
      // Insert sale to Supabase
      supabase.from('sales').insert({
        id: saleId,
        invoice_number: `INV-${Date.now()}`,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        amount_paid: finalAmountPaid,
        change_returned: changeReturned,
      }).then(({ error }) => {
        if (!error) {
          // Insert sale items
          const dbSaleItems = saleItems.map(si => ({
            id: si.id,
            sale_id: saleId,
            product_id: si.productId,
            quantity: si.qty,
            price: si.price,
            total: si.price * si.qty
          }))
          supabase.from('sale_items').insert(dbSaleItems).then(({ error: siError }) => {
             if (siError) console.error("Error adding sale items", siError)
             else this.fetchSales()
          })
        } else {
          console.error("Error adding sale", error)
        }
      })
    }

    return sale
  }

  // Analytics
  getTodayRevenue(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.sales.filter((s) => s.createdAt >= today).reduce((sum, s) => sum + s.total, 0)
  }

  getTotalSales(): number {
    return this.sales.reduce((sum, s) => sum + s.total, 0)
  }

  getTransactionCount(): number {
    return this.sales.length
  }

  getLowStockProducts(threshold = 10): Product[] {
    return this.products.filter((p) => p.stock <= threshold)
  }

  getSalesByDay(days = 7): { date: string; total: number }[] {
    const result: { date: string; total: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayTotal = this.sales
        .filter((s) => s.createdAt >= date && s.createdAt < nextDate)
        .reduce((sum, s) => sum + s.total, 0)

      result.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        total: dayTotal,
      })
    }
    return result
  }
}

export const store = new Store()
