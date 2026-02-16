import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#1c1020' : '#0f1f18',
            border: `1px solid ${t.type === 'error' ? '#ff3b5c44' : '#00e5a044'}`,
            color: t.type === 'error' ? '#ff3b5c' : '#00e5a0',
            padding: '12px 18px', borderRadius: 10,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.3s ease',
          }}>
            {t.type === 'error' ? '✕ ' : '✓ '}{t.msg}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
