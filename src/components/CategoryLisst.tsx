import React from 'react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useCategoryData } from '@/context/CategoryContext'

const CategoryList = () => {
    const {categories ,handleCategoryId} = useCategoryData();
  return (
    <div className='p-3'>
        <ToggleGroup variant="outline">
            {categories.map((category) => (
                <ToggleGroupItem  key={category.categoryId} onClick={() => handleCategoryId(category.categoryId)}>
                    {category.categoryName}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    </div>
  )
}

export default CategoryList