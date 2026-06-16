import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import PortalLayout from '../components/dashboard/portal/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { getUserBookings } from '../lib/db'
import { Camera, Shield } from 'lucide-react'

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
  const [sendingReset, setSendingReset] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhone(user.phoneNumber || '')
      setBirthDate(user.birthDate || '')
      setBio(user.bio || '')
      setGender(user.gender || '')
      setPhotoURL(user.photoURL || '')
      setTwoFA(user.settings?.twoFA ?? false)
      setEmailNotif(user.settings?.emailNotif ?? false)
      setWaNotif(user.settings?.waNotif ?? false)
      setPushNotif(user.settings?.pushNotif ?? false)
      getUserBookings(user.uid).then(b => setSessionCount(b.filter((x: any) => x.status === 'selesai').length)).catch(() => {})
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

  const memberSince = user.metadata?.createdAt
    ? new Date(user.metadata.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const isPsychologist = user?.role === 'psychologist';

  const pageContent = (
    <>
      {/* Page header */}
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-[24px] font-semibold text-[#002768] font-['Plus Jakarta Sans']">Profil Saya</h2>
          <span className="text-sm text-[#41484c] font-['Inter']">Atur informasi pribadi dan keamanan akun</span>
        </div>

        {/* Profile Header */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden mb-6">

          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center text-[#002768] text-5xl font-bold bg-[#f2f4f5] hover:opacity-90 transition-opacity disabled:opacity-60"
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
              className="absolute bottom-0 right-0 bg-[#002768] text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
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
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-[32px] font-bold tracking-[-0.02em] text-[#1a1c1e] font-['Plus Jakarta Sans']">
              {name || 'Pengguna'}
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[#41484c] font-['Inter']">
              <span className="flex items-center gap-1.5">
                <svg className="w-[18px] h-[18px] text-[#747783]" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                </svg>
                {memberSince ? `Member sejak ${memberSince}` : 'Member'}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-[18px] h-[18px] text-[#747783]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {sessionCount > 0 ? `${sessionCount} sesi selesai` : 'Belum ada sesi'}
              </span>
              <button
                type="button"
                onClick={() => router.push('/dashboard/riwayat')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7afc9a]/50 text-[#006d31] hover:bg-[#7afc9a] transition-colors text-sm font-medium"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Riwayat
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 border-l-4 border-[#002768]">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-[#002768]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h4 className="text-[24px] font-semibold text-[#1a1c1e] font-['Plus Jakarta Sans']">Informasi Pribadi</h4>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Nama Lengkap</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#002768]/20 focus:border-[#002768] transition-all font-['Inter']"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Email</label>
                    <input
                      value={user.email || ''}
                      disabled
                      className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] font-['Inter'] opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Nomor Telepon</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#002768]/20 focus:border-[#002768] transition-all font-['Inter']"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#002768]/20 focus:border-[#002768] transition-all font-['Inter']"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-[48px] px-4 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#002768]/20 focus:border-[#002768] transition-all font-['Inter']"
                    >
                      <option value="">Pilih</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#41484c] px-1 mb-1.5 block font-['Inter']">Tentang Saya</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tuliskan sedikit tentang diri Anda..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#f2f4f5] border border-[#c4c6d4]/30 rounded-xl text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#002768]/20 focus:border-[#002768] transition-all font-['Inter'] resize-none"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 rounded-xl text-sm font-medium bg-[#002768] text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-['Inter']"
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
            </section>

            {/* Account Security */}
            <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-[#002768]" />
                <h4 className="text-[24px] font-semibold text-[#1a1c1e] font-['Plus Jakarta Sans']">Keamanan Akun</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#f2f4f5] rounded-xl border border-[#c4c6d4]/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#002768]/10 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-[#002768]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Kata Sandi</p>
                      <p className="text-[10px] font-medium text-[#747783] tracking-[0.05em] font-['Inter']">Terakhir masuk {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={sendingReset}
                    onClick={handleChangePassword}
                    className="text-sm font-medium text-[#002768] px-4 py-2 hover:bg-[#002768]/5 rounded-lg transition-colors disabled:opacity-50 font-['Inter']"
                  >
                    {sendingReset ? 'Mengirim...' : 'Ubah'}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#f2f4f5] rounded-xl border border-[#c4c6d4]/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#002768]/10 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-[#002768]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                        <circle cx="12" cy="16" r="1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Otentikasi Dua Faktor (2FA)</p>
                      <p className="text-[10px] font-medium text-[#ba1a1a] tracking-[0.05em] font-['Inter]">
                        {twoFA ? 'Aktif' : 'Belum Aktif - Sangat Direkomendasikan'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFA(!twoFA)}
                    className={`text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all font-['Inter'] ${
                      twoFA
                        ? 'bg-[#c4c6d4] text-[#41484c] hover:bg-[#b2b8be]'
                        : 'bg-[#002768] text-white hover:opacity-90'
                    }`}
                  >
                    {twoFA ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Settings & Support */}
          <div className="space-y-6">
            {/* Notification Settings */}
            <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-[#002768]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <h4 className="text-[24px] font-semibold text-[#1a1c1e] font-['Plus Jakarta Sans']">Notifikasi</h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Email</p>
                    <p className="text-[10px] font-medium text-[#747783] tracking-[0.05em] font-['Inter']">Laporan mingguan &amp; update</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={() => setEmailNotif(!emailNotif)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c4c6d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002768]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1a1c1e] font-['Inter']">WhatsApp</p>
                    <p className="text-[10px] font-medium text-[#747783] tracking-[0.05em] font-['Inter']">Pengingat jadwal sesi</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waNotif}
                      onChange={() => setWaNotif(!waNotif)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c4c6d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002768]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Push Notification</p>
                    <p className="text-[10px] font-medium text-[#747783] tracking-[0.05em] font-['Inter']">Pesan langsung dari pakar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushNotif}
                      onChange={() => setPushNotif(!pushNotif)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c4c6d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002768]"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Support Section */}
            <section className="bg-[#003b95] p-6 rounded-xl text-[#8cabff] relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <h5 className="text-[24px] font-semibold text-white font-['Plus Jakarta Sans']">Butuh Bantuan?</h5>
                <p className="text-sm opacity-80 font-['Inter']">Tim dukungan pelanggan kami tersedia 24/7 untuk membantu Anda.</p>
                <a
                  href="mailto:support@psyoaas.com"
                  className="block w-full bg-white text-[#002768] px-6 py-2.5 rounded-xl text-sm font-medium text-center shadow-sm hover:bg-[#f2f4f5] transition-colors font-['Inter']"
                >
                  Hubungi Kami
                </a>
              </div>
            </section>

            {/* Danger Zone */}
            <div className="p-6 border-t border-[#c4c6d4]/30">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
                    showToast('success', 'Silakan hubungi support@psyoaas.com untuk menghapus akun')
                  }
                }}
                className="w-full text-[#ba1a1a] border border-[#ba1a1a]/30 py-3 rounded-xl text-sm font-medium hover:bg-[#ba1a1a]/5 transition-colors font-['Inter']"
              >
                Hapus Akun Permanen
              </button>
            </div>
          </div>
        </div>
    </>
  );

  return (
    <>
      <Head>
        <title>Profil Saya – PsyOasis</title>
      </Head>

      {isPsychologist ? (
        <PortalLayout title="Profil Saya" doctorName={user?.displayName || 'Dr. Smith'}>
          {pageContent}
        </PortalLayout>
      ) : (
        <DashboardLayout>{pageContent}</DashboardLayout>
      )}
    </>
  )
}
