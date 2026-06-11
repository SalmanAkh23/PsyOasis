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
} from 'lucide-react';

const items = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Konsultasi Saya', href: '/dashboard/konsultasi', icon: MessageSquare },
  { label: 'Riwayat', href: '/dashboard/riwayat', icon: Clock },
  { label: 'Psikolog Favorit', href: '/dashboard/favorit', icon: Heart },
  { label: 'Notifikasi', href: '/dashboard/notifikasi', icon: Bell },
  { label: 'Artikel', href: '/dashboard/artikel', icon: Bookmark },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-[320px] h-screen fixed top-0 left-0 hidden lg:flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden z-[1000]">
      <div className="shrink-0 px-6 pt-6 pb-5 border-b border-[#E5E7EB]">
        <div className="text-[10px] font-semibold text-[#64748B] tracking-[0.15em] uppercase mb-1.5 font-['Inter']">
          PUSAT AKTIVITAS
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#2D5D7B] flex items-center justify-center shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[28px] font-bold text-[#1E293B] font-['Poppins'] leading-none whitespace-nowrap">
            Psy<span className="text-[#2D5D7B]">Oasis</span>
          </span>
        </div>
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
                  className={`flex items-center gap-3.5 pl-6 pr-4 rounded-[12px] text-sm transition-all duration-200 font-['Inter'] whitespace-nowrap ${
                    isActive
                      ? 'bg-[#C7F0E8] text-[#2D5D7B] font-semibold'
                      : 'text-[#64748B] hover:bg-[#EAF9F7] hover:text-[#1E293B]'
                  }`}
                  style={{ height: '52px' }}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? 'text-[#2D5D7B]' : 'text-[#94A3B8]'
                  }`} />
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 px-4 py-5 border-t border-[#E5E7EB] space-y-3">
        <button
          onClick={() => router.push('/booking')}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-[#2D5D7B] text-white rounded-full text-sm font-semibold hover:bg-[#244A63] transition-all duration-200 shadow-sm font-['Inter'] whitespace-nowrap"
        >
          <CalendarPlus className="w-4 h-4 shrink-0" />
          <span>Booking Konsultasi</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-[#64748B] hover:text-[#EF4444] rounded-[12px] text-sm font-medium hover:bg-red-50 transition-all duration-200 font-['Inter'] whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}