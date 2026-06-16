import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../components/dashboard/DashboardLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { getArticleById } from '../../../lib/db'
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'

const categoryColors: Record<string, string> = {
  Kecemasan: 'from-[#002768] to-[#315ab4]',
  'Self-Care': 'from-[#315ab4] to-[#6B9CB5]',
  Burnout: 'from-[#BE185D] to-[#DB2777]',
  Depresi: 'from-[#6d28d9] to-[#8b5cf6]',
  Trauma: 'from-[#e11d48] to-[#fb7185]',
  Hubungan: 'from-[#059669] to-[#34d399]',
  'Kesehatan Mental': 'from-[#002768] to-[#4f7bc1]',
}

const defaultColor = 'from-[#002768] to-[#315ab4]'

function estimateReadTime(content: string): string {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const min = Math.max(1, Math.round(words / 200))
  return `${min} menit`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

export default function ArtikelDetail() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setFetching(true);
    getArticleById(id)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setFetching(false));
  }, [id]);

  if (loading || !user || fetching) return null;

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm text-[#434652]">Artikel tidak ditemukan</p>
          <button
            onClick={() => router.push('/dashboard/artikel')}
            className="px-4 py-2 bg-[#002768] text-white rounded-full text-xs font-semibold"
          >
            Kembali
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const readTime = article.readTime || estimateReadTime(article.content || '')
  const color = article.color || categoryColors[article.category] || defaultColor
  const dateText = article.createdAt ? timeAgo(article.createdAt) : ''

  return (
    <>
      <Head><title>{article.title} – PsyOasis</title></Head>
      <DashboardLayout>
        <button
          onClick={() => router.push('/dashboard/artikel')}
          className="flex items-center gap-2 text-sm text-[#434652] hover:text-[#002768] transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </button>
        <div className={`h-2 bg-gradient-to-r ${color} rounded-t-2xl`} />
        <div className="bg-white rounded-b-2xl border border-[#c4c6d4] border-t-0 p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#002768]/10 text-[10px] font-semibold text-[#002768]">{article.category}</span>
            <span className="text-[10px] text-[#434652] flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />{readTime}
            </span>
            {dateText && <span className="text-[10px] text-[#434652]">• {dateText}</span>}
          </div>
          <h1 className="text-xl font-bold text-[#1a1c1e] mb-6">{article.title}</h1>
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title} className="w-full rounded-xl mb-6 object-cover max-h-72" />
          )}
          <div
            className="prose prose-sm max-w-none text-[#434652] [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#1a1c1e] [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:leading-relaxed [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </DashboardLayout>
    </>
  )
}
