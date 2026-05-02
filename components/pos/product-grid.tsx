"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/store"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isOutOfStock = product.stock === 0
        return (
          <Card
            key={product.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isOutOfStock && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !isOutOfStock && onAddToCart(product)}
          >
            <CardContent className="p-3">
              <div className="aspect-square relative mb-2 overflow-hidden rounded-md bg-muted">
                <img
                  src={product.image || "/placeholder.svg?height=100&width=100&query=product"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
