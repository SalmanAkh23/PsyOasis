import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Camera } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading, updateUserProfile } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoURL, setPhotoURL] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhone(user.phoneNumber || '')
      setBirthDate(user.birthDate || '')
      setBio(user.bio || '')
      setPhotoURL(user.photoURL || '')
    }
  }, [user])

  const compressImage = (dataUrl: string, maxW = 300, maxH = 300, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        if (h > maxH) { w = w * maxH / h; h = maxH; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context not available')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar'));
      img.src = dataUrl;
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'File harus berupa gambar')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran maksimal 2MB')
      return
    }
    setUploading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(dataUrl);
      setPhotoURL(compressed);
      if (updateUserProfile) {
        await updateUserProfile({ photoURL: compressed });
      }
      showToast('success', 'Foto profil berhasil diubah')
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal upload foto')
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('error', 'Nama lengkap tidak boleh kosong')
      return
    }
    setSaving(true)
    try {
      if (updateUserProfile) {
        await updateUserProfile({ displayName: name, phoneNumber: phone, birthDate, bio })
      }
      showToast('success', 'Perubahan berhasil disimpan')
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Profil Saya – PsyOasis</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-3xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-[18px] overflow-hidden bg-gradient-to-br from-[#2D5D7B] to-[#4A7A96] flex items-center justify-center text-white text-3xl font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {photoURL ? (
                  <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'
                )}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F1F5F9] transition-colors"
              >
                {uploading ? (
                  <svg className="animate-spin w-4 h-4 text-[#2D5D7B]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Camera className="w-4 h-4 text-[#64748B]" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E293B] font-['Poppins']">Profil Saya</h1>
              <p className="text-sm text-[#64748B] mt-0.5 font-['Inter']">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <h2 className="text-sm font-bold text-[#1E293B] mb-5 font-['Poppins']">Informasi Dasar</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#1E293B] font-medium font-['Inter']">Nama Lengkap</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full mt-2 h-[48px] px-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#BFE7E7] focus:border-[#2D5D7B] focus:bg-white transition-all font-['Inter']"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#1E293B] font-medium font-['Inter']">Nomor Telepon</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full mt-2 h-[48px] px-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#BFE7E7] focus:border-[#2D5D7B] focus:bg-white transition-all font-['Inter']"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#1E293B] font-medium font-['Inter']">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full mt-2 h-[48px] px-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#BFE7E7] focus:border-[#2D5D7B] focus:bg-white transition-all font-['Inter']"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#1E293B] font-medium font-['Inter']">Tentang Saya</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className="w-full mt-2 h-28 px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#BFE7E7] focus:border-[#2D5D7B] focus:bg-white transition-all font-['Inter'] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#2D5D7B] text-white rounded-[12px] text-sm font-semibold hover:bg-[#244A63] transition-all shadow-sm font-['Inter'] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#64748B] rounded-[12px] text-sm font-medium hover:bg-[#F1F5F9] transition-all font-['Inter']"
              >
                Kembali
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </>
  )
}