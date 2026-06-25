import { useEffect, useState, useRef } from 'react'
import MentorLayout from '../../components/layouts/MentorLayout'
import api from '../../api/client'

const inp = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }

export default function MentorCertificates() {
  const [certs, setCerts] = useState([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  const load = () => api.get('/api/mentor/certificates').then(r => setCerts(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handleUpload = async e => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setError(''); setSuccess(''); setUploading(true)
    const fd = new FormData()
    fd.append('title', title)
    fd.append('file', file)
    try {
      await api.post('/api/mentor/certificates', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess('Certificate uploaded successfully!'); setTitle(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this certificate?')) return
    await api.delete(`/api/mentor/certificates/${id}`).catch(() => {})
    load()
  }

  return (
    <MentorLayout>

      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          My <span style={{ color: '#4f46e5' }}>Certificates</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Upload and manage your professional certifications.</p>
      </div>

      {/* Upload card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', padding: '28px', marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>Upload New Certificate</h2>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>⚠ {error}</p>
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ color: '#15803d', fontSize: 13, fontWeight: 600, margin: 0 }}>✓ {success}</p>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: 16 }}>
            <input style={inp} type="text" required placeholder="Certificate Title (e.g. Certified Scrum Master)"
              value={title} onChange={e => setTitle(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: '2px dashed #e2e8f0', background: '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#f5f3ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                📎
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: file ? '#4f46e5' : '#475569', margin: '0 0 2px' }}>
                  {file ? file.name : 'Click to choose file'}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>PDF, PNG, or JPG supported</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          <button type="submit" disabled={uploading}
            style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: uploading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: uploading ? 'none' : '0 4px 14px rgba(99,102,241,0.4)' }}>
            {uploading ? 'Uploading…' : 'Upload Certificate'}
          </button>
        </form>
      </div>

      {/* Certificates list */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', padding: '28px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>My Uploaded Certificates</h2>

        {certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>🎖️</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No certificates uploaded yet.</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Upload your professional certifications above to showcase them on your profile.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {certs.map(c => (
              <div key={c.cert_id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 12, border: '1px solid #f1f5f9', background: '#fafafa' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {c.file_type === 'pdf' ? '📄' : '🖼️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                    Uploaded {new Date(c.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {c.file_url && (
                    <a href={c.file_url} target="_blank" rel="noreferrer"
                      style={{ textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#4f46e5', padding: '7px 14px', borderRadius: 8, border: '1px solid #c4b5fd', background: '#fff' }}>
                      View
                    </a>
                  )}
                  <button onClick={() => handleDelete(c.cert_id)}
                    style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', padding: '7px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  )
}
