import React, { useState } from 'react';
import { mockPsychologists } from '../../../data/mockData';

interface Step6Props {
  formData: any;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step6Summary({ formData, onNext, onPrev }: Step6Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPsychologist = mockPsychologists.find(p => p.id === formData.psychologistId);

  const handleConfirm = () => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      onNext();
    }, 2000);
  };

  if (!selectedPsychologist) return null;

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-white mb-2">Ringkasan Booking</h3>
      <p className="text-slate-400 mb-8 text-sm">Pastikan semua data di bawah ini sudah benar sebelum mengkonfirmasi.</p>

      <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-6">
          {/* Section: Layanan & Waktu */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Layanan</div>
              <div className="text-sm font-bold text-white">{formData.serviceName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Metode</div>
              <div className="text-sm font-bold text-white">{formData.info.mode}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Tanggal</div>
              <div className="text-sm font-bold text-white">{formData.date}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Jam</div>
              <div className="text-sm font-bold text-white">{formData.time} WIB</div>
            </div>
          </div>

          {/* Section: Psikolog */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${selectedPsychologist.avatarBg}`}>
              {selectedPsychologist.avatarChar}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-0.5">Konselor Anda</div>
              <div className="text-base font-bold text-white font-space">{selectedPsychologist.name}</div>
              <div className="text-xs text-cyan-400">{selectedPsychologist.role}</div>
            </div>
          </div>

          {/* Section: Pasien */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Nama Pasien</div>
              <div className="text-sm text-white">{formData.info.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-space mb-1">Kontak (WA)</div>
              <div className="text-sm text-white">{formData.info.wa}</div>
            </div>
          </div>

          {/* Section: Biaya */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-300 font-space uppercase tracking-wider">Total Biaya</div>
            <div className="text-2xl font-extrabold text-white font-space bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedPsychologist.fee}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 glass-panel hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
        >
          Kembali
        </button>
        <button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            isSubmitting 
              ? 'bg-indigo-600/50 text-white cursor-wait' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Memproses...
            </>
          ) : (
            'Konfirmasi & Buat Jadwal'
          )}
        </button>
      </div>
    </div>
  );
}
