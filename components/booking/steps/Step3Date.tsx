import React from 'react';
import { mockDates } from '../../../data/mockData';

interface Step3Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3Date({ selectedDate, onSelect, onNext, onPrev }: Step3Props) {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Tanggal</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Kapan Anda ingin melakukan sesi konsultasi?</p>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {mockDates.map((d) => {
          const sel = selectedDate === d.fullDate;
          return (
            <div
              key={d.fullDate}
              onClick={() => onSelect(d.fullDate)}
              className={`relative cursor-pointer py-4 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                sel
                  ? 'border-[#4A7A96] bg-[#4A7A96]/10 shadow-[0_0_15px_rgba(74,122,150,0.15)]'
                  : 'border-[#D9E2DC] bg-white hover:border-[#4A7A96]/30 hover:shadow-sm'
              }`}
            >
              {sel && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#4A7A96] rounded-full flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-[10px] text-[#2D3732]/50 uppercase font-space tracking-wider mb-1">{d.dayName.substring(0, 3)}</span>
              <span className={`text-2xl font-extrabold font-space ${sel ? 'text-[#4A7A96]' : 'text-[#2D3732]'}`}>
                {d.dateNumber}
              </span>
              <span className="text-[10px] text-[#2D3732]/50 uppercase font-space tracking-wider mt-1">{d.monthName}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-[#4A7A96]/6 border border-[#4A7A96]/15 p-4 rounded-xl mb-8 flex items-start gap-3">
        <span className="text-[#4A7A96] mt-0.5">ℹ️</span>
        <p className="text-xs text-[#2D3732]/60 leading-relaxed font-light">
          Hanya tanggal yang tersedia untuk psikolog yang Anda pilih yang akan ditampilkan di sini. Jadwal ditampilkan dalam zona waktu Anda saat ini.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#709085] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedDate
              ? 'bg-[#4A7A96] text-white hover:bg-[#3D6B82] shadow-sm'
              : 'bg-[#D9E2DC] text-[#2D3732]/30 cursor-not-allowed'
          }`}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
