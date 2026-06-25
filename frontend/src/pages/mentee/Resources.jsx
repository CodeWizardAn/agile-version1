import { useEffect, useState } from 'react'
import MenteeLayout from '../../components/layouts/MenteeLayout'
import api from '../../api/client'

const FILE_ICONS  = { pdf: '📄', image: '🖼️', video: '🎬', doc: '📝', ppt: '📊', excel: '📊', txt: '📃' }
const FILE_COLORS = { pdf: '#fef2f2', image: '#f0fdf4', video: '#eff6ff', doc: '#fafafa', ppt: '#fff7ed' }

const SCOPE_FILTERS = [
  { key: '',         label: 'All' },
  { key: 'global',   label: '🌐 Global' },
  { key: 'program',  label: '📋 Program' },
]

export default function MenteeResources() {
  const [resources, setResources] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => { api.get('/api/mentee/resources').then(r => setResources(r.data)) }, [])

  const filtered = filter
    ? resources.filter(r => (r.scope || '').toLowerCase() === filter)
    : resources

  const countOf = key => key === '' ? resources.length : resources.filter(r => (r.scope || '') === key).length

  return (
    <MenteeLayout>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Study <span style={{ color: '#7c3aed' }}>Resources</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Notes, slides, PDFs, and videos shared by your mentors.</p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SCOPE_FILTERS.map(f => {
          const count = countOf(f.key)
          const active = filter === f.key
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: active ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#fff',
                color:      active ? '#fff' : '#64748b',
                boxShadow:  active ? '0 2px 8px rgba(124,58,237,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                border:     active ? 'none' : '1px solid #e2e8f0',
              }}>
              {f.label}
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
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Your mentors will upload materials here once you enroll.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {filtered.map(r => (
            <a key={r.resource_id} href={r.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: FILE_COLORS[r.file_type] || '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {FILE_ICONS[r.file_type] || '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                      {(r.file_type || 'file').toUpperCase()} · {r.scope || 'General'}
                    </p>
                  </div>
                </div>
                {r.description && (
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6, borderTop: '1px solid #f8fafc', fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"/>
                  </svg>
                  View / Download
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </MenteeLayout>
  )
}
