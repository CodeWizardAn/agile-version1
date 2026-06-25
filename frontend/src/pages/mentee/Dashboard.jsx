import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MenteeLayout from '../../components/layouts/MenteeLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

export default function MenteeDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [sessions, setSessions] = useState([])
  const name = user?.full_name?.split(' ')[0] ?? 'Learner'

  useEffect(() => {
    api.get('/api/mentee/enrollments').then(r => setEnrollments(r.data)).catch(() => {})
    api.get('/api/mentee/sessions').then(r => {
      const now = new Date()
      setSessions(r.data
        .filter(s => s.scheduled_at && new Date(s.scheduled_at) > now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 5))
    }).catch(() => {})
  }, [])

  const completed = enrollments.filter(e => e.status === 'completed').length
  const active = enrollments.filter(e => e.status === 'enrolled').length

  const STATS = [
    { label: 'Active Enrollments', value: active,          sub: 'programs in progress', subColor: '#7c3aed', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', emoji: '📚' },
    { label: 'Completed',          value: completed,       sub: 'programs finished',    subColor: '#0d9488', bg: 'linear-gradient(135deg,#0d9488,#0891b2)', emoji: '✅' },
    { label: 'Upcoming Sessions',  value: sessions.length, sub: 'scheduled ahead',      subColor: '#d97706', bg: 'linear-gradient(135deg,#f59e0b,#f97316)', emoji: '📅' },
  ]

  const ACTIONS = [
    { label: 'Browse Programs', sub: 'Discover and enroll in new programs', emoji: '🔍', href: '/programs' },
    { label: 'My Enrollments',  sub: 'Track your enrolled programs',        emoji: '📋', href: '/mentee/enrollments' },
    { label: 'My Sessions',     sub: 'View upcoming and past sessions',     emoji: '🎬', href: '/mentee/sessions' },
    { label: 'My Attendance',   sub: 'Check your attendance record',        emoji: '✅', href: '/mentee/attendance' },
  ]

  return (
    <MenteeLayout>

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 220, background: 'radial-gradient(ellipse at right center,rgba(124,58,237,0.25),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Welcome back, {name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Keep learning and track your progress across all programs.
          </p>
        </div>
        <Link to="/programs" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#fff', padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.45)', flexShrink: 0, position: 'relative' }}>
          Browse Programs
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {s.emoji}
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: s.subColor, margin: 0 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Upcoming Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.75fr', gap: 20 }}>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Actions</h2>
          </div>
          {ACTIONS.map((a, i) => (
            <Link key={a.label} to={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i < ACTIONS.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {a.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: '0 0 2px' }}>{a.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{a.sub}</p>
              </div>
              <svg width="16" height="16" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Upcoming Sessions</h2>
            </div>
            <Link to="/mentee/sessions" style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ flex: 1, padding: '8px 0' }}>
            {sessions.length > 0 ? sessions.map(s => (
              <div key={s.session_id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {s.session_type === 'live' ? '🎥' : '📹'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                    {new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}&nbsp;·&nbsp;
                    {new Date(s.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 12, lineHeight: 1 }}>📅</div>
                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: '0 0 4px' }}>No upcoming sessions</p>
                <Link to="/programs" style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}>
                  Enroll in a program →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MenteeLayout>
  )
}
