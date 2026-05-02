"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/store"
import { Upload, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"


interface ProductFormProps {
  product?: Product
  onSubmit: (data: Omit<Product, "id" | "createdAt">) => void
  onCancel: () => void
}

const CATEGORY_KEYS: (keyof typeof translations.en)[] = [
  "cat_baby",
  "cat_accessories",
  "cat_automotive",
  "cat_cosmetics",
  "cat_stationery",
  "cat_industrial",
  "cat_office",
  "cat_pets",
  "cat_digital",
  "cat_furniture",
  "cat_gardening",
  "cat_toys",
  "cat_books",
  "cat_health",
  "cat_gaming",
  "cat_food",
  "cat_jewelry",
  "cat_pharma",
  "cat_clothing",
  "cat_shoes",
  "cat_electronics",
  "cat_art",
  "cat_hardware",
  "cat_sports",
  "cat_kitchen",
  "cat_audio",
  "cat_building",
  "cat_tools",
  "cat_appliances",
  "cat_musical",
  "cat_beauty",
  "cat_groceries",
  "cat_services",
  "cat_software",
  "cat_other",
]







export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "",
    category: product?.category || "cat_electronics",

    image: product?.image || "",
    barcode: product?.barcode || "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData({ ...formData, image: base64String })
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      category: formData.category,
      image: formData.image || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(formData.name)}`,
      barcode: formData.barcode,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="name" className="text-sm">
          {t("product_name")}
        </Label>

        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="h-8 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="price" className="text-sm">
            {t("price")} ($)
          </Label>

          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="stock" className="text-sm">
            {t("stock")}
          </Label>

          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="category" className="text-sm">
          {t("category")}
        </Label>

        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t("category")} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_KEYS.map((key) => (
              <SelectItem key={key} value={key} className="text-sm">
                {t(key)}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="barcode" className="text-sm">
          {t("barcode")} ({t("cat_other").toLowerCase()})
        </Label>

        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          placeholder={t("barcode")}
          className="h-8 text-sm"
        />

      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm">{t("product_image")}</Label>

        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

        {imagePreview ? (
          <div className="relative w-full h-28 border rounded-md overflow-hidden bg-muted">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Product preview"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-28 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs font-medium">{t("upload_image")}</span>
            <span className="text-xs">{t("image_size_limit")}</span>
          </button>

        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} size="sm" className="flex-1 bg-transparent">
          {t("cancel")}
        </Button>
        <Button type="submit" size="sm" className="flex-1">
          {product ? t("update") : t("create")} {t("products").slice(0, -1)}
        </Button>

      </div>
    </form>
  )
}
