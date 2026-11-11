// src/context/DataContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import { authFetch, tokenStore } from "@/lib/auth"


type DataContextType = {
  loading: boolean
  cartItems : CartItem[]
  cartLength : number
  navigate: NavigateFunction
  handleCartItem : (id : number, quant : number) => Promise<void>
  handleCartRemoveItem : (cartItemId : number) => Promise<void>
  updateCart: (cartItemId : number, quant : number,oldQuant : number) => Promise<void>
  getCartItems : () => Promise<void>
  error: string | null
}

type CartItem = {
    id : number,
    productId : number,
    productName : string
    imageUrl : string,
    unitPrice : number,
    quantity : number,
    subtotal : number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function CartDataProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLength,setCartLength] = useState<number>(0);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  const handleCartItem = async (
    productId: number,
    quantity: number
    ): Promise<void> => {
        if (!productId || quantity <= 0) {
            setError("Invalid product or quantity.")
            return
        }

        if (!tokenStore.hasSession()) {
            setError("Please login first.")
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await authFetch(
            `/api/Cart/items`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                }),
            }
            )

            const contentType = response.headers.get("content-type")

            const data = contentType?.includes("application/json")
            ? await response.json()
            : await response.text()

            console.log("Cart API response:", data)

            if (!response.ok) {
                const message =
                    typeof data === "string"
                    ? data
                    : data.message || data.error || "Failed to add item to cart."

                throw new Error(message)
            }

            console.log("Product added to cart successfully.")
            await getCartItems()
        } catch (error) {
            setError(
            error instanceof Error
                ? error.message
                : "Unable to add item to cart."
            )
        } finally {
            setLoading(false)
        }
    }

    const updateCart = async (cartItemId : number, quant : number,oldQuant : number) : Promise<void> => {
        console.log(cartItemId);
        if(quant === oldQuant) {
            console.log("same"); 
            return;
        }
        if (!tokenStore.hasSession()) {
            setError("Please login first.")
            return
        }
        try {
            const responce = await authFetch(`/api/Cart/items/${cartItemId}`,{
                method : "PUT",
                headers: {
                        "Content-Type": "application/json",
                    },
                
                body : JSON.stringify({
                    quantity: quant
                })
            })
            const data = await responce.json();
            if(!responce.ok){
                const message =
                    typeof data === "string"
                    ? data
                    : data.message || data.error || "Failed to add item to cart."

                throw new Error(message)
            }
        } catch (error) {
            setError(
            error instanceof Error
                ? error.message
                : "Unable to add item to cart."
            )
        }
        
    }
    const handleCartRemoveItem = async (cartItemId : number) : Promise<void> => {
        try {
            if (!tokenStore.hasSession()) {
                setError("Please login first.")
                return
            }
            setLoading(true);
        const responce = await authFetch(`/api/Cart/items/${cartItemId}`,{
                method : "DELETE",
            });
            const data = await responce.json();
            if(!responce.ok){
                const message =
                        typeof data === "string"
                        ? data
                        : data.message || data.error || "Failed to add item to cart."

                throw new Error(message)
            }
            setCartItems((previousItems) => {
                const updatedItems = previousItems.filter((item) => item.id !== cartItemId)
                setCartLength(updatedItems.length)
                return updatedItems
            })
        } catch (error) {
            console.log(error);
        }
        finally{
            setLoading(false)
        }
    }
    const getCartItems = async () : Promise<void> => {
            if (!tokenStore.hasSession()) {
                setError("Please login first.")
                setLoading(false)
                return
            }

            setError(null) // clear the stale "Please login first." from before login

            try {
                const responce = await authFetch(`/api/Cart`)
                // 404 = this user has no cart yet, treat as empty
                if(responce.status === 404){
                    setCartItems([])
                    setCartLength(0)
                    return
                }
                const data = await responce.json();
                if(!responce.ok){
                        const message =
                        typeof data === "string"
                        ? data
                        : data.message || data.error || "Failed to load cart."

                    throw new Error(message)
                }
                setCartItems(data.items)
                setCartLength(data.items.length)
                console.log(data.items);
            } catch (error) {
                console.log(error);
            }
            finally{
                setLoading(false);
            }
        }
    
    useEffect(()=> {
        getCartItems();
    },[])

  return (
    <DataContext.Provider value={{ loading, cartLength, cartItems,navigate, error,getCartItems, handleCartItem,handleCartRemoveItem, updateCart }}>
      {children}
    </DataContext.Provider>
  )
}

export function useCartData() {
  const context = useContext(DataContext)

  if (context === undefined) {
    throw new Error("useData must be used within a CategoryDataProvider.")
  }

  return context
}