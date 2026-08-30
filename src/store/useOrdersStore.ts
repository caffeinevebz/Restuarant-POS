import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../types'
import { uid } from '../utils/id'

interface OrdersState {
  orders: Order[]
  nextNumber: number
  addOrder: (order: Omit<Order, 'id' | 'number'>) => Order
  refundOrder: (id: string) => void
  clearAll: () => void
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextNumber: 1001,

      addOrder: (order) => {
        const number = get().nextNumber
        const full: Order = { ...order, id: uid('ord'), number }
        set((s) => ({
          orders: [full, ...s.orders],
          nextNumber: s.nextNumber + 1,
        }))
        return full
      },

      refundOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: 'refunded' } : o,
          ),
        })),

      clearAll: () => set({ orders: [], nextNumber: 1001 }),
    }),
    { name: 'tcm-orders' },
  ),
)
