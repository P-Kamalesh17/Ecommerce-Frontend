// src/context/DataContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

type Category = {
  categoryId : number
  categoryName: string
}

type DataContextType = {
  categories: Category[]
  loading: boolean
  products : Product[]
  handleCategoryId : (id : number) => void
  error: string | null
}
type Product = {
    id : number,
    name : string,
    categoryName: string,
    categoryId: number,
    description : string,
    imageUrl : string,
    price : number
    stockQuantity : number,
    createdAt : Date,
    updatedAt? : Date
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function CategoryDataProvider({ children }: { children: ReactNode }) {
  const [products, setProduct] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleCategoryId = (id : number) => {
    if(id === categoryId){
        setCategoryId(null);
    }
    else {
        setCategoryId(id);
    }
    // console.log(`category id : ${categoryId} `);
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login first.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          ((categoryId === null) ?
            "https://localhost:44357/api/Product/get-all-products" 
            : `https://localhost:44357/api/Product/get-by-category/${categoryId}`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Failed to fetch categories."
          )
        }
        // console.log(data);
        setProduct(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to fetch categories."
        )
      } finally {
        setLoading(false)
      }
    }
    fetchProducts();

  },[categoryId])
  useEffect(() => {

    const fetchCategories = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login first.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          "https://localhost:44357/api/Category/get-all-category",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Failed to fetch categories."
          )
        }
        // console.log(data);
        setCategories(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to fetch categories."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <DataContext.Provider value={{ categories,products, loading, error , handleCategoryId }}>
      {children}
    </DataContext.Provider>
  )
}

export function useCategoryData() {
  const context = useContext(DataContext)

  if (context === undefined) {
    throw new Error("useData must be used within a CategoryDataProvider.")
  }

  return context
}