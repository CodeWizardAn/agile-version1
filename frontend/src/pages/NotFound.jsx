import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'inherit',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 480,
      }}>
        {/* Big 404 */}
        <div style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
          letterSpacing: '-4px',
        }}>
          404
        </div>

        <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>

        <h1 style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 12px',
          letterSpacing: '-0.5px',
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: 15,
          color: '#64748b',
          margin: '0 0 36px',
          lineHeight: 1.6,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: '1.5px solid #e2e8f0',
              background: '#fff',
              fontSize: 14,
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            ← Go Back
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}
