import React from 'react';
import { mockPsychologists } from '../../../data/mockData';

interface Step1Props {
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  onNext: () => void;
}

export default function Step1Psychologist({ selectedId, onSelect, onNext }: Step1Props) {
  const isSelected = (id: string) => selectedId === id;

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Pilih Psikolog</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Pilih pakar yang paling sesuai dengan kebutuhan Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {mockPsychologists.map((p) => {
          const sel = isSelected(p.id);
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id, p.name)}
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

              <div className="flex items-start gap-3.5 mb-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${p.avatarBg} relative shadow-sm shrink-0`}>
                  {p.avatarChar}
                  {p.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#709085] rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#2D3732] font-bold font-space text-sm leading-tight">{p.name}</h4>
                  <div className="text-[11px] text-[#4A7A96] font-medium mt-0.5">{p.specialty}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-500 text-[10px]">★ {p.rating}</span>
                    <span className="text-[10px] text-[#2D3732]/50">({p.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-[#F7F9F6] border border-[#D9E2DC] rounded-md text-[10px] text-[#2D3732]/60 font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D9E2DC]">
                <div>
                  <div className="text-[10px] text-[#2D3732]/45 font-space tracking-wide">Biaya Sesi</div>
                  <div className="text-sm font-bold text-[#2D3732] font-space">{p.fee}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(p.id, p.name); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-space transition-all duration-200 ${
                    sel
                      ? 'bg-[#4A7A96] text-white shadow-sm'
                      : 'bg-[#4A7A96] text-white hover:bg-[#3D6B82] shadow-sm'
                  }`}
                >
                  {sel ? '\u2713 Terpilih' : 'Pilih'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
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
