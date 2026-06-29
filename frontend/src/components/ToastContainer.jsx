import { useEffect, useState } from 'react'

let nextId = 0

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function handle(e) {
      const { message, type } = e.detail
      const id = ++nextId
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    window.addEventListener('app-toast', handle)
    return () => window.removeEventListener('app-toast', handle)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: 360,
      width: 'calc(100vw - 40px)',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          background: t.type === 'success' ? '#f0fdf4' : t.type === 'warning' ? '#fffbeb' : '#fef2f2',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'warning' ? '#fde68a' : '#fecaca'}`,
          animation: 'toastIn 0.2s ease',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>
            {t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: t.type === 'success' ? '#15803d' : t.type === 'warning' ? '#92400e' : '#dc2626',
            lineHeight: 1.5,
          }}>
            {t.message}
          </p>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8', flexShrink: 0, padding: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
