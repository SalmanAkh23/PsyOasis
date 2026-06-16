import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getPsychologistByUserId,
  getWeeklySchedule,
  upsertSchedule,
  getTimeOff,
  addTimeOff,
  removeTimeOff,
} from '../../../lib/db-psikolog';
import PortalLayout from '../../../components/dashboard/portal/Layout';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalKerja() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [timeOff, setTimeOff] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState('');
  const [newTimeOffReason, setNewTimeOffReason] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) {
        setPsychologistId(prof.id);
        Promise.all([
          getWeeklySchedule(prof.id),
          getTimeOff(prof.id),
        ]).then(([sched, off]) => {
          setSchedule(sched as any[]);
          setTimeOff(off as any[]);
        }).finally(() => setDataLoading(false));
      }
    });
  }, [user]);

  const handleToggleDay = (dayIdx: number) => {
    setSchedule((prev) => {
      const existing = prev.find((s: any) => s.dayOfWeek === dayIdx);
      if (existing) {
        return prev.map((s: any) =>
          s.dayOfWeek === dayIdx ? { ...s, isAvailable: !s.isAvailable } : s
        );
      }
      return [...prev, { dayOfWeek: dayIdx, startTime: '08:00', endTime: '17:00', isAvailable: true }];
    });
  };

  const handleTimeChange = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => {
      const existing = prev.find((s: any) => s.dayOfWeek === dayIdx);
      if (existing) {
        return prev.map((s: any) =>
          s.dayOfWeek === dayIdx ? { ...s, [field]: value } : s
        );
      }
      return [...prev, { dayOfWeek: dayIdx, startTime: '08:00', endTime: '17:00', isAvailable: true, [field]: value }];
    });
  };

  const handleSave = async () => {
    if (!psychologistId) return;
    setSaving(true);
    try {
      for (const s of schedule) {
        await upsertSchedule({
          psychologist_id: psychologistId,
          day_of_week: s.dayOfWeek,
          start_time: s.startTime,
          end_time: s.endTime,
          is_available: s.isAvailable,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save schedule error:', err);
    }
    setSaving(false);
  };

  const handleAddTimeOff = async () => {
    if (!psychologistId || !newTimeOff) return;
    try {
      await addTimeOff(psychologistId, newTimeOff, newTimeOffReason);
      const updated = await getTimeOff(psychologistId);
      setTimeOff(updated as any[]);
      setNewTimeOff('');
      setNewTimeOffReason('');
    } catch (err) {
      console.error('Add time off error:', err);
    }
  };

  const handleRemoveTimeOff = async (id: string) => {
    try {
      await removeTimeOff(id);
      setTimeOff((prev) => prev.filter((t: any) => t.id !== id));
    } catch (err) {
      console.error('Remove time off error:', err);
    }
  };

  if (loading || !user) return null;

  return (
    <PortalLayout title="Jadwal Kerja" doctorName={user?.displayName || 'Dr. Smith'}>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1c1e] font-['Poppins']">Jadwal Kerja</h2>
          <p className="text-sm text-[#434652] mt-1">Atur jam praktik dan hari libur Anda.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !psychologistId}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#002768] text-white hover:bg-[#003b95] active:scale-[0.98]'
          } disabled:opacity-50`}
        >
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Jadwal'}
        </button>
      </header>

      {dataLoading ? (
        <div className="flex items-center justify-center h-40 text-[#434652]">Memuat...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-[#c4c6d4] p-6">
            <h3 className="text-lg font-bold text-[#1a1c1e] font-['Poppins'] mb-5">Jam Kerja Mingguan</h3>
            <div className="space-y-3">
              {DAYS.map((day, idx) => {
                const s = schedule.find((s: any) => s.dayOfWeek === idx);
                const available = s ? s.isAvailable : false;
                const startTime = s?.startTime || '08:00';
                const endTime = s?.endTime || '17:00';
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-[#eeeef0] border border-[#c4c6d4]">
                    <label className="flex items-center gap-3 min-w-[100px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={() => handleToggleDay(idx)}
                        className="w-5 h-5 rounded accent-[#002768]"
                      />
                      <span className="text-sm font-semibold text-[#1a1c1e]">{day}</span>
                    </label>
                    {available ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30"
                        />
                        <span className="text-[#434652]">â€”</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-[#747783] italic">Libur</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#c4c6d4] p-6">
            <h3 className="text-lg font-bold text-[#1a1c1e] font-['Poppins'] mb-5">Hari Libur Khusus</h3>
            <div className="flex items-end gap-3 mb-6 flex-wrap">
              <div>
                <label className="block text-xs text-[#434652] mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newTimeOff}
                  onChange={(e) => setNewTimeOff(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30"
                />
              </div>
              <div>
                <label className="block text-xs text-[#434652] mb-1">Alasan (opsional)</label>
                <input
                  type="text"
                  value={newTimeOffReason}
                  onChange={(e) => setNewTimeOffReason(e.target.value)}
                  placeholder="Cuti, seminar, dll."
                  className="px-4 py-2.5 rounded-xl border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30 w-48"
                />
              </div>
              <button
                onClick={handleAddTimeOff}
                disabled={!newTimeOff}
                className="px-5 py-2.5 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all disabled:opacity-50"
              >
                Tambah
              </button>
            </div>
            {timeOff.length === 0 ? (
              <p className="text-sm text-[#747783]">Belum ada hari libur khusus.</p>
            ) : (
              <div className="space-y-2">
                {timeOff.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#eeeef0] border border-[#c4c6d4]">
                    <div>
                      <span className="text-sm font-medium text-[#1a1c1e]">
                        {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {t.reason && <span className="text-sm text-[#434652] ml-2">â€” {t.reason}</span>}
                    </div>
                    <button
                      onClick={() => handleRemoveTimeOff(t.id)}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; }
      `}</style>
    </PortalLayout>
  );
}
