import { useMemo, useState } from 'react'
import type { CartLineModifier, ModifierGroup, Product } from '../types'
import Modal from './Modal'
import { useMenuStore } from '../store/useMenuStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { money, round2 } from '../utils/format'

interface Props {
  product: Product | null
  onClose: () => void
  onConfirm: (
    product: Product,
    modifiers: CartLineModifier[],
    quantity: number,
    notes: string,
  ) => void
}

/** Build the initial selection: for a required single-choice group we
 *  pre-select the first option so the barista can add fast. */
function initialSelection(groups: ModifierGroup[]): Record<string, string[]> {
  const sel: Record<string, string[]> = {}
  for (const g of groups) {
    sel[g.id] = g.required && !g.multiple && g.options[0] ? [g.options[0].id] : []
  }
  return sel
}

export default function ModifierModal({ product, onClose, onConfirm }: Props) {
  const modifierGroupsFor = useMenuStore((s) => s.modifierGroupsFor)
  const symbol = useSettingsStore((s) => s.settings.currencySymbol)

  const groups = useMemo(
    () => (product ? modifierGroupsFor(product) : []),
    [product, modifierGroupsFor],
  )

  const [selection, setSelection] = useState<Record<string, string[]>>({})
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [initedFor, setInitedFor] = useState<string | null>(null)

  // Reset local state whenever a new product opens the modal.
  if (product && product.id !== initedFor) {
    setSelection(initialSelection(groups))
    setQuantity(1)
    setNotes('')
    setInitedFor(product.id)
  }

  if (!product) return null

  const toggle = (group: ModifierGroup, optionId: string) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? []
      if (group.multiple) {
        return {
          ...prev,
          [group.id]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        }
      }
      // single choice: required groups can't be un-picked
      if (current.includes(optionId)) {
        return group.required ? prev : { ...prev, [group.id]: [] }
      }
      return { ...prev, [group.id]: [optionId] }
    })
  }

  const chosen: CartLineModifier[] = groups.flatMap((g) =>
    (selection[g.id] ?? []).flatMap((optId) => {
      const opt = g.options.find((o) => o.id === optId)
      return opt
        ? [
            {
              groupId: g.id,
              groupName: g.name,
              optionId: opt.id,
              optionName: opt.name,
              priceDelta: opt.priceDelta,
            },
          ]
        : []
    }),
  )

  const unitPrice = round2(
    product.price + chosen.reduce((sum, m) => sum + m.priceDelta, 0),
  )
  const lineTotal = round2(unitPrice * quantity)

  const missingRequired = groups.some(
    (g) => g.required && (selection[g.id] ?? []).length === 0,
  )

  const confirm = () => {
    onConfirm(product, chosen, quantity, notes.trim())
    onClose()
  }

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={`${product.icon}  ${product.name}`}
      size="md"
      footer={
        <div className="modifier-footer">
          <div className="qty-stepper">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
          <button
            className="btn btn-primary btn-lg"
            disabled={missingRequired}
            onClick={confirm}
          >
            Add · {money(lineTotal, symbol)}
          </button>
        </div>
      }
    >
      {groups.map((group) => (
        <section className="modifier-group" key={group.id}>
          <div className="modifier-group-head">
            <h3>{group.name}</h3>
            <span className="modifier-hint">
              {group.required ? 'Required' : 'Optional'}
              {group.multiple ? ' · choose any' : ''}
            </span>
          </div>
          <div className="modifier-options">
            {group.options.map((opt) => {
              const active = (selection[group.id] ?? []).includes(opt.id)
              return (
                <button
                  key={opt.id}
                  className={'modifier-option' + (active ? ' active' : '')}
                  onClick={() => toggle(group, opt.id)}
                >
                  <span>{opt.name}</span>
                  {opt.priceDelta !== 0 && (
                    <span className="modifier-delta">
                      {opt.priceDelta > 0 ? '+' : '−'}
                      {money(Math.abs(opt.priceDelta), symbol)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <section className="modifier-group">
        <div className="modifier-group-head">
          <h3>Notes</h3>
          <span className="modifier-hint">Optional</span>
        </div>
        <input
          className="text-input"
          placeholder="e.g. extra hot, no sugar…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>
    </Modal>
  )
}
