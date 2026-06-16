import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

const navItems = [
  { label: 'Overview', href: '/dashboard/portal', icon: 'dashboard' },
  { label: 'Schedule', href: '/dashboard/portal/jadwal', icon: 'calendar_month' },
  { label: 'Working Hours', href: '/dashboard/portal/jadwal-kerja', icon: 'schedule' },
  { label: 'Patient Records', href: '/dashboard/portal/pasien', icon: 'group' },
  { label: 'Messages', href: '/dashboard/portal/pesan', icon: 'chat' },
  { label: 'Earnings', href: '/dashboard/portal/pendapatan', icon: 'payments' },
];

const bottomItems = [
  { label: 'Profil Praktik', href: '/dashboard/portal/profil', icon: 'badge' },
  { label: 'Pengaturan Akun', href: '/dashboard/pengaturan', icon: 'settings' },
];

export default function PortalSidebar() {
  const router = useRouter();
  const { logout, user } = useAuth() as any;
  const isActive = (href: string) => router.pathname === href;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="w-64 h-screen fixed left-0 top-0 bg-surface shadow-sm flex flex-col border-r border-outline-variant/30 z-50">
      <div className="p-6">
        <Link href="/dashboard/portal" className="block">
          <img src="/logo.png" alt="PsyOasis" className="h-16 w-auto object-contain mb-1" />
        </Link>
        <p className="font-label-md text-label-md text-on-surface-variant mt-1">Clinician Portal</p>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => router.push('/dashboard/portal/jadwal?new=1')}
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md active:scale-95 duration-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Appointment
        </button>
      </div>

      <ul className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-label-md text-label-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:bg-surface-container-high font-label-md text-label-md'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto p-4 border-t border-outline-variant/30 space-y-1">
        <ul className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low px-4 py-3 rounded-r-full hover:bg-surface-container-high transition-colors font-label-md text-label-md"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low px-4 py-3 rounded-r-full hover:bg-surface-container-high transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
