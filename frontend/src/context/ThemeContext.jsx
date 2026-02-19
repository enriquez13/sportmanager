import { createContext, useContext, useEffect } from 'react'
import defaultTheme  from '../themes/default'
import cliente2Theme from '../themes/cliente2'
// Cuando agregues más clientes, impórtalos aquí:
// import cliente3Theme from '../themes/cliente3'

// Mapa de clientes disponibles
const THEMES = {
  default:  defaultTheme,
  cliente2: cliente2Theme,
  // cliente3: cliente3Theme,
}

// Lee la variable de entorno seteada en Vercel por proyecto
const CLIENT_KEY = import.meta.env.VITE_CLIENT || 'default'
export const theme = THEMES[CLIENT_KEY] || defaultTheme

const ThemeContext = createContext(theme)

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Inyecta todas las variables CSS del tema en :root automáticamente
    const root = document.documentElement
    const c = theme.colors

    root.style.setProperty('--bg',       c.bg)
    root.style.setProperty('--surface',  c.surface)
    root.style.setProperty('--surface2', c.surface2)
    root.style.setProperty('--surface3', c.surface3)
    root.style.setProperty('--surface4', c.surface4)
    root.style.setProperty('--border',   c.border)
    root.style.setProperty('--accent',   c.accent)
    root.style.setProperty('--accent2',  c.accent2)
    root.style.setProperty('--text',     c.text)
    root.style.setProperty('--text2',    c.text2)
    root.style.setProperty('--green',    c.green)
    root.style.setProperty('--yellow',   c.yellow)
    root.style.setProperty('--red',      c.red)
    root.style.setProperty('--blue',     c.blue)

    // Fuentes
    root.style.setProperty('--font-display', theme.fonts.display)
    root.style.setProperty('--font-body',    theme.fonts.body)
    root.style.setProperty('--font-mono',    theme.fonts.mono)

    // Detecta si el tema es claro y agrega clase al html
    // (un color "claro" tiene componentes RGB altos)
    const isLight = isLightColor(c.bg)
    document.documentElement.classList.toggle('theme-light', isLight)

    // Título de la pestaña del navegador
    document.title = theme.business.name

    // Cargar Google Fonts del tema dinámicamente
    const existing = document.getElementById('theme-fonts')
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.id   = 'theme-fonts'
    link.rel  = 'stylesheet'
    link.href = theme.googleFonts
    document.head.appendChild(link)
  }, [])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

// Helper: detecta si un color hex es claro
function isLightColor(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2), 16)
  const g = parseInt(h.slice(2,4), 16)
  const b = parseInt(h.slice(4,6), 16)
  // Fórmula de luminosidad percibida
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160
}
