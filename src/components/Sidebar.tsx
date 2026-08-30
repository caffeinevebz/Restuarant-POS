import { NavLink } from 'react-router-dom'
import { useSettingsStore } from '../store/useSettingsStore'

const NAV = [
  { to: '/', label: 'Register', icon: '🧾', end: true },
  { to: '/orders', label: 'Orders', icon: '📋', end: false },
  { to: '/reports', label: 'Reports', icon: '📊', end: false },
  { to: '/menu', label: 'Menu', icon: '🍽️', end: false },
  { to: '/settings', label: 'Settings', icon: '⚙️', end: false },
]

export default function Sidebar() {
  const { storeName } = useSettingsStore((s) => s.settings)

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">☕</span>
        <div className="sidebar-brand-text">
          <strong>{storeName}</strong>
          <span>POS</span>
        </div>
      </div>

      <ul className="sidebar-nav">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
            >
              <span className="sidebar-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <span className="sidebar-status" />
        Open · Cash drawer ready
      </div>
    </nav>
  )
}
