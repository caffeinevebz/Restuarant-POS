import { create } from 'zustand'
import type {
  CartLine,
  CartLineModifier,
  DiscountType,
  OrderType,
  Product,
} from '../types'
import { uid } from '../utils/id'
import { lineTotal, round2 } from '../utils/format'

export interface CartTotals {
  subtotal: number
  discountAmount: number
  taxableBase: number
  taxAmount: number
  total: number
  itemCount: number
}

interface CartState {
  lines: CartLine[]
  orderType: OrderType
  discountType: DiscountType | null
  discountValue: number

  addLine: (
    product: Product,
    modifiers: CartLineModifier[],
    quantity?: number,
    notes?: string,
  ) => void
  setQuantity: (lineId: string, quantity: number) => void
  incrementLine: (lineId: string) => void
  decrementLine: (lineId: string) => void
  removeLine: (lineId: string) => void
  setOrderType: (t: OrderType) => void
  setDiscount: (type: DiscountType | null, value: number) => void
  clear: () => void

  totals: (taxRate: number) => CartTotals
}

/** Two lines can be merged when they are the same product with identical
 *  modifiers and notes — then we just bump the quantity. */
function sameLine(
  a: { productId: string; notes?: string; modifiers: CartLineModifier[] },
  b: { productId: string; notes?: string; modifiers: CartLineModifier[] },
): boolean {
  if (a.productId !== b.productId) return false
  if ((a.notes ?? '') !== (b.notes ?? '')) return false
  if (a.modifiers.length !== b.modifiers.length) return false
  const key = (m: CartLineModifier) => `${m.groupId}:${m.optionId}`
  const as = a.modifiers.map(key).sort().join('|')
  const bs = b.modifiers.map(key).sort().join('|')
  return as === bs
}

export const useCartStore = create<CartState>()((set, get) => ({
  lines: [],
  orderType: 'dine-in',
  discountType: null,
  discountValue: 0,

  addLine: (product, modifiers, quantity = 1, notes) =>
    set((s) => {
      const existing = s.lines.find((l) =>
        sameLine(l, { productId: product.id, notes, modifiers }),
      )
      if (existing) {
        return {
          lines: s.lines.map((l) =>
            l.id === existing.id
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          ),
        }
      }
      const line: CartLine = {
        id: uid('line'),
        productId: product.id,
        name: product.name,
        icon: product.icon,
        basePrice: product.price,
        quantity,
        modifiers,
        notes: notes || undefined,
      }
      return { lines: [...s.lines, line] }
    }),

  setQuantity: (lineId, quantity) =>
    set((s) => ({
      lines:
        quantity <= 0
          ? s.lines.filter((l) => l.id !== lineId)
          : s.lines.map((l) =>
              l.id === lineId ? { ...l, quantity } : l,
            ),
    })),

  incrementLine: (lineId) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === lineId ? { ...l, quantity: l.quantity + 1 } : l,
      ),
    })),

  decrementLine: (lineId) =>
    set((s) => ({
      lines: s.lines
        .map((l) =>
          l.id === lineId ? { ...l, quantity: l.quantity - 1 } : l,
        )
        .filter((l) => l.quantity > 0),
    })),

  removeLine: (lineId) =>
    set((s) => ({ lines: s.lines.filter((l) => l.id !== lineId) })),

  setOrderType: (t) => set({ orderType: t }),

  setDiscount: (type, value) =>
    set({ discountType: type, discountValue: Math.max(0, value) }),

  clear: () =>
    set({ lines: [], discountType: null, discountValue: 0, orderType: 'dine-in' }),

  totals: (taxRate) => {
    const { lines, discountType, discountValue } = get()
    const subtotal = round2(lines.reduce((sum, l) => sum + lineTotal(l), 0))

    let discountAmount = 0
    if (discountType === 'percent') {
      discountAmount = round2((subtotal * Math.min(discountValue, 100)) / 100)
    } else if (discountType === 'amount') {
      discountAmount = round2(Math.min(discountValue, subtotal))
    }

    const taxableBase = round2(subtotal - discountAmount)
    const taxAmount = round2((taxableBase * taxRate) / 100)
    const total = round2(taxableBase + taxAmount)
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)

    return { subtotal, discountAmount, taxableBase, taxAmount, total, itemCount }
  },
}))
