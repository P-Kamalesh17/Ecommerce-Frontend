import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCartData } from "@/context/CartContext"

type CartItem = {
  id: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

type CartCardProps = {
  cartItem: CartItem
}

export function CartCard({ cartItem }: CartCardProps) {
  const {handleCartRemoveItem, updateCart} = useCartData();
  const [quantity, setQuantity] = useState(cartItem.quantity)

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1))
  }

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1)
  }

  const total = cartItem.unitPrice * quantity

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">{cartItem.productName}</CardTitle>

          <p className="text-sm text-muted-foreground">
            ₹{cartItem.unitPrice.toFixed(2)} each
          </p>
        </div>

        <Badge variant="secondary">In Cart</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantity</span>

          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>

            <span className="flex h-9 min-w-12 items-center justify-center border-y bg-background text-sm font-medium">
              {quantity}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={increaseQuantity}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Subtotal</span>

          <span className="text-lg font-semibold">
            ₹{total.toFixed(2)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button type="button" variant="secondary" disabled={quantity === cartItem.quantity} className="flex-1" onClick={() => updateCart(cartItem.id,quantity,cartItem.quantity)}>
          Update Cart
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          aria-label={`Remove ${cartItem.productName} from cart`}
          onClick={() => handleCartRemoveItem(cartItem.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}