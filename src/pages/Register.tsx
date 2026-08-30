import { useMemo, useState } from 'react'
import type { CartLineModifier, Order, Payment, Product } from '../types'
import { useMenuStore } from '../store/useMenuStore'
import { useCartStore } from '../store/useCartStore'
import { useOrdersStore } from '../store/useOrdersStore'
import { useSettingsStore } from '../store/useSettingsStore'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'
import ModifierModal from '../components/ModifierModal'
import PaymentModal from '../components/PaymentModal'
import ReceiptModal from '../components/ReceiptModal'

export default function Register() {
  const { categories, products, modifierGroupsFor } = useMenuStore()
  const cart = useCartStore()
  const addOrder = useOrdersStore((s) => s.addOrder)
  const settings = useSettingsStore((s) => s.settings)

  const [activeCat, setActiveCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [modifierProduct, setModifierProduct] = useState<Product | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [receipt, setReceipt] = useState<Order | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (activeCat !== 'all' && p.categoryId !== activeCat) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, activeCat, search])

  const selectProduct = (product: Product) => {
    const groups = modifierGroupsFor(product)
    if (groups.length > 0) {
      setModifierProduct(product)
    } else {
      cart.addLine(product, [], 1)
    }
  }

  const addConfigured = (
    product: Product,
    modifiers: CartLineModifier[],
    quantity: number,
    notes: string,
  ) => {
    cart.addLine(product, modifiers, quantity, notes)
  }

  const completeSale = (payment: Payment) => {
    const t = cart.totals(settings.taxRate)
    const order = addOrder({
      createdAt: new Date().toISOString(),
      lines: cart.lines,
      orderType: cart.orderType,
      cashier: settings.cashierName,
      subtotal: t.subtotal,
      discountType: cart.discountType,
      discountValue: cart.discountValue,
      discountAmount: t.discountAmount,
      taxRate: settings.taxRate,
      taxAmount: t.taxAmount,
      total: t.total,
      payment,
      status: 'completed',
    })
    cart.clear()
    setShowPayment(false)
    setReceipt(order)
  }

  const total = cart.totals(settings.taxRate).total

  return (
    <div className="register">
      <section className="catalog">
        <div className="catalog-toolbar">
          <input
            className="search-input"
            placeholder="🔍  Search the menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          <button
            className={'category-tab' + (activeCat === 'all' ? ' active' : '')}
            onClick={() => setActiveCat('all')}
          >
            <span className="category-tab-icon">✨</span>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={
                'category-tab' + (activeCat === cat.id ? ' active' : '')
              }
              style={
                activeCat === cat.id
                  ? { borderColor: cat.color, color: cat.color }
                  : undefined
              }
              onClick={() => setActiveCat(cat.id)}
            >
              <span className="category-tab-icon">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filtered.length === 0 ? (
            <div className="catalog-empty">
              <span>🫗</span>
              <p>No items match your search.</p>
            </div>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={selectProduct}
                hasOptions={product.modifierGroupIds.length > 0}
              />
            ))
          )}
        </div>
      </section>

      <Cart onCheckout={() => setShowPayment(true)} />

      <ModifierModal
        product={modifierProduct}
        onClose={() => setModifierProduct(null)}
        onConfirm={addConfigured}
      />

      <PaymentModal
        open={showPayment}
        total={total}
        symbol={settings.currencySymbol}
        onClose={() => setShowPayment(false)}
        onComplete={completeSale}
      />

      <ReceiptModal order={receipt} onClose={() => setReceipt(null)} />
    </div>
  )
}
