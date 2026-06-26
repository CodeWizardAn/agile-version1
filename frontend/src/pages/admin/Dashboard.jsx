import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

const C = '#059669'   // emerald accent

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target == null) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #f1f5f9', zIndex: 100, overflow: 'hidden' }}>
          {items.map((item, i) => item === 'divider'
            ? <div key={i} style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
            : <div key={i} onClick={() => { item.onClick?.(); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: item.danger ? '#dc2626' : '#1e293b', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
              </div>
          )}
        </div>
      )}
    </div>
  )
}

const STAT_DEFS = [
  { key: 'total_programs',     label: 'Programs',       icon: '📚', accent: '#059669' },
  { key: 'active_programs',    label: 'Active',         icon: '✅', accent: '#0d9488' },
  { key: 'total_sessions',     label: 'Sessions',       icon: '🎬', accent: '#1d4ed8' },
  { key: 'live_sessions',      label: 'Live Now',       icon: '🔴', accent: '#dc2626' },
  { key: 'total_users',        label: 'Users',          icon: '👥', accent: '#7c3aed' },
  { key: 'total_mentors',      label: 'Mentors',        icon: '🧑‍🏫', accent: '#0f766e' },
  { key: 'total_enrollments',  label: 'Enrollments',    icon: '📋', accent: '#d97706' },
  { key: 'certificate_eligible', label: 'Cert Ready',   icon: '🏆', accent: '#b45309' },
]

function StatCard({ def, value }) {
  const counted = useCountUp(value)
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', borderLeft: `4px solid ${def.accent}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: `${def.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {def.icon}
      </div>
      <div>
        <p style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>{value != null ? counted : '—'}</p>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 600, letterSpacing: '0.02em' }}>{def.label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [requests, setRequests] = useState([])
  const [acting,   setActing]   = useState(null)
  const [reqOpen,  setReqOpen]  = useState(true)

  const loadRequests = () => api.get('/api/admin/enrollment-requests').then(r => setRequests(r.data)).catch(() => {})
  useEffect(() => {
    api.get('/api/admin/dashboard').then(r => setStats(r.data)).catch(() => {})
    loadRequests()
  }, [])

  const approve = async id => {
    setActing(id + 'a')
    await api.post(`/api/admin/enrollment-requests/${id}/approve`).catch(() => {})
    await loadRequests(); setActing(null)
  }
  const reject = async id => {
    if (!confirm('Reject this enrollment request?')) return
    setActing(id + 'r')
    await api.post(`/api/admin/enrollment-requests/${id}/reject`).catch(() => {})
    await loadRequests(); setActing(null)
  }

  const name = user?.full_name?.split(' ')[0] ?? 'Admin'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const quickAddItems = [
    { icon: '📚', label: 'New Program',  onClick: () => navigate('/admin/programs') },
    { icon: '🎬', label: 'New Session',  onClick: () => navigate('/admin/sessions') },
    { icon: '🧑‍🏫', label: 'Invite Mentor', onClick: () => navigate('/admin/users') },
    { icon: '✅', label: 'Attendance',   onClick: () => navigate('/admin/attendance') },
  ]
  const userItems = [
    { icon: '👤', label: 'Profile',  onClick: () => navigate('/admin/profile') },
    'divider',
    { icon: '🚪', label: 'Sign out', danger: true, onClick: () => { logout(); navigate('/login') } },
  ]

  return (
    <AdminLayout>

      {/* ── Welcome Banner ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#064e3b 100%)', borderRadius: 22, padding: '26px 32px', marginBottom: 26, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%,rgba(5,150,105,0.2),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(5,150,105,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <p style={{ color: '#6ee7b7', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>{today}</p>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {greet}, {name} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              Here's what's happening on your platform.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Platform status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 50, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.35)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.3)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>Online</span>
            </div>

            {/* Quick Add dropdown */}
            <Dropdown
              trigger={
                <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C},#10b981)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.45)' }}>
                  + Quick Add <span style={{ fontSize: 10 }}>▾</span>
                </button>
              }
              items={quickAddItems}
            />

            {/* User avatar dropdown */}
            <Dropdown
              trigger={
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${C},#10b981)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                  {name[0]}
                </div>
              }
              items={userItems}
            />
          </div>
        </div>
      </div>

      {/* ── Stat Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {STAT_DEFS.map(d => <StatCard key={d.key} def={d} value={stats?.[d.key] ?? null} />)}
      </div>

      {/* ── Enrollment Requests ── */}
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: 22, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: reqOpen ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setReqOpen(o => !o)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📋</div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Enrollment Requests</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Review and approve mentee applications</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {requests.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 50, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                {requests.length} pending
              </span>
            )}
            <span style={{ fontSize: 18, color: '#94a3b8', transform: reqOpen ? 'rotate(90deg)' : 'rotate(0)', transition: '0.2s' }}>›</span>
          </div>
        </div>

        {reqOpen && (
          requests.length === 0 ? (
            <div style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>All caught up!</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No pending enrollment requests.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Mentee', 'Email', 'Program', 'Requested', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={r.enrollment_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${C},#10b981)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{r.full_name[0]}</div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{r.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 12, color: '#64748b' }}>{r.email}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.program_title}</td>
                      <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {r.requested_at ? new Date(r.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => approve(r.enrollment_id)} disabled={!!acting}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: acting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', background: acting === r.enrollment_id + 'a' ? '#6ee7b7' : `linear-gradient(135deg,${C},#10b981)`, boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}>
                            {acting === r.enrollment_id + 'a' ? '…' : '✓ Approve'}
                          </button>
                          <button onClick={() => reject(r.enrollment_id)} disabled={!!acting}
                            style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #fecaca', cursor: acting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: '#dc2626', background: '#fef2f2' }}>
                            {acting === r.enrollment_id + 'r' ? '…' : '✕ Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ── Quick Actions + Platform Modules ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Quick Actions — gradient cards */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '0.02em' }}>Quick Actions</h2>
          </div>
          <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: '+ New Program',  emoji: '📚', href: '/admin/programs',   bg: `linear-gradient(135deg,${C},#10b981)`,      shadow: 'rgba(5,150,105,0.35)' },
              { label: '+ New Session',  emoji: '🎬', href: '/admin/sessions',   bg: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',  shadow: 'rgba(29,78,216,0.35)' },
              { label: '+ Invite Mentor',emoji: '🧑‍🏫', href: '/admin/users',     bg: 'linear-gradient(135deg,#7c3aed,#a855f7)',  shadow: 'rgba(124,58,237,0.35)' },
              { label: 'Attendance',     emoji: '✅', href: '/admin/attendance', bg: 'linear-gradient(135deg,#d97706,#f97316)',  shadow: 'rgba(217,119,6,0.35)' },
            ].map(q => (
              <Link key={q.label} to={q.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, background: q.bg, boxShadow: `0 4px 14px ${q.shadow}` }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <span style={{ fontSize: 20 }}>{q.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Modules */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Platform Modules</h2>
          </div>
          {[
            { label: 'Programs',  sub: 'Create & manage mentorship programs', emoji: '📚', href: '/admin/programs',  color: C },
            { label: 'Sessions',  sub: 'Schedule live and recorded sessions',  emoji: '🎬', href: '/admin/sessions',  color: '#1d4ed8' },
            { label: 'Users',     sub: 'Manage mentors, mentees and invites',  emoji: '👥', href: '/admin/users',     color: '#7c3aed' },
            { label: 'Resources', sub: 'Upload and manage study materials',    emoji: '📁', href: '/admin/resources', color: '#d97706' },
          ].map((m, i, arr) => (
            <Link key={m.label} to={m.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${m.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{m.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{m.sub}</p>
              </div>
              <svg width="14" height="14" fill="none" stroke="#cbd5e1" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      </div>

    </AdminLayout>
  )
}
