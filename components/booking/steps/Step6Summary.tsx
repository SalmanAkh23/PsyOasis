import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createBooking } from '../../../lib/db';

interface Step6Props {
  formData: any;
  onNext: (bookingId?: string) => void;
  onPrev: () => void;
}

export default function Step6Summary({ formData, onNext, onPrev }: Step6Props) {
  const { user } = useAuth() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError('');
    try {
      const booking = await createBooking({
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
        mode: 'Online (Video Call)',
        complaint: formData.info.complaint,
        fee: formData.psychologistFee,
      });
      onNext(booking?.id);
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan booking');
    }
    setIsSubmitting(false);
  };

  const initial = formData.psychologistName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold font-space text-[#1a1c1e] mb-2">Ringkasan Booking</h3>
      <p className="text-[#1a1c1e]/55 mb-8 text-sm">Pastikan semua data di bawah ini sudah benar sebelum mengkonfirmasi.</p>

      <div className="bg-white p-6 rounded-3xl border border-[#D9E2DC] mb-8">
        <div className="flex flex-col gap-6">
          <div className="pb-6 border-b border-[#D9E2DC]">
            <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-widest font-space mb-3">Layanan & Jadwal</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Layanan</div>
                <div className="text-sm font-bold text-[#1a1c1e]">{formData.serviceName}</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Tanggal</div>
                <div className="text-sm font-bold text-[#1a1c1e]">{formData.dateDisplay || formData.date}</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Jam</div>
                <div className="text-sm font-bold text-[#1a1c1e]">{formData.time} WIB</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Durasi</div>
                <div className="text-sm font-bold text-[#1a1c1e]">45-60 Menit</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-6 border-b border-[#D9E2DC]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-[#315ab4] to-[#006d31] shadow-sm shrink-0">
              {initial}
            </div>
            <div>
              <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-widest font-space mb-0.5">Psikolog</div>
              <div className="text-base font-bold text-[#1a1c1e] font-space">{formData.psychologistName}</div>
            </div>
          </div>

          <div className="pb-6 border-b border-[#D9E2DC]">
            <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-widest font-space mb-3">Data Pasien</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Nama</div>
                <div className="text-sm text-[#1a1c1e]">{formData.info.name}</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Email</div>
                <div className="text-sm text-[#1a1c1e] truncate">{formData.info.email}</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">WhatsApp</div>
                <div className="text-sm text-[#1a1c1e]">{formData.info.wa}</div>
              </div>
              <div className="bg-[#F7F9F6] p-3 rounded-xl">
                <div className="text-[10px] text-[#1a1c1e]/50 uppercase tracking-wider font-space mb-1">Jenis Kelamin</div>
                <div className="text-sm text-[#1a1c1e]">{formData.info.gender || '-'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-[#1a1c1e]/50 font-space uppercase tracking-wider">Total Biaya</div>
            <div className="text-2xl font-extrabold text-[#1a1c1e] font-space">
              {formData.psychologistFee || 'Rp -'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-[#006d31] bg-white border border-[#D9E2DC] hover:bg-[#F7F9F6] transition-all duration-300 disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            isSubmitting
              ? 'bg-[#315ab4]/50 text-white cursor-wait'
              : 'bg-[#315ab4] text-white hover:bg-[#3D6B82] shadow-sm active:scale-[0.98]'
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