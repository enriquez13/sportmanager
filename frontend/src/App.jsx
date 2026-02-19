import { useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import Dashboard   from './pages/Dashboard'
import Inventario  from './pages/Inventario'
import Ventas      from './pages/Ventas'
import Separados   from './pages/Separados'
import Pedidos     from './pages/Pedidos'
import Facturas    from './pages/Facturas'

const navItems = [
  { to: '/',           label: 'Inicio',    icon: <IconGrid /> },
  { to: '/inventario', label: 'Stock',     icon: <IconBox /> },
  { to: '/ventas',     label: 'Ventas',    icon: <IconDollar /> },
  { to: '/separados',  label: 'Separados', icon: <IconBag /> },
  { to: '/pedidos',    label: 'Pedidos',   icon: <IconArrow /> },
  { to: '/facturas',   label: 'Facturas',  icon: <IconFile /> },
]

export default function App() {
  const theme = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const today = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })

  // Filtra módulos desactivados en la config del cliente
  const activeNav = navItems.filter(item => {
    const key = item.to.replace('/', '') || 'dashboard'
    return theme.modules[key] !== false
  })

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <div className="logo-title">{theme.business.name}</div>
          <div className="logo-sub">{theme.business.tagline}</div>
        </div>
        <div className="nav">
          <div className="nav-section">Principal</div>
          {activeNav.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">Hoy: {today}</div>
      </nav>

      <div className="main">
        <PageTopbar onMenuClick={() => setSidebarOpen(true)} activeNav={activeNav} />
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas"     element={<Ventas />} />
          <Route path="/separados"  element={<Separados />} />
          <Route path="/pedidos"    element={<Pedidos />} />
          <Route path="/facturas"   element={<Facturas />} />
        </Routes>
      </div>

      <nav className="bottom-nav">
        {activeNav.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function PageTopbar({ onMenuClick }) {
  const location = useLocation()
  const titles = {
    '/': theme.business.name, '/inventario': theme.business.name, '/ventas': theme.business.name,
    '/separados': theme.business.name, '/pedidos': theme.business.name, '/facturas': theme.business.name,
  }
  return (
    <div className="topbar">
      <button className="hamburger" onClick={onMenuClick} aria-label="Menú">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className="page-title">{titles[location.pathname] || 'Dashboard'}</div>
      <div style={{ width: 40 }} />
    </div>
  )
}

function IconGrid()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function IconBox()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> }
function IconDollar() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> }
function IconBag()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> }
function IconArrow()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg> }
function IconFile()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
