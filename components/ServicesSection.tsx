import React from 'react';
import { UserIcon, HeartIcon, UsersIcon, AcademicCapIcon, FaceSmileIcon, ShieldCheckIcon, SparklesIcon, BriefcaseIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';


const services = [
  {
    title: 'Konseling Individu',
    desc: 'Bantu dirimu mengeksplorasi emosi dan rintangan pribadi bersama psikolog pilihan secara privat.',
    icon: <UserIcon className="w-6 h-6" />,
    accent: '#315ab4',
  },
  {
    title: 'Konseling Pernikahan',
    desc: 'Bangun harmoni, perbaiki komunikasi, dan temukan solusi terbaik untuk hubungan pasutri.',
    icon: <HeartIcon className="w-6 h-6" />,
    accent: '#006d31',
  },
  {
    title: 'Konseling Keluarga',
    desc: 'Harmonisasikan hubungan antar anggota keluarga dan atasi konflik domestik secara bijaksana.',
    icon: <UsersIcon className="w-6 h-6" />,
    accent: '#315ab4',
  },
  {
    title: 'Konseling Remaja',
    desc: 'Bimbingan khusus untuk mengatasi fase pencarian jati diri, tekanan sosial, dan akademis.',
    icon: <AcademicCapIcon className="w-6 h-6" />,
    accent: '#006d31',
  },
  {
    title: 'Anxiety Therapy',
    desc: 'Atasi kecemasan berlebih, serangan panik, dan temukan ketenangan batin yang sejati.',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    accent: '#315ab4',
  },
  {
    title: 'Depression Therapy',
    desc: 'Mari temukan kembali harapan dan semangat hidup melalui metode terapi kognitif teruji.',
    icon: <SparklesIcon className="w-6 h-6" />,
    accent: '#006d31',
  },
  {
    title: 'Burnout Recovery',
    desc: 'Kembalikan energi dan motivasi Anda untuk menghadapi tuntutan hidup dengan lebih baik.',
    icon: <Cog8ToothIcon className="w-6 h-6" />,

    accent: '#315ab4',
  },
  {
    title: 'Career Counseling',
    desc: 'Dapatkan panduan profesional untuk meraih potensi karier maksimal dan mengatasi tantangan pekerjaan.',
    icon: <BriefcaseIcon className="w-6 h-6" />,
    accent: '#006d31',
  },
  {
    title: 'Konseling Anak',
    desc: 'Dukung tumbuh kembang optimal anak melalui pendekatan psikologis yang tepat dan ramah anak.',
    icon: <FaceSmileIcon className="w-6 h-6" />,
    accent: '#315ab4',
  },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="py-20 relative">
      
      {/* Decorative ambient separator */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#006d31]/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center md:text-left mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#315ab4] mb-2 font-space">
            What We Do Best
          </div>
          <h3 className="text-3xl font-extrabold font-space text-[#1a1c1e]">
            Layanan Utama Kami
          </h3>
          <p className="text-sm text-[#1a1c1e]/60 mt-2 max-w-xl">
            Pilihlah spesialisasi layanan konseling yang sesuai dengan kebutuhan kesehatan mental Anda hari ini.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-[#006d31]/15 hover:border-[#315ab4]/30 hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(74,122,150,0.12)] cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl bg-[#F7F9F6] flex items-center justify-center mb-5 border border-[#006d31]/20 shadow-sm" style={{ color: s.accent }}>
                  {s.icon}
                </div>
                
                {/* Title */}
                <h4 className="text-lg font-bold text-[#1a1c1e] font-space mb-2">
                  {s.title}
                </h4>
                
                {/* Description */}
                <p className="text-xs md:text-sm text-[#1a1c1e]/60 leading-relaxed font-light mb-6">
                  {s.desc}
                </p>
              </div>

              {/* Read more Link */}
              <div className="mt-auto flex justify-end">
                <button
                  onClick={() => { /* Implement navigation to service details */ }}
                  className="px-4 py-2 bg-[#315ab4] text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(74,122,150,0.2)] hover:bg-[#3D6B82] hover:shadow-[0_4px_20px_rgba(74,122,150,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-xs"
                >
                  Pelajari Selengkapnya â†’
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
