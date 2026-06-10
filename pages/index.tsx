import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import AnimeBackground from '../components/AnimeBackground';
import HeroSection from '../components/HeroSection';
import { TrustSection } from '../components/TrustSection';




import ServicesSection from '../components/ServicesSection';

import DirectorySection from '../components/DirectorySection';
import TestimonialSection from '../components/TestimonialSection';
import AboutSection from '../components/AboutSection';
import { FAQSection } from '../components/FAQSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <>
      <Head>
        <title>PsyOasis – Ruang Aman untuk Kesehatan Mental</title>
        <meta name="description" content="PsyOasis adalah platform kesehatan mental yang menghubungkan Anda dengan psikolog profesional berlisensi. Konsultasi rahasia, online & tatap muka." />
        <meta name="keywords" content="psikolog, konsultasi kesehatan mental, terapi online, psyoasis, konseling" />
        <meta property="og:title" content="PsyOasis – Ruang Aman untuk Kesehatan Mental" />
        <meta property="og:description" content="A calm and safe oasis for mental wellbeing. Terhubung dengan psikolog profesional kapan saja, di mana saja." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#F7F9F6" />
      </Head>

      <main className="relative min-h-screen overflow-hidden pb-12 selection:bg-[#4A7A96]/20 selection:text-[#2D3732]">
        {/* Natural Oasis Background */}
        <AnimeBackground />

        {/* Navigation */}
        <Navbar />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8 relative z-10">
          <HeroSection />
          <TrustSection />
          <ServicesSection />
          <DirectorySection />
          <TestimonialSection />
          <AboutSection />
          <FAQSection />
          <ContactSection />
        </div>

        {/* Footer */}
        <footer className="w-full text-center py-10 relative z-10 border-t border-[#709085]/12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#4A7A96] to-[#709085] flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold font-space text-[#2D3732]">
                  Psy<span className="text-[#4A7A96]">Oasis</span>
                </span>
              </div>
              <div className="text-xs text-[#2D3732]/45">
                © 2026 PsyOasis. All rights reserved. A calm and safe oasis for mental wellbeing.
              </div>
              <div className="text-xs text-[#2D3732]/45">
                <a href="mailto:support@psyoasis.id" className="hover:text-[#4A7A96] transition-colors">support@psyoasis.id</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
