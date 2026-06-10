import React from 'react';

// Sample testimonials data
const testimonials = [
  {
    name: 'Rina A.',
    text: 'PsyOasis membantu saya menemukan ketenangan dan mengatasi kecemasan yang selama ini menghantui saya. Konsultasinya profesional dan sangat empatik.',
    avatar: 'from-[#4A7A96] to-[#709085]'
  },
  {
    name: 'Budi S.',
    text: 'Terima kasih kepada tim PsyOasis, saya kini dapat mengelola stres kerja dengan lebih baik. Layanan mudah diakses dan terpercaya.',
    avatar: 'from-[#709085] to-[#4A7A96]'
  },
  {
    name: 'Siti M.',
    text: 'Sesi keluarga di PsyOasis sangat membantu kami berkomunikasi lebih baik. Profesionalisme psikolognya luar biasa.',
    avatar: 'from-[#4A7A96] to-[#2D7A6B]'
  }
];

export default function TestimonialSection() {
  return (
    <section id="testimoni" className="py-20 relative overflow-hidden">
      {/* Soft background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4A7A96]/4 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A7A96] mb-2 font-space">
            Testimoni Pengguna
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-space text-[#2D3732]">
            Apa Kata Mereka?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white/65 backdrop-blur-sm p-6 rounded-2xl border border-[#709085]/15 hover:border-[#4A7A96]/25 hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(74,122,150,0.10)] transition-all duration-300 shadow-sm flex flex-col">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.avatar} flex items-center justify-center mb-4 text-white shadow-sm`}>👤</div>
              <p className="text-[#2D3732]/65 text-sm mb-4 flex-grow leading-relaxed font-light">"{t.text}"</p>
              <h4 className="text-base font-bold text-[#2D3732] font-space">{t.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
