import { useState } from 'react'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')
const hoy = () => new Date().toISOString().slice(0,10)

export default function Facturas() {
  const toast = useToast()
  const { data: facturas, refetch } = useApi(() => api.facturas.listar())
  const { mutate: crear } = useMutation(api.facturas.crear)

  const [cliente, setCliente] = useState('')
  const [telefono, setTel]    = useState('')
  const [tipo, setTipo]       = useState('factura')
  const [lineas, setLineas]   = useState([{ producto:'', cantidad:1, precio:'' }])

  const items = lineas.map(l => ({ producto:l.producto, cantidad:+l.cantidad||1, precio:+l.precio||0, subtotal:(+l.cantidad||1)*(+l.precio||0) }))
  const total = items.reduce((s,i) => s + i.subtotal, 0)

  function addLinea() { setLineas(l => [...l, { producto:'', cantidad:1, precio:'' }]) }
  function removeLinea(i) { setLineas(l => l.filter((_,idx) => idx !== i)) }
  function cambiarLinea(i, field, val) { setLineas(l => l.map((x,idx) => idx===i ? {...x,[field]:val} : x)) }

  const tipoLabel = { factura:'FACTURA', recibo:'RECIBO DE CAJA', separado:'COMPROBANTE DE SEPARADO' }

  async function generar() {
    if (!cliente) return toast('El nombre del cliente es obligatorio', 'error')
    const validItems = items.filter(i => i.producto && i.precio > 0)
    if (!validItems.length) return toast('Agrega al menos un producto con precio', 'error')
    try {
      const fact = await crear({ cliente, telefono, items: validItems, total, tipo })
      toast('Factura generada')
      refetch()
      imprimir({ ...fact, cliente, telefono, items: validItems, total, tipo })
    } catch(e) { toast(e.message, 'error') }
  }

  function imprimir(f) {
    const win = window.open('', '_blank', 'width=420,height=700')
    win.document.write(`<html><body style="font-family:monospace;font-size:13px;padding:24px;max-width:320px">
      <div style="text-align:center;font-size:22px;font-weight:bold;letter-spacing:2px">SPORT STORE</div>
      <div style="text-align:center;font-size:11px;color:#666;margin-bottom:4px">Pasto, Nariño · Colombia</div>
      <div style="text-align:center;font-weight:bold;font-size:13px;margin-bottom:12px">${tipoLabel[f.tipo] || f.tipo} #${f.id}</div>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      <div>Cliente: <b>${f.cliente}</b></div>
      <div>Teléfono: ${f.telefono||'—'}</div>
      <div>Fecha: ${f.fecha||hoy()}</div>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      ${(f.items||[]).map(i=>`<div style="display:flex;justify-content:space-between"><span>${i.cantidad}x ${i.producto}</span><span>${fmt(i.subtotal)}</span></div>`).join('')}
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold"><span>TOTAL</span><span>${fmt(f.total)}</span></div>
      <div style="text-align:center;margin-top:20px;font-size:11px;color:#999">¡Gracias por su preferencia!</div>
    </body></html>`)
    win.document.close(); win.print()
  }

  return (
    <>
      <div className="topbar">
        <div className="page-title">Facturación</div>
      </div>
      <div className="content">
        <div className="grid-2" style={{marginBottom:20}}>

          {/* FORMULARIO */}
          <div className="card">
            <div className="card-header"><div className="card-title">Nueva Factura</div></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input className="form-control" value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Nombre del cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={telefono} onChange={e=>setTel(e.target.value)} placeholder="3XX XXX XXXX" />
                </div>
              </div>

              {/* Líneas de productos */}
              {lineas.map((l,i) => (
                <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
                  <input className="form-control" placeholder="Producto" style={{flex:2}} value={l.producto} onChange={e=>cambiarLinea(i,'producto',e.target.value)} />
                  <input className="form-control" placeholder="Cant." type="number" min="1" style={{width:60}} value={l.cantidad} onChange={e=>cambiarLinea(i,'cantidad',e.target.value)} />
                  <input className="form-control" placeholder="Precio" type="number" style={{width:110}} value={l.precio} onChange={e=>cambiarLinea(i,'precio',e.target.value)} />
                  {lineas.length > 1 && (
                    <button onClick={() => removeLinea(i)} style={{background:'none',border:'1px solid var(--border)',color:'var(--red)',cursor:'pointer',padding:'10px 10px',borderRadius:8}}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addLinea} style={{marginBottom:14}}>+ Agregar línea</button>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12,background:'var(--surface2)',borderRadius:8,marginBottom:16}}>
                <span className="text-muted">Total:</span>
                <span className="mono text-green" style={{fontSize:20}}>{fmt(total)}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de documento</label>
                <select className="form-control" value={tipo} onChange={e=>setTipo(e.target.value)}>
                  <option value="factura">Factura</option>
                  <option value="recibo">Recibo de caja</option>
                  <option value="separado">Comprobante de separado</option>
                </select>
              </div>

              <button className="btn btn-primary" style={{width:'100%'}} onClick={generar}>
                🖨 Generar e Imprimir
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="card">
            <div className="card-header"><div className="card-title">Vista Previa</div></div>
            <div className="card-body" style={{display:'flex',justifyContent:'center'}}>
              {!cliente && !items.some(i=>i.producto)
                ? <div className="empty-state">Completa el formulario para ver la vista previa</div>
                : <div style={{fontFamily:'DM Mono,monospace',fontSize:12,background:'white',color:'#111',padding:'24px 20px',maxWidth:300,borderRadius:8,lineHeight:1.8,width:'100%'}}>
                    <div style={{textAlign:'center',fontSize:18,fontWeight:'bold',letterSpacing:2,marginBottom:4}}>🏃 SPORT STORE</div>
                    <div style={{textAlign:'center',fontSize:10,color:'#666',marginBottom:4}}>Pasto, Colombia</div>
                    <div style={{textAlign:'center',fontSize:11,fontWeight:'bold',marginBottom:8}}>{tipoLabel[tipo]}</div>
                    <div style={{borderTop:'1px dashed #999',margin:'8px 0'}}></div>
                    <div style={{fontSize:11}}>Cliente: <b>{cliente||'—'}</b></div>
                    <div style={{fontSize:11}}>Tel: {telefono||'—'}</div>
                    <div style={{fontSize:11}}>Fecha: {hoy()}</div>
                    <div style={{borderTop:'1px dashed #999',margin:'8px 0'}}></div>
                    {items.filter(i=>i.producto).map((i,idx)=>(
                      <div key={idx} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                        <span>{i.cantidad}x {i.producto}</span><span>{fmt(i.subtotal)}</span>
                      </div>
                    ))}
                    <div style={{borderTop:'1px dashed #999',margin:'8px 0'}}></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontWeight:'bold',fontSize:14}}>
                      <span>TOTAL</span><span>{fmt(total)}</span>
                    </div>
                    <div style={{textAlign:'center',marginTop:8,fontSize:10,color:'#999'}}>¡Gracias por su compra!</div>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="card">
          <div className="card-header"><div className="card-title">Historial de Facturas</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Tipo</th><th>Acciones</th></tr></thead>
              <tbody>
                {!facturas?.length
                  ? <tr><td colSpan="6" className="empty-state">Sin facturas aún</td></tr>
                  : facturas.map(f => (
                    <tr key={f.id}>
                      <td className="mono text-muted">#{f.id}</td>
                      <td><b>{f.cliente}</b><div style={{fontSize:11,color:'var(--text2)'}}>{f.telefono}</div></td>
                      <td className="text-muted">{f.fecha}</td>
                      <td className="mono text-green">{fmt(f.total)}</td>
                      <td><span className="badge badge-blue">{f.tipo}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => imprimir(f)}>🖨 Imprimir</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
