import { useState } from 'react'
import { useMenuStore } from '../store/useMenuStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { money } from '../utils/format'
import Modal from '../components/Modal'
import type { Product } from '../types'

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  categoryId: '',
  price: 0,
  icon: '☕',
  description: '',
  available: true,
  modifierGroupIds: [],
}

export default function MenuManager() {
  const {
    products,
    categories,
    modifierGroups,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    resetMenu,
  } = useMenuStore()
  const symbol = useSettingsStore((s) => s.settings.currencySymbol)

  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="page menu-page">
      <header className="page-header">
        <div>
          <h1>Menu</h1>
          <p className="page-sub">
            {products.length} items across {categories.length} categories
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (
                window.confirm(
                  'Reset the menu to the default Caffeine Ministry lineup? Your custom items will be lost.',
                )
              )
                resetMenu()
            }}
          >
            Reset menu
          </button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            + New item
          </button>
        </div>
      </header>

      {categories.map((cat) => {
        const items = products.filter((p) => p.categoryId === cat.id)
        if (items.length === 0) return null
        return (
          <section className="menu-category" key={cat.id}>
            <h2 className="menu-category-title">
              <span className="menu-cat-swatch" style={{ background: cat.color }} />
              {cat.icon} {cat.name}
              <span className="menu-cat-count">{items.length}</span>
            </h2>
            <div className="menu-items">
              {items.map((p) => (
                <div
                  className={'menu-item' + (p.available ? '' : ' off')}
                  key={p.id}
                >
                  <span className="menu-item-icon">{p.icon}</span>
                  <div className="menu-item-info">
                    <strong>{p.name}</strong>
                    {p.description && <span>{p.description}</span>}
                    {p.modifierGroupIds.length > 0 && (
                      <span className="menu-item-mods">
                        {p.modifierGroupIds
                          .map(
                            (id) =>
                              modifierGroups.find((g) => g.id === id)?.name,
                          )
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                  <span className="menu-item-price">
                    {money(p.price, symbol)}
                  </span>
                  <div className="menu-item-actions">
                    <button
                      className="chip-btn"
                      onClick={() => toggleAvailability(p.id)}
                      title={p.available ? 'Mark sold out' : 'Mark available'}
                    >
                      {p.available ? '● On' : '○ Off'}
                    </button>
                    <button className="chip-btn" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    <button
                      className="chip-btn danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"?`))
                          deleteProduct(p.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {(editing || creating) && (
        <ProductEditor
          initial={editing ?? { ...EMPTY_PRODUCT, categoryId: categories[0]?.id ?? '' }}
          categories={categories}
          modifierGroups={modifierGroups}
          symbol={symbol}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
          onSave={(data) => {
            if (editing) updateProduct(editing.id, data)
            else addProduct(data)
            setEditing(null)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

interface EditorProps {
  initial: Omit<Product, 'id'> | Product
  categories: { id: string; name: string; icon: string }[]
  modifierGroups: { id: string; name: string }[]
  symbol: string
  onClose: () => void
  onSave: (data: Omit<Product, 'id'>) => void
}

function ProductEditor({
  initial,
  categories,
  modifierGroups,
  symbol,
  onClose,
  onSave,
}: EditorProps) {
  const [name, setName] = useState(initial.name)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [price, setPrice] = useState(String(initial.price))
  const [icon, setIcon] = useState(initial.icon)
  const [description, setDescription] = useState(initial.description ?? '')
  const [available, setAvailable] = useState(initial.available)
  const [modIds, setModIds] = useState<string[]>(initial.modifierGroupIds)

  const toggleMod = (id: string) =>
    setModIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    )

  const valid = name.trim() && categoryId && Number(price) >= 0

  return (
    <Modal
      open
      onClose={onClose}
      title={'name' in initial && initial.name ? 'Edit item' : 'New item'}
      size="md"
      footer={
        <div className="editor-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() =>
              onSave({
                name: name.trim(),
                categoryId,
                price: Math.max(0, Number(price) || 0),
                icon: icon || '☕',
                description: description.trim() || undefined,
                available,
                modifierGroupIds: modIds,
              })
            }
          >
            Save item
          </button>
        </div>
      }
    >
      <div className="form-grid">
        <label className="field field-icon">
          <span>Icon</span>
          <input
            className="text-input icon-input"
            value={icon}
            maxLength={2}
            onChange={(e) => setIcon(e.target.value)}
          />
        </label>
        <label className="field field-name">
          <span>Name</span>
          <input
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Flat White"
          />
        </label>
        <label className="field">
          <span>Category</span>
          <select
            className="text-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Price ({symbol})</span>
          <input
            className="text-input"
            type="number"
            min="0"
            step="0.1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="field field-name">
          <span>Description</span>
          <input
            className="text-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="field">
        <span>Modifier groups</span>
        <div className="mod-toggle-list">
          {modifierGroups.map((g) => (
            <button
              key={g.id}
              className={'chip-btn' + (modIds.includes(g.id) ? ' active' : '')}
              onClick={() => toggleMod(g.id)}
            >
              {modIds.includes(g.id) ? '✓ ' : '+ '}
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <label className="switch-row">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        <span>Available for sale</span>
      </label>
    </Modal>
  )
}
