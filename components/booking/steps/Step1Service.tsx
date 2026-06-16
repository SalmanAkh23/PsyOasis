import React, { useEffect, useState } from 'react';
import { getPsychologists } from '../../../lib/db-psikolog';
import { services } from '../../../lib/services';

interface Step1Props {
  selectedId: string;
  onSelect: (id: string, title: string) => void;
  onNext: () => void;
}

export default function Step1Service({ selectedId, onSelect, onNext }: Step1Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getPsychologists().then((list) => {
      const map: Record<string, number> = {};
      for (const s of services) {
        map[s.id] = list.filter((p: any) => (p.serviceIds || []).includes(s.id)).length;
      }
      setCounts(map);
    });
  }, []);

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Pilih Layanan</h3>
      <p className="text-[#1a1c1e]/55 mb-8 text-sm">Pilih jenis konseling yang sesuai dengan kebutuhan Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {services.map((s) => {
          const sel = selectedId === s.id;
          const count = counts[s.id] || 0;
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s.id, s.title)}
              className={`relative cursor-pointer p-5 rounded-2xl transition-all duration-300 border ${
                sel
                  ? 'border-[#315ab4] bg-[#315ab4]/6 shadow-[0_0_20px_rgba(74,122,150,0.12)]'
                  : 'border-[#D9E2DC] bg-white hover:border-[#315ab4]/30 hover:shadow-sm hover:-translate-y-0.5'
              }`}
            >
              {sel && (
                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-1 bg-[#315ab4] text-white text-[10px] font-bold rounded-lg shadow-sm font-space tracking-wide">
                  Dipilih
                </div>
              )}

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#315ab4]/10 to-[#006d31]/10 border border-[#315ab4]/15 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#315ab4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>

              <h4 className="text-[#1a1c1e] font-bold font-space text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-[#1a1c1e]/55 leading-relaxed font-light mb-3 min-h-[2.5rem]">{s.desc}</p>

              <div className="flex items-center gap-1.5 text-[11px] text-[#315ab4] font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{count} psikolog tersedia</span>
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