import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  Heart,
  Bell,
  Bookmark,
  User,
  Settings,
  LogOut,
  CalendarPlus,
  Calendar,
  Users,
  DollarSign,
  Search,
  CreditCard,
} from 'lucide-react';

const patientItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Konsultasi Saya', href: '/dashboard/konsultasi', icon: MessageSquare },
  { label: 'Pesan', href: '/dashboard/pesan', icon: MessageSquare },
  { label: 'Riwayat', href: '/dashboard/riwayat', icon: Clock },
  { label: 'Cari Psikolog', href: '/dashboard/psikolog', icon: Search },
  { label: 'Tagihan', href: '/dashboard/tagihan', icon: CreditCard },
  { label: 'Notifikasi', href: '/dashboard/notifikasi', icon: Bell },
  { label: 'Artikel', href: '/dashboard/artikel', icon: Bookmark },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
];

const psychologistItems = [
  { label: 'Portal Psikolog', href: '/dashboard/portal', icon: LayoutDashboard },
  { label: 'Pesan', href: '/dashboard/portal/pesan', icon: MessageSquare },
  { label: 'Jadwal', href: '/dashboard/portal/jadwal', icon: Calendar },
  { label: 'Jam Kerja', href: '/dashboard/portal/jadwal-kerja', icon: Clock },
  { label: 'Pasien', href: '/dashboard/portal/pasien', icon: Users },
  { label: 'Pendapatan', href: '/dashboard/portal/pendapatan', icon: DollarSign },
  { label: 'Notifikasi', href: '/dashboard/notifikasi', icon: Bell },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const router = useRouter();

  const { user, logout } = useAuth() as any;
  const isPsychologist = user?.role === 'psychologist';
  const items = isPsychologist ? psychologistItems : patientItems;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <aside className="w-[320px] h-screen flex flex-col bg-white border-r border-[#c4c6d4] overflow-hidden shrink-0">
      <div className="shrink-0 px-6 pt-6 pb-5 border-b border-[#c4c6d4]">
        <div className="text-[10px] font-semibold text-[#434652] tracking-[0.15em] uppercase mb-1.5 font-['Inter']">
          PUSAT AKTIVITAS
        </div>
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PsyOasis" className="h-20 w-auto object-contain" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-hidden">
        <ul className="space-y-[2px]">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = router.pathname === it.href;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 pl-6 pr-4 rounded-[12px] text-sm transition-all duration-200 font-['Inter'] whitespace-nowrap ${
                    isActive
                      ? 'bg-[#7afc9a] text-[#002768] font-semibold'
                      : 'text-[#434652] hover:bg-[#e2f8e6] hover:text-[#1a1c1e]'
                  }`}
                  style={{ height: '52px' }}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? 'text-[#002768]' : 'text-[#747783]'
                  }`} />
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 px-4 py-5 border-t border-[#c4c6d4] space-y-3">
        {isPsychologist ? (
          <button
            onClick={() => { router.push('/dashboard'); onClose?.(); }}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white border border-[#c4c6d4] text-[#434652] rounded-full text-sm font-semibold hover:bg-[#eeeef0] hover:border-[#002768] hover:text-[#002768] transition-all duration-200 font-['Inter'] whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard Pasien</span>
          </button>
        ) : (
          <button
            onClick={() => { router.push('/booking'); onClose?.(); }}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-[#002768] text-white rounded-full text-sm font-semibold hover:bg-[#003b95] transition-all duration-200 shadow-sm font-['Inter'] whitespace-nowrap"
          >
            <CalendarPlus className="w-4 h-4 shrink-0" />
            <span>Booking Konsultasi</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-[#434652] hover:text-[#EF4444] rounded-[12px] text-sm font-medium hover:bg-red-50 transition-all duration-200 font-['Inter'] whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex h-screen fixed top-0 left-0 z-[1000]">
        {sidebarContent}
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[1000]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed top-0 left-0 h-screen shadow-2xl animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
