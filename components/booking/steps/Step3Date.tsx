import React from 'react';
import { mockDates } from '../../../data/mockData';

interface Step3Props {
  selectedDate: string; // the fullDate
  onSelect: (date: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3Date({ selectedDate, onSelect, onNext, onPrev }: Step3Props) {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Tanggal</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Kapan Anda ingin melakukan sesi konsultasi?</p>

      {/* Modern horizontal date scroller / grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {mockDates.map((d) => (
          <div 
            key={d.fullDate}
            onClick={() => onSelect(d.fullDate)}
            className={`cursor-pointer py-4 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
              selectedDate === d.fullDate 
                ? 'border-[#4A7A96] bg-[#4A7A96]/10 shadow-[0_0_15px_rgba(74,122,150,0.15)] scale-[1.05]' 
                : 'border-[#709085]/15 bg-white/60 hover:border-[#709085]/30 hover:bg-white/80 hover:shadow-sm'
            }`}
          >
            <span className="text-[10px] text-[#2D3732]/50 uppercase font-space tracking-wider mb-1">{d.dayName.substring(0,3)}</span>
            <span className={`text-2xl font-extrabold font-space ${selectedDate === d.fullDate ? 'text-[#4A7A96]' : 'text-[#2D3732]'}`}>
              {d.dateNumber}
            </span>
            <span className="text-[10px] text-[#2D3732]/50 uppercase font-space tracking-wider mt-1">{d.monthName}</span>
          </div>
        ))}
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
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#709085] bg-white/60 border border-[#709085]/25 hover:bg-white/80 hover:border-[#709085]/40 transition-all duration-300"
        >
          Kembali
        </button>
        <button 
          onClick={onNext}
          disabled={!selectedDate}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedDate 
              ? 'bg-[#4A7A96] text-white hover:bg-[#3D6B82] hover:shadow-[0_4px_15px_rgba(74,122,150,0.3)] hover:scale-105' 
              : 'bg-[#709085]/15 text-[#2D3732]/30 cursor-not-allowed'
          }`}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
