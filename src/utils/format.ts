import type { CartLine } from '../types'

/** Round to 2 decimals avoiding binary float drift (e.g. 1.005). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function money(amount: number, symbol = '$'): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return `${symbol}${safe.toFixed(2)}`
}

/** Unit price of a cart line: base price plus every selected modifier. */
export function lineUnitPrice(line: CartLine): number {
  const mods = line.modifiers.reduce((sum, m) => sum + m.priceDelta, 0)
  return round2(line.basePrice + mods)
}

/** Total price of a cart line across its quantity. */
export function lineTotal(line: CartLine): number {
  return round2(lineUnitPrice(line) * line.quantity)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

/** Same calendar day as today, in local time. */
export function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
