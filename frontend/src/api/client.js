const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── PRODUCTOS ─────────────────────────────────────────────────────
export const api = {
  productos: {
    listar:    ()        => req('GET',    '/productos/'),
    crear:     (data)    => req('POST',   '/productos/', data),
    actualizar:(id, data)=> req('PATCH',  `/productos/${id}`, data),
    eliminar:  (id)      => req('DELETE', `/productos/${id}`),
  },

  // ── VENTAS ──────────────────────────────────────────────────────
  ventas: {
    hoy:       ()     => req('GET',  '/ventas/hoy'),
    listar:    (fecha)=> req('GET',  `/ventas/${fecha ? '?fecha=' + fecha : ''}`),
    registrar: (data) => req('POST', '/ventas/', data),
    eliminar:  (id)   => req('DELETE', `/ventas/${id}`),
  },

  // ── SEPARADOS ───────────────────────────────────────────────────
  separados: {
    listar:    (params = {}) => {
      const q = new URLSearchParams(params).toString()
      return req('GET', `/separados/${q ? '?' + q : ''}`)
    },
    crear:      (data)  => req('POST',  '/separados/', data),
    actualizar: (id, d) => req('PATCH', `/separados/${id}`, d),
    abono:      (id, monto) => req('PATCH', `/separados/${id}/abono?monto=${monto}`),
    entregar:   (id)    => req('PATCH', `/separados/${id}/entregar`),
    eliminar:   (id)    => req('DELETE', `/separados/${id}`),
  },

  // ── PEDIDOS ─────────────────────────────────────────────────────
  pedidos: {
    listar:    (estado) => req('GET', `/pedidos/${estado ? '?estado=' + estado : ''}`),
    crear:     (data)   => req('POST',  '/pedidos/', data),
    actualizar:(id, d)  => req('PATCH', `/pedidos/${id}`, d),
    recibido:  (id)     => req('PATCH', `/pedidos/${id}/recibido`),
    eliminar:  (id)     => req('DELETE', `/pedidos/${id}`),
  },

  // ── FACTURAS ────────────────────────────────────────────────────
  facturas: {
    listar: ()     => req('GET',  '/facturas/'),
    crear:  (data) => req('POST', '/facturas/', data),
  },
}
