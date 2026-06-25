import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

const STAT_DEFS = [
  { key: 'total_programs',    label: 'Total Programs',  emoji: '📚', bg: 'linear-gradient(135deg,#059669,#10b981)', sub: 'programs created' },
  { key: 'active_programs',   label: 'Active',          emoji: '✅', bg: 'linear-gradient(135deg,#0d9488,#06b6d4)', sub: 'currently running' },
  { key: 'total_sessions',    label: 'Sessions',        emoji: '🎬', bg: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', sub: 'all time' },
  { key: 'live_sessions',     label: 'Live Now',        emoji: '🔴', bg: 'linear-gradient(135deg,#dc2626,#f97316)', sub: 'in progress' },
  { key: 'total_users',       label: 'Total Users',     emoji: '👥', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', sub: 'registered' },
  { key: 'total_mentors',     label: 'Mentors',         emoji: '🧑‍🏫', bg: 'linear-gradient(135deg,#0f766e,#059669)', sub: 'active' },
  { key: 'total_enrollments', label: 'Enrollments',     emoji: '📋', bg: 'linear-gradient(135deg,#d97706,#f59e0b)', sub: 'total enrollments' },
  { key: 'certificate_eligible', label: 'Cert Eligible', emoji: '🏆', bg: 'linear-gradient(135deg,#b45309,#d97706)', sub: 'ready to issue' },
]

const QUICK = [
  { label: '+ New Program', emoji: '📚', href: '/admin/programs', bg: 'linear-gradient(135deg,#059669,#10b981)', shadow: 'rgba(5,150,105,0.4)' },
  { label: '+ New Session', emoji: '🎬', href: '/admin/sessions', bg: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', shadow: 'rgba(29,78,216,0.4)' },
  { label: '+ Invite Mentor', emoji: '🧑‍🏫', href: '/admin/users', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', shadow: 'rgba(124,58,237,0.4)' },
  { label: 'Attendance',    emoji: '✅', href: '/admin/attendance', bg: 'linear-gradient(135deg,#d97706,#f97316)', shadow: 'rgba(217,119,6,0.4)' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/api/admin/dashboard').then(r => setStats(r.data)).catch(() => {}) }, [])
  const name = user?.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <AdminLayout>

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 220, background: 'radial-gradient(ellipse at right center,rgba(5,150,105,0.25),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Welcome back, {name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Here's what's happening on your platform today.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 50, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', flexShrink: 0, position: 'relative' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7' }}>Platform Online</span>
        </div>
      </div>

      {/* Stat grid (2 rows × 4 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {STAT_DEFS.map(s => (
          <div key={s.key} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.13)' }}>
              {s.emoji}
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>
                {stats ? (stats[s.key] ?? 0) : '—'}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px', fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Module Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Actions</h2>
          </div>
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {QUICK.map(q => (
              <Link key={q.label} to={q.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: q.bg, boxShadow: `0 4px 12px ${q.shadow}` }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <span style={{ fontSize: 20 }}>{q.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Module Links */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Platform Modules</h2>
          </div>
          {[
            { label: 'Programs',   sub: 'Create and manage mentorship programs',  emoji: '📚', href: '/admin/programs',   color: '#059669' },
            { label: 'Sessions',   sub: 'Schedule live and recorded sessions',     emoji: '🎬', href: '/admin/sessions',   color: '#1d4ed8' },
            { label: 'Users',      sub: 'Manage mentors, mentees and invites',     emoji: '👥', href: '/admin/users',      color: '#7c3aed' },
            { label: 'Resources',  sub: 'Upload and manage study materials',       emoji: '📁', href: '/admin/resources',  color: '#d97706' },
          ].map((m, i, arr) => (
            <Link key={m.label} to={m.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {m.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{m.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{m.sub}</p>
              </div>
              <svg width="14" height="14" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
