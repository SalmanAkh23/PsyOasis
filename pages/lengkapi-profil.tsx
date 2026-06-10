import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function LengkapiProfil() {
  const router = useRouter()
  const { user, loading, updateUserProfile } = useAuth() as any
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birth, setBirth] = useState('')
  const [gender, setGender] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhone(user.phoneNumber || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (updateUserProfile) await updateUserProfile({ displayName: name, phoneNumber: phone })
      router.push('/dashboard')
    } catch (err) {
      // ignore for now
    }
    setSaving(false)
  }

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Lengkapi Profil – PsyOasis</title>
      </Head>

      <div className="min-h-screen bg-[#F7F9F6] flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white/80 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-[#2D3732]">Lengkapi Profil Anda</h1>
          <p className="text-sm text-[#2D3732]/60 mt-1">Agar kami dapat menyediakan layanan yang tepat, lengkapi beberapa data berikut.</p>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-[#2D3732] font-medium">Nama Lengkap</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="w-full mt-2 psy-input" />
            </div>

            <div>
              <label className="text-sm text-[#2D3732] font-medium">Nomor Telepon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxx" className="w-full mt-2 psy-input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[#2D3732] font-medium">Tanggal Lahir</label>
                <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="w-full mt-2 psy-input" />
              </div>
              <div>
                <label className="text-sm text-[#2D3732] font-medium">Jenis Kelamin</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full mt-2 psy-input">
                  <option value="">Pilih</option>
                  <option value="female">Perempuan</option>
                  <option value="male">Laki-laki</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-[#4A7A96] text-white">Simpan</button>
              <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-xl border">Lewati</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
