import { useState } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useOrdersStore } from '../store/useOrdersStore'
import { useMenuStore } from '../store/useMenuStore'
import type { Settings } from '../types'

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const resetSettings = useSettingsStore((s) => s.reset)
  const clearOrders = useOrdersStore((s) => s.clearAll)
  const orderCount = useOrdersStore((s) => s.orders.length)
  const resetMenu = useMenuStore((s) => s.resetMenu)

  const [form, setForm] = useState<Settings>(settings)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const save = () => {
    update({
      ...form,
      taxRate: Math.max(0, Number(form.taxRate) || 0),
      currencySymbol: form.currencySymbol || '$',
    })
    setSaved(true)
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Store profile, tax & register options</p>
        </div>
      </header>

      <section className="card settings-card">
        <h3>Store profile</h3>
        <div className="settings-grid">
          <label className="field field-wide">
            <span>Store name</span>
            <input
              className="text-input"
              value={form.storeName}
              onChange={(e) => set('storeName', e.target.value)}
            />
          </label>
          <label className="field field-wide">
            <span>Tagline</span>
            <input
              className="text-input"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />
          </label>
          <label className="field field-wide">
            <span>Address</span>
            <input
              className="text-input"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Phone</span>
            <input
              className="text-input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Cashier name</span>
            <input
              className="text-input"
              value={form.cashierName}
              onChange={(e) => set('cashierName', e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="card settings-card">
        <h3>Money & tax</h3>
        <div className="settings-grid">
          <label className="field">
            <span>Currency symbol</span>
            <input
              className="text-input"
              value={form.currencySymbol}
              maxLength={3}
              onChange={(e) => set('currencySymbol', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Tax label</span>
            <input
              className="text-input"
              value={form.taxLabel}
              onChange={(e) => set('taxLabel', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Tax rate (%)</span>
            <input
              className="text-input"
              type="number"
              min="0"
              step="0.1"
              value={form.taxRate}
              onChange={(e) => set('taxRate', Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <div className="settings-save-bar">
        <button className="btn btn-primary btn-lg" onClick={save}>
          Save changes
        </button>
        {saved && <span className="saved-flag">✓ Saved</span>}
      </div>

      <section className="card settings-card danger-zone">
        <h3>Danger zone</h3>
        <div className="danger-row">
          <div>
            <strong>Clear order history</strong>
            <p>Permanently removes all {orderCount} recorded orders.</p>
          </div>
          <button
            className="btn btn-ghost danger"
            onClick={() => {
              if (
                window.confirm(
                  'Delete ALL order history? This cannot be undone.',
                )
              )
                clearOrders()
            }}
          >
            Clear orders
          </button>
        </div>
        <div className="danger-row">
          <div>
            <strong>Reset menu</strong>
            <p>Restores the default Caffeine Ministry menu.</p>
          </div>
          <button
            className="btn btn-ghost danger"
            onClick={() => {
              if (window.confirm('Reset the menu to defaults?')) resetMenu()
            }}
          >
            Reset menu
          </button>
        </div>
        <div className="danger-row">
          <div>
            <strong>Reset settings</strong>
            <p>Restores the default store profile & tax.</p>
          </div>
          <button
            className="btn btn-ghost danger"
            onClick={() => {
              if (window.confirm('Reset settings to defaults?')) {
                resetSettings()
                setForm(useSettingsStore.getState().settings)
              }
            }}
          >
            Reset settings
          </button>
        </div>
      </section>
    </div>
  )
}
