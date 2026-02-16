import { useState } from 'react'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')
const CATS = ['Calzado', 'Ropa', 'Accesorios', 'Equipamiento']

const EMPTY = { nombre:'', categoria:'Calzado', precio:'', costo:'', stock:'', stock_minimo:'', talla:'', color:'', sku:'' }

export default function Inventario() {
  const toast = useToast()
  const { data: productos, loading, refetch } = useApi(() => api.productos.listar())
  const { mutate: crear }      = useMutation(api.productos.crear)
  const { mutate: actualizar } = useMutation(api.productos.actualizar)
  const { mutate: eliminar }   = useMutation(api.productos.eliminar)

  const [busqueda, setBusqueda] = useState('')
  const [catFiltro, setCat]     = useState('')
  const [modal, setModal]       = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY)

  const filtrados = (productos || []).filter(p =>
    (!busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku?.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!catFiltro || p.categoria === catFiltro)
  )

  function abrirCrear() { setEditId(null); setForm(EMPTY); setModal(true) }
  function abrirEditar(p) { setEditId(p.id); setForm({ ...p, precio: p.precio, costo: p.costo }); setModal(true) }

  async function guardar() {
    if (!form.nombre) return toast('El nombre es obligatorio', 'error')
    const data = { ...form, precio: +form.precio, costo: +form.costo, stock: +form.stock, stock_minimo: +form.stock_minimo }
    try {
      if (editId) { await actualizar(editId, data); toast('Producto actualizado') }
      else        { await crear(data);              toast('Producto agregado') }
      setModal(false); refetch()
    } catch(e) { toast(e.message, 'error') }
  }

  async function borrar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try { await eliminar(id); toast('Producto eliminado'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  function exportarCSV() {
    const rows = [['Nombre','Categoría','Precio','Costo','Stock','Stock Mín','Talla','Color','SKU'],
      ...(productos||[]).map(p => [p.nombre,p.categoria,p.precio,p.costo,p.stock,p.stock_minimo,p.talla,p.color,p.sku])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download = 'inventario.csv'; a.click()
    toast('CSV exportado')
  }

  return (
    <>
      <div className="topbar">
        <div className="page-title">Inventario</div>
        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={exportarCSV}>⬇ Exportar CSV</button>
          <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo Producto</button>
        </div>
      </div>
      <div className="content">
        <div className="card">
          <div style={{padding:'16px 20px',display:'flex',gap:10,flexWrap:'wrap',borderBottom:'1px solid var(--border)'}}>
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <select className="form-control" style={{width:180}} value={catFiltro} onChange={e => setCat(e.target.value)}>
              <option value="">Todas las categorías</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Costo</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan="7" className="empty-state">Cargando...</td></tr>
                  : filtrados.length === 0
                    ? <tr><td colSpan="7" className="empty-state">No se encontraron productos</td></tr>
                    : filtrados.map(p => {
                      const estado = p.stock === 0
                        ? <span className="badge badge-red">Sin stock</span>
                        : p.stock <= p.stock_minimo
                          ? <span className="badge badge-yellow">Stock bajo</span>
                          : <span className="badge badge-green">Disponible</span>
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{fontWeight:600}}>{p.nombre}</div>
                            <div style={{fontSize:11,color:'var(--text2)'}}>{p.sku} · {p.talla} · {p.color}</div>
                          </td>
                          <td><span className="badge badge-blue">{p.categoria}</span></td>
                          <td className="mono text-green">{fmt(p.precio)}</td>
                          <td className="mono text-muted">{fmt(p.costo)}</td>
                          <td><span className="mono" style={{color: p.stock <= p.stock_minimo ? 'var(--yellow)' : 'var(--text)'}}>{p.stock}</span></td>
                          <td>{estado}</td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                            <button className="btn btn-red btn-sm" style={{marginLeft:4}} onClick={() => borrar(p.id)}>Eliminar</button>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Editar Producto' : 'Nuevo Producto'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} placeholder="Ej: Tenis Nike Air Max" />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio de Venta ($)</label>
                  <input className="form-control" type="number" value={form.precio} onChange={e => setForm({...form, precio:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio de Costo ($)</label>
                  <input className="form-control" type="number" value={form.costo} onChange={e => setForm({...form, costo:e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock Actual</label>
                  <input className="form-control" type="number" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Mínimo</label>
                  <input className="form-control" type="number" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo:e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Talla</label>
                  <input className="form-control" value={form.talla||''} onChange={e => setForm({...form, talla:e.target.value})} placeholder="Ej: 40, S/M/L" />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input className="form-control" value={form.color||''} onChange={e => setForm({...form, color:e.target.value})} placeholder="Ej: Negro/Blanco" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Referencia</label>
                <input className="form-control" value={form.sku||''} onChange={e => setForm({...form, sku:e.target.value})} placeholder="Ej: NK-AM-40" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar Producto</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
