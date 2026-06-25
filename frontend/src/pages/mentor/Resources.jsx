import { useEffect, useState, useRef } from 'react'
import MentorLayout from '../../components/layouts/MentorLayout'
import api from '../../api/client'

const FILTERS = [
  { key: 'all',   label: 'All',   emoji: '' },
  { key: 'pdf',   label: 'PDF',   emoji: '📄' },
  { key: 'ppt',   label: 'PPT',   emoji: '📊' },
  { key: 'doc',   label: 'DOC',   emoji: '📝' },
  { key: 'image', label: 'Image', emoji: '🖼️' },
  { key: 'video', label: 'Video', emoji: '🎬' },
]

const FILE_ICONS = { pdf: '📄', image: '🖼️', video: '🎬', doc: '📝', ppt: '📊', excel: '📊', txt: '📃' }
const FILE_COLORS = { pdf: '#fef2f2', image: '#f0fdf4', video: '#eff6ff', doc: '#fafafa', ppt: '#fff7ed' }

const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' }

export default function MentorResources() {
  const [resources, setResources] = useState([])
  const [programs, setPrograms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', program_id: '' })
  const [file, setFile] = useState(null)
  const [filter, setFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const load = () => Promise.all([
    api.get('/api/mentor/resources').then(r => setResources(r.data)),
    api.get('/api/mentor/programs').then(r => setPrograms(r.data)),
  ])
  useEffect(() => { load() }, [])

  const handleUpload = async e => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setError(''); setUploading(true)
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('program_id', form.program_id)
    fd.append('file', file)
    try {
      await api.post('/api/mentor/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false); setForm({ title: '', description: '', program_id: '' }); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this resource?')) return
    await api.delete(`/api/mentor/resources/${id}`); load()
  }

  const countOf = key => key === 'all' ? resources.length : resources.filter(r => r.file_type === key).length
  const filtered = filter === 'all' ? resources : resources.filter(r => r.file_type === filter)

  return (
    <MentorLayout>

      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          My <span style={{ color: '#4f46e5' }}>Resources</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Upload notes, slides, PDFs and videos for your programs and sessions.</p>
      </div>

      {/* Upload accordion */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', marginBottom: 24, overflow: 'hidden' }}>
        <button onClick={() => { setShowForm(v => !v); setError('') }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📁</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Upload New Resource</span>
          <svg style={{ marginLeft: 'auto', transform: showForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
          </svg>
        </button>

        {showForm && (
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '24px 24px 28px' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>⚠ {error}</p>
              </div>
            )}
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div>
                  <p style={lbl}>Title *</p>
                  <input style={inp} required placeholder="e.g. Sprint Planning Guide"
                    value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Program (optional)</p>
                  <select style={inp} value={form.program_id} onChange={e => setForm(f => ({...f, program_id: e.target.value}))}>
                    <option value="">— General / All Programs —</option>
                    {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <p style={lbl}>Description</p>
                <input style={inp} placeholder="Brief description of this resource"
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: '2px dashed #e2e8f0', background: '#fafafa', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#f5f3ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📎</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: file ? '#4f46e5' : '#475569', margin: '0 0 2px' }}>
                      {file ? file.name : 'Click to choose file'}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>PDF, PPT, DOC, Image, or Video</p>
                  </div>
                  <input ref={fileRef} type="file" style={{ display: 'none' }} required onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={uploading}
                  style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: uploading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: uploading ? 'none' : '0 4px 14px rgba(99,102,241,0.4)' }}>
                  {uploading ? 'Uploading…' : 'Upload Resource →'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 28px', borderRadius: 10, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#fff' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map(t => {
          const count = countOf(t.key)
          const active = filter === t.key
          return (
            <button key={t.key} onClick={() => setFilter(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: active ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : '#fff',
                color: active ? '#fff' : '#64748b',
                boxShadow: active ? '0 2px 8px rgba(99,102,241,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                border: active ? 'none' : '1px solid #e2e8f0',
              }}>
              {t.emoji && <span>{t.emoji}</span>}
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Resource grid */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>📂</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No resources yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Upload your first resource using the form above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {filtered.map(r => (
            <div key={r.resource_id}
              style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: FILE_COLORS[r.file_type] || '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {FILE_ICONS[r.file_type] || '📁'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{(r.file_type || 'file').toUpperCase()} · {r.scope || 'General'}</p>
                </div>
              </div>
              {r.description && <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{r.description}</p>}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #f8fafc' }}>
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noreferrer"
                    style={{ textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#4f46e5' }}>
                    View / Download
                  </a>
                )}
                <button onClick={() => handleDelete(r.resource_id)}
                  style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  )
}
