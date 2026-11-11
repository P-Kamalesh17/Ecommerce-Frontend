import { useCategoryData } from '@/context/CategoryContext'
import { ProductCard } from './ProductCard'

const Products = () => {
  const {products} = useCategoryData()
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
            <ProductCard key={product.id} product={product} />
        ))}
    </div>
  )
}

export default Products