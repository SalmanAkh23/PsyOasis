import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { getUnreadNotificationCount } from '../../../lib/db';
import { supabase } from '../../../lib/supabase';
import { getPsychologistByUserId, getPsychologistProfile } from '../../../lib/db-psikolog';

interface Props {
  doctorName?: string;
}

export default function PortalTopbar({ doctorName }: Props) {
  const router = useRouter();
  const { user } = useAuth() as any;
  const [unreadCount, setUnreadCount] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const displayName = doctorName || user?.displayName || user?.name || 'Dr. Smith';
  const initial = displayName.charAt(0) || 'D';

  const fetchUnread = async () => {
    if (!user) return;
    let count = await getUnreadNotificationCount(user.uid);
    if (psychologistId) {
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('psychologist_id', psychologistId)
        .eq('status', 'menunggu');
      count += pendingCount || 0;
    }
    setUnreadCount(count);
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, psychologistId]);

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) {
        setPsychologistId(prof.id);
        getPsychologistProfile(prof.id).then((p) => {
          if (p?.photoUrl) setPhotoUrl(p.photoUrl);
        });
      }
    });
  }, [user]);

  return (
    <header className="bg-surface-bright border-b border-outline-variant/30 flex justify-between items-center px-margin-desktop h-16 z-40 sticky top-0 w-full">
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-2 w-64 border border-transparent focus-within:border-primary focus-within:bg-surface transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            className="bg-transparent border-none outline-none font-body-md text-body-md w-full placeholder:text-outline text-on-surface focus:ring-0 p-0"
            placeholder="Cari pasien..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/dashboard/notifikasi')}
          className="text-on-surface-variant hover:text-primary transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button
          onClick={() => router.push('/dashboard/portal/profil')}
          className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant/30 flex items-center justify-center text-on-primary-container font-label-sm font-bold hover:ring-2 hover:ring-primary transition-all shrink-0"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </div>
    </header>
  );
}