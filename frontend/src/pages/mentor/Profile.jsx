import { useEffect, useState, useRef } from 'react'
import MentorLayout from '../../components/layouts/MentorLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'

export default function MentorProfile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ bio: '', expertise: '', linkedin_url: '', github_url: '', website_url: '', years_of_experience: '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/api/mentor/profile').then(r => {
      const p = r.data
      setForm({
        bio: p.bio || '', expertise: p.expertise || '',
        linkedin_url: p.linkedin_url || '', github_url: p.github_url || '',
        website_url: p.website_url || '', years_of_experience: p.years_of_experience || '',
      })
    })
  }, [])

  const handleSave = async e => {
    e.preventDefault(); setError(''); setSaved(false)
    try {
      await api.put('/api/mentor/profile', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err.response?.data?.detail || 'Save failed') }
  }

  const handlePhoto = async e => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await api.post('/api/mentor/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser(u => ({ ...u, profile_photo: res.data.profile_photo }))
    } finally { setPhotoUploading(false) }
  }

  return (
    <MentorLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="relative">
            {user?.profile_photo
              ? <img src={user.profile_photo} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              : <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-3xl font-bold">
                  {user?.full_name?.[0]}
                </div>
            }
            <button onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 bg-teal-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-teal-700 transition">
              ✎
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          {photoUploading && <p className="text-xs text-gray-400">Uploading…</p>}
          <div className="text-center">
            <p className="font-semibold text-gray-800">{user?.full_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          {error && <p className="bg-red-50 text-red-600 text-sm rounded p-2 mb-4">{error}</p>}
          {saved && <p className="bg-green-50 text-green-600 text-sm rounded p-2 mb-4">Profile saved!</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Tell mentees about yourself..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Expertise</label>
              <input value={form.expertise} onChange={e => setForm(f => ({...f, expertise: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="e.g. React, Agile, Product Management" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Years of Experience</label>
              <input type="number" value={form.years_of_experience} onChange={e => setForm(f => ({...f, years_of_experience: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            {[['linkedin_url','LinkedIn URL'], ['github_url','GitHub URL'], ['website_url','Website']].map(([k, l]) => (
              <div key={k}>
                <label className="text-sm font-medium text-gray-700">{l}</label>
                <input type="url" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="https://..." />
              </div>
            ))}
            <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-700 transition">Save Profile</button>
          </form>
        </div>
      </div>
    </MentorLayout>
  )
}
