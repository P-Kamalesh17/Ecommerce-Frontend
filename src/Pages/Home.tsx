import CategoryList from '@/components/CategoryLisst'
import Products from '@/components/Products'
import { CategoryDataProvider } from '@/context/CategoryContext'
import React from 'react'

const Home = () => {
  return (
    <div>
        <CategoryDataProvider>
            <CategoryList/>
            <Products/>
        </CategoryDataProvider>
    </div>
  )
}

export default Home