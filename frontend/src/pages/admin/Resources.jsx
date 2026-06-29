import { useEffect, useState, useRef } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import api from '../../api/client'
import { toast } from '../../utils/toast'

const FILE_ICONS  = { pdf: '📄', image: '🖼️', video: '🎬', doc: '📝', ppt: '📊', excel: '📊', txt: '📃' }
const FILE_COLORS = { pdf: '#fef2f2', image: '#f0fdf4', video: '#eff6ff', doc: '#fafafa', ppt: '#fff7ed' }

const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' }

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [programs,  setPrograms]  = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ title: '', description: '', program_id: '', session_id: '' })
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef()

  const load = () => Promise.all([
    api.get('/api/admin/resources').then(r => setResources(r.data)),
    api.get('/api/admin/programs').then(r => setPrograms(r.data)),
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
    fd.append('session_id', form.session_id)
    fd.append('file', file)
    try {
      await api.post('/api/admin/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false); setForm({ title: '', description: '', program_id: '', session_id: '' }); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err) { setError(err.response?.data?.detail || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this resource?')) return
    try {
      await api.delete(`/api/admin/resources/${id}`)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete resource')
    }
  }

  const f = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#059669' }}>Resources</span>
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Upload and manage study materials available to all mentees.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError('') }}
          style={{ padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}>
          + Upload Resource
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', padding: '32px', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Upload Resource</h2>
              <button onClick={() => setShowForm(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>✕</button>
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>⚠ {error}</p>
              </div>
            )}
            <form onSubmit={handleUpload}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <p style={lbl}>Title *</p>
                  <input style={inp} required value={form.title} onChange={f('title')} placeholder="Resource title"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Description</p>
                  <input style={inp} value={form.description} onChange={f('description')} placeholder="Brief description"
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <p style={lbl}>Program (optional)</p>
                  <select style={inp} value={form.program_id} onChange={f('program_id')}
                    onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                    <option value="">— Global (all programs) —</option>
                    {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <p style={lbl}>File *</p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: '2px dashed #e2e8f0', background: '#fafafa', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.background = '#f0fdf4' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📎</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: file ? '#059669' : '#475569', margin: '0 0 2px' }}>{file ? file.name : 'Click to choose file'}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>PDF, PPT, DOC, Image, or Video</p>
                    </div>
                    <input ref={fileRef} type="file" style={{ display: 'none' }} required onChange={e => setFile(e.target.files[0])} />
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <button type="submit" disabled={uploading}
                    style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: uploading ? '#6ee7b7' : 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
                    {uploading ? 'Uploading…' : 'Upload Resource →'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#fff' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource grid */}
      {resources.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>📂</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No resources yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Upload study materials for mentees using the button above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {resources.map(r => (
            <div key={r.resource_id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: FILE_COLORS[r.file_type] || '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {FILE_ICONS[r.file_type] || '📁'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{(r.file_type || 'file').toUpperCase()} · {r.scope || 'Global'}</p>
                </div>
              </div>
              {r.description && <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{r.description}</p>}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #f8fafc' }}>
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noreferrer"
                    style={{ textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#059669' }}>
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
    </AdminLayout>
  )
}
