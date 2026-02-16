import { useState } from 'react'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')

const EMPTY = { cliente:'', telefono:'', tipo:'stock', producto:'', total:'', abonado:'', fecha_limite:'', notas:'' }

export default function Separados() {
  const toast = useToast()
  const [filtro, setFiltro] = useState('activos')

  const params = filtro === 'entregados' ? { estado:'entregado' } : filtro === 'pedidos' ? { estado:'activo', tipo:'pedido' } : { estado:'activo', tipo:'stock' }
  const { data, loading, refetch } = useApi(() => api.separados.listar(params), [filtro])

  const { mutate: crear }    = useMutation(api.separados.crear)
  const { mutate: entregar } = useMutation(api.separados.entregar)
  const { mutate: eliminar } = useMutation(api.separados.eliminar)
  const { mutate: abonar }   = useMutation((id, monto) => api.separados.abono(id, monto))

  const [modal, setModal]       = useState(false)
  const [form,  setForm]        = useState(EMPTY)
  const [abonoModal, setAbono]  = useState(null)
  const [abonoMonto, setMonto]  = useState('')

  const resta = (+form.total || 0) - (+form.abonado || 0)

  async function guardar() {
    if (!form.cliente) return toast('El nombre del cliente es obligatorio', 'error')
    try {
      await crear({ ...form, total: +form.total, abonado: +form.abonado || 0 })
      toast('Separado registrado'); setModal(false); setForm(EMPTY); refetch()
    } catch(e) { toast(e.message, 'error') }
  }

  async function confirmarAbono() {
    if (!abonoMonto || +abonoMonto <= 0) return toast('Ingresa un monto válido', 'error')
    try { await abonar(abonoModal.id, +abonoMonto); toast('Abono registrado'); setAbono(null); setMonto(''); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  async function marcarEntregado(id) {
    try { await entregar(id); toast('Separado entregado ✓'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  async function borrar(id) {
    if (!confirm('¿Eliminar este separado?')) return
    try { await eliminar(id); toast('Eliminado'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  function notificar(s) {
    const msg = `Hola ${s.cliente}, te informamos que tu producto "${s.producto}" ya está listo para recoger en nuestra tienda. ¡Te esperamos! 🛍️`
    window.open(`https://wa.me/57${s.telefono?.replace(/\s/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const tabs = [
    { key:'activos',    label:'En stock' },
    { key:'pedidos',    label:'Pedidos especiales' },
    { key:'entregados', label:'Entregados' },
  ]

  return (
    <>
      <div className="topbar">
        <div className="page-title">Separados</div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Nuevo Separado</button>
        </div>
      </div>
      <div className="content">
        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:'var(--surface2)',padding:4,borderRadius:10,marginBottom:20}}>
          {tabs.map(t => (
            <div key={t.key} onClick={() => setFiltro(t.key)}
              style={{flex:1,textAlign:'center',padding:'8px 16px',borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:500,
                background: filtro===t.key ? 'var(--surface)' : 'transparent',
                color: filtro===t.key ? 'var(--text)' : 'var(--text2)',
                transition:'all .2s'
              }}>
              {t.label}
            </div>
          ))}
        </div>

        {loading
          ? <div className="empty-state">Cargando...</div>
          : !data?.length
            ? <div className="empty-state">No hay separados en esta categoría</div>
            : data.map(s => {
              const pct = s.total > 0 ? Math.round((s.abonado / s.total) * 100) : 0
              return (
                <div key={s.id} className="sep-card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{s.cliente}</div>
                      <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>📞 {s.telefono} · {s.fecha_creacion}</div>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <span className={`badge ${s.tipo==='pedido' ? 'badge-orange' : 'badge-blue'}`}>{s.tipo==='pedido' ? 'Pedido especial' : 'En stock'}</span>
                      <span className={`badge ${s.estado==='entregado' ? 'badge-green' : 'badge-yellow'}`}>{s.estado==='entregado' ? 'Entregado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  <div style={{fontSize:12,color:'var(--text2)',marginBottom:10}}>📦 {s.producto} {s.notas ? `· ${s.notas}` : ''}</div>

                  {s.estado === 'activo' && <>
                    <div className="progress"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginTop:5}}>
                      <span className="text-muted">Abonado: <span className="text-green">{fmt(s.abonado)}</span></span>
                      <span className="text-muted">{pct}%</span>
                      <span className="text-muted">Resta: <span style={{color:'var(--accent)'}}>{fmt(s.total - s.abonado)}</span></span>
                    </div>
                    <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
                      <button className="btn btn-yellow btn-sm" onClick={() => { setAbono(s); setMonto('') }}>+ Abono</button>
                      <button className="btn btn-green btn-sm"  onClick={() => marcarEntregado(s.id)}>✓ Entregado</button>
                      <button className="btn btn-ghost btn-sm"  onClick={() => notificar(s)}>📩 Notificar</button>
                      <button className="btn btn-red btn-sm" style={{marginLeft:'auto'}} onClick={() => borrar(s.id)}>Eliminar</button>
                    </div>
                  </>}

                  {s.fecha_limite && <div style={{fontSize:11,color:'var(--text2)',marginTop:8}}>📅 Fecha límite: {s.fecha_limite}</div>}
                </div>
              )
            })
        }
      </div>

      {/* Modal nuevo separado */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{width:560}}>
            <div className="modal-header">
              <div className="modal-title">Nuevo Separado</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input className="form-control" value={form.cliente} onChange={e => setForm({...form,cliente:e.target.value})} placeholder="Nombre completo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={form.telefono} onChange={e => setForm({...form,telefono:e.target.value})} placeholder="3XX XXX XXXX" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-control" value={form.tipo} onChange={e => setForm({...form,tipo:e.target.value})}>
                  <option value="stock">Producto en stock</option>
                  <option value="pedido">Pedido especial (no está en tienda)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Producto</label>
                <input className="form-control" value={form.producto} onChange={e => setForm({...form,producto:e.target.value})} placeholder="Descripción del producto" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio Total ($)</label>
                  <input className="form-control" type="number" value={form.total} onChange={e => setForm({...form,total:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Abono Inicial ($)</label>
                  <input className="form-control" type="number" value={form.abonado} onChange={e => setForm({...form,abonado:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Resta</label>
                <input className="form-control" readOnly value={resta > 0 ? fmt(resta) : '$0'} style={{color:'var(--accent)'}} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha Límite</label>
                  <input className="form-control" type="date" value={form.fecha_limite} onChange={e => setForm({...form,fecha_limite:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notas</label>
                  <input className="form-control" value={form.notas} onChange={e => setForm({...form,notas:e.target.value})} placeholder="Talla, color, etc." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar Separado</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal abono */}
      {abonoModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAbono(null)}>
          <div className="modal" style={{width:420}}>
            <div className="modal-header">
              <div className="modal-title">Registrar Abono</div>
              <button className="modal-close" onClick={() => setAbono(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--surface2)',borderRadius:8,padding:14,marginBottom:16,fontSize:13,lineHeight:1.8}}>
                <b>{abonoModal.cliente}</b><br/>
                <span className="text-muted">{abonoModal.producto}</span><br/>
                Total: <b>{fmt(abonoModal.total)}</b> · Abonado: <b className="text-green">{fmt(abonoModal.abonado)}</b> · Resta: <b style={{color:'var(--accent)'}}>{fmt(abonoModal.total - abonoModal.abonado)}</b>
              </div>
              <div className="form-group">
                <label className="form-label">Monto del Abono ($)</label>
                <input className="form-control" type="number" value={abonoMonto} onChange={e => setMonto(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAbono(null)}>Cancelar</button>
              <button className="btn btn-green" onClick={confirmarAbono}>Registrar Abono</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
