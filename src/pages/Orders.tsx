import { useMemo, useState } from 'react'
import { useOrdersStore } from '../store/useOrdersStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatDateTime, isToday, money } from '../utils/format'
import Receipt from '../components/Receipt'
import type { Order } from '../types'

type Filter = 'today' | 'all' | 'refunded'

export default function Orders() {
  const orders = useOrdersStore((s) => s.orders)
  const refundOrder = useOrdersStore((s) => s.refundOrder)
  const symbol = useSettingsStore((s) => s.settings.currencySymbol)

  const [filter, setFilter] = useState<Filter>('today')
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<Order | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter === 'today' && !isToday(o.createdAt)) return false
      if (filter === 'refunded' && o.status !== 'refunded') return false
      if (q) {
        const inNumber = String(o.number).includes(q)
        const inItems = o.lines.some((l) =>
          l.name.toLowerCase().includes(q),
        )
        if (!inNumber && !inItems) return false
      }
      return true
    })
  }, [orders, filter, search])

  const takings = filtered
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)

  const doRefund = (order: Order) => {
    if (
      window.confirm(
        `Refund order #${order.number} for ${money(order.total, symbol)}?`,
      )
    ) {
      refundOrder(order.id)
      setViewing((v) => (v && v.id === order.id ? { ...v, status: 'refunded' } : v))
    }
  }

  return (
    <div className="page orders-page">
      <header className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-sub">
            {filtered.length} order{filtered.length === 1 ? '' : 's'} ·{' '}
            {money(takings, symbol)} taken
          </p>
        </div>
        <input
          className="search-input"
          placeholder="🔍  Order # or item…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="segmented">
        {(['today', 'all', 'refunded'] as Filter[]).map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'today' ? 'Today' : f === 'all' ? 'All time' : 'Refunded'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span>🗂️</span>
          <p>No orders here yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <button
              key={order.id}
              className={
                'order-row' + (order.status === 'refunded' ? ' refunded' : '')
              }
              onClick={() => setViewing(order)}
            >
              <div className="order-row-num">
                <strong>#{order.number}</strong>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="order-row-items">
                {order.lines
                  .slice(0, 3)
                  .map((l) => `${l.quantity}× ${l.name}`)
                  .join(', ')}
                {order.lines.length > 3 && ` +${order.lines.length - 3} more`}
              </div>
              <div className="order-row-tags">
                <span className="tag">
                  {order.orderType === 'dine-in' ? '🍽️' : '🥡'}
                </span>
                <span className="tag">
                  {order.payment.method === 'cash' ? '💵' : '💳'}
                </span>
                {order.status === 'refunded' && (
                  <span className="tag tag-refunded">Refunded</span>
                )}
              </div>
              <div className="order-row-total">{money(order.total, symbol)}</div>
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div
            className="modal modal-sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="modal-header">
              <h2>Order #{viewing.number}</h2>
              <button
                className="modal-close"
                onClick={() => setViewing(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <div className="modal-body">
              <Receipt order={viewing} />
            </div>
            <footer className="modal-footer">
              <div className="receipt-actions">
                {viewing.status === 'completed' ? (
                  <button
                    className="btn btn-ghost danger"
                    onClick={() => doRefund(viewing)}
                  >
                    Refund
                  </button>
                ) : (
                  <span className="refunded-note">This order was refunded</span>
                )}
                <button
                  className="btn btn-ghost"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setViewing(null)}
                >
                  Done
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
