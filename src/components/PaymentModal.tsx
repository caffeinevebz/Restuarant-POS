import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import type { Payment, PaymentMethod } from '../types'
import { money, round2 } from '../utils/format'

interface Props {
  open: boolean
  total: number
  symbol: string
  onClose: () => void
  onComplete: (payment: Payment) => void
}

/** Suggested cash tenders: exact, then the next round notes above the total. */
function quickTenders(total: number): number[] {
  const set = new Set<number>([round2(total)])
  const notes = [5, 10, 20, 50, 100]
  for (const n of notes) {
    if (n >= total) set.add(n)
    // also the next multiple of the note above the total
    const mult = Math.ceil(total / n) * n
    if (mult > total) set.add(mult)
  }
  return Array.from(set)
    .sort((a, b) => a - b)
    .slice(0, 6)
}

export default function PaymentModal({
  open,
  total,
  symbol,
  onClose,
  onComplete,
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [tendered, setTendered] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('card')
      setTendered('')
    }
  }, [open])

  const tenders = useMemo(() => quickTenders(total), [total])
  const tenderNum = Number(tendered) || 0
  const change = round2(Math.max(0, tenderNum - total))
  const cashShort = method === 'cash' && tenderNum < total

  const press = (key: string) => {
    setTendered((prev) => {
      if (key === 'back') return prev.slice(0, -1)
      if (key === 'clear') return ''
      if (key === '.' && prev.includes('.')) return prev
      // limit to 2 decimal places
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2 && key !== '.')
        return prev
      return prev + key
    })
  }

  const complete = () => {
    if (method === 'cash') {
      onComplete({ method: 'cash', tendered: tenderNum, change })
    } else {
      onComplete({ method: 'card' })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Payment" size="lg">
      <div className="payment">
        <div className="payment-due">
          <span>Amount due</span>
          <strong>{money(total, symbol)}</strong>
        </div>

        <div className="payment-method-toggle">
          <button
            className={method === 'card' ? 'active' : ''}
            onClick={() => setMethod('card')}
          >
            💳 Card
          </button>
          <button
            className={method === 'cash' ? 'active' : ''}
            onClick={() => setMethod('cash')}
          >
            💵 Cash
          </button>
        </div>

        {method === 'cash' ? (
          <div className="payment-cash">
            <div className="quick-tenders">
              {tenders.map((amt) => (
                <button
                  key={amt}
                  className="quick-tender"
                  onClick={() => setTendered(String(amt))}
                >
                  {amt === round2(total) ? 'Exact' : money(amt, symbol)}
                </button>
              ))}
            </div>

            <div className="cash-display">
              <div className="cash-field">
                <span>Tendered</span>
                <strong>{tendered ? money(tenderNum, symbol) : '—'}</strong>
              </div>
              <div className="cash-field change">
                <span>Change</span>
                <strong className={cashShort ? 'muted' : ''}>
                  {money(change, symbol)}
                </strong>
              </div>
            </div>

            <div className="keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map(
                (k) => (
                  <button
                    key={k}
                    className="keypad-key"
                    onClick={() => press(k)}
                  >
                    {k === 'back' ? '⌫' : k}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="payment-card">
            <div className="card-visual">
              <span className="card-chip" />
              <span className="card-tap">Tap or insert card</span>
            </div>
            <p className="card-hint">
              Confirm once the terminal approves the transaction.
            </p>
          </div>
        )}
      </div>

      <div className="payment-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary btn-lg"
          disabled={cashShort}
          onClick={complete}
        >
          {method === 'cash' ? `Tender · Change ${money(change, symbol)}` : 'Approve payment'}
        </button>
      </div>
    </Modal>
  )
}
