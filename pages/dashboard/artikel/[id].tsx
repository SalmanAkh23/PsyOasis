import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../components/dashboard/DashboardLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const articles: Record<string, any> = {
  '1': {
    title: 'Mengatasi Anxiety di Era Modern',
    category: 'Kecemasan',
    readTime: '5 menit',
    color: 'from-[#2D5D7B] to-[#4A7A96]',
    content: '<p>Kecemasan adalah respons alami tubuh terhadap stres. Namun, ketika kecemasan menjadi berlebihan dan terus-menerus, hal ini dapat mengganggu kehidupan sehari-hari. Berikut adalah beberapa teknik yang dapat membantu Anda mengelola kecemasan:</p><h2>1. Teknik Pernapasan 4-7-8</h2><p>Tarik napas selama 4 detik, tahan selama 7 detik, dan hembuskan selama 8 detik. Ulangi 4-5 kali.</p><h2>2. Grounding 5-4-3-2-1</h2><p>Sebutkan 5 hal yang Anda lihat, 4 yang Anda sentuh, 3 yang Anda dengar, 2 yang Anda cium, dan 1 yang Anda rasakan.</p><h2>3. Journaling</h2><p>Tuliskan pikiran dan perasaan Anda setiap hari untuk membantu mengidentifikasi pemicu kecemasan.</p><p>Praktikkan teknik-teknik ini secara teratur untuk membantu mengelola kecemasan Anda. Jika kecemasan terus berlanjut, jangan ragu untuk berkonsultasi dengan psikolog profesional.</p>'
  },
  '2': {
    title: 'Pentingnya Self-Care untuk Kesehatan Mental',
    category: 'Self-Care',
    readTime: '4 menit',
    color: 'from-[#4A7A96] to-[#6B9CB5]',
    content: '<p>Self-care bukanlah kemewahan, melainkan kebutuhan dasar untuk menjaga kesehatan mental. Di tengah rutinitas yang padat, seringkali kita lupa untuk merawat diri sendiri.</p><h2>Tips Self-Care Harian</h2><ul><li>Luangkan 10 menit untuk meditasi setiap pagi</li><li>Konsumsi makanan bergizi dan cukup air putih</li><li>Olahraga ringan selama 15-30 menit</li><li>Tidur yang cukup (7-9 jam)</li><li>Batasi paparan media sosial</li></ul><p>Mulailah dengan satu atau dua tips dan tingkatkan secara bertahap. Konsistensi lebih penting daripada kesempurnaan.</p>'
  },
  '3': {
    title: 'Memahami Burnout dan Cara Mengatasinya',
    category: 'Burnout',
    readTime: '7 menit',
    color: 'from-[#BE185D] to-[#DB2777]',
    content: '<p>Burnout adalah kondisi kelelahan fisik, emosional, dan mental yang disebabkan oleh stres berkepanjangan. Mengenali tanda-tanda awal sangat penting untuk mencegah dampak yang lebih serius.</p><h2>Tanda-Tanda Burnout</h2><ul><li>Kelelahan ekstrem meskipun sudah istirahat</li><li>Penurunan produktivitas</li><li>Sikap sinis terhadap pekerjaan atau hubungan sosial</li><li>Gangguan tidur dan nafsu makan</li></ul><h2>Langkah Pemulihan</h2><p>Istirahat yang cukup, bicarakan dengan profesional, tetapkan batasan yang sehat, dan lakukan aktivitas yang menyenangkan. Ingatlah bahwa pemulihan adalah proses, bukan tujuan instan.</p>'
  }
}

export default function ArtikelDetail() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { id } = router.query;
  const article = typeof id === 'string' ? articles[id] : null;

  if (loading || !user) return null;

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[#64748B]">Artikel tidak ditemukan</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head><title>{article.title} – PsyOasis</title></Head>
      <DashboardLayout>
        <button
          onClick={() => router.push('/dashboard/artikel')}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#2D5D7B] transition-colors mb-6 font-['Inter']"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </button>
        <div className={`h-2 bg-gradient-to-r ${article.color} rounded-t-2xl`} />
        <div className="bg-white rounded-b-2xl border border-[#E5E7EB] border-t-0 p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2D5D7B]/10 text-[10px] font-semibold text-[#2D5D7B] font-['Inter']">{article.category}</span>
            <span className="text-[10px] text-[#64748B] font-['Inter']">{article.readTime} • 3 hari lalu</span>
          </div>
          <h1 className="text-xl font-bold text-[#1E293B] mb-6 font-['Poppins']">{article.title}</h1>
          <div
            className="prose prose-sm max-w-none text-[#475569] font-['Inter'] [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#1E293B] [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:leading-relaxed [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </DashboardLayout>
    </>
  )
}
