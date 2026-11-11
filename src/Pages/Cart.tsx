import { CartCard } from "@/components/CartCard"
import { Button } from "@/components/ui/button"
import { useCartData } from "@/context/CartContext"
import { useOrderData } from "@/context/OrderContext"
import { authFetch, tokenStore } from "@/lib/auth"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type CartSummary = {
  subtotal: number
  discountAmount: number
  shippingCost: number
  tax: number
  totalAmount: number
}

const Carts = () => {
  const { cartItems, loading, error, cartLength,navigate } = useCartData()
  const { checkout } = useOrderData()
  const [open, setOpen] = useState<boolean>(false)
  const [summary, setSummary] = useState<CartSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)


  if (loading) {
    return <p className="p-4 text-center">Loading cart...</p>
  }

  if (error) {
    return <p className="p-4 text-center text-destructive">{error}</p>
  }

  if (cartItems.length === 0) {
    return <p className="p-4 text-center text-muted-foreground">Your cart is empty.</p>
  }

  const getSummary = async() => {
            if (!tokenStore.hasSession()) {
                navigate("/login")
                return
            }

            setSummaryLoading(true)
            setSummaryError(null)
            try {
                const responce = await authFetch(`/api/Cart/summary`)
                const data = await responce.json();
                if(!responce.ok){
                        const message =
                        typeof data === "string"
                        ? data
                        : data.message || data.error || "Failed to load summary."

                    throw new Error(message)
                }
                setSummary(data)
            } catch (error) {
                setSummaryError(
                  error instanceof Error ? error.message : "Failed to load summary."
                )
            } finally {
                setSummaryLoading(false)
            }
  }
  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartItems.map((cartItem) => (
          <CartCard key={cartItem.id} cartItem={cartItem} />
        ))}
      </div>
      {cartLength !== 0 && 
        <div className="flex w-full justify-center mt-4">
          <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" className="font-bold text-xl p-7" onClick={() => getSummary()}>CheckOut</Button>} />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          <ProfileForm
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
            checkout={checkout}
            setOpen={setOpen}
            navigate={navigate}
          />
        </DialogContent>
      </Dialog>
        </div>
      }
    </div>
  )
}

type ProfileFormProps = {
  summary: CartSummary | null
  loading: boolean
  error: string | null
  checkout : () => Promise<unknown>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  navigate: (path: string) => void
}

function ProfileForm({ summary, loading, error, checkout, setOpen, navigate }: ProfileFormProps) {
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  const handlePlaceOrder = async () => {
    setPlacing(true)
    setPlaceError(null)
    try {
      await checkout()
      setOpen(false)
      navigate("/orders")
    } catch (error) {
      setPlaceError(error instanceof Error ? error.message : "Checkout failed.")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Loading summary...</p>
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-destructive">{error}</p>
  }

  if (!summary) {
    return null
  }

  const rows: { label: string; value: number }[] = [
    { label: "Subtotal", value: summary.subtotal },
    { label: "Discount", value: -summary.discountAmount },
    { label: "Shipping", value: summary.shippingCost },
    { label: "Tax", value: summary.tax },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.value < 0 ? "text-emerald-600" : "text-foreground"}>
              {row.value < 0 ? "-" : ""}₹{Math.abs(row.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">Total</span>
        <span className="text-lg font-bold">₹{summary.totalAmount.toFixed(2)}</span>
      </div>

      {placeError && (
        <p className="text-sm text-destructive">{placeError}</p>
      )}

      <Button className="w-full font-semibold" disabled={placing} onClick={handlePlaceOrder}>
        {placing ? "Placing order..." : "Place Order"}
      </Button>
    </div>
  )
}

export default Carts