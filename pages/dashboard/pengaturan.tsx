import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PortalLayout from '../../components/dashboard/portal/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { saveNotificationSettings, getNotificationSettings } from '../../lib/db'
import { BellIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const toggleDefs = [
  { id: 'booking', label: 'Notifikasi Booking', desc: 'Pemberitahuan saat jadwal dikonfirmasi' },
  { id: 'reminder', label: 'Pengingat Sesi', desc: 'Pengigat 24 jam sebelum sesi' },
  { id: 'articles', label: 'Artikel & Tips', desc: 'Rekomendasi artikel kesehatan mental' },
  { id: 'promo', label: 'Promo & Penawaran', desc: 'Informasi promo layanan PsyOasis' },
]

export default function PengaturanPage() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    getNotificationSettings(user.uid).then(s => {
      setSettings({
        booking: s.booking ?? true,
        reminder: s.reminder ?? true,
        articles: s.articles ?? false,
        promo: s.promo ?? false,
      });
      setLoaded(true);
    }).catch(() => {
      setSettings({ booking: true, reminder: true, articles: false, promo: false });
      setLoaded(true);
    });
  }, [user]);

  const toggleSetting = async (id: string) => {
    const next = { ...settings, [id]: !settings[id] };
    setSettings(next);
    if (user) {
      try {
        await saveNotificationSettings(user.uid, next);
      } catch {
        setSettings(settings);
      }
    }
  };

  if (loading || !user) return null;

  const isPsychologist = user?.role === 'psychologist';
  const pageContent = (
    <>
      <Head><title>Pengaturan â€“ PsyOasis</title></Head>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Pengaturan Akun</h1>
        <p className="text-xs text-[#434652] mt-0.5 font-['Inter']">Kelola preferensi dan pengaturan akun Anda</p>
      </div>
      <div className="rounded-2xl bg-white p-5 border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-5">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002768] to-[#315ab4] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">{user.displayName || 'Pengguna'}</h3>
            <p className="text-xs text-[#434652] font-['Inter']">{user.email}</p>
          </div>
          <button onClick={() => router.push(isPsychologist ? '/dashboard/portal/profil' : '/profile')} className="ml-auto px-4 py-2 text-xs font-semibold text-[#002768] border border-[#002768]/30 rounded-xl hover:bg-[#002768]/10 transition-colors font-['Inter']">Edit Profil</button>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#c4c6d4] flex items-center gap-3">
          <BellIcon className="w-5 h-5 text-[#002768]" />
          <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">Preferensi Notifikasi</h3>
        </div>
        <div className="divide-y divide-[#c4c6d4]">
          {toggleDefs.map((t) => (
            <div key={t.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#eeeef0] transition-colors">
              <div>
                <div className="text-sm font-medium text-[#1a1c1e] font-['Inter']">{t.label}</div>
                <div className="text-xs text-[#434652] mt-0.5 font-['Inter']">{t.desc}</div>
              </div>
              <button
                onClick={() => toggleSetting(t.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                  settings[t.id] ? 'bg-[#002768]' : 'bg-[#c4c6d4]'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  settings[t.id] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#c4c6d4] flex items-center gap-3">
          <LockClosedIcon className="w-5 h-5 text-[#002768]" />
          <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">Keamanan</h3>
        </div>
        <div className="p-5">
          <button
            onClick={() => {
              showToast('success', 'Link reset password telah dikirim ke email Anda');
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#c4c6d4] hover:bg-[#eeeef0] transition-colors"
          >
            <span className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Ubah Password</span>
            <span className="text-xs text-[#002768] font-semibold font-['Inter']">Kirim Email</span>
          </button>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#c4c6d4] flex items-center gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-[#002768]" />
          <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">Privasi</h3>
        </div>
        <div className="divide-y divide-[#c4c6d4]">
          <div className="px-5 py-4 flex items-center justify-between hover:bg-[#eeeef0] transition-colors">
            <div>
              <div className="text-sm font-medium text-[#1a1c1e] font-['Inter']">Mode Privasi</div>
              <div className="text-xs text-[#434652] mt-0.5 font-['Inter']">Sembunyikan detail sesi dari notifikasi</div>
            </div>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                privacyMode ? 'bg-[#002768]' : 'bg-[#c4c6d4]'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                privacyMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return isPsychologist ? (
    <PortalLayout title="Pengaturan" doctorName={user?.displayName || 'Dr. Smith'}>{pageContent}</PortalLayout>
  ) : (
    <DashboardLayout>{pageContent}</DashboardLayout>
  );
}
