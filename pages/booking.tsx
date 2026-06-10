import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BookingWizard from '../components/booking/BookingWizard';

export default function BookingPage() {
  return (
    <div className="relative min-h-screen bg-[#F7F9F6] overflow-x-hidden selection:bg-[#4A7A96]/20 selection:text-[#2D3732]">
      <Head>
        <title>Booking Konsultasi – PsyOasis</title>
        <meta name="description" content="Jadwalkan sesi konsultasi psikologi Anda dengan PsyOasis. Pilih psikolog, layanan, tanggal dan waktu yang tersedia." />
      </Head>

      {/* Background ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-[#4A7A96]/6 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#709085]/6 rounded-full blur-[150px] pointer-events-none" />

      {/* Simple Header */}
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-[#709085]/10">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4A7A96] to-[#709085] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold font-space text-[#2D3732]">
            Psy<span className="text-[#4A7A96]">Oasis</span>
          </span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#709085] hover:text-[#4A7A96] transition-colors">
          ← Batal & Kembali
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center">
        <BookingWizard />
      </main>
    </div>
  );
}
