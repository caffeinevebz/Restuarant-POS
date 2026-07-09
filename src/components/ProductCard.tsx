import type { Product } from '../types'
import { money } from '../utils/format'
import { useSettingsStore } from '../store/useSettingsStore'

interface Props {
  product: Product
  onSelect: (product: Product) => void
  hasOptions: boolean
}

export default function ProductCard({ product, onSelect, hasOptions }: Props) {
  const symbol = useSettingsStore((s) => s.settings.currencySymbol)
  const disabled = !product.available

  return (
    <button
      className={'product-card' + (disabled ? ' unavailable' : '')}
      onClick={() => !disabled && onSelect(product)}
      disabled={disabled}
    >
      <span className="product-icon" aria-hidden>
        {product.icon}
      </span>
      <span className="product-name">{product.name}</span>
      {product.description && (
        <span className="product-desc">{product.description}</span>
      )}
      <span className="product-price">
        {money(product.price, symbol)}
        {hasOptions && <span className="product-badge">options</span>}
      </span>
      {disabled && <span className="product-soldout">Sold out</span>}
    </button>
  )
}
