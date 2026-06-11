import React from 'react';
import { useRouter } from 'next/router';

export default function Step7Success() {
  const router = useRouter();

  const bookingId = `MC-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-8">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h3 className="text-3xl font-extrabold font-space text-[#2D3732] mb-2 text-center">Booking Berhasil!</h3>
      <p className="text-[#2D3732]/55 mb-8 text-center max-w-md text-sm">
        Jadwal konsultasi Anda telah berhasil dibuat. Silakan cek email Anda untuk instruksi selanjutnya.
      </p>

      <div className="w-full max-w-sm p-6 rounded-3xl border border-[#D9E2DC] mb-8 flex flex-col items-center gap-4 bg-white shadow-sm">
        <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space">Nomor Booking</div>
        <div className="text-2xl font-bold font-space text-[#4A7A96] tracking-widest bg-[#F7F9F6] px-6 py-2 rounded-xl border border-[#D9E2DC]">
          {bookingId}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-500 font-medium">Menunggu Konfirmasi</span>
        </div>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="px-8 py-3 rounded-xl text-sm font-bold bg-[#4A7A96] hover:bg-[#3D6B82] text-white transition-all duration-300 shadow-sm"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}
