import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  getPsychologistByUserId,
  getPatientDetail,
  saveSessionNotes,
} from '../../../../lib/db-psikolog';
import PortalLayout from '../../../../components/dashboard/portal/Layout';

export default function PatientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth() as any;
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) {
        setPsychologistId(prof.id);
        getPatientDetail(prof.id, id as string).then((data) => {
          setPatient(data.profile);
          setSessions(data.sessions);
        }).finally(() => setDataLoading(false));
      }
    });
  }, [user, id]);

  const handleSaveNotes = async (bookingId: string) => {
    setSavingNotes(true);
    try {
      await saveSessionNotes(bookingId, notesText);
      setSessions((prev) =>
        prev.map((s: any) => (s.id === bookingId ? { ...s, notes: notesText } : s))
      );
      setEditingNotes(null);
      setNotesText('');
    } catch (err) {
      console.error('Save notes error:', err);
    }
    setSavingNotes(false);
  };

  if (loading || !user) return null;

  return (
    <PortalLayout title="Patient Detail" doctorName={user?.displayName || 'Dr. Smith'}>
      <header className="mb-8">
        <button
          onClick={() => router.push('/dashboard/portal/pasien')}
          className="text-sm text-[#002768] hover:underline mb-4 inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali ke daftar pasien
        </button>
        {dataLoading ? (
          <div className="text-[#434652]">Memuat...</div>
        ) : patient ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#002768] flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {(patient.displayName || '??').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a1c1e] font-['Poppins']">{patient.displayName || 'Unknown'}</h2>
              <p className="text-sm text-[#434652]">{patient.email || ''}</p>
              <div className="flex items-center gap-3 mt-1">
                {patient.phoneNumber && <span className="text-xs text-[#434652]">{patient.phoneNumber}</span>}
                {patient.gender && <span className="text-xs text-[#434652]">{patient.gender}</span>}
                {patient.birthDate && <span className="text-xs text-[#434652]">Lahir: {patient.birthDate}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[#434652]">Pasien tidak ditemukan</div>
        )}
      </header>

      {!dataLoading && patient && (
        <div className="bg-white rounded-2xl border border-[#c4c6d4] overflow-hidden">
          <div className="p-5 border-b border-[#c4c6d4]">
            <h3 className="text-lg font-bold text-[#1a1c1e] font-['Poppins']">Riwayat Sesi</h3>
            <p className="text-sm text-[#434652] mt-0.5">{sessions.length} sesi konsultasi</p>
          </div>
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-[#747783]">Belum ada sesi konsultasi.</div>
          ) : (
            <div className="divide-y divide-[#c4c6d4]">
              {sessions.map((s: any) => (
                <div key={s.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1a1c1e]">
                          {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="text-sm text-[#434652]">â€¢ {s.time} WIB</span>
                      </div>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'dikonfirmasi'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        {s.status === 'selesai' ? 'Selesai' : s.status === 'dikonfirmasi' ? 'Dikonfirmasi' : s.status}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#002768]">{s.fee || '-'}</span>
                  </div>

                  <div className="text-sm text-[#434652] mb-3">
                    {s.serviceName && <span>Layanan: {s.serviceName}</span>}
                    {s.mode && <span className="ml-3">Mode: {s.mode}</span>}
                  </div>

                  {s.complaint && (
                    <div className="mb-3 p-3 bg-[#eeeef0] rounded-xl border border-[#c4c6d4]">
                      <p className="text-[10px] text-[#434652] uppercase tracking-wider font-semibold mb-1">Keluhan Awal</p>
                      <p className="text-sm text-[#1a1c1e]">{s.complaint}</p>
                    </div>
                  )}

                  <div className="border-t border-[#c4c6d4] pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-[#434652] uppercase tracking-wider font-semibold">Catatan Sesi</p>
                      {editingNotes === s.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingNotes(null); setNotesText(''); }}
                            className="text-xs text-[#434652] hover:text-red-500"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleSaveNotes(s.id)}
                            disabled={savingNotes}
                            className="text-xs text-[#002768] font-semibold hover:underline disabled:opacity-50"
                          >
                            {savingNotes ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNotes(s.id); setNotesText(s.notes || ''); }}
                          className="text-xs text-[#002768] hover:underline"
                        >
                          {s.notes ? 'Edit' : 'Tambah Catatan'}
                        </button>
                      )}
                    </div>
                    {editingNotes === s.id ? (
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Tulis catatan sesi..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30 resize-none"
                      />
                    ) : s.notes ? (
                      <p className="text-sm text-[#1a1c1e] bg-[#eeeef0] p-3 rounded-xl border border-[#c4c6d4]">{s.notes}</p>
                    ) : (
                      <p className="text-sm text-[#747783] italic">Belum ada catatan.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </PortalLayout>
  );
}
