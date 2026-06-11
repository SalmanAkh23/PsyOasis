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
        {mockTimes.map((time) => {
          const sel = selectedTime === time;
          return (
            <div
              key={time}
              onClick={() => onSelect(time)}
              className={`relative cursor-pointer py-3 px-2 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                sel
                  ? 'border-[#4A7A96] bg-[#4A7A96]/10 shadow-[0_0_12px_rgba(74,122,150,0.15)]'
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
              <span className={`text-sm font-bold font-space ${sel ? 'text-[#4A7A96]' : 'text-[#2D3732]'}`}>
                {time}
              </span>
            </div>
          );
        })}
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
          disabled={!selectedTime}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedTime
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
