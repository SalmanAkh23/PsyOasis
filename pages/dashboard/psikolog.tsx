import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getPsychologists, getUserFavorites, toggleFavorite } from '../../lib/db'
import { useToast } from '../../components/ui/Toast'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const categories = [
  'All',
  'Anxiety',
  'Depression',
  'Stress',
  'Trauma',
  'Relationship',
  'Family',
  'Career',
  'Youth',
  'Parenting',
  'Burnout',
]

const categoryColors: Record<string, string> = {
  Anxiety: 'from-purple-500 to-indigo-600',
  Depression: 'from-blue-500 to-cyan-600',
  Stress: 'from-amber-400 to-orange-600',
  Trauma: 'from-fuchsia-500 to-purple-600',
  Relationship: 'from-rose-400 to-pink-600',
  Family: 'from-emerald-400 to-teal-600',
  Career: 'from-sky-400 to-blue-600',
  Youth: 'from-lime-400 to-green-600',
  Parenting: 'from-violet-400 to-purple-600',
  Burnout: 'from-red-400 to-rose-600',
}

export default function CariPsikologPage() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    Promise.all([
      getPsychologists(selectedCategory === 'All' ? undefined : selectedCategory),
      getUserFavorites(user.uid),
    ])
      .then(([psychs, favs]) => {
        setPsychologists(psychs);
        setFavoriteIds(favs);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user, selectedCategory]);

  const handleToggleFav = async (id: string) => {
    if (!user) return;
    const wasFav = favoriteIds.includes(id);
    setFavoriteIds(prev => wasFav ? prev.filter(f => f !== id) : [...prev, id]);
    try {
      await toggleFavorite(user.uid, id);
      showToast('success', wasFav ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
    } catch {
      setFavoriteIds(prev => wasFav ? [...prev, id] : prev.filter(f => f !== id));
    }
  };

  if (loading || !user) return null;

  const filtered = psychologists.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.specialty || '').toLowerCase().includes(q) ||
      (p.tags || []).some((t: string) => t.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Head><title>Cari Psikolog - PsyOasis</title></Head>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a1c1e]">Cari Psikolog</h1>
            <p className="text-xs text-[#434652] mt-0.5">Temukan psikolog yang sesuai dengan kebutuhan anda</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747783]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, spesialisasi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#002768] text-white border-[#002768]'
                  : 'bg-white text-[#434652] border-[#c4c6d4] hover:border-[#002768] hover:text-[#002768]'
              }`}
            >
              {cat === 'All' ? 'Semua' : cat}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center h-40 text-sm text-[#434652]">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-sm text-[#434652] gap-2">
            <FunnelIcon className="w-8 h-8 text-[#c4c6d4]" />
            <span>Tidak ada psikolog ditemukan</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const isFav = favoriteIds.includes(p.id);
              const colorKey = (p.tags?.[0] || 'Anxiety') as string;
              const bgGrad = categoryColors[colorKey] || 'from-purple-500 to-indigo-600';
              const initial = (p.name || '?').charAt(0).toUpperCase();
              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white p-5 border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all group cursor-pointer"
                  onClick={() => router.push(`/dashboard/psikolog/${p.id}`)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl overflow-hidden ${!p.photoUrl ? `bg-gradient-to-br ${bgGrad} flex items-center justify-center text-2xl shadow-sm text-white font-bold` : 'shadow-sm'}`}>
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#1a1c1e] truncate group-hover:text-[#002768] transition-colors">
                        {p.name || p.displayName || 'Psikolog'}
                      </h3>
                      <p className="text-[10px] text-[#002768] font-medium">{p.specialty || 'Psikolog'}</p>
                      {p.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-amber-500 text-xs">â˜…</span>
                          <span className="text-xs font-medium text-[#1a1c1e]">{p.rating}</span>
                          {p.reviewsCount > 0 && (
                            <span className="text-[10px] text-[#747783]">({p.reviewsCount})</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFav(p.id); }}
                      className={`p-2 rounded-xl transition-colors ${
                        isFav ? 'bg-rose-50 text-rose-500' : 'bg-[#f2f4f5] text-[#747783] hover:bg-rose-50 hover:text-rose-500'
                      }`}
                    >
                      {isFav ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {(p.tags?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-[#f2f4f5] border border-[#c4c6d4] text-[10px] text-[#434652] font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                  {p.bio && (
                    <p className="text-xs text-[#434652] line-clamp-2 mb-3">{p.bio}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-[#c4c6d4]">
                    <span className="text-sm font-bold text-[#1a1c1e]">
                      {p.fee ? `${p.fee}` : 'Hubungi'}
                      {p.fee && <span className="text-[10px] font-normal text-[#434652]"> / sesi</span>}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push('/booking'); }}
                      className="px-4 py-2 bg-[#002768] text-white rounded-xl text-xs font-semibold hover:bg-[#003b95] transition-all shadow-sm"
                    >
                      Booking
                    </button>
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
