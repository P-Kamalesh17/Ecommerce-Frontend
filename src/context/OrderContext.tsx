import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { authFetch, tokenStore } from "@/lib/auth"
import { useCartData } from "@/context/CartContext"

export type OrderStatusName =
  | "Pending"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"

export type PaymentStatus = "Pending" | "Success" | "Failed" | "Refunded"

export type OrderItem = {
  id: number
  orderId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Order = {
  id: number
  userId: string
  orderStatus: OrderStatusName
  shippingAddress: string
  totalAmount: number
  createdAt: string
  updatedAt: string | null
  paymentId: number | null
  paymentStatus: PaymentStatus | null
  items: OrderItem[]
}

type OrderContextType = {
  orders: Order[]
  loading: boolean
  error: string | null
  getOrders: () => Promise<void>
  checkout: (shippingAddress?: string) => Promise<Order>
  confirmPayment: (orderId: number, transactionId: string) => Promise<void>
  failPayment: (orderId: number) => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Errors are either { message } or the ASP.NET validation shape { errors: {...} }
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (typeof body === "string") return body
    return (
      body.message ??
      (Object.values(body.errors ?? {}).flat()[0] as string | undefined) ??
      fallback
    )
  } catch {
    return fallback
  }
}

export function OrderDataProvider({ children }: { children: ReactNode }) {
  const { getCartItems } = useCartData()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrders = async (): Promise<void> => {
    if (!tokenStore.hasSession()) {
      setError("Please login first.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await authFetch(`/api/Order/my-orders`)

      if (!response.ok) {
        throw new Error(await readError(response, "Failed to load orders."))
      }
      setOrders(await response.json())
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load orders."
      )
    } finally {
      setLoading(false)
    }
  }

  const checkout = async (shippingAddress?: string): Promise<Order> => {
    if (!tokenStore.hasSession()) {
      throw new Error("Please login first.")
    }

    const address = shippingAddress?.trim()
    const response = await authFetch(`/api/Order/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address ? { shippingAddress: address } : {}),
    })

    if (!response.ok) {
      throw new Error(await readError(response, "Checkout failed."))
    }

    const order: Order = await response.json()
    await getCartItems() // cart is emptied by the server, refresh the badge
    return order
  }

  const confirmPayment = async (
    orderId: number,
    transactionId: string
  ): Promise<void> => {
    const response = await authFetch(`/api/Payment/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, transactionId }),
    })

    if (!response.ok) {
      throw new Error(await readError(response, "Payment failed."))
    }
    await getOrders()
  }

  const failPayment = async (orderId: number): Promise<void> => {
    const response = await authFetch(`/api/Payment/fail-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })

    if (!response.ok) {
      throw new Error(await readError(response, "Could not cancel payment."))
    }
    // order is cancelled and its items are back in the cart
    await Promise.all([getOrders(), getCartItems()])
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        getOrders,
        checkout,
        confirmPayment,
        failPayment,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrderData() {
  const context = useContext(OrderContext)

  if (context === undefined) {
    throw new Error("useOrderData must be used within an OrderDataProvider.")
  }

  return context
}
