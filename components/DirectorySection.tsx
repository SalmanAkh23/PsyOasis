import React from 'react';
import { useRouter } from 'next/router';

const psychologists = [
  {
    id: 'p1',
    name: 'Dr. Anita Sitorus',
    role: 'Psikolog Klinis Utama',
    fee: 'Rp 300.000',
    experience: '8 Tahun Pengalaman',
    tags: ['Anxiety', 'Depression'],
    avatarGradient: 'from-[#315ab4] to-[#006d31]',
    avatarChar: 'ðŸ‘©â€âš•ï¸'
  },
  {
    id: 'p2',
    name: 'Budi Santoso, M.Psi',
    role: 'Psikolog Hubungan & Pernikahan',
    fee: 'Rp 200.000',
    experience: '5 Tahun Pengalaman',
    tags: ['Marriage', 'Relationship'],
    avatarGradient: 'from-[#006d31] to-[#315ab4]',
    avatarChar: 'ðŸ‘¨â€âš•ï¸'
  },
  {
    id: 'p3',
    name: 'Dr. Rina Pramestya',
    role: 'Psikolog Tumbuh Kembang Anak',
    fee: 'Rp 250.000',
    experience: '6 Tahun Pengalaman',
    tags: ['Youth', 'Family Issues'],
    avatarGradient: 'from-[#315ab4] to-[#2D7A6B]',
    avatarChar: 'ðŸ‘©â€âš•ï¸'
  },
];

export default function DirectorySection() {
  const router = useRouter();
  return (
    <section id="psikolog" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center md:text-left mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#315ab4] mb-2 font-space">
              Expert Guidance
            </div>
            <h3 className="text-3xl font-extrabold font-space text-[#1a1c1e]">
              Daftar Psikolog Profesional
            </h3>
            <p className="text-sm text-[#1a1c1e]/60 mt-2 max-w-xl">
              Hubungi dan jadwalkan sesi bersama konselor berpengalaman kami untuk mendiskusikan apa pun dalam lingkungan aman.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/booking')}
            className="self-start md:self-auto px-5 py-2.5 bg-white/60 border border-[#006d31]/30 text-[#006d31] text-xs rounded-xl hover:bg-white/80 hover:border-[#006d31]/50 transition-all duration-300 font-semibold backdrop-blur-sm"
          >
            Lihat Semua Jadwal
          </button>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {psychologists.map((p) => (
            <div
              key={p.id}
              className="bg-white/65 backdrop-blur-sm p-6 rounded-3xl border border-[#006d31]/15 hover:border-[#315ab4]/30 hover:bg-white/80 hover:shadow-[0_12px_40px_rgba(74,122,150,0.12)] transition-all duration-300 shadow-sm flex flex-col relative group overflow-hidden"
            >
              
              {/* Soft ambient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#315ab4]/5 rounded-full blur-2xl group-hover:bg-[#315ab4]/8 transition-colors" />

              {/* Avatar and Info Header */}
              <div className="flex items-center gap-4 mb-5">
                {/* Clean avatar frame */}
                <div className="relative p-[3px] rounded-2xl bg-gradient-to-tr from-[#315ab4] to-[#006d31] shadow-[0_0_12px_rgba(74,122,150,0.2)]">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${p.avatarGradient}`}>
                    {p.avatarChar}
                  </div>
                  {/* Online Status Indicator */}
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#006d31] rounded-full border-4 border-[#F7F9F6] shadow-sm" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-[#1a1c1e] font-space leading-tight">
                    {p.name}
                  </h4>
                  <div className="text-xs text-[#315ab4] font-medium mt-1">
                    {p.role}
                  </div>
                  <div className="text-[11px] text-[#1a1c1e]/50 mt-0.5">
                    {p.experience}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {p.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#006d31]/10 border border-[#006d31]/25 text-[#006d31] uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Fee & Action */}
              <div className="mt-auto pt-4 border-t border-[#006d31]/12 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#1a1c1e]/45 uppercase tracking-widest font-space">
                    Biaya Sesi
                  </div>
                  <div className="text-base font-extrabold text-[#1a1c1e] font-space mt-0.5">
                    {p.fee} <span className="text-xs font-normal text-[#1a1c1e]/50">/ jam</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/booking')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#315ab4] hover:bg-[#3D6B82] hover:shadow-[0_4px_15px_rgba(74,122,150,0.3)] transition-all duration-300 transform group-hover:scale-105 active:scale-95"
                >
                  Book Konsultasi
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
