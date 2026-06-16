import React, { useEffect, useState } from 'react';
import { getWeeklySchedule, getTimeOff } from '../../../lib/db-psikolog';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface Step3Props {
  psychologistId: string;
  selectedDate: string;
  selectedDisplay: string;
  onSelect: (date: string, display: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3Date({ psychologistId, selectedDate, selectedDisplay, onSelect, onNext, onPrev }: Step3Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [availableDaySet, setAvailableDaySet] = useState<Set<number>>(new Set());
  const [timeOffDates, setTimeOffDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!psychologistId) return;
    setLoading(true);
    Promise.all([
      getWeeklySchedule(psychologistId),
      getTimeOff(psychologistId),
    ]).then(([schedule, timeOff]) => {
      const days = new Set<number>();
      for (const s of schedule) {
        if (s.isAvailable) days.add(s.dayOfWeek);
      }
      setAvailableDaySet(days);
      setTimeOffDates((timeOff || []).map((t: any) => t.date));
    }).finally(() => setLoading(false));
  }, [psychologistId]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else { setViewMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else { setViewMonth(m => m + 1); }
  };

  const handleSelect = (iso: string, display: string) => {
    onSelect(iso, display);
  };

  const renderCalendar = () => {
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const iso = date.toISOString().split('T')[0];
      const isPast = date <= today;
      const isSel = selectedDate === iso;
      const dayOfWeek = date.getDay();
      const hasSchedule = availableDaySet.has(dayOfWeek);
      const isTimeOff = timeOffDates.includes(iso);
      const enabled = !isPast && hasSchedule && !isTimeOff;

      cells.push(
        <div
          key={iso}
          onClick={() => enabled && handleSelect(iso, `${day} ${MONTHS[viewMonth]} ${viewYear}`)}
          className={`relative py-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-sm ${
            isSel
              ? 'bg-[#315ab4] text-white shadow-[0_0_12px_rgba(74,122,150,0.3)] font-bold'
              : enabled
                ? 'cursor-pointer hover:border-[#315ab4]/30 hover:shadow-sm border border-transparent text-[#1a1c1e] font-medium'
                : 'text-[#1a1c1e]/20 cursor-not-allowed'
          }`}
        >
          <span className={`text-[10px] uppercase tracking-wider ${isSel ? 'text-white/70' : ''}`}>
            {DAYS[dayOfWeek]}
          </span>
          <span className="text-lg font-bold">{day}</span>
          {isSel && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-[#315ab4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Pilih Tanggal</h3>
      <p className="text-[#1a1c1e]/55 mb-8 text-sm">Pilih tanggal yang tersedia untuk sesi konsultasi Anda.</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#315ab4]/30 border-t-[#315ab4] animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              disabled={viewMonth === today.getMonth() && viewYear === today.getFullYear()}
              className="w-9 h-9 rounded-xl border border-[#D9E2DC] flex items-center justify-center hover:bg-[#F7F9F6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1a1c1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-base font-bold font-space text-[#1a1c1e]">
              {MONTHS[viewMonth]} {viewYear}
            </h4>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl border border-[#D9E2DC] flex items-center justify-center hover:bg-[#F7F9F6] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1a1c1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-[#1a1c1e]/40 font-space font-bold uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      )}

      <div className="bg-[#315ab4]/6 border border-[#315ab4]/15 p-4 rounded-xl mb-8 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#315ab4] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[#1a1c1e]/60 leading-relaxed font-light">
          Hanya tanggal dengan jadwal kerja psikolog yang ditampilkan.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#006d31] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedDate
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