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
      <Head><title>Konsultasi – PsyOasis</title></Head>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] font-['Poppins']">Konsultasi Saya</h1>
            <p className="text-xs text-[#64748B] mt-0.5 font-['Inter']">Kelola jadwal konsultasi Anda</p>
          </div>
          <button onClick={() => router.push('/booking')} className="px-4 py-2.5 bg-[#2D5D7B] text-white rounded-xl text-sm font-semibold hover:bg-[#244A63] transition-all shadow-sm font-['Inter']">
            + Booking Baru
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari konsultasi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2D5D7B]/40 focus:ring-2 focus:ring-[#2D5D7B]/10 transition-all font-['Inter']"
            />
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#64748B]">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-[#64748B] gap-2">
            <span>{search ? 'Tidak ditemukan' : 'Belum ada konsultasi'}</span>
            {!search && (
              <button onClick={() => router.push('/booking')} className="mt-1 px-4 py-2 bg-[#2D5D7B] text-white rounded-full text-xs font-semibold">
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
                  className="rounded-2xl bg-white p-5 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all cursor-pointer"
                  onClick={() => b.psychologistId && router.push(`/dashboard/psikolog/${b.psychologistId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5D7B] to-[#4A7A96] flex items-center justify-center text-xl text-white font-bold shadow-sm">
                        {b.psychologistName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1E293B] font-['Poppins']">{b.psychologistName}</h3>
                        <p className="text-xs text-[#2D5D7B] font-medium font-['Inter']">{b.serviceName}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] font-['Inter']">
                          <span>{b.date}</span>
                          <span>•</span>
                          <span>{b.time} WIB</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <VideoCameraIcon className="w-3 h-3" />
                            {b.mode || 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold font-['Inter'] ${status.classes}`}>{status.label}</span>
                      {(b.status === 'dikonfirmasi' || b.status === 'pending') && (
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
