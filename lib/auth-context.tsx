"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { store, type User, type Role } from "./store"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    localStorage.removeItem("gacal_user")
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    console.log("[v0] Attempting login with:", email)
    const authenticatedUser = store.authenticate(email, password)
    console.log("[v0] Auth result:", authenticatedUser)
    if (authenticatedUser) {
      setUser(authenticatedUser)
      localStorage.setItem("gacal_user", JSON.stringify(authenticatedUser))
      return { success: true }
    }
    return { success: false, error: "Invalid email or password" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gacal_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, isLoading } = useAuth()

  const isAuthorized = !isLoading && user && (!allowedRoles || allowedRoles.includes(user.role))

  return { user, isLoading, isAuthorized }
}
