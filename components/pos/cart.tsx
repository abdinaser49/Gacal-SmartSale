"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useLanguage } from "@/lib/language-context"


export interface CartItem {
  productId: string
  productName: string
  price: number
  qty: number
  maxStock: number
}

interface CartProps {
  items: CartItem[]
  onUpdateQty: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove: (productId: string) => void
  onCheckout: () => void
  isProcessing: boolean
}

export function Cart({ items, onUpdateQty, onUpdatePrice, onRemove, onCheckout, isProcessing }: CartProps) {
  const { t } = useLanguage()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t("cart")} ({items.length})
        </CardTitle>

      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>{t("cart_is_empty")}</p>
          </div>

        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.productName}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    $
                    <Input
                      type="number"
                      step="0.01"
                      className="h-6 w-20 px-2 py-0 ml-1 text-xs"
                      value={item.price}
                      onChange={(e) => onUpdatePrice(item.productId, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                    disabled={item.qty <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                    disabled={item.qty >= item.maxStock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.productId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex-col gap-4 border-t pt-4">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("tax")} (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t("total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>

          </div>
          <Button className="w-full" size="lg" onClick={onCheckout} disabled={isProcessing}>
            {isProcessing ? t("processing") : `${t("checkout")} $${total.toFixed(2)}`}
          </Button>

        </CardFooter>
      )}
    </Card>
  )
}
