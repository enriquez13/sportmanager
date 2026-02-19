const defaultTheme = {
  name: "SportManager Pro",
  client: "default",
  business: {
    name: "Sport Store",
    tagline: "Pasto · Colombia",
    emoji: "🏃",
  },
  colors: {
    bg:       "#0a0a0f",
    surface:  "#13131a",
    surface2: "#1c1c28",
    surface3:  "#13131a",
    border:   "#2a2a3d",
    accent:   "#ff4d00",
    accent2:  "#ff8c42",
    text:     "#f0f0f5",
    text2:    "#8888aa",
    green:    "#00e5a0",
    yellow:   "#ffd600",
    red:      "#ff3b5c",
    blue:     "#3b82f6",
  },
  fonts: {
    display: "'Bebas Neue', cursive",
    body:    "'DM Sans', sans-serif",
    mono:    "'DM Mono', monospace",
  },
  googleFonts: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap",
  // Módulos activos (puedes desactivar los que el cliente no necesite)
  modules: {
    inventario: true,
    ventas:     true,
    separados:  true,
    pedidos:    true,
    facturas:   true,
  },
}

export default defaultTheme
