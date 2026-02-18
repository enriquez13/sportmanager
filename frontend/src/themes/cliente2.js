const cliente2Theme = {
  name: "Boutique Manager",
  client: "cliente2",
  business: {
    name: "Tu Tienda",        //← el cliente cambia esto
    tagline: "Moda Femenina",
    emoji: "👗",
  },
  colors: {
    bg:       "#faf7f5",       // blanco cálido, no frío
    surface:  "#ffffff",
    surface2: "#fdf0f4",       // rosado muy suave para fondos secundarios
    border:   "#f0d9e3",       // borde rosado delicado
    accent:   "#e8447a",       // rosado fuerte — CTA principal
    accent2:  "#f472a8",       // rosado claro — hover / secundario
    text:     "#1a1118",       // casi negro con tinte cálido
    text2:    "#9b7a8a",       // gris rosado para texto secundario
    green:    "#2dd4a0",       // verde menta — confirmaciones
    yellow:   "#f59e0b",       // ámbar — advertencias
    red:      "#f43f5e",       // rojo rosado — errores
    blue:     "#8b5cf6",       // violeta — info (combina con rosado)
  },
  fonts: {
    display: "'Playfair Display', serif",   // elegante, femenino
    body:    "'Nunito', sans-serif",         // redondo, amigable
    mono:    "'DM Mono', monospace",
  },
  googleFonts: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap",
  modules: {
    inventario: true,
    ventas:     true,
    separados:  true,
    pedidos:    true,
    facturas:   true,
  },
}

export default cliente2Theme
