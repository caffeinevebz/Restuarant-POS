// Core domain models for The Caffeine Ministry POS

export interface Category {
  id: string
  name: string
  icon: string // emoji
  color: string // accent color used in the UI
}

export interface ModifierOption {
  id: string
  name: string
  priceDelta: number
}

export interface ModifierGroup {
  id: string
  name: string
  /** must the customer pick an option from this group? */
  required: boolean
  /** may more than one option be selected at once? */
  multiple: boolean
  options: ModifierOption[]
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  icon: string // emoji
  description?: string
  available: boolean
  /** ids of the modifier groups that apply to this product */
  modifierGroupIds: string[]
}

export interface CartLineModifier {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceDelta: number
}

export interface CartLine {
  /** unique per cart line so identical products with different mods coexist */
  id: string
  productId: string
  name: string
  icon: string
  basePrice: number
  quantity: number
  modifiers: CartLineModifier[]
  notes?: string
}

export type OrderType = 'dine-in' | 'takeaway'
export type PaymentMethod = 'cash' | 'card'
export type DiscountType = 'percent' | 'amount'
export type OrderStatus = 'completed' | 'refunded'

export interface Payment {
  method: PaymentMethod
  tendered?: number
  change?: number
}

export interface Order {
  id: string
  number: number
  createdAt: string // ISO timestamp
  lines: CartLine[]
  orderType: OrderType
  cashier: string
  subtotal: number
  discountType: DiscountType | null
  discountValue: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  payment: Payment
  status: OrderStatus
}

export interface Settings {
  storeName: string
  tagline: string
  address: string
  phone: string
  currencySymbol: string
  taxRate: number // percentage, e.g. 10 = 10%
  taxLabel: string
  cashierName: string
}
