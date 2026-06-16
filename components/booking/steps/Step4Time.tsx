import React, { useEffect, useState } from 'react';
import { getWeeklySchedule, getBookedTimes } from '../../../lib/db-psikolog';

interface Step4Props {
  psychologistId: string;
  selectedDate: string;
  selectedTime: string;
  onSelect: (time: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let h = sh, m = sm;
  while (h < eh || (h === eh && m < em)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 60;
    if (m >= 60) { h += 1; m -= 60; }
  }
  return slots;
}

export default function Step4Time({ psychologistId, selectedDate, selectedTime, onSelect, onNext, onPrev }: Step4Props) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!psychologistId || !selectedDate) return;
    console.log('[Step4Time] psychologistId:', psychologistId, 'selectedDate:', selectedDate);
    setLoading(true);

    Promise.all([
      getWeeklySchedule(psychologistId).catch((e) => { console.error('[Step4Time] getWeeklySchedule error:', e); return []; }),
      getBookedTimes(psychologistId, selectedDate).catch((e) => { console.error('[Step4Time] getBookedTimes error:', e); return []; }),
    ]).then(([schedule, booked]) => {
      const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
      console.log('[Step4Time] schedule:', JSON.stringify(schedule), 'dayOfWeek:', dayOfWeek, 'booked:', booked);
      const daySchedule = schedule.find((s: any) => s.dayOfWeek === dayOfWeek && s.isAvailable);
      console.log('[Step4Time] daySchedule found:', !!daySchedule, daySchedule);

      if (daySchedule) {
        const allSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
        const bookedSet = new Set(booked);
        const free = allSlots.filter((t) => !bookedSet.has(t));
        console.log('[Step4Time] allSlots:', allSlots, 'free:', free);
        setAvailableTimes(free);
      } else {
        console.log('[Step4Time] NO daySchedule found — schedule empty or day not available');
        setAvailableTimes([]);
      }
    }).finally(() => setLoading(false));
  }, [psychologistId, selectedDate]);

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Pilih Jam</h3>
      <p className="text-[#1a1c1e]/55 mb-2 text-sm">Pilih waktu yang tersedia untuk jadwal Anda.</p>
      {!loading && (
        <p className="text-xs text-[#315ab4] mb-8 font-medium">
          {availableTimes.length} slot tersedia untuk tanggal ini
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#315ab4]/30 border-t-[#315ab4] animate-spin" />
        </div>
      ) : availableTimes.length === 0 ? (
        <div className="text-center py-12 text-[#1a1c1e]/50 mb-8">
          <p className="text-lg font-bold mb-1">Tidak ada slot tersedia</p>
          <p className="text-sm">Psikolog tidak memiliki jadwal pada tanggal ini atau semua slot sudah dibooking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {availableTimes.map((time) => {
            const sel = selectedTime === time;
            const hour = parseInt(time.split(':')[0]);
            const period = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';
            return (
              <div
                key={time}
                onClick={() => onSelect(time)}
                className={`relative cursor-pointer py-3.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border ${
                  sel
                    ? 'border-[#315ab4] bg-[#315ab4]/10 shadow-[0_0_12px_rgba(74,122,150,0.15)]'
                    : 'border-[#D9E2DC] bg-white hover:border-[#315ab4]/30 hover:shadow-sm hover:-translate-y-0.5'
                }`}
              >
                {sel && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#315ab4] rounded-full flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className={`text-sm font-bold font-space ${sel ? 'text-[#315ab4]' : 'text-[#1a1c1e]'}`}>
                  {time}
                </span>
                <span className={`text-[9px] uppercase tracking-wider mt-0.5 ${sel ? 'text-[#315ab4]/60' : 'text-[#1a1c1e]/30'}`}>
                  {period}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedDate && (
        <div className="bg-[#315ab4]/6 border border-[#315ab4]/15 p-4 rounded-xl mb-8 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#315ab4] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[#1a1c1e]/60 leading-relaxed font-light">
            Sesi konsultasi berlangsung selama 45-60 menit. Slot yang sudah dibooking tidak ditampilkan.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#006d31] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTime}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedTime
              ? 'bg-[#315ab4] text-white hover:bg-[#3D6B82] shadow-sm active:scale-[0.98]'
              : 'bg-[#D9E2DC] text-[#1a1c1e]/30 cursor-not-allowed'
          }`}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}