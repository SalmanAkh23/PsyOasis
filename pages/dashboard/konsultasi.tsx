import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getUserBookings, cancelBooking } from '../../lib/db'
import { useToast } from '../../components/ui/Toast'
import {
  VideoCameraIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

const statusStyles: Record<string, { label: string, classes: string }> = {
  dikonfirmasi: { label: 'Dikonfirmasi', classes: 'bg-emerald-50 text-emerald-600' },
  pending: { label: 'Menunggu', classes: 'bg-amber-50 text-amber-600' },
  selesai: { label: 'Selesai', classes: 'bg-slate-50 text-slate-500' },
}

export default function KonsultasiPage() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    getUserBookings(user.uid)
      .then(b => setBookings(b.filter((bb: any) => bb.status !== 'selesai')))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  useEffect(() => {
    const q = router.query.q as string;
    if (q) setSearch(q);
  }, [router.query.q]);

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      showToast('success', 'Konsultasi berhasil dibatalkan');
    } catch {
      showToast('error', 'Gagal membatalkan konsultasi');
    }
  };

  if (loading || !user) return null;

  const filtered = search
    ? bookings.filter((b: any) =>
        b.psychologistName?.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  return (
    <>
      <Head><title>Konsultasi â€“ PsyOasis</title></Head>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Konsultasi Saya</h1>
            <p className="text-xs text-[#434652] mt-0.5 font-['Inter']">Kelola jadwal konsultasi Anda</p>
          </div>
          <button onClick={() => router.push('/booking')} className="px-4 py-2.5 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all shadow-sm font-['Inter']">
            + Booking Baru
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747783]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari konsultasi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#c4c6d4] text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:border-[#002768]/40 focus:ring-2 focus:ring-[#002768]/10 transition-all font-['Inter']"
            />
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#434652]">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-[#434652] gap-2">
            <span>{search ? 'Tidak ditemukan' : 'Belum ada konsultasi'}</span>
            {!search && (
              <button onClick={() => router.push('/booking')} className="mt-1 px-4 py-2 bg-[#002768] text-white rounded-full text-xs font-semibold">
                Booking Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b: any) => {
              const status = statusStyles[b.status] || statusStyles.pending;
              return (
                <div
                  key={b.id}
                  className="rounded-2xl bg-white p-5 border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all cursor-pointer"
                  onClick={() => b.psychologistId && router.push(`/dashboard/psikolog/${b.psychologistId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002768] to-[#315ab4] flex items-center justify-center text-xl text-white font-bold shadow-sm">
                        {b.psychologistName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">{b.psychologistName}</h3>
                        <p className="text-xs text-[#002768] font-medium font-['Inter']">{b.serviceName}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#434652] font-['Inter']">
                          <span>{b.date}</span>
                          <span>â€¢</span>
                          <span>{b.time} WIB</span>
                          <span>â€¢</span>
                          <span className="flex items-center gap-1">
                            <VideoCameraIcon className="w-3 h-3" />
                            {b.mode || 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold font-['Inter'] ${status.classes}`}>{status.label}</span>
                      {b.status === 'dikonfirmasi' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/konsultasi/sesi/${b.id}`); }}
                          className="px-4 py-1.5 rounded-full text-[10px] font-semibold font-['Inter'] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          Mulai
                        </button>
                      )}
                      {(b.status === 'pending') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}
                          className="px-3 py-1 rounded-full text-[10px] font-semibold font-['Inter'] bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
