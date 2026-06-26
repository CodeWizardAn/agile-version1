import { useEffect, useState } from 'react'
import MentorLayout from '../../components/layouts/MentorLayout'
import api from '../../api/client'

const C = '#4f46e5'

function StatChip({ label, value, suffix = '' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 20px', borderRadius: 14,
      background: '#f5f3ff', border: '1px solid #ede9fe',
      minWidth: 90,
    }}>
      <span style={{ fontSize: 22, fontWeight: 900, color: C, lineHeight: 1 }}>
        {value != null ? value : '—'}{suffix}
      </span>
      <span style={{ fontSize: 11, color: '#6d28d9', fontWeight: 700, marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

function StatusBadge({ done }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      padding: '4px 12px', borderRadius: 50,
      background: done ? '#f0fdf4' : '#eff6ff',
      color: done ? '#15803d' : '#1d4ed8',
      border: `1px solid ${done ? '#bbf7d0' : '#bfdbfe'}`,
      whiteSpace: 'nowrap',
    }}>
      {done ? '✓ Completed' : '● In Progress'}
    </span>
  )
}

function ProgramAccordion({ prog, idx }) {
  const [open, setOpen] = useState(false)

  const GRAD_COLORS = [
    'linear-gradient(135deg,#4f46e5,#6366f1)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#d97706,#f97316)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#db2777,#e879f9)',
    'linear-gradient(135deg,#0f766e,#0d9488)',
  ]
  const grad = GRAD_COLORS[idx % GRAD_COLORS.length]

  const ratingStars = (r) => {
    if (r == null) return '—'
    const filled = Math.round(r)
    return '★'.repeat(filled) + '☆'.repeat(5 - filled) + ` ${Number(r).toFixed(1)}`
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      boxShadow: open ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
      border: `1px solid ${open ? '#e2e8f0' : '#f1f5f9'}`,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      marginBottom: 12,
    }}>

      {/* Accordion header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', cursor: 'pointer', userSelect: 'none' }}
        onMouseEnter={e => !open && (e.currentTarget.style.background = '#fafafa')}
        onMouseLeave={e => !open && (e.currentTarget.style.background = 'transparent')}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background: grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}>
          📚
        </div>

        {/* Title + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prog.title}
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Enrolled badge */}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: '#ede9fe', color: C }}>
              {prog.enrolled} enrolled
            </span>
            {/* Completion rate */}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
              {prog.completion_rate}% complete
            </span>
            {/* Rating */}
            {prog.avg_rating != null && (
              <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                ⭐ {Number(prog.avg_rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.22s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9' }}>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 12, padding: '18px 22px', flexWrap: 'wrap', borderBottom: '1px solid #f8fafc' }}>
            <StatChip label="Sessions"  value={prog.total_sessions} />
            <StatChip label="Enrolled"  value={prog.enrolled} />
            <StatChip label="Completed" value={prog.completed} />
            <StatChip label="Avg Rating" value={prog.avg_rating != null ? Number(prog.avg_rating).toFixed(1) : null} />
          </div>

          {/* Mentee progress table */}
          {prog.mentees?.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Mentee Name', 'Progress', 'Attendance Rate', 'Status'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 20px',
                        fontSize: 11, fontWeight: 700, color: '#64748b',
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                        borderBottom: '1px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prog.mentees.map((mentee, mi) => {
                    const done = mentee.progress_pct >= 100
                    return (
                      <tr key={mentee.user_id} style={{ background: mi % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f8fafc' }}>

                        {/* Name */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: grad,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0,
                            }}>
                              {mentee.name[0]}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{mentee.name}</span>
                          </div>
                        </td>

                        {/* Progress bar + % */}
                        <td style={{ padding: '14px 20px', minWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, background: '#ede9fe', borderRadius: 50, height: 8, overflow: 'hidden', minWidth: 80 }}>
                              <div style={{
                                width: `${Math.min(mentee.progress_pct, 100)}%`,
                                height: '100%',
                                background: done
                                  ? 'linear-gradient(90deg,#059669,#10b981)'
                                  : `linear-gradient(90deg,${C},#6366f1)`,
                                borderRadius: 50,
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                              {mentee.progress_pct}%
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 3 }}>
                            {mentee.sessions_completed} / {mentee.total_trackable_sessions} sessions
                          </span>
                        </td>

                        {/* Attendance rate */}
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 50,
                            background: mentee.attendance_rate >= 75 ? '#f0fdf4' : mentee.attendance_rate >= 50 ? '#fffbeb' : '#fef2f2',
                            color: mentee.attendance_rate >= 75 ? '#15803d' : mentee.attendance_rate >= 50 ? '#92400e' : '#dc2626',
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {mentee.attendance_rate}%
                          </span>
                        </td>

                        {/* Status badge */}
                        <td style={{ padding: '14px 20px' }}>
                          <StatusBadge done={done} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '28px 22px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>No mentees enrolled in this program yet.</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default function MentorAnalytics() {
  const [programs, setPrograms] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    api.get('/api/mentor/analytics')
      .then(r => setPrograms(r.data?.programs ?? []))
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MentorLayout>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          <span style={{ color: C }}>Analytics</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Your program performance at a glance</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C}30`, borderTop: `3px solid ${C}`, animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Loading analytics…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>⚠ {error}</p>
        </div>
      )}

      {!loading && !error && programs.length === 0 && (
        <div style={{
          background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>📊</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>No programs yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Your analytics will appear here once you have active programs with enrolled mentees.</p>
        </div>
      )}

      {!loading && !error && programs.length > 0 && (
        <div>
          {programs.map((prog, idx) => (
            <ProgramAccordion key={prog.program_id} prog={prog} idx={idx} />
          ))}
        </div>
      )}

    </MentorLayout>
  )
}
