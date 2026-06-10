import React from 'react';
import { mockServices } from '../../../data/mockData';

interface Step2Props {
  selectedId: string;
  onSelect: (id: string, title: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Service({ selectedId, onSelect, onNext, onPrev }: Step2Props) {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Layanan</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Fokuskan sesi Anda pada area spesifik yang ingin dibahas.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {mockServices.map((s) => (
          <div 
            key={s.id}
            onClick={() => onSelect(s.id, s.title)}
            className={`cursor-pointer p-5 rounded-2xl transition-all duration-300 border ${
              selectedId === s.id 
                ? 'border-[#709085] bg-[#709085]/8 shadow-[0_0_20px_rgba(112,144,133,0.15)] scale-[1.02]' 
                : 'border-[#709085]/15 bg-white/60 hover:border-[#709085]/30 hover:bg-white/80 hover:shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#F7F9F6] border border-[#709085]/20 flex items-center justify-center text-xl mb-3 shadow-sm">
              {s.icon}
            </div>
            <h4 className="text-[#2D3732] font-bold font-space text-sm mb-1">{s.title}</h4>
            <p className="text-xs text-[#2D3732]/55 leading-relaxed font-light">{s.desc}</p>
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
          disabled={!selectedId}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedId 
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
