import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getUserFavorites, toggleFavorite } from '../../lib/db'
import { useToast } from '../../components/ui/Toast'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { mockPsychologists } from '../../data/mockData'

export default function FavoritPage() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    getUserFavorites(user.uid)
      .then(setFavoriteIds)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleToggle = async (id: string) => {
    if (!user) return;
    const wasFav = favoriteIds.includes(id);
    setFavoriteIds(prev => wasFav ? prev.filter(f => f !== id) : [...prev, id]);
    try {
      await toggleFavorite(user.uid, id);
      showToast(wasFav ? 'success' : 'success', wasFav ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
    } catch {
      setFavoriteIds(prev => wasFav ? [...prev, id] : prev.filter(f => f !== id));
      showToast('error', 'Gagal mengubah favorit');
    }
  };

  if (loading || !user) return null;

  const favorites = mockPsychologists.filter(p => favoriteIds.includes(p.id));

  return (
    <>
      <Head><title>Favorit – PsyOasis</title></Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1E293B] font-['Poppins']">Psikolog Favorit</h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-['Inter']">Psikolog yang sering Anda konsultasi</p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#64748B]">Memuat...</div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-[#64748B] gap-2">
            <HeartIcon className="w-8 h-8 text-[#D1D5DB]" />
            <span>Belum ada psikolog favorit</span>
            <button onClick={() => router.push('/booking')} className="mt-1 px-4 py-2 bg-[#2D5D7B] text-white rounded-full text-xs font-semibold">
              Cari Psikolog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-white p-5 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all group cursor-pointer"
                onClick={() => router.push(`/dashboard/psikolog/${p.id}`)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${p.avatarBg} shadow-sm`}>
                    {p.avatarChar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#1E293B] font-['Poppins'] truncate group-hover:text-[#2D5D7B] transition-colors">{p.name}</h3>
                    <p className="text-[10px] text-[#2D5D7B] font-medium font-['Inter']">{p.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="text-xs font-medium text-[#1E293B] font-['Inter']">{p.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(p.id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                  >
                    <HeartSolidIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#E5E7EB] text-[10px] text-[#64748B] font-medium font-['Inter']">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <span className="text-sm font-bold text-[#1E293B] font-['Inter']">{p.fee} <span className="text-[10px] font-normal text-[#64748B]">/ sesi</span></span>
                  <button onClick={() => router.push('/booking')} className="px-4 py-2 bg-[#2D5D7B] text-white rounded-xl text-xs font-semibold hover:bg-[#244A63] transition-all shadow-sm font-['Inter']">Booking</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
