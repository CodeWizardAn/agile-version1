import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import api from '../../api/client'

export default function AdminAttendance() {
  const [sessions,     setSessions]     = useState([])
  const [selected,     setSelected]     = useState(null)
  const [attendanceData, setAttendance] = useState(null)
  const [marking,      setMarking]      = useState(null)

  useEffect(() => { api.get('/api/admin/sessions').then(r => setSessions(r.data)).catch(() => {}) }, [])

  const loadAttendance = async sid => {
    setSelected(sid)
    try {
      const res = await api.get(`/api/admin/attendance/${sid}`)
      setAttendance(res.data)
    } catch {
      setAttendance(null)
    }
  }

  const mark = async (userId, status) => {
    setMarking(userId + status)
    try {
      await api.post(`/api/admin/attendance/${selected}/mark`, { user_id: userId, status })
      await loadAttendance(selected)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to mark attendance')
    } finally {
      setMarking(null)
    }
  }

  const present = attendanceData?.mentees?.filter(m => m.status === 'present').length ?? 0
  const total   = attendanceData?.mentees?.length ?? 0

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#059669' }}>Attendance</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Select a session and mark mentee attendance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

        {/* Session list */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Sessions</h2>
          </div>
          <div style={{ padding: '8px', maxHeight: 520, overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '30px 0' }}>No sessions</p>
            ) : sessions.map(s => (
              <button key={s.session_id} onClick={() => loadAttendance(s.session_id)}
                style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, marginBottom: 4, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: selected === s.session_id ? '#059669' : 'transparent',
                  color: selected === s.session_id ? '#fff' : '#374151',
                }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: selected === s.session_id ? '#fff' : '#1e293b' }}>
                  {s.title}
                </p>
                <p style={{ fontSize: 11, margin: 0, color: selected === s.session_id ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                  {s.session_type} · {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Attendance panel */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!attendanceData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>📋</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>Select a session</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Choose a session from the list to view and mark attendance.</p>
            </div>
          ) : (
            <>
              {/* Session info + stats */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{attendanceData.session.title}</h2>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{attendanceData.session.session_type} session</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: '8px 18px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#15803d', margin: '0 0 2px', lineHeight: 1 }}>{present}</p>
                      <p style={{ fontSize: 11, color: '#15803d', margin: 0, fontWeight: 600 }}>Present</p>
                    </div>
                    <div style={{ padding: '8px 18px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', margin: '0 0 2px', lineHeight: 1 }}>{total - present}</p>
                      <p style={{ fontSize: 11, color: '#dc2626', margin: 0, fontWeight: 600 }}>Absent</p>
                    </div>
                    <div style={{ padding: '8px 18px', borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#6d28d9', margin: '0 0 2px', lineHeight: 1 }}>{total}</p>
                      <p style={{ fontSize: 11, color: '#6d28d9', margin: 0, fontWeight: 600 }}>Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentee table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Mentee', 'Status', 'Mark Attendance'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.mentees.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No mentees enrolled in this session</td></tr>
                  ) : attendanceData.mentees.map((m, i) => (
                    <tr key={m.user_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                            {m.full_name[0]}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{m.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50,
                          background: m.status === 'present' ? '#f0fdf4' : m.status === 'absent' ? '#fef2f2' : '#f8fafc',
                          color:      m.status === 'present' ? '#15803d' : m.status === 'absent' ? '#dc2626' : '#94a3b8' }}>
                          {m.status === 'present' ? '✓ Present' : m.status === 'absent' ? '✗ Absent' : 'Not marked'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => mark(m.user_id, 'present')} disabled={marking === m.user_id + 'present'}
                            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#15803d' }}>
                            Present
                          </button>
                          <button onClick={() => mark(m.user_id, 'absent')} disabled={marking === m.user_id + 'absent'}
                            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}>
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
