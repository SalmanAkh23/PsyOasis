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
      <p className="text-[#2D3732]/55 mb-8 text-sm">Lengkapi data diri Anda untuk keperluan sesi konsultasi.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider font-space">Nama Lengkap *</label>
          <input
            type="text"
            name="name"
            value={info.name || ''}
            onChange={handleChange}
            placeholder="Ketik nama lengkap Anda"
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#2D3732] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/20 focus:border-[#4A7A96] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider font-space">Email *</label>
          <input
            type="email"
            name="email"
            value={info.email || ''}
            onChange={handleChange}
            placeholder="alamat@email.com"
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#2D3732] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/20 focus:border-[#4A7A96] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider font-space">Nomor WhatsApp *</label>
          <input
            type="tel"
            name="wa"
            value={info.wa || ''}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#2D3732] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/20 focus:border-[#4A7A96] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider font-space">Jenis Konsultasi *</label>
          <select
            name="mode"
            value={info.mode || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#2D3732] focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/20 focus:border-[#4A7A96] transition-colors appearance-none"
          >
            <option value="" disabled>Pilih Jenis Konsultasi</option>
            <option value="Online (Video Call)">Online (Video Call)</option>
            <option value="Tatap Muka (Klinik)">Tatap Muka (Klinik)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs text-[#2D3732] font-semibold uppercase tracking-wider font-space">Keluhan Utama</label>
          <textarea
            name="complaint"
            value={info.complaint || ''}
            onChange={handleChange}
            placeholder="Ceritakan secara singkat apa yang sedang Anda rasakan (Opsional)"
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#2D3732] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/20 focus:border-[#4A7A96] transition-colors h-24 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#709085] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            isFormValid
              ? 'bg-[#4A7A96] text-white hover:bg-[#3D6B82] shadow-sm'
              : 'bg-[#D9E2DC] text-[#2D3732]/30 cursor-not-allowed'
          }`}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
