import React from 'react';
import { useRouter } from 'next/router';

export default function Step7Success() {
  const router = useRouter();
  
  // Generate mock booking ID
  const bookingId = `MC-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10 border-4 border-[#080810]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white animate-[anime-slash_0.8s_ease-out_forwards]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h3 className="text-3xl font-extrabold font-space text-[#1E293B] mb-2 text-center">Booking Berhasil!</h3>
      <p className="text-[#64748B] mb-8 text-center max-w-md text-sm">
        Jadwal konsultasi Anda telah berhasil dibuat. Silakan cek email Anda untuk instruksi selanjutnya.
      </p>

      <div className="w-full max-w-sm p-6 rounded-3xl border border-[#E5E7EB] mb-8 flex flex-col items-center gap-4 bg-white shadow-sm">
        <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-space">Nomor Booking</div>
        <div className="text-2xl font-bold font-space text-[#2D5D7B] tracking-widest bg-[#F7F8FA] px-6 py-2 rounded-xl border border-[#E5E7EB]">
          {bookingId}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-medium">Menunggu Konfirmasi Pembayaran</span>
        </div>
      </div>

      <button 
        onClick={() => router.push('/')}
        className="px-8 py-3 rounded-xl text-sm font-bold bg-[#2D5D7B] hover:bg-[#244A63] text-white transition-all duration-300 border border-transparent shadow-sm"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
