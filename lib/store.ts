import { supabase } from './supabase'

export type Role = "admin" | "manager" | "cashier"

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: Role
  parentId?: string
  isActive: boolean
  subscriptionExpiry?: string // ISO date string
}

export interface Customer {
  id: string
  name: string
  phone: string
  address?: string
  totalDebt: number
  userId: string
  createdAt: Date
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: Date
  userId: string
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  price: number
  costPrice?: number
  stock: number
  image: string
  category: string
  barcode?: string
  userId: string
  createdAt: Date
}

export interface Sale {
  id: string
  userId: string
  userName: string
  total: number
  paymentMethod: string
  payments?: { method: string; amount: number }[]
  paymentStatus: string
  amountPaid: number
  changeReturned: number
  customerId?: string
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

export interface CompanySettings {
  name: string
  logo: string
  phone: string
  address: string
  currency: string
  taxRate: number
  receiptFooter: string
}

// Initial mock data
const initialUsers: User[] = [
  { id: "1", name: "Admin", email: "admin@gacal.com", password: "admin123", role: "admin", isActive: true },
  { id: "2", name: "Manager", email: "manager@gacal.com", password: "manager123", role: "manager", isActive: true },
  { id: "3", name: "Cashier", email: "cashier@gacal.com", password: "cashier123", role: "cashier", isActive: true },
]

const initialProducts: Product[] = [
  { id: "p1", name: "Laptop HP", price: 500, costPrice: 400, stock: 10, category: "cat_electronics", image: "", barcode: "123456789", userId: "1", createdAt: new Date() },
  { id: "p2", name: "Wireless Mouse", price: 20, costPrice: 10, stock: 50, category: "cat_accessories", image: "", barcode: "987654321", userId: "1", createdAt: new Date() },
  { id: "p3", name: "Notebook", price: 5, costPrice: 3, stock: 100, category: "cat_stationery", image: "", barcode: "111222333", userId: "1", createdAt: new Date() }
]

const initialCustomers: Customer[] = [
  { id: "c1", name: "Ahmed Ali", phone: "0612345678", address: "Mogadishu", totalDebt: 0, userId: "1", createdAt: new Date() },
  { id: "c2", name: "Fatima Noor", phone: "0618765432", address: "Hargeisa", totalDebt: 50, userId: "1", createdAt: new Date() }
]

const initialExpenses: Expense[] = [
  { id: "e1", title: "Office Rent", amount: 200, category: "Rent", date: new Date(), userId: "1", createdAt: new Date() },
  { id: "e2", title: "Electricity", amount: 30, category: "Utilities", date: new Date(), userId: "1", createdAt: new Date() }
]

// Global state management connected to Supabase
class Store {
  private users: User[] = initialUsers
  private products: Product[] = initialProducts
  private sales: Sale[] = []
  private customers: Customer[] = initialCustomers
  private expenses: Expense[] = initialExpenses
  private settings: Record<string, CompanySettings> = {}
  private defaultSettings: CompanySettings = {
    name: "GacalSolution",
    logo: "",
    phone: "+252 61 000 0000",
    address: "Mogadishu, Somalia",
    currency: "USD",
    taxRate: 0,
    receiptFooter: "Thank you for your business!"
  }
  private subscribers: Set<() => void> = new Set()
  private currentUserId: string | null = null
  public isInitialized = false

  private get isMockMode() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co'
    return supabaseUrl.includes('placeholder')
  }

  constructor() {
    // Initialize data from Supabase asynchronously if on client side
    if (typeof window !== 'undefined') {
      this.loadUsers()
      this.loadAllData()

      if (!this.isMockMode) {
        this.initSupabase()
      } else {
        this.isInitialized = true
        this.notify()
      }
    }
  }

  private loadUsers() {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('gacal_users')
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed
        }
      } catch (e) {}
    }
    
    // Always ensure admin@gacal.com is in the list
    if (!this.users.some(u => u.email === 'admin@gacal.com')) {
      this.users.unshift(initialUsers[0])
    }
  }

  private loadAllData() {
    if (typeof window === 'undefined') return

    const id = this.currentUserId
    const suffix = id ? `_${id}` : ''

    const load = (key: string, defaultVal: any) => {
      const saved = localStorage.getItem(`gacal_${key}${suffix}`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return defaultVal
        }
      }
      return defaultVal
    }

    if (id) {
      this.products = load('products', initialProducts.filter(p => p.userId === id || !p.userId))
      this.sales = load('sales', [])
      this.customers = load('customers', initialCustomers.filter(c => c.userId === id || !c.userId))
      this.expenses = load('expenses', initialExpenses.filter(e => e.userId === id || !e.userId))
      
      // Load settings for this user
      const savedSettings = localStorage.getItem(`gacal_settings_${id}`)
      if (savedSettings) {
        try {
          this.settings[id] = JSON.parse(savedSettings)
        } catch (e) {
          this.settings[id] = { ...this.defaultSettings }
        }
      } else {
        this.settings[id] = { ...this.defaultSettings }
      }
    }
  }

  private saveAllData() {
    if (typeof window === 'undefined') return
    
    const id = this.currentUserId
    const suffix = id ? `_${id}` : ''

    localStorage.setItem('gacal_users', JSON.stringify(this.users))
    
    if (id) {
      localStorage.setItem(`gacal_products${suffix}`, JSON.stringify(this.products))
      localStorage.setItem(`gacal_sales${suffix}`, JSON.stringify(this.sales))
      localStorage.setItem(`gacal_customers${suffix}`, JSON.stringify(this.customers))
      localStorage.setItem(`gacal_expenses${suffix}`, JSON.stringify(this.expenses))
      if (this.settings[id]) {
        localStorage.setItem(`gacal_settings_${id}`, JSON.stringify(this.settings[id]))
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
        costPrice: p.cost_price ? Number(p.cost_price) : undefined,
        stock: p.stock_quantity,
        category: 'cat_electronics', // fallback category since real categories are UUID linked in db
        barcode: p.barcode || '',
        image: p.image_url || '',
        userId: p.user_id || 'unknown',
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
        customerId: s.customer_id,
        total: Number(s.total_amount),
        paymentMethod: s.payment_method || 'Cash',
        amountPaid: Number(s.amount_paid) || 0,
        changeReturned: Number(s.change_returned) || 0,
        paymentStatus: s.payment_status || 'paid',
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

  private notify(shouldSave = true) {
    if (shouldSave) this.saveAllData()
    this.subscribers.forEach((callback) => callback())
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback)
    return () => { this.subscribers.delete(callback) }
  }

  setCurrentUserId(id: string | null) {
    this.currentUserId = id
    this.loadUsers()
    this.loadAllData()
    this.notify()
  }

  // Auth
  authenticate(email: string, password?: string): User | null {
    this.loadUsers() // Load latest from storage
    if (this.isMockMode || true) { // Using mock users until Supabase Auth UI is fully integrated
      const user = this.users.find((u) => u.email === email && u.password === password)
      
      if (user && email !== 'admin@gacal.com') {
        // Check subscription expiry
        if (user.subscriptionExpiry) {
          const expiry = new Date(user.subscriptionExpiry)
          if (expiry < new Date()) {
            user.isActive = false // Auto-lock on expiry
            this.notify()
            throw new Error("SUBSCRIPTION_EXPIRED")
          }
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_LOCKED")
        }
      }
      return user || null
    }
    return null
  }

  getUsers(): User[] {
    if (this.currentUserId === 'admin@gacal.com') {
      return [...this.users]
    }
    if (!this.currentUserId) return []
    // Regular admins see themselves and their sub-users
    return this.users.filter((u) => u.id === this.currentUserId || u.parentId === this.currentUserId)
  }

  addUser(user: Omit<User, "id" | "parentId">): User {
    const newUser: User = { ...user, id: Math.random().toString(36).substring(2), parentId: this.currentUserId || undefined }
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
  register(name: string, email: string, password: string, businessName?: string, phone?: string, address?: string): User | null {
    this.loadUsers() // Load latest from storage before checking existence
    if (this.users.some(u => u.email === email)) return null
    const newUser: User = {
      id: Math.random().toString(36).substring(2),
      name,
      email,
      password,
      role: "admin",
      isActive: true,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month trial
    }
    this.users.push(newUser)
    
    // Initialize settings for this user
    this.settings[newUser.id] = {
      ...this.defaultSettings,
      name: businessName || "My Store",
      phone: phone || "",
      address: address || ""
    }
    
    // Persist user-specific settings
    if (typeof window !== 'undefined') {
      localStorage.setItem(`gacal_settings_${newUser.id}`, JSON.stringify(this.settings[newUser.id]))
    }

    this.notify()
    return newUser
  }
  // Products
  getProducts(): Product[] {
    if (!this.currentUserId) return []
    return this.products.filter(p => p.userId === this.currentUserId)
  }

  getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  addProduct(product: Omit<Product, "id" | "createdAt" | "userId">): Product {
    const newProduct: Product = { ...product, id: crypto.randomUUID(), createdAt: new Date(), userId: this.currentUserId || 'unknown' }
    this.products.push(newProduct) // optimistic update
    this.notify()

    if (!this.isMockMode) {
      supabase.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        selling_price: newProduct.price,
        cost_price: newProduct.costPrice || 0,
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
      if (data.costPrice !== undefined) updatePayload.cost_price = data.costPrice
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
    if (!this.currentUserId) return []
    return this.customers
      .filter(c => c.userId === this.currentUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addCustomer(customer: Omit<Customer, "id" | "createdAt" | "totalDebt" | "userId">): Customer {
    const newCustomer: Customer = { ...customer, id: crypto.randomUUID(), totalDebt: 0, createdAt: new Date(), userId: this.currentUserId || 'unknown' }
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
    if (!this.currentUserId) return []
    return this.expenses
      .filter(e => e.userId === this.currentUserId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  addExpense(expense: Omit<Expense, "id" | "createdAt" | "userId">): Expense {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID(), createdAt: new Date(), userId: this.currentUserId || 'unknown' }
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
    if (!this.currentUserId) return []
    return this.sales
      .filter(s => s.userId === this.currentUserId || s.userId === 'unknown') // also show sales for sub-users if needed
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addSale(userId: string, userName: string, items: Omit<SaleItem, "id" | "saleId">[], payments: { method: string, amount: number }[], customerId?: string): Sale | null {
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
    const finalAmountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const changeReturned = finalAmountPaid > total ? finalAmountPaid - total : 0
    const paymentStatus = finalAmountPaid >= total ? 'paid' : (finalAmountPaid > 0 ? 'partial' : 'pending')
    
    // Determine primary payment method name
    const paymentMethod = payments.length > 1 ? 'Split' : (payments[0]?.method || 'Cash')

    for (const item of items) {
      this.reduceStock(item.productId, item.qty)
    }

    // Assign debt to customer if partial payment
    if (finalAmountPaid < total && customerId && customerId !== "none") {
      const debtAmount = total - finalAmountPaid;
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
        this.updateCustomer(customerId, { totalDebt: customer.totalDebt + debtAmount });
      }
    }

    const sale: Sale = {
      id: saleId,
      userId,
      userName,
      customerId,
      total,
      paymentMethod,
      payments,
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
        customer_id: customerId !== "none" ? customerId : null,
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
    return this.getSales().filter((s) => s.createdAt >= today).reduce((sum, s) => sum + s.total, 0)
  }

  getTotalSales(): number {
    return this.getSales().reduce((sum, s) => sum + s.total, 0)
  }

  getTransactionCount(): number {
    return this.getSales().length
  }

  getLowStockProducts(threshold = 10): Product[] {
    return this.getProducts().filter((p) => p.stock <= threshold)
  }

  getSalesByDay(days = 7): { date: string; total: number }[] {
    const result: { date: string; total: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayTotal = this.getSales()
        .filter((s) => s.createdAt >= date && s.createdAt < nextDate)
        .reduce((sum, s) => sum + s.total, 0)

      result.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        total: dayTotal,
      })
    }
    return result
  }

  // Settings
  getSettings(): CompanySettings {
    if (this.currentUserId && this.settings[this.currentUserId]) {
      return { ...this.settings[this.currentUserId] }
    }
    return { ...this.defaultSettings }
  }

  updateSettings(data: Partial<CompanySettings>) {
    if (!this.currentUserId) return

    this.settings[this.currentUserId] = { 
      ...(this.settings[this.currentUserId] || this.defaultSettings), 
      ...data 
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`gacal_settings_${this.currentUserId}`, JSON.stringify(this.settings[this.currentUserId]))
    }
    this.notify()
  }

  resetAllData() {
    this.products = []
    this.sales = []
    this.customers = []
    this.expenses = []
    this.notify()
    
    // If we want to persist the "empty" state in mock mode, 
    // we would need to save to localStorage. 
    // For now, this clears the current session's data.
  }
}

export const store = new Store()
