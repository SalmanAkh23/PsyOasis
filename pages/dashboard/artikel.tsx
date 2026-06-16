import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getArticles, getSavedArticles, toggleSavedArticle } from '../../lib/db'
import { BookmarkIcon as BookmarkOutline, ClockIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

const fallbackArticles = [
  { id: '1', title: 'Mengatasi Anxiety di Era Modern', excerpt: 'Tips praktis untuk mengelola kecemasan sehari-hari dengan teknik pernapasan dan mindfulness.', category: 'Kecemasan', readTime: '5 menit', color: 'from-[#002768] to-[#315ab4]' },
  { id: '2', title: 'Pentingnya Self-Care untuk Kesehatan Mental', excerpt: 'Cara sederhana merawat diri sendiri di tengah kesibukan dan tekanan hidup.', category: 'Self-Care', readTime: '4 menit', color: 'from-[#315ab4] to-[#6B9CB5]' },
  { id: '3', title: 'Memahami Burnout dan Cara Mengatasinya', excerpt: 'Kenali tanda-tanda burnout dan langkah-langkah pemulihan yang efektif.', category: 'Burnout', readTime: '7 menit', color: 'from-[#BE185D] to-[#DB2777]' },
]

export default function ArtikelPage() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    Promise.all([
      getArticles().then(data => setArticles(data.length > 0 ? data : fallbackArticles)).catch(() => setArticles(fallbackArticles)),
      getSavedArticles(user.uid).then(setSavedIds).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, [user]);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    const wasSaved = savedIds.includes(id);
    setSavedIds(prev => wasSaved ? prev.filter(s => s !== id) : [...prev, id]);
    try {
      await toggleSavedArticle(user.uid, id);
      showToast('success', wasSaved ? 'Artikel dihapus dari tersimpan' : 'Artikel tersimpan');
    } catch {
      setSavedIds(prev => wasSaved ? [...prev, id] : prev.filter(s => s !== id));
      showToast('error', 'Gagal menyimpan artikel');
    }
  };

  if (loading || !user) return null;

  const savedArticles = articles.filter(a => savedIds.includes(a.id));

  return (
    <>
      <Head><title>Artikel â€“ PsyOasis</title></Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Artikel Tersimpan</h1>
          <p className="text-xs text-[#434652] mt-0.5 font-['Inter']">Koleksi artikel kesehatan mental Anda</p>
        </div>
        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl bg-white border border-[#c4c6d4] overflow-hidden animate-pulse">
                <div className="h-2 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : savedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-sm text-[#434652] gap-3">
            <BookmarkOutline className="w-10 h-10 text-[#c4c6d4]" />
            <span className="font-semibold">Belum ada artikel tersimpan</span>
            <p className="text-xs text-[#747783]">Simpan artikel dengan mengklik ikon bookmark</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedArticles.map((a: any) => (
              <div
                key={a.id}
                className="group rounded-2xl bg-white border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all overflow-hidden cursor-pointer"
                onClick={() => router.push(`/dashboard/artikel/${a.id}`)}
              >
                <div className={`h-2 bg-gradient-to-r ${a.color || 'from-[#002768] to-[#315ab4]'}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#002768]/10 text-[10px] font-semibold text-[#002768] font-['Inter']">{a.category}</span>
                      <span className="text-[10px] text-[#434652] flex items-center gap-1 font-['Inter']">
                        <ClockIcon className="w-3 h-3" />
                        {a.readTime}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleToggleSave(e, a.id)}
                      className="p-1.5 rounded-lg hover:bg-[#f2f4f5] transition-colors"
                    >
                      <BookmarkSolid className="w-4 h-4 text-[#002768]" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1c1e] mb-2 group-hover:text-[#002768] transition-colors font-['Poppins']">{a.title}</h3>
                  <p className="text-xs text-[#434652] leading-relaxed font-['Inter']">{a.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#c4c6d4]">
                    <span className="text-[10px] text-[#747783] font-['Inter']">Tersimpan</span>
                    <span className="text-[10px] font-semibold text-[#002768] font-['Inter']">Baca â†’</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
