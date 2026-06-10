import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 bg-transparent">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 bg-white/60 rounded-md" onClick={onOpenSidebar}>☰</button>
        <div>
          <div className="text-xs text-[#4A7A96] uppercase font-space">Selamat Datang</div>
          <div className="text-lg font-bold text-[#2D3732]">{user?.displayName || user?.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard/notifikasi')} className="px-3 py-2 rounded-lg bg-white/70">Notifikasi</button>
        <button onClick={() => router.push('/dashboard/konsultasi')} className="px-3 py-2 rounded-lg bg-[#4A7A96] text-white">Booking</button>
      </div>
    </header>
  );
}
