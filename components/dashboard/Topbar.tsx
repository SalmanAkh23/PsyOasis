import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Search, Bell, Menu } from 'lucide-react';
import { getUnreadNotificationCount } from '../../lib/db';

export default function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUnreadNotificationCount(user.uid).then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => {
      getUnreadNotificationCount(user.uid).then(setUnreadCount).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SS';
  const photoURL = user?.photoURL;

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      router.push(`/dashboard/konsultasi?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="w-full h-[80px] bg-white border-b border-[#c4c6d4] flex items-center justify-between px-8 shrink-0 sticky top-0 z-[100]">
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <button className="lg:hidden p-2 rounded-[12px] text-[#434652] hover:bg-[#f2f4f5] transition-colors shrink-0" onClick={onOpenSidebar}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center w-full max-w-[520px] h-[48px] bg-[#f2f4f5] rounded-full shrink-0 focus-within:ring-2 focus-within:ring-[#BFE7E7] focus-within:bg-white transition-all">
          <div className="flex items-center justify-center pl-4 pr-3">
            <Search className="w-[18px] h-[18px] text-[#747783]" />
          </div>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Cari layanan, artikel, atau psikolog..."
            className="flex-1 h-full bg-transparent pr-4 text-sm text-[#1a1c1e] placeholder-[#747783] outline-none border-none font-['Inter']"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6 shrink-0">
        <button
          onClick={() => router.push('/dashboard/notifikasi')}
          className="relative p-2.5 rounded-[12px] text-[#434652] hover:bg-[#f2f4f5] transition-colors shrink-0"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <span className="text-sm text-[#434652] font-['Inter'] hidden sm:inline whitespace-nowrap">Notifikasi</span>

        <div className="w-px h-8 bg-[#c4c6d4] shrink-0" />

        <button onClick={() => router.push('/profile')} className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[#002768] font-['Inter'] whitespace-nowrap">Premium Member</div>
            <div className="text-xs text-[#434652] font-['Inter'] truncate max-w-[120px]">{user?.displayName || user?.email || 'User'}</div>
          </div>
          {photoURL ? (
            <img
              src={photoURL}
              alt="avatar"
              className="w-10 h-10 rounded-[12px] object-cover shadow-sm shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-[12px] bg-[#002768] flex items-center justify-center text-white text-sm font-bold font-['Inter'] shadow-sm shrink-0">
              {initials}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}