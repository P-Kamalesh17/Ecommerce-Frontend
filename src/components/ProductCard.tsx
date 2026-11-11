import { useState } from "react"
import { Minus, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Hero from "@/assets/react.svg"
import { useCartData } from "@/context/CartContext"

export type Product = {
  id: number
  name: string
  categoryName: string
  categoryId: number
  description: string
  imageUrl: string
  price: number
  stockQuantity: number
  createdAt: Date
  updatedAt?: Date
}

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const { handleCartItem } = useCartData();
  const [quantity, setQuantity] = useState(1)

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1))
  }

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(product.stockQuantity, previous + 1))
  }

  const isOutOfStock = product.stockQuantity <= 0

  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />

      <img
        src={(product.imageUrl)? `${API_BASE_URL}${product.imageUrl}` : Hero}
        alt={product.name}
        className="relative z-20 aspect-video w-full object-cover"
      />

      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{product.categoryName}</Badge>
        </CardAction>

        <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
        <CardDescription>{product.description}</CardDescription>

        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-foreground">₹{product.price}</p>

          <Badge variant="destructive" className="m-1">
            {isOutOfStock
              ? "Out of stock"
              : `${product.stockQuantity} available`}
          </Badge>
        </div>
      {/* Quantity selector */}
        <div className="flex w-full items-center justify-center ">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={decreaseQuantity}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>

          <span
            className="flex h-9 min-w-10 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium"
            aria-label={`Quantity: ${quantity}`}
          >
            {isOutOfStock ? 0 : quantity}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={increaseQuantity}
            disabled={isOutOfStock || quantity >= product.stockQuantity}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        </CardContent>
      <CardFooter className="flex-col gap-3">

        <Button className="w-full" disabled={isOutOfStock} onClick={() => handleCartItem(product.id,quantity)}>
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}