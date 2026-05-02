"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"


export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      // Get user role and redirect
      const savedUser = localStorage.getItem("gacal_user")
      if (savedUser) {
        const user = JSON.parse(savedUser)
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
    } else {
      setError(result.error || t("login_failed"))
      setIsLoading(false)
    }

  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center relative">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <CardTitle className="text-2xl font-bold">GacalSolution</CardTitle>
        <CardDescription>{t("sign_in_desc")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("enter_email")}

              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("enter_password")}

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("signing_in")}
              </>
            ) : (
              t("sign_in")
            )}
          </Button>


         
        </form>
      </CardContent>
    </Card>
  )
}
