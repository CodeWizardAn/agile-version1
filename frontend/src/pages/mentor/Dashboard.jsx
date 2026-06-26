import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MentorLayout from '../../components/layouts/MentorLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

const C = '#4f46e5'

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

function StatCard({ label, value, sub, subColor, bg, emoji }) {
  const counted = useCountUp(value)
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '24px 26px', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>{emoji}</div>
      <div>
        <p style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>{counted}</p>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: subColor, margin: 0 }}>{sub}</p>
      </div>
    </div>
  )
}

export default function MentorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [sessions, setSessions] = useState([])
  const [requests, setRequests] = useState([])
  const [reqOpen,  setReqOpen]  = useState(true)

  useEffect(() => {
    api.get('/api/mentor/dashboard').then(r => setStats(r.data?.stats ?? r.data)).catch(() => {})
    api.get('/api/mentor/enrollment-requests').then(r => setRequests(r.data)).catch(() => {})
    api.get('/api/mentor/sessions').then(r => {
      const now = new Date()
      setSessions(r.data
        .filter(s => s.scheduled_at && new Date(s.scheduled_at) > now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 8))
    }).catch(() => {})
  }, [])

  const name = user?.full_name?.split(' ')[0] ?? 'Mentor'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const createItems = [
    { icon: '🎥', label: 'New Live Session',     onClick: () => navigate('/mentor/sessions') },
    { icon: '📹', label: 'New Recorded Session', onClick: () => navigate('/mentor/sessions') },
    { icon: '🏆', label: 'Add Certificate',      onClick: () => navigate('/mentor/certificates') },
  ]
  const userItems = [
    { icon: '👤', label: 'Edit Profile', onClick: () => navigate('/mentor/profile') },
    { icon: '🏆', label: 'Certificates', onClick: () => navigate('/mentor/certificates') },
    'divider',
    { icon: '🚪', label: 'Sign out', danger: true, onClick: () => { logout(); navigate('/login') } },
  ]

  const STATS = [
    { label: 'Sessions Created', value: stats?.total_sessions ?? 0, sub: 'total created',   subColor: C,         bg: `linear-gradient(135deg,${C},#6366f1)`,         emoji: '🎯' },
    { label: 'Mentees',          value: stats?.total_mentees  ?? 0, sub: 'across programs', subColor: '#0d9488', bg: 'linear-gradient(135deg,#0d9488,#0891b2)',       emoji: '👥' },
    { label: 'Certificates',     value: stats?.total_certs    ?? 0, sub: 'on your profile', subColor: '#d97706', bg: 'linear-gradient(135deg,#f59e0b,#f97316)',       emoji: '🏆' },
  ]

  return (
    <MentorLayout>

      {/* ── Welcome Banner ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#1e1b4b 100%)', borderRadius: 22, padding: '26px 32px', marginBottom: 26, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%,rgba(79,70,229,0.22),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: 60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(79,70,229,0.07)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <p style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>{today}</p>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {greet}, {name} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              Guide your mentees and manage your sessions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Dropdown
              trigger={
                <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C},#6366f1)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.45)' }}>
                  + Create <span style={{ fontSize: 10 }}>▾</span>
                </button>
              }
              items={createItems}
            />
            <Dropdown
              trigger={
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${C},#6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                  {name[0]}
                </div>
              }
              items={userItems}
            />
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Upcoming Sessions — horizontal scroll ── */}
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Upcoming Sessions</h2>
          </div>
          <Link to="/mentor/sessions" style={{ fontSize: 12, fontWeight: 700, color: C, textDecoration: 'none', padding: '5px 12px', borderRadius: 8, background: '#eef2ff' }}>View all →</Link>
        </div>
        {sessions.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>No upcoming sessions</p>
            <Link to="/mentor/sessions" style={{ fontSize: 13, fontWeight: 700, color: C, textDecoration: 'none' }}>Create your first session →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, padding: '16px 20px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sessions.map(s => {
              const d = new Date(s.scheduled_at)
              const isLive = s.session_type === 'live'
              return (
                <div key={s.session_id} style={{ minWidth: 200, maxWidth: 200, background: '#f8fafc', borderRadius: 14, padding: '16px', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: isLive ? '#eef2ff' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {isLive ? '🎥' : '📹'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: isLive ? '#eef2ff' : '#f5f3ff', color: C }}>
                      {isLive ? 'Live' : 'Recorded'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                    {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions + Pending Requests ── */}
      <div style={{ display: 'grid', gridTemplateColumns: requests.length > 0 ? '1fr 1fr' : '1fr', gap: 20 }}>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quick Actions</h2>
          </div>
          {[
            { label: 'My Sessions',     sub: 'Create and manage sessions',         emoji: '📅', href: '/mentor/sessions' },
            { label: 'Mark Attendance', sub: 'Review and mark mentee attendance',  emoji: '✅', href: '/admin/attendance' },
            { label: 'My Certificates', sub: 'Upload your certifications',         emoji: '🏆', href: '/mentor/certificates' },
            { label: 'Update Profile',  sub: 'Edit bio, expertise, LinkedIn',      emoji: '👤', href: '/mentor/profile' },
          ].map((a, i, arr) => (
            <Link key={a.label} to={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.emoji}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{a.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{a.sub}</p>
              </div>
              <svg width="14" height="14" fill="none" stroke="#cbd5e1" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>

        {/* Pending Enrollment Requests */}
        {requests.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #fde68a', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #fef3c7', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', margin: 0 }}>Pending Enrollments</h2>
                  <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>Awaiting admin approval</p>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 50, background: '#fde68a', color: '#92400e' }}>{requests.length}</span>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {requests.map((r, i) => (
                <div key={r.enrollment_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < requests.length - 1 ? '1px solid #fef9c3' : 'none', background: i % 2 === 0 ? '#fff' : '#fffbeb' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{r.full_name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.full_name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.program_title}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#b45309', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {r.requested_at ? new Date(r.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 20px', background: '#fffbeb', borderTop: '1px solid #fef3c7' }}>
              <p style={{ fontSize: 11, color: '#b45309', margin: 0 }}>🔑 Contact your admin to approve these requests.</p>
            </div>
          </div>
        )}
      </div>

    </MentorLayout>
  )
}
