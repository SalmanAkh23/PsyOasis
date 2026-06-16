import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BookingWizard from '../components/booking/BookingWizard';

export default function BookingPage() {
  return (
    <div className="relative min-h-screen bg-[#F7F9F6] overflow-x-hidden selection:bg-[#315ab4]/20 selection:text-[#1a1c1e]">
      <Head>
        <title>Booking Konsultasi â€“ PsyOasis</title>
        <meta name="description" content="Jadwalkan sesi konsultasi psikologi Anda dengan PsyOasis. Pilih psikolog, layanan, tanggal dan waktu yang tersedia." />
      </Head>

      {/* Background ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-[#315ab4]/6 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#006d31]/6 rounded-full blur-[150px] pointer-events-none" />

      {/* Simple Header */}
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-[#006d31]/10">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <img src="/logo.png" alt="PsyOasis" className="h-16 w-auto object-contain" />
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#006d31] hover:text-[#315ab4] transition-colors">
          â† Batal & Kembali
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center">
        <BookingWizard />
      </main>
    </div>
  );
}
