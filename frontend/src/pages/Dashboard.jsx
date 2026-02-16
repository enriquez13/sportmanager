import { useApi } from '../hooks/useApi'
import { api } from '../api/client'

const fmt = n => '$' + (+n || 0).toLocaleString('es-CO')

export default function Dashboard() {
  const { data: ventasHoy, loading: lv } = useApi(() => api.ventas.hoy())
  const { data: productos, loading: lp }  = useApi(() => api.productos.listar())
  const { data: separados, loading: ls }  = useApi(() => api.separados.listar({ estado: 'activo' }))
  const { data: pedidos,   loading: lpd } = useApi(() => api.pedidos.listar('pendiente'))

  const bajoStock = productos?.filter(p => p.stock <= p.stock_minimo) || []
  const totalAbonado = separados?.reduce((s, x) => s + (x.abonado || 0), 0) || 0

  return (
    <>
      <div className="topbar">
        <div className="page-title">Dashboard</div>
      </div>
      <div className="content">

        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-label">Ventas Hoy</div>
            <div className="stat-value green">{lv ? '...' : fmt(ventasHoy?.total_dia)}</div>
            <div className="stat-change">{ventasHoy?.cantidad || 0} transacciones</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-label">Productos en Stock</div>
            <div className="stat-value orange">{lp ? '...' : productos?.length || 0}</div>
            <div className="stat-change">{bajoStock.length} con stock bajo</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Separados Activos</div>
            <div className="stat-value yellow">{ls ? '...' : separados?.length || 0}</div>
            <div className="stat-change">{fmt(totalAbonado)} en abonos</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Pedidos Pendientes</div>
            <div className="stat-value blue">{lpd ? '...' : pedidos?.length || 0}</div>
            <div className="stat-change">a fabricantes</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Últimas Ventas Hoy</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Descripción</th><th>Método</th><th>Monto</th></tr></thead>
                <tbody>
                  {!ventasHoy?.ventas?.length
                    ? <tr><td colSpan="3" className="empty-state">Sin ventas hoy</td></tr>
                    : ventasHoy.ventas.slice(0, 6).map(v => (
                      <tr key={v.id}>
                        <td style={{fontSize:12}}>{v.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}</td>
                        <td><span className="badge badge-blue">{v.metodo_pago}</span></td>
                        <td className="mono text-green">{fmt(v.total)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">⚠️ Stock Bajo</div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th></tr></thead>
                <tbody>
                  {!bajoStock.length
                    ? <tr><td colSpan="3" className="empty-state">Todo en orden ✓</td></tr>
                    : bajoStock.map(p => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td><span className="mono" style={{color: p.stock === 0 ? 'var(--red)' : 'var(--yellow)'}}>{p.stock}</span></td>
                        <td className="text-muted">{p.stock_minimo}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card" style={{marginTop:20}}>
          <div className="card-header"><div className="card-title">Separados Pendientes</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Producto</th><th>Total</th><th>Abonado</th><th>Resta</th><th>Vence</th></tr></thead>
              <tbody>
                {!separados?.length
                  ? <tr><td colSpan="6" className="empty-state">Sin separados activos</td></tr>
                  : separados.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td><b>{s.cliente}</b></td>
                      <td style={{fontSize:12}}>{s.producto}</td>
                      <td className="mono">{fmt(s.total)}</td>
                      <td className="mono text-green">{fmt(s.abonado)}</td>
                      <td className="mono text-accent">{fmt(s.total - s.abonado)}</td>
                      <td className="text-muted">{s.fecha_limite || '—'}</td>
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
