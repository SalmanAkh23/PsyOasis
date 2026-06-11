import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createBooking } from '../../../lib/db';
import { mockPsychologists } from '../../../data/mockData';

interface Step6Props {
  formData: any;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step6Summary({ formData, onNext, onPrev }: Step6Props) {
  const { user } = useAuth() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selectedPsychologist = mockPsychologists.find(p => p.id === formData.psychologistId);

  const handleConfirm = async () => {
    if (!user || !selectedPsychologist) return;
    setIsSubmitting(true);
    setError('');
    try {
      await createBooking({
        userId: user.uid,
        userName: formData.info.name,
        userEmail: formData.info.email,
        userWa: formData.info.wa,
        psychologistId: formData.psychologistId,
        psychologistName: formData.psychologistName,
        serviceId: formData.serviceId,
        serviceName: formData.serviceName,
        date: formData.date,
        time: formData.time,
        mode: formData.info.mode,
        complaint: formData.info.complaint,
        fee: selectedPsychologist.fee,
      });
      onNext();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan booking');
    }
    setIsSubmitting(false);
  };

  if (!selectedPsychologist) return null;

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#2D3732] mb-2">Ringkasan Booking</h3>
      <p className="text-[#2D3732]/55 mb-8 text-sm">Pastikan semua data di bawah ini sudah benar sebelum mengkonfirmasi.</p>

      <div className="bg-white p-6 rounded-3xl border border-[#D9E2DC] mb-8">

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#D9E2DC]">
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Layanan</div>
              <div className="text-sm font-bold text-[#2D3732]">{formData.serviceName}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Metode</div>
              <div className="text-sm font-bold text-[#2D3732]">{formData.info.mode}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Tanggal</div>
              <div className="text-sm font-bold text-[#2D3732]">{formData.date}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Jam</div>
              <div className="text-sm font-bold text-[#2D3732]">{formData.time} WIB</div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-6 border-b border-[#D9E2DC]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${selectedPsychologist.avatarBg} shadow-sm`}>
              {selectedPsychologist.avatarChar}
            </div>
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-0.5">Konselor Anda</div>
              <div className="text-base font-bold text-[#2D3732] font-space">{selectedPsychologist.name}</div>
              <div className="text-xs text-[#4A7A96]">{selectedPsychologist.role}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#D9E2DC]">
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Nama Pasien</div>
              <div className="text-sm text-[#2D3732]">{formData.info.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2D3732]/50 uppercase tracking-widest font-space mb-1">Kontak (WA)</div>
              <div className="text-sm text-[#2D3732]">{formData.info.wa}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-[#2D3732]/50 font-space uppercase tracking-wider">Total Biaya</div>
            <div className="text-2xl font-extrabold text-[#2D3732] font-space">
              {selectedPsychologist.fee}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#709085] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300 disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            isSubmitting
              ? 'bg-[#4A7A96]/50 text-white cursor-wait'
              : 'bg-[#4A7A96] text-white hover:bg-[#3D6B82] shadow-sm'
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
