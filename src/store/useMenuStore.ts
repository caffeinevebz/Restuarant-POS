import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, ModifierGroup, Product } from '../types'
import {
  SEED_CATEGORIES,
  SEED_MODIFIER_GROUPS,
  SEED_PRODUCTS,
} from '../data/seed'
import { uid } from '../utils/id'

interface MenuState {
  categories: Category[]
  products: Product[]
  modifierGroups: ModifierGroup[]

  // Products
  addProduct: (p: Omit<Product, 'id'>) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleAvailability: (id: string) => void

  // Categories
  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  modifierGroupsFor: (product: Product) => ModifierGroup[]
  resetMenu: () => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      modifierGroups: SEED_MODIFIER_GROUPS,

      addProduct: (p) =>
        set((s) => ({ products: [...s.products, { ...p, id: uid('p') }] })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleAvailability: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, available: !p.available } : p,
          ),
        })),

      addCategory: (c) =>
        set((s) => ({
          categories: [...s.categories, { ...c, id: uid('cat') }],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          // detach products from the removed category
          products: s.products.map((p) =>
            p.categoryId === id ? { ...p, categoryId: '' } : p,
          ),
        })),

      modifierGroupsFor: (product) => {
        const groups = get().modifierGroups
        return product.modifierGroupIds
          .map((gid) => groups.find((g) => g.id === gid))
          .filter((g): g is ModifierGroup => Boolean(g))
      },

      resetMenu: () =>
        set({
          categories: SEED_CATEGORIES,
          products: SEED_PRODUCTS,
          modifierGroups: SEED_MODIFIER_GROUPS,
        }),
    }),
    { name: 'tcm-menu' },
  ),
)
