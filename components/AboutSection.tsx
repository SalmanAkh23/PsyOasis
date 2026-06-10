import React from 'react';

// Icon placeholders – simple SVGs for visual consistency
const icons = {
  confidentiality: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#4A7A96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v4h-6v-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11V9a6 6 0 1112 0v2" />
    </svg>
  ),
  professional: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#709085]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0118 21.5" />
    </svg>
  ),
  accessibility: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#4A7A96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l4 4 8-8" />
    </svg>
  ),
  humanCentered: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#709085]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

const highlights = [
  {
    title: 'Kerahasiaan Terjamin',
    desc: 'Privasi dan keamanan setiap konsultasi menjadi prioritas utama kami.',
    icon: icons.confidentiality,
  },
  {
    title: 'Psikolog Profesional',
    desc: 'Bekerja sama dengan psikolog berlisensi dan berpengalaman dari berbagai bidang keahlian.',
    icon: icons.professional,
  },
  {
    title: 'Akses yang Mudah',
    desc: 'Temukan dan jadwalkan konsultasi kapan saja melalui platform yang sederhana dan nyaman digunakan.',
    icon: icons.accessibility,
  },
  {
    title: 'Pendekatan Human‑Centered',
    desc: 'Setiap individu memiliki cerita yang unik. Kami percaya pada dukungan yang personal dan penuh empati.',
    icon: icons.humanCentered,
  },
];

export default function AboutSection() {
  return (
    <section id="tentang-kami" className="py-20 relative overflow-hidden">
      {/* Subtle section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#709085]/4 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A7A96] mb-2 font-space">
            Tentang PsyOasis
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-space text-[#2D3732]">
            Kami Percaya Setiap Orang Berhak Mendapatkan Dukungan yang Tepat
          </h2>
          <p className="text-[#2D3732]/60 text-base md:text-lg font-light mt-4 max-w-2xl mx-auto">
            Perjalanan menuju kesehatan mental yang lebih baik tidak harus dilalui sendiri. PsyOasis hadir untuk menghubungkan Anda dengan psikolog profesional yang siap mendengarkan, memahami, dan mendampingi setiap langkah perjalanan Anda. Kami membangun platform ini dengan satu tujuan sederhana: membuat layanan kesehatan mental lebih mudah diakses, lebih nyaman, dan lebih manusiawi bagi semua orang.
          </p>
        </div>

        {/* Highlight Cards – two‑column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-white/65 backdrop-blur-sm p-6 rounded-2xl border border-[#709085]/15 hover:border-[#4A7A96]/25 hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(74,122,150,0.10)] transition-all duration-300 shadow-sm flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#F7F9F6] flex items-center justify-center mb-4 border border-[#709085]/20 shadow-sm">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-[#2D3732] font-space mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-[#2D3732]/60 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Closing Statement */}
        <div className="text-center">
          <blockquote className="text-[#2D3732]/65 italic text-base md:text-lg font-medium max-w-2xl mx-auto border-l-4 border-[#709085]/40 pl-6 text-left">
            "Kesehatan mental adalah bagian penting dari kualitas hidup. Kami hadir untuk membantu Anda menemukan dukungan yang tepat, kapan pun Anda membutuhkannya."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
