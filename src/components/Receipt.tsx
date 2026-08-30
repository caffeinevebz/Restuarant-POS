import type { Order } from '../types'
import { useSettingsStore } from '../store/useSettingsStore'
import {
  formatDateTime,
  lineTotal,
  lineUnitPrice,
  money,
} from '../utils/format'

interface Props {
  order: Order
}

/** The printable receipt body. Reused on-screen and in the print window. */
export default function Receipt({ order }: Props) {
  const settings = useSettingsStore((s) => s.settings)
  const symbol = settings.currencySymbol

  return (
    <div className="receipt" id="receipt-print">
      <div className="receipt-head">
        <div className="receipt-logo">☕</div>
        <h2>{settings.storeName}</h2>
        <p className="receipt-tagline">{settings.tagline}</p>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>

      <div className="receipt-meta">
        <div>
          <span>Order</span>
          <strong>#{order.number}</strong>
        </div>
        <div>
          <span>Type</span>
          <strong>
            {order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
          </strong>
        </div>
        <div>
          <span>Cashier</span>
          <strong>{order.cashier}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{formatDateTime(order.createdAt)}</strong>
        </div>
      </div>

      <div className="receipt-divider" />

      <table className="receipt-items">
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.id} className="receipt-item">
              <td className="ri-qty">{line.quantity}×</td>
              <td className="ri-name">
                {line.name}
                {line.modifiers.length > 0 && (
                  <div className="ri-mods">
                    {line.modifiers.map((m) => m.optionName).join(', ')}
                  </div>
                )}
                {line.notes && <div className="ri-notes">“{line.notes}”</div>}
              </td>
              <td className="ri-price">
                {money(lineTotal(line), symbol)}
                {line.quantity > 1 && (
                  <div className="ri-each">
                    @ {money(lineUnitPrice(line), symbol)}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-divider" />

      <div className="receipt-totals">
        <div className="rt-row">
          <span>Subtotal</span>
          <span>{money(order.subtotal, symbol)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="rt-row">
            <span>Discount</span>
            <span>−{money(order.discountAmount, symbol)}</span>
          </div>
        )}
        <div className="rt-row">
          <span>
            {settings.taxLabel} ({order.taxRate}%)
          </span>
          <span>{money(order.taxAmount, symbol)}</span>
        </div>
        <div className="rt-row rt-grand">
          <span>Total</span>
          <span>{money(order.total, symbol)}</span>
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-payment">
        <div className="rt-row">
          <span>Paid ({order.payment.method})</span>
          <span>
            {money(
              order.payment.method === 'cash'
                ? order.payment.tendered ?? order.total
                : order.total,
              symbol,
            )}
          </span>
        </div>
        {order.payment.method === 'cash' && (
          <div className="rt-row">
            <span>Change</span>
            <span>{money(order.payment.change ?? 0, symbol)}</span>
          </div>
        )}
      </div>

      {order.status === 'refunded' && (
        <div className="receipt-refunded">REFUNDED</div>
      )}

      <div className="receipt-foot">
        <p>Thank you & stay caffeinated ☕</p>
        <p className="receipt-barcode">
          *{order.number.toString().padStart(8, '0')}*
        </p>
      </div>
    </div>
  )
}
