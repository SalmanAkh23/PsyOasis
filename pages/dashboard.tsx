import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, saveMood, getTodayMood, getMoodHistory } from '../lib/db';
import { useToast } from '../components/ui/Toast';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Heart,
  Bookmark,
  Search,
  BookOpen,
  Clock,
} from 'lucide-react';

const moods = [
  { emoji: '\u{1F60A}', label: 'Sangat Baik' },
  { emoji: '\u{1F642}', label: 'Baik' },
  { emoji: '\u{1F610}', label: 'Netral' },
  { emoji: '\u{1F614}', label: 'Sedih' },
  { emoji: '\u{1F630}', label: 'Cemas' },
];

const statIcons = [
  { bg: '#DCEEF8', iconColor: '#2D5D7B' },
  { bg: '#D4EDDA', iconColor: '#166534' },
  { bg: '#FCE4EC', iconColor: '#BE185D' },
  { bg: '#FEF3C7', iconColor: '#B45309' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  initial: {},
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    getUserBookings(user.uid)
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getTodayMood(user.uid).then(m => { if (m !== null) setSelectedMood(m); }).catch(() => {});
    getMoodHistory(user.uid).then(setMoodHistory).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const name = user.displayName?.split(' ')[0] || 'Sobat';
  const upcoming = bookings.filter(b => b.status !== 'selesai');
  const completed = bookings.filter(b => b.status === 'selesai');
  const nextBooking = upcoming[0];

  const stats = [
    { icon: Calendar, label: 'Konsultasi Mendatang', value: upcoming.length },
    { icon: CheckCircle, label: 'Konsultasi Selesai', value: completed.length },
    { icon: Heart, label: 'Psikolog Favorit', value: user.favorites?.length || 0 },
    { icon: Bookmark, label: 'Artikel Tersimpan', value: 0 },
  ];

  return (
    <>
      <Head>
        <title>Dashboard – PsyOasis</title>
        <meta name="description" content="Kelola sesi konsultasi dan riwayat terapi Anda di PsyOasis." />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-[#DCEEF8] rounded-[24px] p-8 flex items-center w-full overflow-hidden"
            style={{ height: '160px' }}
          >
            <div className="w-full">
              <span className="text-[11px] font-semibold text-[#2D5D7B] tracking-[0.15em] font-['Inter']">
                SELAMAT DATANG
              </span>
              <h1 className="text-[38px] font-bold text-[#1E293B] leading-tight mt-0.5 font-['Poppins'] truncate">
                Halo, {name}
              </h1>
              <p className="text-sm text-[#475569] mt-1 max-w-2xl font-['Nunito_Sans'] truncate">
                Senang melihat Anda kembali di PsyOasis.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              const colors = statIcons[i];
              return (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="bg-white rounded-[18px] p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 w-full overflow-hidden"
                  style={{ height: '110px' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#64748B] font-['Inter'] truncate">{s.label}</p>
                    <p className="text-[28px] font-bold text-[#1E293B] mt-0.5 font-['Poppins']">
                      {loadingData ? '-' : s.value}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ml-3"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: colors.iconColor }} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 w-full">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 w-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[#1E293B] font-['Poppins']">Konsultasi Mendatang</h2>
                <button
                  onClick={() => router.push('/dashboard/konsultasi')}
                  className="text-xs font-semibold text-[#2D5D7B] hover:underline font-['Inter'] whitespace-nowrap"
                >
                  Lihat Semua
                </button>
              </div>
              {loadingData ? (
                <div className="flex items-center justify-center h-32 text-sm text-[#64748B]">
                  Memuat...
                </div>
              ) : nextBooking ? (
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-[16px] bg-gradient-to-br from-[#2D5D7B] to-[#4A7A96] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm">
                    {nextBooking.psychologistName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-[#1E293B] font-['Poppins'] truncate">{nextBooking.psychologistName}</h3>
                      <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200 font-['Inter'] whitespace-nowrap shrink-0">
                        {nextBooking.status?.toUpperCase() || 'DIKONFIRMASI'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-[#64748B] font-['Nunito_Sans']">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#2D5D7B] shrink-0" />
                        <span>{nextBooking.date}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#2D5D7B] shrink-0" />
                        <span>{nextBooking.time} WIB</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#2D5D7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span>Jenis: {nextBooking.mode || 'Konsultasi Online'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <button
                        onClick={() => router.push('/dashboard/konsultasi')}
                        className="px-6 py-2.5 bg-[#2D5D7B] text-white rounded-full text-xs font-semibold hover:bg-[#244A63] transition-all duration-200 shadow-sm font-['Inter'] whitespace-nowrap"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-sm text-[#64748B] gap-2">
                  <Calendar className="w-8 h-8 text-[#D1D5DB]" />
                  <span>Belum ada konsultasi mendatang</span>
                  <button
                    onClick={() => router.push('/booking')}
                    className="mt-1 px-4 py-2 bg-[#2D5D7B] text-white rounded-full text-xs font-semibold hover:bg-[#244A63] transition-all"
                  >
                    Booking Sekarang
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 w-full overflow-hidden"
            >
              <h2 className="text-base font-bold text-[#1E293B] mb-5 font-['Poppins']">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/booking')}
                  className="w-full h-[50px] flex items-center justify-center gap-2.5 bg-[#2D5D7B] text-white rounded-[12px] text-sm font-semibold hover:bg-[#244A63] transition-all duration-200 shadow-sm font-['Inter']"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="truncate">Booking Konsultasi</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/favorit')}
                  className="w-full h-[50px] flex items-center justify-center gap-2.5 border border-[#E5E7EB] text-[#64748B] rounded-[12px] text-sm font-medium hover:border-[#2D5D7B] hover:text-[#2D5D7B] transition-all duration-200 font-['Inter'] bg-white"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span className="truncate">Cari Psikolog</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/artikel')}
                  className="w-full h-[50px] flex items-center justify-center gap-2.5 border border-[#E5E7EB] text-[#64748B] rounded-[12px] text-sm font-medium hover:border-[#2D5D7B] hover:text-[#2D5D7B] transition-all duration-200 font-['Inter'] bg-white"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="truncate">Baca Artikel</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/riwayat')}
                  className="w-full h-[50px] flex items-center justify-center gap-2.5 border border-[#E5E7EB] text-[#64748B] rounded-[12px] text-sm font-medium hover:border-[#2D5D7B] hover:text-[#2D5D7B] transition-all duration-200 font-['Inter'] bg-white"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="truncate">Lihat Riwayat</span>
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-[22px] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 w-full overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-[#1E293B] mb-7 font-['Poppins']">
              Bagaimana Perasaan Anda Hari Ini?
            </h2>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {moods.map((m, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    setSelectedMood(i);
                    if (user) {
                      await saveMood(user.uid, i).catch(() => {});
                      showToast('success', `Mood "${moods[i].label}" tersimpan`);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 w-[90px] h-[90px] rounded-[16px] border transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedMood === i
                      ? 'border-[#2D5D7B] bg-[#DCEEF8] shadow-sm'
                      : 'border-[#E5E7EB] bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span className="text-3xl leading-none">{m.emoji}</span>
                  <span className={`text-[11px] font-semibold font-['Inter'] ${
                    selectedMood === i ? 'text-[#2D5D7B]' : 'text-[#64748B]'
                  }`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {moodHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-white rounded-[22px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full overflow-hidden"
            >
              <h2 className="text-base font-bold text-[#1E293B] mb-4 font-['Poppins']">Riwayat Mood</h2>
              <div className="flex items-end gap-2 h-24">
                {moodHistory.slice(0, 7).reverse().map((m: any, i: number) => {
                  const emojis = ['\u{1F60A}', '\u{1F642}', '\u{1F610}', '\u{1F614}', '\u{1F630}']
                  const barColors = ['bg-emerald-400', 'bg-emerald-300', 'bg-amber-300', 'bg-orange-400', 'bg-red-400']
                  const h = 40 + m.mood * 20
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <span className="text-xs">{emojis[m.mood] || '\u{1F642}'}</span>
                      <div className={`w-full rounded-full ${barColors[m.mood] || 'bg-slate-300'}`}
                        style={{ height: `${h}%`, maxHeight: '80px' }}
                      />
                      <span className="text-[10px] text-[#64748B] font-['Inter'] truncate w-full text-center">
                        {m.date?.slice(5) || ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}
