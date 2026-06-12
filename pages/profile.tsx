import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Camera, User, Shield, Bell, Phone } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading, updateUserProfile, resetPassword } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoURL, setPhotoURL] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [emailNotif, setEmailNotif] = useState(false)
  const [waNotif, setWaNotif] = useState(false)
  const [pushNotif, setPushNotif] = useState(false)
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('')
  const [sendingReset, setSendingReset] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhone(user.phoneNumber || '')
      setBirthDate(user.birthDate || '')
      setBio(user.bio || '')
      setGender(user.gender || '')
      setPhotoURL(user.photoURL || '')
      setEmergencyName(user.emergencyContactName || '')
      setEmergencyRelation(user.emergencyContactRelation || '')
      setTwoFA(user.settings?.twoFA ?? false)
      setEmailNotif(user.settings?.emailNotif ?? false)
      setWaNotif(user.settings?.waNotif ?? false)
      setPushNotif(user.settings?.pushNotif ?? false)
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

  const handleChangePassword = async () => {
    if (!user?.email) {
      showToast('error', 'Email tidak ditemukan')
      return
    }
    setSendingReset(true)
    try {
      if (resetPassword) {
        await resetPassword(user.email)
        showToast('success', 'Tautan reset kata sandi telah dikirim ke email Anda')
      } else {
        showToast('error', 'Layanan autentikasi tidak tersedia')
      }
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        showToast('error', 'Akun tidak ditemukan')
      } else if (err?.code === 'auth/invalid-email') {
        showToast('error', 'Email tidak valid')
      } else if (err?.code === 'auth/too-many-requests') {
        showToast('error', 'Terlalu banyak permintaan. Coba lagi nanti')
      } else {
        showToast('error', err?.message || 'Gagal mengirim email reset')
      }
    } finally {
      setSendingReset(false)
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
        await updateUserProfile({
          displayName: name,
          phoneNumber: phone,
          birthDate,
          bio,
          gender,
          emergencyContactName: emergencyName,
          emergencyContactRelation: emergencyRelation,
          settings: { twoFA, emailNotif, waNotif, pushNotif },
        })
      }
      showToast('success', 'Perubahan berhasil disimpan')
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  if (loading || !user) return null

  const memberYear = user.metadata?.createdAt
    ? new Date(user.metadata.createdAt).getFullYear()
    : '2024'

  return (
    <>
      <Head>
        <title>Profil Saya – PsyOasis</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-[1000px] mx-auto space-y-6 pb-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-[#154a61]">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#154a61]/10 flex items-center justify-center text-[#154a61] text-5xl font-bold bg-[#f2f4f5] hover:opacity-90 transition-opacity disabled:opacity-60"
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
                  disabled={uploading}
                  className="absolute bottom-1 right-1 bg-[#154a61] text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
                >
                  {uploading ? (
                    <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Camera className="w-[18px] h-[18px]" />
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
                <h2 className="text-[32px] font-semibold tracking-[-0.01em] text-[#154a61] font-['Plus Jakarta Sans']">
                  {name || 'Pengguna'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-[18px] h-[18px] text-[#306764]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-sm font-medium text-[#306764] font-['Inter']">Premium Member</span>
                  <span className="text-[#c1c7cd] mx-2">•</span>
                  <span className="text-sm text-[#71787d] font-['Inter']">Member since {memberYear}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center gap-3 mb-8 border-b border-[#c1c7cd]/20 pb-4">
                <User className="w-5 h-5 text-[#154a61]" />
                <h3 className="text-[24px] font-semibold text-[#154a61] font-['Plus Jakarta Sans']">Informasi Pribadi</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Nama Lengkap</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] placeholder-[#71787d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Email</label>
                  <input
                    value={user.email || ''}
                    disabled
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] font-['Inter'] opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Nomor Telepon</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] placeholder-[#71787d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  >
                    <option value="">Pilih</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Tentang Saya</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className="w-full h-28 px-4 py-3 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] placeholder-[#71787d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter'] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Account Security & Notifications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Security */}
              <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-[#c1c7cd]/20 pb-4">
                  <Shield className="w-5 h-5 text-[#154a61]" />
                  <h3 className="text-[24px] font-semibold text-[#154a61] font-['Plus Jakarta Sans']">Keamanan Akun</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#c1c7cd]/30 bg-[#f8fafb]">
                    <div>
                      <p className="text-sm font-medium text-[#191c1d] font-['Inter']">Ubah Kata Sandi</p>
                      <p className="text-[10px] font-medium text-[#71787d] tracking-[0.05em] mt-0.5 font-['Inter']">
                        {user.email ? `Tautan reset akan dikirim ke ${user.email}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={sendingReset}
                      onClick={handleChangePassword}
                      className="text-sm font-medium text-[#154a61] hover:underline disabled:opacity-50 font-['Inter']"
                    >
                      {sendingReset ? 'Mengirim...' : 'Perbarui'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#c1c7cd]/30 bg-[#f8fafb]">
                    <div>
                      <p className="text-sm font-medium text-[#191c1d] font-['Inter']">Autentikasi Dua Faktor</p>
                      <p className="text-[10px] font-medium text-[#71787d] tracking-[0.05em] mt-0.5 font-['Inter']">Lindungi akun Anda dengan 2FA</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFA}
                        onChange={() => setTwoFA(!twoFA)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#c1c7cd] rounded-full peer peer-focus:ring-4 peer-focus:ring-[#154a61]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154a61]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-[#c1c7cd]/20 pb-4">
                  <Bell className="w-5 h-5 text-[#154a61]" />
                  <h3 className="text-[24px] font-semibold text-[#154a61] font-['Plus Jakarta Sans']">Pengaturan Notifikasi</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#71787d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 7l-10 7L2 7" />
                      </svg>
                      <span className="text-sm text-[#191c1d] font-['Inter']">Notifikasi Email</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotif}
                        onChange={() => setEmailNotif(!emailNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#c1c7cd] rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#154a61] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#71787d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      <span className="text-sm text-[#191c1d] font-['Inter']">Pengingat WhatsApp</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waNotif}
                        onChange={() => setWaNotif(!waNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#c1c7cd] rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#154a61] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#71787d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      <span className="text-sm text-[#191c1d] font-['Inter']">Notifikasi Push</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotif}
                        onChange={() => setPushNotif(!pushNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#c1c7cd] rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#154a61] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <p className="text-[10px] font-medium text-[#71787d] tracking-[0.05em] mt-4 pt-4 border-t border-[#c1c7cd]/10 font-['Inter']">
                    Anda akan menerima pengingat sesi, pesan psikolog, dan tips kesehatan harian.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center gap-3 mb-8 border-b border-[#c1c7cd]/20 pb-4">
                <Phone className="w-5 h-5 text-[#ba1a1a]" />
                <h3 className="text-[24px] font-semibold text-[#154a61] font-['Plus Jakarta Sans']">Kontak Darurat</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Nama Kontak</label>
                  <input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nama kontak darurat"
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] placeholder-[#71787d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] block mb-2 font-['Inter']">Hubungan</label>
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c1c7cd]/30 rounded-lg text-sm text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#154a61]/20 focus:border-[#154a61] focus:bg-white transition-all font-['Inter']"
                  >
                    <option value="">Pilih hubungan</option>
                    <option value="spouse">Pasangan</option>
                    <option value="parent">Orang Tua</option>
                    <option value="sibling">Saudara</option>
                    <option value="friend">Teman</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 rounded-lg text-sm font-medium text-[#41484c] hover:bg-[#e6e8e9] transition-colors font-['Inter']"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-12 py-3 rounded-lg text-sm font-medium bg-[#154a61] text-white shadow-lg hover:shadow-[#154a61]/20 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed font-['Inter']"
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
            </div>
          </form>

          {/* Footer */}
          <footer className="w-full py-6 border-t border-[#c1c7cd]/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-white mt-8 rounded-xl px-8">
            <div className="flex flex-col gap-1">
              <p className="text-[24px] font-semibold text-[#154a61] font-['Plus Jakarta Sans']">PsyOasis</p>
              <p className="text-[10px] font-medium text-[#71787d] tracking-[0.05em] font-['Inter']">© 2024 PsyOasis Psychological Services. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a className="text-[12px] font-semibold text-[#71787d] hover:text-[#306764] transition-colors font-['Inter']" href="#">Kebijakan Privasi</a>
              <a className="text-[12px] font-semibold text-[#71787d] hover:text-[#306764] transition-colors font-['Inter']" href="#">Ketentuan Layanan</a>
              <a className="text-[12px] font-semibold text-[#71787d] hover:text-[#306764] transition-colors font-['Inter']" href="#">Hubungi Kami</a>
            </div>
          </footer>
        </div>
      </DashboardLayout>
    </>
  )
}
