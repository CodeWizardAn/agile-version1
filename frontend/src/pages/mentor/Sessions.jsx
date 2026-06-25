import { useEffect, useState } from 'react'
import MentorLayout from '../../components/layouts/MentorLayout'
import api from '../../api/client'

const emptyForm = { title: '', description: '', session_type: 'live', scheduled_at: '', meeting_link: '', video_url: '', duration_minutes: '' }

const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }
const label = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' }

export default function MentorSessions() {
  const [sessions, setSessions] = useState([])
  const [programs, setPrograms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedProgram, setSelectedProgram] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([
    api.get('/api/mentor/sessions').then(r => setSessions(r.data)),
    api.get('/api/mentor/programs').then(r => setPrograms(r.data)),
  ])
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setSelectedProgram(''); setError(''); setShowForm(true) }
  const openEdit   = s  => {
    setEditing(s.session_id)
    setForm({ title: s.title, description: s.description || '', session_type: s.session_type,
               scheduled_at: s.scheduled_at?.slice(0, 16) || '', meeting_link: s.meeting_link || '',
               video_url: s.video_url || '', duration_minutes: s.duration_minutes || '' })
    setError(''); setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) await api.put(`/api/mentor/sessions/${editing}`, form)
      else         await api.post('/api/mentor/sessions', { ...form, program_id: selectedProgram })
      setShowForm(false); setEditing(null); setForm(emptyForm); setSelectedProgram(''); load()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to save session') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this session?')) return
    await api.delete(`/api/mentor/sessions/${id}`); load()
  }

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.session_type === filter)

  const FILTERS = [
    { key: 'all',      label: `All (${sessions.length})` },
    { key: 'live',     label: '🔴  Live' },
    { key: 'recorded', label: '📹  Recorded' },
  ]

  return (
    <MentorLayout>

      {/* ── Create/Edit accordion ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', marginBottom: 24, overflow: 'hidden' }}>
        <button onClick={() => showForm && !editing ? setShowForm(false) : openCreate()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>+</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{editing ? 'Edit Session' : 'Create New Session'}</span>
          <svg style={{ marginLeft: 'auto', transform: showForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
          </svg>
        </button>

        {showForm && (
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '24px 24px 28px' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>⚠ {error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div>
                  <p style={label}>Session Title *</p>
                  <input style={inp} required placeholder="e.g. Introduction to Scrum"
                    value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                {!editing && (
                  <div>
                    <p style={label}>Program *</p>
                    <select style={inp} required value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
                      <option value="">Select a program</option>
                      {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <p style={label}>Session Type *</p>
                  <select style={inp} value={form.session_type} onChange={e => setForm(f => ({...f, session_type: e.target.value}))}>
                    <option value="live">🔴 Live Session</option>
                    <option value="recorded">📹 Recorded</option>
                  </select>
                </div>
                <div>
                  <p style={label}>Duration (minutes)</p>
                  <input style={inp} type="number" min="1" placeholder="e.g. 60"
                    value={form.duration_minutes} onChange={e => setForm(f => ({...f, duration_minutes: e.target.value}))}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {form.session_type === 'live' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                  <div>
                    <p style={label}>Scheduled At</p>
                    <input style={inp} type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({...f, scheduled_at: e.target.value}))}
                      onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div>
                    <p style={label}>Meeting Link</p>
                    <input style={inp} placeholder="https://meet.google.com/..."
                      value={form.meeting_link} onChange={e => setForm(f => ({...f, meeting_link: e.target.value}))}
                      onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 18 }}>
                  <p style={label}>Video URL</p>
                  <input style={inp} placeholder="https://youtube.com/..."
                    value={form.video_url} onChange={e => setForm(f => ({...f, video_url: e.target.value}))}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <p style={label}>Description</p>
                <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} placeholder="Session agenda or notes..."
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving}
                  style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.4)' }}>
                  {saving ? 'Saving…' : editing ? 'Update Session' : 'Create Session →'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                  style={{ padding: '12px 28px', borderRadius: 10, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#fff' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTERS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{ padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: filter === t.key ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : '#fff',
              color: filter === t.key ? '#fff' : '#64748b',
              boxShadow: filter === t.key ? '0 2px 8px rgba(99,102,241,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
              border: filter === t.key ? 'none' : '1px solid #e2e8f0',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Session cards ── */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>🎬</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No sessions yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px' }}>Click "Create New Session" above to get started</p>
          <button onClick={openCreate}
            style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
            Create First Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(s => {
            const isLive = s.session_type === 'live'
            const isPast = s.scheduled_at && new Date(s.scheduled_at) < new Date()
            return (
              <div key={s.session_id}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: isLive ? '#eff6ff' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {isLive ? '🎥' : '📹'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, flexShrink: 0, background: isLive ? '#dbeafe' : '#ede9fe', color: isLive ? '#1d4ed8' : '#6d28d9' }}>
                      {isLive ? 'Live' : 'Recorded'}
                    </span>
                    {isPast && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 50, background: '#f1f5f9', color: '#94a3b8', flexShrink: 0 }}>Past</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recorded session'}
                    {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {s.meeting_link && (
                    <a href={s.meeting_link} target="_blank" rel="noreferrer"
                      style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#fff', padding: '8px 16px', borderRadius: 8, background: '#4f46e5' }}>
                      Join
                    </a>
                  )}
                  <button onClick={() => openEdit(s)}
                    style={{ fontSize: 12, fontWeight: 600, color: '#64748b', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.session_id)}
                    style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', padding: '8px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </MentorLayout>
  )
}
