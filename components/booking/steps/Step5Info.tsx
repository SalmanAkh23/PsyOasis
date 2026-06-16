import React, { useState } from 'react';

interface Step5Props {
  info: any;
  onChange: (info: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step5Info({ info, onChange, onNext, onPrev }: Step5Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updated = { ...info, [e.target.name]: e.target.value };
    onChange(updated);
    if (errors[e.target.name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!info.name?.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!info.email?.trim()) errs.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errs.email = 'Format email tidak valid';
    if (!info.wa?.trim()) errs.wa = 'Nomor WhatsApp wajib diisi';
    else if (!/^08\d{8,12}$/.test(info.wa.replace(/[\s-]/g, ''))) errs.wa = 'Nomor WhatsApp tidak valid (mulai dengan 08, min 10 digit)';
    if (!info.gender) errs.gender = 'Pilih jenis kelamin';
    if (!info.birthDate) errs.birthDate = 'Tanggal lahir wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Data Diri</h3>
      <p className="text-[#1a1c1e]/55 mb-8 text-sm">Lengkapi data diri Anda untuk keperluan sesi konsultasi.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={info.name || ''}
            onChange={handleChange}
            placeholder="Ketik nama lengkap Anda"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-[#D9E2DC]'
            }`}
          />
          {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={info.email || ''}
            onChange={handleChange}
            placeholder="alamat@email.com"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-[#D9E2DC]'
            }`}
          />
          {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">
            Nomor WhatsApp <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            name="wa"
            value={info.wa || ''}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors ${
              errors.wa ? 'border-red-300 bg-red-50' : 'border-[#D9E2DC]'
            }`}
          />
          {errors.wa && <span className="text-[11px] text-red-500">{errors.wa}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">
            Jenis Kelamin <span className="text-red-400">*</span>
          </label>
          <select
            name="gender"
            value={info.gender || ''}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors appearance-none ${
              errors.gender ? 'border-red-300 bg-red-50' : 'border-[#D9E2DC]'
            }`}
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.gender && <span className="text-[11px] text-red-500">{errors.gender}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">
            Tanggal Lahir <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="birthDate"
            value={info.birthDate || ''}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors ${
              errors.birthDate ? 'border-red-300 bg-red-50' : 'border-[#D9E2DC]'
            }`}
          />
          {errors.birthDate && <span className="text-[11px] text-red-500">{errors.birthDate}</span>}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs text-[#1a1c1e] font-semibold uppercase tracking-wider font-space">Catatan / Keluhan</label>
          <textarea
            name="complaint"
            value={info.complaint || ''}
            onChange={handleChange}
            placeholder="Ceritakan secara singkat apa yang sedang Anda rasakan (opsional)"
            className="w-full rounded-xl border border-[#D9E2DC] bg-white px-4 py-3 text-sm text-[#1a1c1e] placeholder-[#747783] focus:outline-none focus:ring-2 focus:ring-[#315ab4]/20 focus:border-[#315ab4] transition-colors h-24 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#006d31] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300"
        >
          Kembali
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-xl text-sm font-bold bg-[#315ab4] text-white hover:bg-[#3D6B82] shadow-sm active:scale-[0.98] transition-all duration-300"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
