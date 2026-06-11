import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../../lib/db'
import { BellAlertIcon, CheckCircleIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline'

const iconMap: Record<string, any> = {
  booking: CheckCircleIcon,
  reminder: CalendarDaysIcon,
  article: BookOpenIcon,
  default: BellAlertIcon,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  return `${days} hari lalu`
}

export default function NotifikasiPage() {
  const { user, loading } = useAuth() as any;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    getUserNotifications(user.uid)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await markNotificationRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await markAllNotificationsRead(user.uid); } catch {}
  };

  if (loading || !user) return null;

  return (
    <>
      <Head><title>Notifikasi – PsyOasis</title></Head>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] font-['Poppins']">Notifikasi</h1>
            <p className="text-xs text-[#64748B] mt-0.5 font-['Inter']">Pemberitahuan dan pengingat untuk Anda</p>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#2D5D7B] hover:text-[#244A63] transition-colors font-['Inter']"
          >
            Tandai Semua Dibaca
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#64748B]">Memuat...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-[#64748B] gap-2">
            <BellAlertIcon className="w-8 h-8 text-[#D1D5DB]" />
            <span>Tidak ada notifikasi</span>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const Icon = iconMap[n.type] || iconMap.default;
              return (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                  !n.read
                    ? 'bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
                    : 'bg-white/60 border-[#E5E7EB]/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.read ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold font-['Poppins'] ${!n.read ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{n.title}</h3>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#2D5D7B] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 font-['Inter']">{n.message}</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1.5 block font-['Inter']">{timeAgo(n.createdAt)}</span>
                    </div>
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
