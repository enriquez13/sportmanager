import { useState } from 'react'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')
const EMPTY = { fabricante:'', productos:'', valor:'', fecha_pedido:'', fecha_llegada_estimada:'', clientes_esperando:'' }

export default function Pedidos() {
  const toast = useToast()
  const { data, loading, refetch } = useApi(() => api.pedidos.listar())
  const { mutate: crear }    = useMutation(api.pedidos.crear)
  const { mutate: recibido } = useMutation(api.pedidos.recibido)
  const { mutate: eliminar } = useMutation(api.pedidos.eliminar)

  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState(EMPTY)

  async function guardar() {
    if (!form.fabricante) return toast('El nombre del fabricante es obligatorio', 'error')
    try {
      await crear({ ...form, valor: +form.valor || 0 })
      toast('Pedido registrado'); setModal(false); setForm(EMPTY); refetch()
    } catch(e) { toast(e.message, 'error') }
  }

  async function marcarRecibido(id) {
    try { await recibido(id); toast('Pedido marcado como recibido ✓'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  async function borrar(id) {
    if (!confirm('¿Eliminar este pedido?')) return
    try { await eliminar(id); toast('Pedido eliminado'); refetch() }
    catch(e) { toast(e.message, 'error') }
  }

  function notificarClientes(p) {
    const msg = `¡Hola! Tu pedido de "${p.productos}" ya llegó a nuestra tienda. ¡Puedes pasar a recogerlo! 🎉`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    toast('Mensaje listo para enviar')
  }

  const estadoBadge = e =>
    e === 'pendiente' ? <span className="badge badge-yellow">Pendiente</span> :
    e === 'recibido'  ? <span className="badge badge-green">Recibido</span>  :
                        <span className="badge badge-gray">Cancelado</span>

  return (
    <>
      <div className="topbar">
        <div className="page-title">Pedidos a Fabricantes</div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Nuevo Pedido</button>
        </div>
      </div>
      <div className="content">
        {loading
          ? <div className="empty-state">Cargando...</div>
          : !data?.length
            ? <div className="empty-state">No hay pedidos registrados</div>
            : data.map(p => (
              <div key={p.id} className="pedido-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>🏭 {p.fabricante}</div>
                    <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>
                      Pedido: {p.fecha_pedido} · Llegada estimada: {p.fecha_llegada_estimada || 'Por definir'}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {estadoBadge(p.estado)}
                    <span className="mono text-green">{fmt(p.valor)}</span>
                  </div>
                </div>

                <div style={{fontSize:12,color:'var(--text2)',marginBottom:10}}>📦 {p.productos}</div>

                {p.clientes_esperando && (
                  <div style={{fontSize:12,color:'var(--text2)',marginBottom:10}}>👥 Clientes esperando: {p.clientes_esperando}</div>
                )}

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',gap:8}}>
                    {p.estado === 'pendiente' && (
                      <button className="btn btn-green btn-sm" onClick={() => marcarRecibido(p.id)}>✓ Marcar Recibido</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => notificarClientes(p)}>📩 Notificar clientes</button>
                  </div>
                  <button className="btn btn-red btn-sm" onClick={() => borrar(p.id)}>Eliminar</button>
                </div>
              </div>
            ))
        }
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Nuevo Pedido a Fabricante</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Fabricante / Proveedor *</label>
                <input className="form-control" value={form.fabricante} onChange={e => setForm({...form,fabricante:e.target.value})} placeholder="Nombre del proveedor" />
              </div>
              <div className="form-group">
                <label className="form-label">Productos solicitados</label>
                <textarea className="form-control" value={form.productos} onChange={e => setForm({...form,productos:e.target.value})} placeholder="Ej: 5x Tenis Nike T40 Negro, 3x Pantaloneta Adidas S..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha del Pedido</label>
                  <input className="form-control" type="date" value={form.fecha_pedido} onChange={e => setForm({...form,fecha_pedido:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Llegada Estimada</label>
                  <input className="form-control" type="date" value={form.fecha_llegada_estimada} onChange={e => setForm({...form,fecha_llegada_estimada:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Valor del Pedido ($)</label>
                <input className="form-control" type="number" value={form.valor} onChange={e => setForm({...form,valor:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Clientes que esperan este pedido</label>
                <input className="form-control" value={form.clientes_esperando} onChange={e => setForm({...form,clientes_esperando:e.target.value})} placeholder="Nombre(s) y teléfono(s)" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
