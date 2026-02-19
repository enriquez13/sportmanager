const cliente2Theme = {
  name: "Boutique Manager",
  client: "cliente2",
  business: {
    name:    "Alina",  // ← cambia esto
    tagline: "Moda Femenina",
    emoji:   "👗",
  },
  colors: {
    bg:       "#fff0f5",
    surface:  "#ffe4ef",
    surface2: "#ffffff",
    surface3: "#ffffff",
    border:   "#ffd6e7",
    accent:   "#e8357a",
    accent2:  "#f79cbd",
    text:     "#1a0a12",
    text2:    "#8a4060",
    green:    "#06d6a0",
    yellow:   "#ffb703",
    red:      "#ef233c",
    blue:     "#7b2d8b",
  },
  fonts: {
    display: "'Plus Jakarta Sans', sans-serif",
    body:    "'Plus Jakarta Sans', sans-serif",
    mono:    "'DM Mono', monospace",
  },
  googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap",
  modules: {
    inventario: true,
    ventas:     true,
    separados:  true,
    pedidos:    true,
    facturas:   true,
  },
}

export default cliente2Theme
