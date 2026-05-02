"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3, LogOut, Menu, X, UserCircle, Receipt, FileText, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { store } from "@/lib/store"


interface SidebarProps {
  role: "admin" | "manager"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [settings, setSettings] = useState(() => store.getSettings())

  useEffect(() => {
    const updateSettings = () => setSettings(store.getSettings())
    const unsubscribe = store.subscribe(updateSettings)
    return () => unsubscribe()
  }, [])

  const { t } = useLanguage()

  const adminLinks = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/customers", label: t("customers") || "Customers", icon: UserCircle },
    { href: "/admin/sales", label: t("sales"), icon: ShoppingCart },
    { href: "/admin/expenses", label: t("expenses") || "Expenses", icon: Receipt },
    { href: "/admin/reports", label: t("reports") || "Reports", icon: FileText },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const managerLinks = [
    { href: "/manager", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/manager/products", label: t("products"), icon: Package },
    { href: "/manager/customers", label: t("customers") || "Customers", icon: UserCircle },
    { href: "/manager/sales", label: t("sales"), icon: BarChart3 },
    { href: "/manager/expenses", label: t("expenses") || "Expenses", icon: Receipt },
    { href: "/manager/reports", label: t("reports") || "Reports", icon: FileText },
  ]


  const links = role === "admin" ? adminLinks : managerLinks

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold text-primary truncate">{settings.name || "GacalSolution"}</h1>
          </div>

          <nav className="flex-1 p-4">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t p-4 pb-12">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-3 text-muted-foreground hover:text-foreground"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </Button>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
