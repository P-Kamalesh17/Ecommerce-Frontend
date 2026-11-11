import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOrderData, type Order } from "@/context/OrderContext"

// What to show for an order, per the payment table in the API docs
function paymentLabel(order: Order): {
  text: string
  canPay: boolean
  unknown: boolean
} {
  if (order.paymentId === null && order.paymentStatus === null) {
    return { text: "Payment status unknown", canPay: false, unknown: true }
  }
  if (order.paymentId === null && order.orderStatus === "Pending") {
    return { text: "Payment pending", canPay: true, unknown: false }
  }
  switch (order.paymentStatus) {
    case "Success":
      return { text: "Paid", canPay: false, unknown: false }
    case "Failed":
      return { text: "Payment failed", canPay: false, unknown: false }
    case "Refunded":
      return { text: "Refunded", canPay: false, unknown: false }
    default:
      return { text: "Payment pending", canPay: false, unknown: false }
  }
}

const Orders = () => {
  const { orders, loading, error, getOrders, confirmPayment, failPayment } =
    useOrderData()
  const [payOrder, setPayOrder] = useState<Order | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    getOrders()
  }, [])

  const closeDialog = () => {
    setPayOrder(null)
    setPayError(null)
  }

  // Simulated payment: there is no real provider, so make up a transaction id
  const handlePay = async () => {
    if (!payOrder) return
    setPaying(true)
    setPayError(null)
    try {
      await confirmPayment(payOrder.id, `TXN-${Date.now()}`)
      closeDialog()
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Payment failed.")
    } finally {
      setPaying(false)
    }
  }

  const handleCancel = async () => {
    if (!payOrder) return
    setPaying(true)
    setPayError(null)
    try {
      await failPayment(payOrder.id)
      closeDialog()
    } catch (error) {
      setPayError(
        error instanceof Error ? error.message : "Could not cancel payment."
      )
    } finally {
      setPaying(false)
    }
  }

  if (loading && orders.length === 0) {
    return <p className="p-4 text-center">Loading orders...</p>
  }

  if (error) {
    return <p className="p-4 text-center text-destructive">{error}</p>
  }

  if (orders.length === 0) {
    return (
      <p className="p-4 text-center text-muted-foreground">
        You have no orders yet.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const payment = paymentLabel(order)
          return (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{order.orderStatus}</Badge>
                  <Badge variant="outline">{payment.text}</Badge>
                </div>
              </div>

              <Separator className="my-3" />

              <ul className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>₹{item.subtotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <Separator className="my-3" />

              <p className="text-sm text-muted-foreground">
                Ship to: {order.shippingAddress}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">
                  Total ₹{order.totalAmount.toFixed(2)}
                </span>

                {payment.canPay && (
                  <Button onClick={() => setPayOrder(order)}>Pay now</Button>
                )}
                {payment.unknown && (
                  <Button variant="outline" onClick={() => getOrders()}>
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={payOrder !== null}
        onOpenChange={(open) => {
          if (!open && !paying) closeDialog()
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay for order #{payOrder?.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Amount</span>
              <span className="text-lg font-bold">
                ₹{payOrder?.totalAmount.toFixed(2)}
              </span>
            </div>

            {payError && (
              <p className="text-sm text-destructive">{payError}</p>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1 font-semibold"
                disabled={paying}
                onClick={handlePay}
              >
                {paying ? "Processing..." : "Pay"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={paying}
                onClick={handleCancel}
              >
                Cancel payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
