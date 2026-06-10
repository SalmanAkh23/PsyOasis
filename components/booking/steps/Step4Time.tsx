import React from 'react';
import { mockTimes } from '../../../data/mockData';

interface Step4Props {
  selectedTime: string;
  onSelect: (time: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step4Time({ selectedTime, onSelect, onNext, onPrev }: Step4Props) {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Jam</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Pilih waktu yang tersedia untuk jadwal yang telah dipilih.</p>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {mockTimes.map((time) => (
          <div 
            key={time}
            onClick={() => onSelect(time)}
            className={`cursor-pointer py-3 px-2 rounded-xl flex items-center justify-center transition-all duration-300 border ${
              selectedTime === time 
                ? 'border-[#709085] bg-[#709085]/10 shadow-[0_0_12px_rgba(112,144,133,0.15)] scale-[1.05]' 
                : 'border-[#709085]/15 bg-white/60 hover:border-[#709085]/30 hover:bg-white/80 hover:shadow-sm'
            }`}
          >
            <span className={`text-sm font-bold font-space ${selectedTime === time ? 'text-[#709085]' : 'text-[#2D3732]'}`}>
              {time}
            </span>
          </div>
        ))}
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
          disabled={!selectedTime}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedTime 
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
