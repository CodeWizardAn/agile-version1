import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import api from '../../api/client'

const empty = { title: '', description: '', category: '', duration_weeks: '', start_date: '', end_date: '', assigned_mentor: '' }

const inp  = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl  = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' }

const STATUS = {
  active:   { bg: '#f0fdf4', color: '#15803d' },
  pending:  { bg: '#fffbeb', color: '#92400e' },
  rejected: { bg: '#fef2f2', color: '#dc2626' },
  archived: { bg: '#f8fafc', color: '#64748b' },
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([])
  const [mentors,  setMentors]  = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(empty)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)

  const load = () => Promise.all([
    api.get('/api/admin/programs').then(r => setPrograms(r.data)),
    api.get('/api/admin/mentors').then(r => setMentors(r.data)),
  ])
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setError(''); setShowForm(true) }
  const openEdit   = p => {
    setEditing(p.program_id)
    setForm({ title: p.title, description: p.description || '', category: p.category || '',
               duration_weeks: p.duration_weeks || '', start_date: p.start_date || '',
               end_date: p.end_date || '', assigned_mentor: p.assigned_mentor || '', status: p.status })
    setError(''); setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) await api.put(`/api/admin/programs/${editing}`, form)
      else         await api.post('/api/admin/programs', form)
      setShowForm(false); load()
    } catch (err) { setError(err.response?.data?.detail || 'Error saving program') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this program and all its sessions/enrollments?')) return
    await api.delete(`/api/admin/programs/${id}`); load()
  }

  const f = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#059669' }}>Programs</span>
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Create and manage all mentorship programs on the platform.</p>
        </div>
        <button onClick={openCreate}
          style={{ padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}>
          + New Program
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', padding: '32px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>{editing ? 'Edit Program' : 'New Program'}</h2>
              <button onClick={() => setShowForm(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#64748b' }}>✕</button>
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>⚠ {error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={lbl}>Title *</p>
                  <input style={inp} required value={form.title} onChange={f('title')} placeholder="e.g. Agile Fundamentals"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Category</p>
                  <input style={inp} value={form.category} onChange={f('category')} placeholder="e.g. Scrum, Kanban"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Duration (weeks)</p>
                  <input style={inp} type="number" value={form.duration_weeks} onChange={f('duration_weeks')} placeholder="8"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Start Date</p>
                  <input style={inp} type="date" value={form.start_date} onChange={f('start_date')}
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>End Date</p>
                  <input style={inp} type="date" value={form.end_date} onChange={f('end_date')}
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={lbl}>Description</p>
                  <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={f('description')} placeholder="Program overview…"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={lbl}>Assign Mentor</p>
                  <select style={inp} value={form.assigned_mentor} onChange={f('assigned_mentor')}
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                    <option value="">— None —</option>
                    {mentors.map(m => <option key={m.mentor_profile_id} value={m.mentor_profile_id}>{m.full_name}</option>)}
                  </select>
                </div>
                {editing && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={lbl}>Status</p>
                    <select style={inp} value={form.status} onChange={f('status')}
                      onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                      {['pending','active','rejected','archived'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: saving ? '#6ee7b7' : 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
                  {saving ? 'Saving…' : editing ? 'Update Program' : 'Create Program'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#fff' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Title','Category','Duration','Mentor','Status','Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No programs yet</td></tr>
            ) : programs.map((p, i) => {
              const st = STATUS[p.status] || { bg: '#f8fafc', color: '#64748b' }
              return (
                <tr key={p.program_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{p.title}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{p.category || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{p.duration_weeks ? `${p.duration_weeks}w` : '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{p.mentor_name || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, background: st.bg, color: st.color }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => openEdit(p)} style={{ fontSize: 12, fontWeight: 600, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                      <button onClick={() => handleDelete(p.program_id)} style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
