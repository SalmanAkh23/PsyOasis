import React from 'react';
import { mockPsychologists } from '../../../data/mockData';

interface Step1Props {
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  onNext: () => void;
}

export default function Step1Psychologist({ selectedId, onSelect, onNext }: Step1Props) {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Psikolog</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Pilih pakar yang paling sesuai dengan kebutuhan Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {mockPsychologists.map((p) => (
          <div 
            key={p.id}
            onClick={() => onSelect(p.id, p.name)}
            className={`cursor-pointer p-5 rounded-2xl transition-all duration-300 border ${
              selectedId === p.id 
                ? 'border-[#4A7A96] bg-[#4A7A96]/8 shadow-[0_0_20px_rgba(74,122,150,0.15)] scale-[1.02]' 
                : 'border-[#709085]/15 bg-white/60 hover:border-[#709085]/30 hover:bg-white/80 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${p.avatarBg} relative shadow-sm`}>
                {p.avatarChar}
                {p.status === 'online' && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#709085] rounded-full border-2 border-[#F7F9F6]" />
                )}
              </div>
              <div>
                <h4 className="text-[#2D3732] font-bold font-space text-sm leading-tight">{p.name}</h4>
                <div className="text-[11px] text-[#4A7A96] font-medium mt-0.5">{p.specialty}</div>
                <div className="text-[10px] text-[#2D3732]/50 flex items-center gap-1 mt-1">
                  <span className="text-amber-500">★ {p.rating}</span> ({p.reviews})
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-[#709085]/10 border border-[#709085]/20 rounded-md text-[10px] text-[#709085] font-medium">{tag}</span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#709085]/12">
              <span className="text-[10px] text-[#2D3732]/45">Biaya Sesi</span>
              <span className="text-sm font-bold text-[#2D3732] font-space">{p.fee}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
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
