import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../components/dashboard/DashboardLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { mockPsychologists } from '../../../data/mockData'
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline'

export default function PsikologDetail() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { id } = router.query;
  const p = mockPsychologists.find(p => p.id === id);

  if (loading || !user) return null;

  if (!p) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm text-[#64748B]">Psikolog tidak ditemukan</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-[#2D5D7B] text-white rounded-full text-xs font-semibold">Kembali</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head><title>{p.name} – PsyOasis</title></Head>
      <DashboardLayout>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#2D5D7B] transition-colors mb-6 font-['Inter']"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${p.avatarBg} flex items-center justify-center text-3xl shadow-sm shrink-0`}>
              {p.avatarChar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#1E293B] font-['Poppins']">{p.name}</h1>
              <p className="text-sm text-[#2D5D7B] font-medium font-['Inter']">{p.role} • {p.specialty}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#64748B] font-['Inter']">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="font-semibold text-[#1E293B]">{p.rating}</span>
                  <span>({p.reviews} ulasan)</span>
                </div>
                <span>•</span>
                <span>{p.experience}</span>
                <span>•</span>
                <span className={`font-semibold ${p.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {p.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {p.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full bg-[#F1F5F9] text-xs text-[#64748B] font-medium font-['Inter']">{t}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-[#1E293B] font-['Inter']">{p.fee}</div>
              <div className="text-xs text-[#64748B] font-['Inter']">per sesi</div>
              <button
                onClick={() => router.push('/booking')}
                className="mt-3 px-6 py-2.5 bg-[#2D5D7B] text-white rounded-xl text-sm font-semibold hover:bg-[#244A63] transition-all shadow-sm font-['Inter']"
              >
                Booking Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mt-6">
          <h2 className="text-base font-bold text-[#1E293B] mb-4 font-['Poppins']">Tentang Psikolog</h2>
          <p className="text-sm text-[#475569] leading-relaxed font-['Inter']">
            {p.name} adalah {p.role} dengan {p.experience} yang berfokus pada {p.specialty.toLowerCase()}.
            Memiliki lebih dari {p.reviews} ulasan positif dari klien dengan rating {p.rating}.
            Berpengalaman dalam menangani berbagai kasus terkait {p.tags.join(', ').toLowerCase()}.
          </p>
        </div>
      </DashboardLayout>
    </>
  )
}
