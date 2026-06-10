import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section id="beranda" className="relative pt-12 pb-24 md:py-24 flex items-center justify-center overflow-hidden">
      
      {/* Soft natural background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#709085]/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#4A7A96]/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />

      <div className={`w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Left Column: Content */}
        <div className="lg:col-span-7 flex flex-col text-left">
          
          {/* Brand Tagline Badge */}
          <div className="inline-flex self-start items-center gap-2 px-3 py-1 bg-white/70 border border-[#709085]/30 rounded-full text-xs font-semibold text-[#709085] tracking-wider uppercase mb-6 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A7A96] animate-ping" />
            The Secret Oasis
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-space leading-tight text-[#2D3732] mb-6">
            Ruang Aman untuk Kesehatan Mental: <br />
            <span className="bg-gradient-to-r from-[#4A7A96] to-[#709085] bg-clip-text text-transparent">Mendengar</span>,{' '}
            <span className="bg-gradient-to-r from-[#709085] to-[#4A7A96] bg-clip-text text-transparent">Memahami</span>,{' '}
            <span className="text-[#2D3732]">dan</span>{' '}
            <span className="bg-gradient-to-r from-[#4A7A96] to-[#709085] bg-clip-text text-transparent">Bertumbuh</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#2D3732]/65 text-base md:text-lg font-light leading-relaxed mb-8 max-w-xl">
            Setiap perjalanan kesehatan mental dimulai dari langkah kecil. Terhubung dengan psikolog profesional yang siap membantu Anda menghadapi berbagai tantangan hidup dengan aman dan rahasia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <button
              onClick={() => router.push('/booking')}
              className="px-8 py-3.5 bg-[#4A7A96] text-white font-semibold rounded-2xl shadow-[0_4px_20px_rgba(74,122,150,0.3)] hover:bg-[#3D6B82] hover:shadow-[0_4px_30px_rgba(74,122,150,0.45)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              Booking Konsultasi
            </button>
            <button
              onClick={() => { const el = document.getElementById('psikolog'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
              className="px-6 py-3.5 bg-white/60 border border-[#709085]/40 text-[#709085] font-medium rounded-2xl hover:bg-white/80 hover:border-[#709085]/60 transition-all duration-300 text-sm backdrop-blur-sm"
            >
              Lihat Psikolog
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-[#709085]/15 pt-8 max-w-md">
            {[
              'Psikolog Berlisensi',
              'Konsultasi Rahasia',
              'Online & Tatap Muka',
              'Dukungan Profesional'
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-[#2D3732]/70">
                <div className="w-5 h-5 rounded-full bg-[#709085]/15 border border-[#709085]/30 flex items-center justify-center text-[#709085] text-xs font-bold">
                  ✓
                </div>
                <span>{badge}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Visual Dashboard Mockup */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center">
          
          {/* Main Visual Container */}
          <div className="relative w-full max-w-[400px] h-[380px] bg-white/55 rounded-3xl p-6 border border-[#709085]/20 shadow-[0_8px_40px_rgba(112,144,133,0.15)] backdrop-blur-md overflow-hidden flex flex-col justify-between">
            
            {/* Ambient inner glow */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#4A7A96]/8 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#709085]/8 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header section of dashboard */}
            <div className="flex justify-between items-center pb-4 border-b border-[#709085]/15">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#709085] animate-pulse" />
                <span className="text-xs font-semibold text-[#2D3732]/60 font-space tracking-wider uppercase">Sesi Konsultasi Aktif</span>
              </div>
              <span className="text-[10px] text-[#4A7A96] bg-[#4A7A96]/10 px-2 py-0.5 rounded-full border border-[#4A7A96]/20">Secure Room</span>
            </div>

            {/* Profile Card Mockup */}
            <div className="bg-white/70 border border-[#709085]/20 p-4 rounded-2xl flex items-center gap-4 my-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A7A96] to-[#709085] flex items-center justify-center text-2xl shadow-sm">
                👩‍⚕️
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D3732] font-space">Dr. Anita Sitorus</h4>
                <p className="text-[11px] text-[#4A7A96] font-medium">Psikolog Klinis Pendamping Anda</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#2D3732]/50">
                  <span>Rating: ⭐ 4.9</span>
                  <span className="text-[#709085]/40">•</span>
                  <span>Online</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Message bubble */}
            <div className="flex flex-col gap-2 bg-[#F7F9F6] border border-[#709085]/15 p-4 rounded-2xl text-left self-start max-w-[90%] mb-4 shadow-sm">
              <div className="text-[10px] font-bold text-[#4A7A96] uppercase tracking-widest">Anita Sitorus</div>
              <p className="text-xs text-[#2D3732]/70 leading-relaxed font-light">
                "Halo, terima kasih sudah berkunjung. Mari kita mulai obrolan santai hari ini. Apa yang sedang memenuhi pikiranmu saat ini?"
              </p>
            </div>

            {/* Mood Wave Tracker Animation */}
            <div className="pt-3 border-t border-[#709085]/15 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#2D3732]/45 font-space uppercase">Status Mood Terapi</span>
                <span className="text-xs font-bold text-[#709085] mt-0.5">Sangat Tenang & Damai</span>
              </div>
              
              {/* Pulsing visual wave lines */}
              <div className="flex items-end gap-1.5 h-8">
                {[4, 8, 5, 7, 3, 6, 2].map((heightVal, idx) => (
                  <span
                    key={idx}
                    className="w-1 rounded-full bg-gradient-to-t from-[#709085] to-[#4A7A96] opacity-70"
                    style={{
                      height: `${heightVal * 3}px`,
                      animation: 'float 2s ease-in-out infinite',
                      animationDelay: `${idx * 0.15}s`
                    }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Decorative floating badges */}
          <div className="absolute -top-4 -right-2 bg-white/70 border border-[#709085]/25 py-2 px-3 rounded-xl flex items-center gap-2 shadow-md animate-float backdrop-blur-sm" style={{ animationDuration: '7s' }}>
            <span className="text-sm">🧘</span>
            <span className="text-[10px] font-bold text-[#2D3732]/70">Relaksasi Kognitif</span>
          </div>

          <div className="absolute -bottom-4 -left-2 bg-white/70 border border-[#709085]/25 py-2 px-3 rounded-xl flex items-center gap-2 shadow-md animate-float backdrop-blur-sm" style={{ animationDuration: '5s', animationDelay: '1s' }}>
            <span className="text-sm">🔐</span>
            <span className="text-[10px] font-bold text-[#2D3732]/70">Enkripsi End-to-End</span>
          </div>

        </div>

      </div>
    </section>
  );
}
