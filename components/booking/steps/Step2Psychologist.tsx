import React, { useEffect, useState } from 'react';
import { getPsychologists } from '../../../lib/db-psikolog';

const services = [
  { id: 's1', title: 'Konseling Individu' },
  { id: 's2', title: 'Konseling Pernikahan' },
  { id: 's3', title: 'Konseling Keluarga' },
  { id: 's4', title: 'Konseling Remaja' },
  { id: 's5', title: 'Konseling Anak' },
  { id: 's6', title: 'Anxiety Therapy' },
  { id: 's7', title: 'Depression Therapy' },
  { id: 's8', title: 'Burnout Recovery' },
  { id: 's9', title: 'Career Counseling' },
];

const avatarColors = [
  'from-purple-500 to-indigo-600',
  'from-cyan-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-500 to-purple-600',
  'from-amber-400 to-orange-600',
];

interface Step2Props {
  serviceId: string;
  selectedId: string;
  onSelect: (id: string, name: string, fee: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Psychologist({ serviceId, selectedId, onSelect, onNext, onPrev }: Step2Props) {
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [loadingPsy, setLoadingPsy] = useState(true);

  useEffect(() => {
    setLoadingPsy(true);
    getPsychologists().then((list) => {
      const filtered = list.filter((p: any) =>
        (p.serviceIds || []).includes(serviceId)
      );
      setPsychologists(filtered);
    }).finally(() => setLoadingPsy(false));
  }, [serviceId]);

  const service = services.find((s) => s.id === serviceId);

  if (loadingPsy) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#315ab4]/30 border-t-[#315ab4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <span className="px-2.5 py-1 bg-[#315ab4]/10 text-[#315ab4] text-[10px] font-bold rounded-lg font-space tracking-wide">
          {service?.title}
        </span>
      </div>
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Pilih Psikolog</h3>
      <p className="text-[#1a1c1e]/55 mb-8 text-sm">
        {psychologists.length} psikolog tersedia untuk layanan <strong className="text-[#1a1c1e]">{service?.title}</strong>
      </p>

      {psychologists.length === 0 && (
        <div className="text-center py-12 text-[#1a1c1e]/50">
          <p className="text-lg font-bold mb-1">Belum ada psikolog</p>
          <p className="text-sm">Belum tersedia psikolog untuk layanan ini. Silakan pilih layanan lain.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {psychologists.map((p, idx) => {
          const sel = selectedId === p.id;
          const initial = (p.name || p.displayName || '?').charAt(0).toUpperCase();
          const colorIdx = idx % avatarColors.length;
          const tags = p.tags || [];
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id, p.name || p.displayName || 'Psikolog', p.fee || '')}
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

              <div className="flex items-start gap-3.5 mb-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${avatarColors[colorIdx]} relative shadow-sm shrink-0`}>
                  {initial}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#1a1c1e] font-bold font-space text-sm leading-tight">{p.name || p.displayName}</h4>
                  <div className="text-[11px] text-[#315ab4] font-medium mt-0.5">{p.specialty || 'Psikolog'}</div>
                  {p.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-500 text-[10px]">★ {p.rating}</span>
                      {p.reviewsCount > 0 && (
                        <span className="text-[10px] text-[#1a1c1e]/50">({p.reviewsCount} review)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 bg-[#F7F9F6] border border-[#D9E2DC] rounded-md text-[10px] text-[#1a1c1e]/60 font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D9E2DC]">
                <div>
                  <div className="text-[10px] text-[#1a1c1e]/45 font-space tracking-wide">Biaya Sesi</div>
                  <div className="text-sm font-bold text-[#1a1c1e] font-space">{p.fee || 'Rp -'}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(p.id, p.name || p.displayName || 'Psikolog', p.fee || ''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-space transition-all duration-200 ${
                    sel
                      ? 'bg-[#315ab4] text-white shadow-sm'
                      : 'bg-[#315ab4] text-white hover:bg-[#3D6B82] shadow-sm'
                  }`}
                >
                  {sel ? '✓ Terpilih' : 'Pilih'}
                </button>
              </div>
            </div>
          );
        })}
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