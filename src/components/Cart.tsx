import { useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { lineTotal, lineUnitPrice, money } from '../utils/format'
import type { DiscountType } from '../types'

interface Props {
  onCheckout: () => void
}

export default function Cart({ onCheckout }: Props) {
  const {
    lines,
    orderType,
    discountType,
    discountValue,
    setOrderType,
    incrementLine,
    decrementLine,
    removeLine,
    setDiscount,
    clear,
    totals,
  } = useCartStore()
  const settings = useSettingsStore((s) => s.settings)
  const symbol = settings.currencySymbol
  const t = totals(settings.taxRate)

  const [showDiscount, setShowDiscount] = useState(false)

  const applyDiscount = (type: DiscountType, value: number) => {
    if (!value || value <= 0) {
      setDiscount(null, 0)
    } else {
      setDiscount(type, value)
    }
    setShowDiscount(false)
  }

  return (
    <aside className="cart">
      <header className="cart-header">
        <h2>Current Order</h2>
        <div className="order-type-toggle">
          <button
            className={orderType === 'dine-in' ? 'active' : ''}
            onClick={() => setOrderType('dine-in')}
          >
            🍽️ Dine-in
          </button>
          <button
            className={orderType === 'takeaway' ? 'active' : ''}
            onClick={() => setOrderType('takeaway')}
          >
            🥡 Takeaway
          </button>
        </div>
      </header>

      <div className="cart-lines">
        {lines.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🧾</span>
            <p>No items yet</p>
            <span>Tap products to build the order</span>
          </div>
        ) : (
          lines.map((line) => (
            <div className="cart-line" key={line.id}>
              <div className="cart-line-main">
                <span className="cart-line-icon" aria-hidden>
                  {line.icon}
                </span>
                <div className="cart-line-info">
                  <div className="cart-line-name">
                    {line.name}
                    <span className="cart-line-unit">
                      {money(lineUnitPrice(line), symbol)} ea
                    </span>
                  </div>
                  {line.modifiers.length > 0 && (
                    <div className="cart-line-mods">
                      {line.modifiers.map((m) => m.optionName).join(' · ')}
                    </div>
                  )}
                  {line.notes && (
                    <div className="cart-line-notes">“{line.notes}”</div>
                  )}
                </div>
                <button
                  className="cart-line-remove"
                  onClick={() => removeLine(line.id)}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
              <div className="cart-line-foot">
                <div className="qty-stepper sm">
                  <button onClick={() => decrementLine(line.id)}>−</button>
                  <span>{line.quantity}</span>
                  <button onClick={() => incrementLine(line.id)}>+</button>
                </div>
                <span className="cart-line-total">
                  {money(lineTotal(line), symbol)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        {showDiscount ? (
          <DiscountEditor
            symbol={symbol}
            initialType={discountType ?? 'percent'}
            initialValue={discountValue}
            onApply={applyDiscount}
            onCancel={() => setShowDiscount(false)}
          />
        ) : (
          <div className="cart-total-rows">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{money(t.subtotal, symbol)}</span>
            </div>
            {t.discountAmount > 0 && (
              <div className="total-row discount">
                <span>
                  Discount
                  {discountType === 'percent' && ` (${discountValue}%)`}
                </span>
                <span>−{money(t.discountAmount, symbol)}</span>
              </div>
            )}
            <div className="total-row">
              <span>
                {settings.taxLabel} ({settings.taxRate}%)
              </span>
              <span>{money(t.taxAmount, symbol)}</span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span>{money(t.total, symbol)}</span>
            </div>
          </div>
        )}

        <div className="cart-actions">
          <button
            className="btn btn-ghost"
            onClick={() => setShowDiscount((v) => !v)}
            disabled={lines.length === 0}
          >
            {t.discountAmount > 0 ? 'Edit discount' : 'Discount'}
          </button>
          <button
            className="btn btn-ghost danger"
            onClick={clear}
            disabled={lines.length === 0}
          >
            Clear
          </button>
        </div>

        <button
          className="btn btn-primary btn-checkout"
          onClick={onCheckout}
          disabled={lines.length === 0}
        >
          Charge {money(t.total, symbol)}
          <span className="btn-checkout-count">{t.itemCount} items</span>
        </button>
      </div>
    </aside>
  )
}

interface DiscountEditorProps {
  symbol: string
  initialType: DiscountType
  initialValue: number
  onApply: (type: DiscountType, value: number) => void
  onCancel: () => void
}

function DiscountEditor({
  symbol,
  initialType,
  initialValue,
  onApply,
  onCancel,
}: DiscountEditorProps) {
  const [type, setType] = useState<DiscountType>(initialType)
  const [value, setValue] = useState(String(initialValue || ''))

  return (
    <div className="discount-editor">
      <div className="discount-type-toggle">
        <button
          className={type === 'percent' ? 'active' : ''}
          onClick={() => setType('percent')}
        >
          %
        </button>
        <button
          className={type === 'amount' ? 'active' : ''}
          onClick={() => setType('amount')}
        >
          {symbol}
        </button>
      </div>
      <input
        className="text-input"
        type="number"
        min="0"
        autoFocus
        placeholder={type === 'percent' ? 'Percent off' : 'Amount off'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="discount-editor-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onApply(type, Number(value) || 0)}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
