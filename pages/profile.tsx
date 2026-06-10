import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, loading, updateUserProfile } = useAuth() as any;
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhone(user.phoneNumber || '')
      setBio((user as any).bio || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (updateUserProfile) {
          await updateUserProfile({ displayName: name, phoneNumber: phone, bio })
        }
      setMessage('Perubahan disimpan')
    } catch (err: any) {
      setMessage(err?.message || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Profil Saya – PsyOasis</title>
      </Head>

      <div className="min-h-screen bg-[#F7F9F6] flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Topbar />
          <main className="mt-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-[#2D3732]">Profil Saya</h1>
            <p className="text-sm text-[#2D3732]/60 mt-1">Perbarui data profil Anda agar sesi konsultasi berjalan lancar.</p>

            {message && <div className="mt-4 text-sm text-[#2D3732]">{message}</div>}

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-[#2D3732] font-medium">Nama Lengkap</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="w-full mt-2 psy-input" />
              </div>

              <div>
                <label className="text-sm text-[#2D3732] font-medium">Nomor Telepon</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxx" className="w-full mt-2 psy-input" />
              </div>

              <div>
                <label className="text-sm text-[#2D3732] font-medium">Tentang Saya</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Deskripsikan diri singkat" className="w-full mt-2 h-28 psy-textarea" />
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-[#4A7A96] text-white">Simpan</button>
                <button type="button" onClick={() => { setName(user.displayName || ''); setPhone(user.phoneNumber || ''); setBio((user as any).bio || '') }} className="px-4 py-2 rounded-xl border">Reset</button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  )
}
