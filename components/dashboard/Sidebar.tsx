import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const items = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Konsultasi Saya', href: '/dashboard/konsultasi' },
    { label: 'Riwayat Konsultasi', href: '/dashboard/riwayat' },
    { label: 'Psikolog Favorit', href: '/dashboard/favorit' },
    { label: 'Notifikasi', href: '/dashboard/notifikasi' },
    { label: 'Artikel Tersimpan', href: '/dashboard/artikel' },
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Pengaturan', href: '/dashboard/pengaturan' },
  ];

  return (
    <aside className="w-64 h-full hidden md:block bg-white/70 border-r border-[#709085]/10 p-4">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <div className="text-sm font-semibold text-[#4A7A96] uppercase">Pusat Aktivitas</div>
          <div className="text-lg font-bold text-[#2D3732]">PsyOasis</div>
        </div>
        <nav className="flex-1">
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="block px-3 py-2 rounded-lg text-sm text-[#2D3732]/80 hover:bg-[#F7F9F6] hover:text-[#2D3732]">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-xs text-[#2D3732]/50 mt-6">© PsyOasis</div>
      </div>
    </aside>
  );
}
