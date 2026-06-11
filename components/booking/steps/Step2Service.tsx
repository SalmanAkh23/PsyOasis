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
        {mockServices.map((s) => {
          const sel = selectedId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s.id, s.title)}
              className={`relative cursor-pointer p-5 rounded-2xl transition-all duration-300 border ${
                sel
                  ? 'border-[#4A7A96] bg-[#4A7A96]/6 shadow-[0_0_20px_rgba(74,122,150,0.12)]'
                  : 'border-[#D9E2DC] bg-white hover:border-[#4A7A96]/30 hover:shadow-sm'
              }`}
            >
              {sel && (
                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-1 bg-[#4A7A96] text-white text-[10px] font-bold rounded-lg shadow-sm font-space tracking-wide">
                  Dipilih
                </div>
              )}

              <div className="w-10 h-10 rounded-xl bg-[#F7F9F6] border border-[#D9E2DC] flex items-center justify-center text-xl mb-3 shadow-sm">
                {s.icon}
              </div>
              <h4 className="text-[#2D3732] font-bold font-space text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-[#2D3732]/55 leading-relaxed font-light">{s.desc}</p>
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
          disabled={!selectedId}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            selectedId
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
