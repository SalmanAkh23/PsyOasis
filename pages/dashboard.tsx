import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock stats (replace with real data where available)
  const [stats] = useState({
    upcoming: 1,
    completed: 12,
    favorites: 3,
    saved: 5,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return null; // AuthGate handles full-screen loading
  }


  return (
    <>
      <Head>
        <title>Dashboard – PsyOasis</title>
        <meta name="description" content="Kelola sesi konsultasi dan riwayat terapi Anda di PsyOasis." />
      </Head>

      <div className="min-h-screen bg-[#F7F9F6]">
        <div className="max-w-[1400px] mx-auto flex gap-6">
          {/* Sidebar */}
          <Sidebar />

          {/* Main area */}
          <div className="flex-1 p-6">
            <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              {/* Welcome */}
              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#4A7A96] mb-1 font-space">Dashboard</div>
                    <h1 className="text-3xl font-bold text-[#2D3732] font-space mb-1">Halo, {user.displayName || user.email} 👋</h1>
                    <p className="text-[#2D3732]/60">Selamat datang kembali di PsyOasis. Hari ini adalah kesempatan baru untuk menjaga kesehatan mental Anda.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/booking')} className="px-4 py-2 bg-[#4A7A96] text-white rounded-lg">Booking Konsultasi</button>
                    <button onClick={handleLogout} className="px-4 py-2 border border-[#709085]/20 rounded-lg">Keluar</button>
                  </div>
                </div>
              </section>

              {/* Overview Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white/70 p-4 border border-[#709085]/12 shadow-sm">
                  <div className="text-xs text-[#709085] font-semibold">Konsultasi Mendatang</div>
                  <div className="text-2xl font-bold text-[#2D3732]">{stats.upcoming}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 border border-[#709085]/12 shadow-sm">
                  <div className="text-xs text-[#709085] font-semibold">Konsultasi Selesai</div>
                  <div className="text-2xl font-bold text-[#2D3732]">{stats.completed}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 border border-[#709085]/12 shadow-sm">
                  <div className="text-xs text-[#709085] font-semibold">Psikolog Favorit</div>
                  <div className="text-2xl font-bold text-[#2D3732]">{stats.favorites}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 border border-[#709085]/12 shadow-sm">
                  <div className="text-xs text-[#709085] font-semibold">Artikel Tersimpan</div>
                  <div className="text-2xl font-bold text-[#2D3732]">{stats.saved}</div>
                </div>
              </section>

              {/* Main grid: Upcoming + Quick Actions + Wellness + Activity */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl bg-white/70 p-6 border border-[#709085]/12 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#2D3732]">Konsultasi Mendatang</h3>
                    <span className="text-sm text-[#4A7A96]">Primary</span>
                  </div>
                  {/* Placeholder upcoming card */}
                  <div className="p-4 rounded-xl bg-[#F7F9F6] border border-[#709085]/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#2D3732]">Dr. Anita Sitorus</div>
                      <div className="text-xs text-[#2D3732]/60">12 Juni 2026 • 10:00 - 11:00</div>
                      <div className="text-xs text-[#2D3732]/60">Jenis: Konsultasi Online</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-[#4A7A96] font-semibold">Dikonfirmasi</div>
                      <button onClick={() => router.push('/dashboard/konsultasi')} className="px-3 py-2 bg-[#4A7A96] text-white rounded-lg text-sm">Lihat Detail</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/70 p-6 border border-[#709085]/12 shadow-sm space-y-4">
                  <h4 className="text-md font-semibold text-[#2D3732]">Quick Actions</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => router.push('/booking')} className="w-full px-3 py-2 bg-[#4A7A96] text-white rounded-lg">Booking Konsultasi</button>
                    <button onClick={() => router.push('/dashboard/konsultasi')} className="w-full px-3 py-2 border border-[#709085]/12 rounded-lg">Cari Psikolog</button>
                    <button onClick={() => router.push('/dashboard/artikel')} className="w-full px-3 py-2 border border-[#709085]/12 rounded-lg">Baca Artikel</button>
                    <button onClick={() => router.push('/dashboard/riwayat')} className="w-full px-3 py-2 border border-[#709085]/12 rounded-lg">Lihat Riwayat</button>
                  </div>
                </div>

                <div className="lg:col-span-3 rounded-2xl bg-white/70 p-6 border border-[#709085]/12 shadow-sm">
                  <h4 className="text-md font-semibold text-[#2D3732] mb-3">Bagaimana Perasaan Anda Hari Ini?</h4>
                  <div className="flex flex-wrap gap-3">
                    {['😊 Sangat Baik','🙂 Baik','😐 Netral','😔 Sedih','😟 Cemas'].map((m) => (
                      <button key={m} className="px-4 py-2 rounded-lg bg-white/80 border border-[#709085]/10">{m}</button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 rounded-2xl bg-white/70 p-6 border border-[#709085]/12 shadow-sm">
                  <h4 className="text-md font-semibold text-[#2D3732] mb-4">Aktivitas Terbaru</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4A7A96] mt-2" />
                      <div>
                        <div className="text-sm font-semibold">Booking konsultasi berhasil</div>
                        <div className="text-xs text-[#2D3732]/60">2 jam yang lalu</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#709085] mt-2" />
                      <div>
                        <div className="text-sm font-semibold">Artikel disimpan</div>
                        <div className="text-xs text-[#2D3732]/60">Kemarin</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
