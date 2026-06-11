import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getUserBookings, submitReview } from '../../lib/db'
import { useToast } from '../../components/ui/Toast'
import { ClockIcon, FunnelIcon } from '@heroicons/react/24/outline'

export default function RiwayatPage() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; psychologistId: string; psychologistName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filter, setFilter] = useState<'semua' | 'bulanini' | 'tahunini'>('semua');

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    getUserBookings(user.uid)
      .then(b => setBookings(b.filter((bb: any) => bb.status === 'selesai')))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleSubmitReview = async () => {
    if (!reviewModal || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      await submitReview({ bookingId: reviewModal.bookingId, userId: user.uid, psychologistId: reviewModal.psychologistId, rating: reviewRating, comment: reviewComment });
      showToast('success', 'Ulasan berhasil dikirim');
      setReviewModal(null);
      setReviewRating(0);
      setReviewComment('');
    } catch {
      showToast('error', 'Gagal mengirim ulasan');
    }
    setSubmittingReview(false);
  };

  if (loading || !user) return null;

  const now = new Date();
  const filtered = bookings.filter(b => {
    if (filter === 'bulanini') {
      const d = new Date(b.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === 'tahunini') {
      return new Date(b.date).getFullYear() === now.getFullYear();
    }
    return true;
  });

  const bulanIni = bookings.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <>
      <Head><title>Riwayat – PsyOasis</title></Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1E293B] font-['Poppins']">Riwayat Konsultasi</h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-['Inter']">Semua sesi konsultasi yang pernah Anda lakukan</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Sesi', value: bookings.length, icon: '\u{1F4CB}' },
            { label: 'Bulan Ini', value: bulanIni, icon: '\u{1F4C5}' },
            { label: 'Rata-rata Rating', value: bookings.length > 0 ? '4.8' : '-', icon: '\u{2B50}' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white p-4 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs text-[#64748B] font-medium font-['Inter']">{item.label}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xl font-bold text-[#1E293B] font-['Poppins']">{loadingData ? '-' : item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-4 h-4 text-[#64748B]" />
          {(['semua', 'bulanini', 'tahunini'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all font-['Inter'] ${
                filter === f
                  ? 'bg-[#2D5D7B] text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E5E7EB]'
              }`}
            >
              {f === 'semua' ? 'Semua' : f === 'bulanini' ? 'Bulan Ini' : 'Tahun Ini'}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl bg-white p-5 border border-[#E5E7EB] animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-sm text-[#64748B] gap-3">
            <ClockIcon className="w-10 h-10 text-[#D1D5DB]" />
            <span className="font-semibold">Belum ada riwayat konsultasi</span>
            <p className="text-xs text-[#94A3B8]">Sesi yang selesai akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b: any) => (
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
                      <p className="text-[10px] text-[#2D5D7B] font-medium font-['Inter']">{b.serviceName}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B] font-['Inter']">
                        <ClockIcon className="w-3 h-3" />
                        <span>{b.date}</span>
                        <span>•</span>
                        <span>{b.time} WIB</span>
                        <span>•</span>
                        <span>{b.mode || 'Online'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-semibold font-['Inter']">Selesai</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setReviewModal({ bookingId: b.id, psychologistId: b.psychologistId, psychologistName: b.psychologistName }); setReviewRating(0); setReviewComment(''); }}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold font-['Inter'] bg-[#2D5D7B]/10 text-[#2D5D7B] hover:bg-[#2D5D7B]/20 transition-colors"
                  >
                    Beri Ulasan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>

      {reviewModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[#1E293B] mb-1 font-['Poppins']">Beri Ulasan</h3>
            <p className="text-xs text-[#64748B] mb-4 font-['Inter']">{reviewModal.psychologistName}</p>
            <div className="flex items-center gap-1 mb-4 justify-center">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)} className="text-2xl transition-colors">
                  {s <= reviewRating ? '\u{2B50}' : '\u{2606}'}
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Tulis ulasan Anda..."
              className="w-full h-20 px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#BFE7E7] resize-none font-['Inter']"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || submittingReview}
                className="flex-1 px-4 py-2.5 bg-[#2D5D7B] text-white rounded-xl text-sm font-semibold hover:bg-[#244A63] transition-all font-['Inter'] disabled:opacity-60"
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2.5 border border-[#E5E7EB] text-[#64748B] rounded-xl text-sm font-medium font-['Inter']"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
