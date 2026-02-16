import { useState } from 'react'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')
const METODOS = ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta']

export default function Ventas() {
  const toast = useToast()
  const { data: ventasHoy, refetch } = useApi(() => api.ventas.hoy())
  const { data: productos }          = useApi(() => api.productos.listar())
  const { mutate: registrar, loading: guardando } = useMutation(api.ventas.registrar)
  const { mutate: eliminar } = useMutation(api.ventas.eliminar)

  const [busqueda,  setBusqueda]  = useState('')
  const [carrito,   setCarrito]   = useState([])
  const [metodo,    setMetodo]    = useState('Efectivo')
  const [sugerencias, setSug]     = useState([])

  const total = carrito.reduce((s, c) => s + c.precio_unitario * c.cantidad, 0)

  function buscar(q) {
    setBusqueda(q)
    if (!q) { setSug([]); return }
    const res = (productos || []).filter(p => p.stock > 0 && (p.nombre.toLowerCase().includes(q.toLowerCase()) || p.sku?.toLowerCase().includes(q.toLowerCase())))
    setSug(res.slice(0, 6))
  }

  function addCarrito(p) {
    setBusqueda(''); setSug([])
    setCarrito(prev => {
      const ex = prev.find(c => c.producto_id === p.id)
      if (ex) {
        if (ex.cantidad >= p.stock) { toast('No hay más unidades', 'error'); return prev }
        return prev.map(c => c.producto_id === p.id ? {...c, cantidad: c.cantidad+1} : c)
      }
      return [...prev, { producto_id: p.id, nombre: p.nombre, precio_unitario: p.precio, cantidad: 1, stock: p.stock }]
    })
  }

  function cambiarCantidad(id, delta) {
    setCarrito(prev => prev.map(c => {
      if (c.producto_id !== id) return c
      const nueva = c.cantidad + delta
      if (nueva < 1) return c
      if (nueva > c.stock) { toast('Sin stock suficiente', 'error'); return c }
      return {...c, cantidad: nueva}
    }))
  }

  function removeItem(id) { setCarrito(prev => prev.filter(c => c.producto_id !== id)) }

  async function cobrar() {
    if (!carrito.length) return toast('El carrito está vacío', 'error')
    try {
      await registrar({ items: carrito.map(c => ({ producto_id: c.producto_id, nombre: c.nombre, cantidad: c.cantidad, precio_unitario: c.precio_unitario })), metodo_pago: metodo, total })
      setCarrito([])
      toast(`Venta registrada: ${fmt(total)}`)
      refetch()
    } catch(e) { toast(e.message, 'error') }
  }

  async function borrarVenta(id) {
    if (!confirm('¿Eliminar esta venta?')) return
    try { await eliminar(id); toast('Venta eliminada'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  function imprimirRecibo(v) {
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`<html><body style="font-family:monospace;font-size:13px;padding:20px;max-width:300px">
      <div style="text-align:center;font-size:20px;font-weight:bold;letter-spacing:2px">SPORT STORE</div>
      <div style="text-align:center;font-size:11px;color:#666;margin-bottom:12px">Pasto, Colombia</div>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      <div>Fecha: ${v.fecha}</div><div>Hora: ${v.hora}</div><div>Pago: ${v.metodo_pago}</div>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      ${(v.items||[]).map(i => `<div style="display:flex;justify-content:space-between"><span>${i.cantidad}x ${i.nombre}</span><span>${fmt(i.precio_unitario*i.cantidad)}</span></div>`).join('')}
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px"><span>TOTAL</span><span>${fmt(v.total)}</span></div>
      <div style="text-align:center;margin-top:16px;font-size:11px;color:#999">¡Gracias por su compra!</div>
    </body></html>`)
    win.document.close(); win.print()
  }

  return (
    <>
      <div className="topbar">
        <div className="page-title">Ventas</div>
        <div className="topbar-actions">
          <span className="mono text-green" style={{fontSize:20}}>{fmt(ventasHoy?.total_dia || 0)}</span>
          <span className="text-muted" style={{fontSize:12}}>caja del día</span>
        </div>
      </div>
      <div className="content">
        <div className="grid-2">

          {/* CARRITO */}
          <div className="card">
            <div className="card-header"><div className="card-title">Nueva Venta</div></div>
            <div className="card-body">
              <div className="form-group" style={{position:'relative'}}>
                <label className="form-label">Buscar producto</label>
                <input className="form-control" placeholder="Nombre o SKU..." value={busqueda} onChange={e => buscar(e.target.value)} autoComplete="off" />
                {sugerencias.length > 0 && (
                  <div className="autocomplete">
                    {sugerencias.map(p => (
                      <div key={p.id} className="autocomplete-item" onMouseDown={() => addCarrito(p)}>
                        <span>{p.nombre} <span className="text-muted" style={{fontSize:11}}>{p.talla}</span></span>
                        <span className="mono text-green">{fmt(p.precio)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{minHeight:60,marginBottom:12}}>
                {carrito.length === 0
                  ? <div className="text-muted" style={{fontSize:12,padding:'8px 0'}}>Agrega productos al carrito...</div>
                  : carrito.map(c => (
                    <div key={c.producto_id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:8,background:'var(--surface2)',borderRadius:8}}>
                      <span style={{flex:1,fontSize:13}}>{c.nombre}</span>
                      <button className="btn btn-ghost btn-sm" style={{padding:'4px 8px'}} onClick={() => cambiarCantidad(c.producto_id,-1)}>−</button>
                      <span className="mono" style={{minWidth:20,textAlign:'center'}}>{c.cantidad}</span>
                      <button className="btn btn-ghost btn-sm" style={{padding:'4px 8px'}} onClick={() => cambiarCantidad(c.producto_id,+1)}>+</button>
                      <span className="mono text-green" style={{minWidth:80,textAlign:'right'}}>{fmt(c.precio_unitario*c.cantidad)}</span>
                      <button onClick={() => removeItem(c.producto_id)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',padding:'2px 6px'}}>✕</button>
                    </div>
                  ))
                }
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:'1px solid var(--border)',marginBottom:12}}>
                <div>
                  <div className="form-label">Total</div>
                  <div className="mono text-green" style={{fontSize:22}}>{fmt(total)}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setCarrito([])}>Limpiar</button>
                  <button className="btn btn-primary" onClick={cobrar} disabled={guardando}>
                    {guardando ? 'Guardando...' : '✓ Cobrar'}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Método de Pago</label>
                <select className="form-control" value={metodo} onChange={e => setMetodo(e.target.value)}>
                  {METODOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* CAJA DEL DÍA */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Caja del Día</div>
              <span className="mono text-green">{fmt(ventasHoy?.total_dia || 0)}</span>
            </div>
            <div className="table-wrap" style={{maxHeight:420,overflowY:'auto'}}>
              <table>
                <thead><tr><th>Hora</th><th>Descripción</th><th>Método</th><th>Monto</th><th></th></tr></thead>
                <tbody>
                  {!ventasHoy?.ventas?.length
                    ? <tr><td colSpan="5" className="empty-state">Sin ventas hoy</td></tr>
                    : ventasHoy.ventas.map(v => (
                      <tr key={v.id}>
                        <td className="text-muted">{v.hora}</td>
                        <td style={{fontSize:11}}>{v.items?.map(i=>`${i.cantidad}x ${i.nombre}`).join(', ')}</td>
                        <td><span className="badge badge-blue">{v.metodo_pago}</span></td>
                        <td className="mono text-green">{fmt(v.total)}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => imprimirRecibo(v)}>🖨</button>
                          <button className="btn btn-red btn-sm" style={{marginLeft:4}} onClick={() => borrarVenta(v.id)}>✕</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
