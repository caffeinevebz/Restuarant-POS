import { useMemo, useState } from 'react'
import { useOrdersStore } from '../store/useOrdersStore'
import { useMenuStore } from '../store/useMenuStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { isToday, money } from '../utils/format'
import type { Order } from '../types'

type Range = 'today' | '7d' | '30d' | 'all'

function withinRange(order: Order, range: Range): boolean {
  if (range === 'all') return true
  if (range === 'today') return isToday(order.createdAt)
  const days = range === '7d' ? 7 : 30
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(order.createdAt).getTime() >= cutoff
}

export default function Reports() {
  const orders = useOrdersStore((s) => s.orders)
  const { products, categories } = useMenuStore()
  const settings = useSettingsStore((s) => s.settings)
  const symbol = settings.currencySymbol

  const [range, setRange] = useState<Range>('7d')

  const scoped = useMemo(
    () =>
      orders.filter(
        (o) => o.status === 'completed' && withinRange(o, range),
      ),
    [orders, range],
  )

  const kpis = useMemo(() => {
    const revenue = scoped.reduce((s, o) => s + o.total, 0)
    const count = scoped.length
    const items = scoped.reduce(
      (s, o) => s + o.lines.reduce((n, l) => n + l.quantity, 0),
      0,
    )
    const avg = count ? revenue / count : 0
    return { revenue, count, items, avg }
  }, [scoped])

  // Sales by category
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of scoped) {
      for (const l of o.lines) {
        const product = products.find((p) => p.id === l.productId)
        const catId = product?.categoryId ?? 'unknown'
        const unit =
          l.basePrice + l.modifiers.reduce((s, m) => s + m.priceDelta, 0)
        map.set(catId, (map.get(catId) ?? 0) + unit * l.quantity)
      }
    }
    return categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        value: map.get(c.id) ?? 0,
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [scoped, products, categories])

  // Top products by quantity
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; qty: number; revenue: number }>()
    for (const o of scoped) {
      for (const l of o.lines) {
        const unit =
          l.basePrice + l.modifiers.reduce((s, m) => s + m.priceDelta, 0)
        const prev = map.get(l.productId) ?? {
          name: l.name,
          icon: l.icon,
          qty: 0,
          revenue: 0,
        }
        map.set(l.productId, {
          name: l.name,
          icon: l.icon,
          qty: prev.qty + l.quantity,
          revenue: prev.revenue + unit * l.quantity,
        })
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
  }, [scoped])

  // Revenue for the last 7 calendar days (always daily, regardless of range)
  const daily = useMemo(() => {
    const buckets: { label: string; key: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      buckets.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        key: d.toDateString(),
        value: 0,
      })
    }
    for (const o of orders) {
      if (o.status !== 'completed') continue
      const key = new Date(o.createdAt).toDateString()
      const bucket = buckets.find((b) => b.key === key)
      if (bucket) bucket.value += o.total
    }
    return buckets
  }, [orders])

  // Payment + order-type mix
  const mix = useMemo(() => {
    let cash = 0
    let card = 0
    let dinein = 0
    let takeaway = 0
    for (const o of scoped) {
      if (o.payment.method === 'cash') cash += o.total
      else card += o.total
      if (o.orderType === 'dine-in') dinein += o.total
      else takeaway += o.total
    }
    return { cash, card, dinein, takeaway }
  }, [scoped])

  const maxCat = Math.max(1, ...byCategory.map((c) => c.value))
  const maxProd = Math.max(1, ...topProducts.map((p) => p.qty))
  const maxDaily = Math.max(1, ...daily.map((d) => d.value))
  const hasData = scoped.length > 0

  return (
    <div className="page reports-page">
      <header className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-sub">Sales performance & product insights</p>
        </div>
        <div className="segmented">
          {(['today', '7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              className={range === r ? 'active' : ''}
              onClick={() => setRange(r)}
            >
              {r === 'today'
                ? 'Today'
                : r === '7d'
                  ? '7 days'
                  : r === '30d'
                    ? '30 days'
                    : 'All'}
            </button>
          ))}
        </div>
      </header>

      <div className="kpi-row">
        <StatTile label="Revenue" value={money(kpis.revenue, symbol)} icon="💰" />
        <StatTile label="Orders" value={String(kpis.count)} icon="🧾" />
        <StatTile
          label="Avg order"
          value={money(kpis.avg, symbol)}
          icon="📈"
        />
        <StatTile label="Items sold" value={String(kpis.items)} icon="📦" />
      </div>

      {!hasData ? (
        <div className="empty-state">
          <span>📊</span>
          <p>No sales in this period yet.</p>
          <span>Take a few orders on the Register to see reports.</span>
        </div>
      ) : (
        <div className="reports-grid">
          <section className="card chart-card">
            <h3>Revenue · last 7 days</h3>
            <div className="vbar-chart">
              {daily.map((d) => (
                <div className="vbar-col" key={d.key} title={money(d.value, symbol)}>
                  <div className="vbar-track">
                    <div
                      className="vbar-fill"
                      style={{
                        height: `${(d.value / maxDaily) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="vbar-value">
                    {d.value > 0 ? money(d.value, symbol) : '—'}
                  </span>
                  <span className="vbar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card chart-card">
            <h3>Sales by category</h3>
            <div className="hbar-list">
              {byCategory.map((c) => (
                <div className="hbar-row" key={c.id}>
                  <span className="hbar-label">
                    <span aria-hidden>{c.icon}</span> {c.name}
                  </span>
                  <div className="hbar-track">
                    <div
                      className="hbar-fill"
                      style={{
                        width: `${(c.value / maxCat) * 100}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                  <span className="hbar-value">{money(c.value, symbol)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card chart-card">
            <h3>Top sellers</h3>
            <div className="hbar-list">
              {topProducts.map((p, i) => (
                <div className="hbar-row" key={p.name}>
                  <span className="hbar-label">
                    <span className="rank">{i + 1}</span>
                    <span aria-hidden>{p.icon}</span> {p.name}
                  </span>
                  <div className="hbar-track">
                    <div
                      className="hbar-fill accent"
                      style={{ width: `${(p.qty / maxProd) * 100}%` }}
                    />
                  </div>
                  <span className="hbar-value">{p.qty} sold</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card chart-card">
            <h3>Payment & service mix</h3>
            <div className="mix-block">
              <MixBar
                label="💵 Cash"
                value={mix.cash}
                total={mix.cash + mix.card}
                symbol={symbol}
              />
              <MixBar
                label="💳 Card"
                value={mix.card}
                total={mix.cash + mix.card}
                symbol={symbol}
              />
            </div>
            <div className="mix-block">
              <MixBar
                label="🍽️ Dine-in"
                value={mix.dinein}
                total={mix.dinein + mix.takeaway}
                symbol={symbol}
              />
              <MixBar
                label="🥡 Takeaway"
                value={mix.takeaway}
                total={mix.dinein + mix.takeaway}
                symbol={symbol}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: string
}) {
  return (
    <div className="stat-tile">
      <span className="stat-icon" aria-hidden>
        {icon}
      </span>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}

function MixBar({
  label,
  value,
  total,
  symbol,
}: {
  label: string
  value: number
  total: number
  symbol: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="mix-row">
      <span className="mix-label">{label}</span>
      <div className="mix-track">
        <div className="mix-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="mix-value">
        {money(value, symbol)} · {pct}%
      </span>
    </div>
  )
}
