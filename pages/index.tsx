import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getLandingStats } from '../lib/db';
import { services } from '../lib/services';

const navLinks = [
  { label: 'Home', href: '#', active: true },
  { label: 'Services', href: '#services' },
  { label: 'Psychologists', href: '#psychologists' },
  { label: 'About Us', href: '#about' },
];

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({ psychologistCount: 0, sessionCount: 0 });

  useEffect(() => {
    getLandingStats().then(s => setStats(s)).catch(() => {});
    setLoaded(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>PsyOasis — Ruang Aman untuk Kesehatan Mental</title>
        <meta name="description" content="Platform kesehatan mental premium yang menghubungkan Anda dengan psikolog profesional berlisensi. Konsultasi rahasia, online & tatap muka." />
        <meta property="og:title" content="PsyOasis — Ruang Aman untuk Kesehatan Mental" />
        <meta property="og:description" content="Setiap perjalanan kesehatan mental dimulai dari langkah kecil. Terhubung dengan psikolog profesional." />
        <meta name="theme-color" content="#f9f9fc" />
      </Head>

      <style jsx global>{`
        body {
          background-color: #f9f9fc;
          color: #1a1c1e;
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .text-gradient {
          background: linear-gradient(135deg, #002768, #315ab4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-fade-up { animation: fade-up 0.7s ease-out forwards; opacity: 0; }
        .anim-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.3s; }
        .anim-delay-4 { animation-delay: 0.4s; }
        .anim-delay-5 { animation-delay: 0.5s; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl shadow-sm border-outline-variant/20'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="PsyOasis" className="h-12 md:h-14 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.active
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block font-label-md text-label-md text-primary hover:bg-surface-container-low transition-all duration-300 px-4 py-2 rounded-full active:scale-90"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 px-6 py-3 rounded-full shadow-sm hover:shadow-md active:scale-90"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop mx-auto relative"
        style={{
          background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuAp4OXwcchBPX1sDH9zCYiD-SSoZ6PxicJBW19a59w34jdy0m4TWw4r3SRYSe0R0Kl2_OANBLxMLwQQbctmBJ9YNzCqHthgleO0XOZDtghcH8IGGUf7qnnUqO1w7IPiJAzPsqUBNYFe6knmthNitVSVSEaY6_WVKb7nVVFj2DtoWU8cr4fj0pb1BIIblFLj4KMhVWoJPBhRRjse9jHfLbHzddgYUiWzfJxOFmRYWbk7hlyOG--jFhJgameLYPJR4E2EbKGuksCZki2f)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto ${loaded ? '' : 'opacity-0'}`}>
          <div className="anim-fade-up anim-delay-1 inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-label-md text-label-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
            THE SECRET OASIS
          </div>

          <h1 className="anim-fade-up anim-delay-2 font-display-lg text-display-lg text-white">
            Ruang Aman untuk Kesehatan Mental: <br />
            <span className="text-secondary-fixed">Mendengar, Memahami,</span> dan Bertumbuh
          </h1>

          <p className="anim-fade-up anim-delay-3 font-body-lg text-body-lg text-white/90 max-w-2xl">
            Setiap perjalanan kesehatan mental dimulai dari langkah kecil. Terhubung dengan psikolog profesional yang siap membantu Anda menghadapi berbagai tantangan hidup dengan aman dan rahasia.
          </p>

          <div className="anim-fade-up anim-delay-4 flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/booking')}
              className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-90"
            >
              Booking Konsultasi
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/psikolog')}
              className="bg-white/10 text-white px-8 py-4 rounded-full font-label-md text-label-md hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm active:scale-90"
            >
              Lihat Psikolog
            </button>
          </div>

          <div className="anim-fade-up anim-delay-5 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/20 w-full">
            {[
              'Psikolog Berlisensi',
              'Konsultasi Rahasia',
              'Online & Tatap Muka',
              'Dukungan Profesional',
            ].map((item) => (
              <div key={item} className="flex items-center justify-center gap-2 text-white font-body-md text-body-md">
                <span className="material-symbols-outlined fill text-secondary-fixed">check_circle</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 bg-surface-container-lowest border-y border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${stats.psychologistCount || 120}+`, label: 'Psikolog Profesional' },
              { value: '98%', label: 'Kepuasan Pengguna' },
              { value: `${(stats.sessionCount > 0 ? Math.round(stats.sessionCount / 100) * 100 : 10)}+`, label: 'Sesi Sukses' },
              { value: '24/7', label: 'Akses Mudah' },
            ].map((stat, i) => (
              <div key={i} className={`text-center px-4 ${i > 0 ? 'md:border-l md:border-outline-variant/20' : ''}`}>
                <div className="text-[40px] leading-[1.2] font-bold text-primary mb-2">{stat.value}</div>
                <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-4">Layanan Utama Kami</h2>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4">Pilih Layanan Konseling Sesuai Kebutuhan Anda</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Spesialisasi layanan kami dirancang untuk memberikan dukungan tepat sasaran demi kesejahteraan mental Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const materialIcons: Record<string, string> = {
              'Konseling Individu': 'person',
              'Konseling Pernikahan': 'favorite',
              'Konseling Keluarga': 'diversity_1',
              'Konseling Remaja': 'school',
              'Konseling Anak': 'child_care',
              'Anxiety Therapy': 'psychology',
              'Depression Therapy': 'sentiment_satisfied',
              'Burnout Recovery': 'bolt',
              'Career Counseling': 'work',
            };
            return services.filter(s => materialIcons[s.title]).slice(0, 6).map((svc) => (
              <div
                key={svc.title}
                className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-2xl mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">{materialIcons[svc.title]}</span>
                </div>
                <h4 className="font-headline-md text-xl font-bold text-on-surface mb-3">{svc.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[80px]">{svc.desc}</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-primary group-hover:text-primary-container transition-colors"
                >
                  Pelajari Selengkapnya <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* ─── VALUE PROPOSITION (BENTO) ─── */}
      <section id="about" className="py-24 bg-surface-container px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Kami Percaya Setiap Orang Berhak Mendapatkan Dukungan yang Tepat</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Perjalanan menuju kesehatan mental yang lebih baik tidak harus dilalui sendiri. PsyOasis hadir dengan platform yang mudah diakses, nyaman, dan manusiawi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento 1 */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden border border-outline-variant/20">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined fill text-secondary text-2xl">shield_lock</span>
                </div>
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-4">Kerahasiaan Terjamin</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Privasi dan keamanan setiap konsultasi menjadi prioritas utama kami. Platform kami menggunakan enkripsi end-to-end berstandar medis.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mb-20"></div>
            </div>

            {/* Bento 2 */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 flex flex-col justify-center border border-outline-variant/20">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined fill text-primary text-2xl">psychology</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4">Psikolog Profesional</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Bekerja sama dengan psikolog berlisensi dan berpengalaman dari berbagai bidang keahlian khusus.</p>
            </div>

            {/* Bento 3 */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 flex flex-col justify-center border border-outline-variant/20">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined fill text-primary text-2xl">devices</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4">Akses yang Mudah</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Temukan dan jadwalkan konsultasi kapan saja melalui platform yang sederhana dan nyaman digunakan dari perangkat apa pun.</p>
            </div>

            {/* Bento 4 */}
            <div className="lg:col-span-2 bg-primary text-on-primary rounded-[2rem] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10 max-w-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined fill text-white text-2xl">volunteer_activism</span>
                </div>
                <h3 className="font-headline-md text-2xl font-bold text-white mb-4">Pendekatan Human-Centered</h3>
                <p className="font-body-md text-body-md text-white/80 italic text-lg border-l-4 border-secondary-fixed pl-6 py-2">
                  &quot;Kesehatan mental adalah bagian penting dari kualitas hidup. Kami hadir untuk membantu Anda menemukan dukungan yang tepat, kapan pun Anda membutuhkannya.&quot;
                </p>
              </div>
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-surface-container-lowest w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center">
              <img src="/logo.png" alt="PsyOasis" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-on-surface-variant font-body-md text-body-md max-w-sm">
              &copy; 2026 PsyOasis. All rights reserved. Professional mental health support.
            </p>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-primary font-semibold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
              {['About Us', 'Careers', 'Research', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-primary font-semibold mb-4 uppercase tracking-wider">Legal &amp; Help</h4>
            <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
              {['Privacy Policy', 'Terms of Service', 'Help Center'].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors opacity-80 hover:opacity-100">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}