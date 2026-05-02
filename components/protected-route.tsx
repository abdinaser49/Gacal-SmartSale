"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRequireAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/store"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthorized } = useRequireAuth(allowedRoles)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user && !isAuthorized) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "admin":
          router.push("/admin")
          break
        case "manager":
          router.push("/manager")
          break
        case "cashier":
          router.push("/pos")
          break
      }
    }
  }, [isLoading, user, isAuthorized, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
