import React, { useState } from 'react';

interface Step5Props {
  info: any;
  onChange: (info: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step5Info({ info, onChange, onNext, onPrev }: Step5Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange({ ...info, [e.target.name]: e.target.value });
  };

  const isFormValid = info.name && info.email && info.wa && info.mode;

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Informasi Konsultasi</h3>
      <p className="text-slate-400 mb-8 text-sm">Lengkapi data diri Anda untuk keperluan sesi konsultasi.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider">Nama Lengkap *</label>
          <input 
            type="text" 
            name="name"
            value={info.name || ''}
            onChange={handleChange}
            placeholder="Ketik nama lengkap Anda" 
            className="w-full rounded-xl border border-[#D9E2DC] bg-[#FFFFFF] px-4 py-3 text-sm text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96] focus:border-[#4A7A96] transition-colors psy-input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider">Email *</label>
          <input 
            type="email" 
            name="email"
            value={info.email || ''}
            onChange={handleChange}
            placeholder="alamat@email.com" 
            className="w-full rounded-xl border border-[#D9E2DC] bg-[#FFFFFF] px-4 py-3 text-sm text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96] focus:border-[#4A7A96] transition-colors psy-input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider">Nomor WhatsApp *</label>
          <input 
            type="tel" 
            name="wa"
            value={info.wa || ''}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx" 
            className="w-full rounded-xl border border-[#D9E2DC] bg-[#FFFFFF] px-4 py-3 text-sm text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96] focus:border-[#4A7A96] transition-colors psy-input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider">Jenis Konsultasi *</label>
          <select 
            name="mode"
            value={info.mode || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#D9E2DC] bg-[#FFFFFF] px-4 py-3 text-sm text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96] focus:border-[#4A7A96] transition-colors appearance-none psy-input psy-select"
          >
            <option value="" disabled>Pilih Jenis Konsultasi</option>
            <option value="Online (Video Call)">Online (Video Call)</option>
            <option value="Tatap Muka (Klinik)">Tatap Muka (Klinik)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider">Keluhan Utama</label>
          <textarea 
            name="complaint"
            value={info.complaint || ''}
            onChange={handleChange}
            placeholder="Ceritakan secara singkat apa yang sedang Anda rasakan (Opsional)" 
            className="w-full rounded-xl border border-[#D9E2DC] bg-[#FFFFFF] px-4 py-3 text-sm text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96] focus:border-[#4A7A96] transition-colors h-24 resize-none psy-textarea"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 glass-panel hover:bg-white/10 transition-all duration-300"
        >
          Kembali
        </button>
        <button 
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            isFormValid 
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105' 
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
