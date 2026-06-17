import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../components/dashboard/DashboardLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { getPsychologists, getPsychologistReviews } from '../../../lib/db'
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline'

const avatarColors = [
  'from-purple-500 to-indigo-600',
  'from-cyan-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-500 to-purple-600',
  'from-amber-400 to-orange-600',
];

export default function PsikologDetail() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { id } = router.query;
  const [p, setP] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    getPsychologists().then((list) => {
      const found = list.find((item: any) => item.id === id);
      setP(found || null);
    }).finally(() => setFetching(false));
    getPsychologistReviews(id as string).then(setReviews).catch(() => {});
  }, [id]);

  if (loading || !user || fetching) return null;

  if (!p) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm text-[#434652]">Psikolog tidak ditemukan</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-[#002768] text-white rounded-full text-xs font-semibold">Kembali</button>
        </div>
      </DashboardLayout>
    )
  }

  const initial = (p.name || '?').charAt(0).toUpperCase();
  const colorIdx = (p.name || '').length % avatarColors.length;
  const tags: string[] = p.tags || [];
  const reviewsCount = p.reviewsCount || p.reviews_count || 0;

  return (
    <>
      <Head><title>{p.name} – PsyOasis</title></Head>
      <DashboardLayout>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#434652] hover:text-[#002768] transition-colors mb-6 font-['Inter']"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl border border-[#c4c6d4] p-8">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 ${!p.photoUrl ? `bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-3xl text-white font-bold shadow-sm` : 'shadow-sm'}`}>
              {p.photoUrl ? (
                <img src={p.photoUrl} alt={p.name || ''} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">{p.name}</h1>
              <p className="text-sm text-[#002768] font-medium font-['Inter']">{p.specialty || 'Psikolog'}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#434652] font-['Inter']">
                {p.rating && (
                  <>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-semibold text-[#1a1c1e]">{p.rating}</span>
                      {reviewsCount > 0 && <span>({reviewsCount} ulasan)</span>}
                    </div>
                    <span>•</span>
                  </>
                )}
                <span>{p.experience || '-'}</span>
                {p.status && (
                  <>
                    <span>•</span>
                    <span className={`font-semibold ${p.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {p.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((t: string) => (
                  <span key={t} className="px-3 py-1 rounded-full bg-[#f2f4f5] text-xs text-[#434652] font-medium font-['Inter']">{t}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-[#1a1c1e] font-['Inter']">{p.fee || 'Rp -'}</div>
              <div className="text-xs text-[#434652] font-['Inter']">per sesi</div>
              <button
                onClick={() => router.push('/booking')}
                className="mt-3 px-6 py-2.5 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all shadow-sm font-['Inter']"
              >
                Booking Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#c4c6d4] p-8 mt-6">
          <h2 className="text-base font-bold text-[#1a1c1e] mb-4 font-['Poppins']">Tentang Psikolog</h2>
          {p.bio ? (
            <p className="text-sm text-[#434652] leading-relaxed font-['Inter']">{p.bio}</p>
          ) : (
            <p className="text-sm text-[#434652] leading-relaxed font-['Inter']">
              {p.name} adalah psikolog dengan {p.experience || 'pengalaman'} yang berfokus pada {p.specialty?.toLowerCase() || 'konseling'}.
              {tags.length > 0 && ` Berpengalaman dalam menangani berbagai kasus terkait ${tags.join(', ').toLowerCase()}.`}
            </p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#c4c6d4] p-8 mt-6">
            <h2 className="text-base font-bold text-[#1a1c1e] mb-4 font-['Poppins']">Ulasan ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="pb-4 border-b border-[#c4c6d4]/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= r.rating ? 'text-amber-500' : 'text-[#c4c6d4]'}`}>★</span>
                    ))}
                    <span className="ml-2 text-xs text-[#434652]">{new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {r.comment && <p className="text-sm text-[#434652] font-['Inter']">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  )
}