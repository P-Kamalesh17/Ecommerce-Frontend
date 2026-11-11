export interface AuthResult {
  token: string
  refreshToken: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  address?: string | null
}

export interface Category {
  categoryId: number
  categoryName: string
}

export interface Product {
  id: number
  name: string
  description: string | null
  imageUrl: string
  price: number
  stockQuantity: number
  createdAt: string
  updatedAt: string | null
  categoryId: number
  categoryName: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  imageUrl: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Cart {
  id: number
  userId: string
  createdAt: string
  updatedAt: string | null
  items: CartItem[]
}

export interface CartSummary {
  subtotal: number
  discountAmount: number
  tax: number
  shippingCost: number
  totalAmount: number
}

export interface AddCartItemRequest {
  userId: string
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface MessageResponse {
  message: string
}
