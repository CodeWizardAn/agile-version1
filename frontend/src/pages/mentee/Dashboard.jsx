import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MenteeLayout from '../../components/layouts/MenteeLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

const C = '#7c3aed'

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

export default function MenteeDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [sessions,    setSessions]    = useState([])

  useEffect(() => {
    api.get('/api/mentee/enrollments').then(r => setEnrollments(r.data)).catch(() => {})
    api.get('/api/mentee/sessions').then(r => {
      const now = new Date()
      setSessions(r.data
        .filter(s => !s.access_locked && s.scheduled_at && new Date(s.scheduled_at) > now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 8))
    }).catch(() => {})
  }, [])

  const name     = user?.full_name?.split(' ')[0] ?? 'Learner'
  const today    = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour     = new Date().getHours()
  const greet    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const completed  = enrollments.filter(e => e.status === 'completed' || e.status === 'certificate_eligible').length
  const active     = enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length
  const certReady  = enrollments.filter(e => e.status === 'certificate_eligible').length

  const userItems = [
    { icon: '📋', label: 'My Enrollments', onClick: () => navigate('/mentee/enrollments') },
    { icon: '✅', label: 'My Attendance',  onClick: () => navigate('/mentee/attendance') },
    'divider',
    { icon: '🚪', label: 'Sign out', danger: true, onClick: () => { logout(); navigate('/login') } },
  ]

  const STATS = [
    { label: 'Active Programs',   value: active,       sub: 'in progress',          subColor: C,         bg: `linear-gradient(135deg,${C},#a855f7)`,        emoji: '📚' },
    { label: 'Completed',         value: completed,    sub: 'programs finished',    subColor: '#0d9488', bg: 'linear-gradient(135deg,#0d9488,#0891b2)',      emoji: '✅' },
    { label: 'Upcoming Sessions', value: sessions.length, sub: 'scheduled ahead',   subColor: '#d97706', bg: 'linear-gradient(135deg,#f59e0b,#f97316)',     emoji: '📅' },
  ]

  return (
    <MenteeLayout>

      {/* ── Welcome Banner ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#2e1065 100%)', borderRadius: 22, padding: '26px 32px', marginBottom: 26, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%,rgba(124,58,237,0.22),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: 60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(124,58,237,0.07)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <p style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>{today}</p>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {greet}, {name} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              Keep learning and track your progress.
              {certReady > 0 && <span style={{ marginLeft: 10, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '2px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>🏆 {certReady} certificate{certReady > 1 ? 's' : ''} ready!</span>}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Link to="/programs" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, textDecoration: 'none', background: `linear-gradient(135deg,${C},#a855f7)`, color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(124,58,237,0.45)' }}>
              🔍 Browse Programs
            </Link>
            <Dropdown
              trigger={
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${C},#a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
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

      {/* ── My Programs — horizontal scroll cards with progress bars ── */}
      {enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length > 0 && (
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 22 }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>My Programs</h2>
            </div>
            <Link to="/mentee/enrollments" style={{ fontSize: 12, fontWeight: 700, color: C, textDecoration: 'none', padding: '5px 12px', borderRadius: 8, background: '#f5f3ff' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', gap: 14, padding: '16px 20px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').map(e => {
              const pct = e.progress ?? 0
              return (
                <div key={e.enrollment_id} style={{ minWidth: 220, maxWidth: 220, background: '#f8fafc', borderRadius: 16, padding: '18px', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>📚</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.program_title ?? e.program_id}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px' }}>Enrolled</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: `linear-gradient(90deg,${C},#a855f7)`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Upcoming Sessions + Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>

        {/* Upcoming Sessions — scrollable list */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Upcoming Sessions</h2>
            </div>
            <Link to="/mentee/sessions" style={{ fontSize: 12, fontWeight: 700, color: C, textDecoration: 'none', padding: '5px 12px', borderRadius: 8, background: '#f5f3ff' }}>View all →</Link>
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>No upcoming sessions</p>
              <Link to="/programs" style={{ fontSize: 13, fontWeight: 700, color: C, textDecoration: 'none' }}>Enroll in a program →</Link>
            </div>
          ) : (
            <div style={{ maxHeight: 310, overflowY: 'auto', padding: '8px 0' }}>
              {sessions.map((s, i) => {
                const d = new Date(s.scheduled_at)
                const isLive = s.session_type === 'live'
                const isToday = d.toDateString() === new Date().toDateString()
                return (
                  <div key={s.session_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderBottom: i < sessions.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: isLive ? '#f5f3ff' : '#eff6ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: C, margin: 0, lineHeight: 1 }}>{d.getDate()}</p>
                      <p style={{ fontSize: 9, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.toLocaleString('en-IN', { month: 'short' })}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                        {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {s.program_title ?? ''}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {isToday
                        ? <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 50, background: '#fee2e2', color: '#dc2626' }}>Today</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 50, background: '#f5f3ff', color: C }}>{isLive ? 'Live' : 'Rec'}</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quick Links</h2>
          </div>
          {[
            { label: 'Browse Programs',  sub: 'Discover new programs',          emoji: '🔍', href: '/programs' },
            { label: 'My Enrollments',   sub: 'Track enrolled programs',        emoji: '📋', href: '/mentee/enrollments' },
            { label: 'My Sessions',      sub: 'Live and recorded sessions',     emoji: '🎬', href: '/mentee/sessions' },
            { label: 'My Attendance',    sub: 'Check your attendance record',   emoji: '✅', href: '/mentee/attendance' },
            { label: 'Resources',        sub: 'Study materials and files',      emoji: '📁', href: '/mentee/resources' },
          ].map((a, i, arr) => (
            <Link key={a.label} to={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{a.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 1px' }}>{a.label}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{a.sub}</p>
              </div>
              <svg width="13" height="13" fill="none" stroke="#cbd5e1" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      </div>

    </MenteeLayout>
  )
}
