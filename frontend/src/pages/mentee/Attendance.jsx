import { useEffect, useState } from 'react'
import MenteeLayout from '../../components/layouts/MenteeLayout'
import api from '../../api/client'

export default function MenteeAttendance() {
  const [records, setRecords] = useState([])

  useEffect(() => { api.get('/api/mentee/attendance').then(r => setRecords(r.data)) }, [])

  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const total   = records.length
  const rate    = total ? Math.round((present / total) * 100) : 0

  const STATS = [
    { label: 'Present',    value: present,        bg: 'linear-gradient(135deg,#0d9488,#10b981)', emoji: '✅' },
    { label: 'Absent',     value: absent,         bg: 'linear-gradient(135deg,#ef4444,#f97316)', emoji: '❌' },
    { label: 'Total',      value: total,          bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', emoji: '📊' },
    { label: 'Rate',       value: `${rate}%`,     bg: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', emoji: '📈' },
  ]

  const statusStyle = s => ({
    present: { bg: '#f0fdf4', color: '#15803d', label: '✓ Present' },
    absent:  { bg: '#fef2f2', color: '#dc2626', label: '✗ Absent'  },
  }[s] || { bg: '#f8fafc', color: '#94a3b8', label: 'Not marked' })

  return (
    <MenteeLayout>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          My <span style={{ color: '#7c3aed' }}>Attendance</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Track your attendance across all sessions and programs.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.13)' }}>
              {s.emoji}
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance rate bar */}
      {total > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>Overall Attendance Rate</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: rate >= 75 ? '#15803d' : rate >= 50 ? '#d97706' : '#dc2626', margin: 0 }}>{rate}%</p>
          </div>
          <div style={{ height: 10, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${rate}%`, transition: 'width 0.5s ease',
              background: rate >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)' : rate >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)' }} />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', fontWeight: 500 }}>
            {rate >= 75 ? '✅ Great attendance! Keep it up.' : rate >= 50 ? '⚠️ Try to improve your attendance.' : '🚨 Low attendance — please check in more sessions.'}
          </p>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Attendance Log</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Session', 'Program', 'Date', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No attendance records yet
                </td>
              </tr>
            ) : records.map((r, i) => {
              const st = statusStyle(r.status)
              return (
                <tr key={r.attendance_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.session_title}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{r.program_title}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>
                    {r.session_date ? new Date(r.session_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 50, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </MenteeLayout>
  )
}
