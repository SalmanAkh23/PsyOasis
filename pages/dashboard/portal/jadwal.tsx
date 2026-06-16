import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getUpcomingAppointments,
  updateAppointmentStatus,
  getPsychologistByUserId,
  createBookingByDoctor,
} from '../../../lib/db-psikolog';
import { services } from '../../../lib/services';
import PortalLayout from '../../../components/dashboard/portal/Layout';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function PortalJadwal() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    patientEmail: '',
    patientWa: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    mode: 'online',
    complaint: '',
    fee: '',
  });

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) setPsychologistId(prof.id);
    });
  }, [user]);

  useEffect(() => {
    if (!psychologistId) return;
    setDataLoading(true);
    getUpcomingAppointments(psychologistId)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [psychologistId]);

  useEffect(() => {
    if (router.query.new === '1') setShowModal(true);
  }, [router.query.new]);

  const filteredAppts = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const groupedByDate: Record<string, any[]> = {};
  for (const appt of filteredAppts) {
    const date = appt.date || 'unknown';
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(appt);
  }

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    try {
      await updateAppointmentStatus(bookingId, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === bookingId ? { ...a, status } : a))
      );
    } catch (err) {
      console.error('Update error:', err);
    }
    setUpdating(null);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologistId || !form.patientName.trim() || !form.serviceId) return;
    setSubmitting(true);
    try {
      const svc = services.find(s => s.id === form.serviceId);
      const fee = form.fee || '200000';
      await createBookingByDoctor({
        psychologistId,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim(),
        patientWa: form.patientWa.trim(),
        serviceId: form.serviceId,
        serviceName: svc?.title || 'Consultation',
        date: form.date,
        time: form.time,
        mode: form.mode,
        complaint: form.complaint,
        fee,
      });
      setShowModal(false);
      setForm({ patientName: '', patientEmail: '', patientWa: '', serviceId: '', date: new Date().toISOString().split('T')[0], time: '09:00', mode: 'online', complaint: '', fee: '' });
      const updated = await getUpcomingAppointments(psychologistId);
      setAppointments(updated);
    } catch (err: any) {
      alert(err?.message || 'Gagal membuat appointment');
    }
    setSubmitting(false);
  };

  if (loading || !user) return null;

  return (
    <PortalLayout title="Schedule" doctorName={user?.displayName || 'Dr. Smith'}>
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Schedule</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage your appointments and sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Appointment
          </button>
          {['all', 'menunggu', 'dikonfirmasi', 'selesai'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors ${
                filter === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-xl p-6"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}>
        {dataLoading ? (
          <div className="flex items-center justify-center h-40 text-on-surface-variant">
            Loading schedule...
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-2">
            <span className="material-symbols-outlined text-4xl text-outline">calendar_today</span>
            <p className="font-body-md">No appointments found</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, appts]) => {
            const d = new Date(date);
            const dayName = weekDays[d.getDay()] || '';
            const formatted = `${dayName}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div key={date} className="mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-3 h-3 rounded-full ${isToday ? 'bg-primary' : 'bg-outline'}`}></span>
                  <h3 className={`font-headline-md text-headline-md ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                    {isToday ? `Today – ${formatted}` : formatted}
                  </h3>
                  <span className="font-caption text-caption text-on-surface-variant">
                    {appts.length} appointment{appts.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-3">
                  {appts.map((appt: any) => {
                    const initial = (appt.userName || 'U').charAt(0).toUpperCase();
                    const mode = appt.mode === 'offline' ? 'In-Person' : 'Online';
                    const modeColor = appt.mode === 'offline' ? 'bg-tertiary' : 'bg-secondary';
                    const isPending = appt.status === 'menunggu';
                    const isConfirmed = appt.status === 'dikonfirmasi';
                    const isDone = appt.status === 'selesai';
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-surface hover:bg-surface-container-low transition-colors border border-outline-variant/20"
                      >
                        <div className="text-center w-20">
                          <p className="font-headline-md text-headline-md text-primary">{formatTime(appt.time)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary-container overflow-hidden flex items-center justify-center text-on-primary-container font-bold text-lg">
                          {initial}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-label-md text-label-md text-on-surface">{appt.userName || 'Patient'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${modeColor === 'bg-secondary' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                              {mode}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isDone ? 'bg-secondary-container text-on-secondary-container' :
                              isConfirmed ? 'bg-primary-fixed text-primary-fixed-variant' :
                              isPending ? 'bg-amber-100 text-amber-800' :
                              'bg-surface-variant text-on-surface-variant'
                            }`}>
                              {isDone ? 'Completed' : isConfirmed ? 'Confirmed' : isPending ? 'Pending' : appt.status}
                            </span>
                          </div>
                          <p className="font-caption text-caption text-on-surface-variant mt-1">
                            {appt.serviceName || 'Consultation'} • {appt.fee || 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleStatusUpdate(appt.id, 'dikonfirmasi')}
                              disabled={updating === appt.id}
                              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {updating === appt.id ? '...' : 'Confirm'}
                            </button>
                          )}
                          {isPending && (
                            <button
                              onClick={() => handleStatusUpdate(appt.id, 'dibatalkan')}
                              disabled={updating === appt.id}
                              className="px-4 py-2 border border-error text-error rounded-lg font-label-sm text-label-sm hover:bg-error/5 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={() => router.push(`/dashboard/portal/sesi/${appt.id}`)}
                              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm leading-none">video_camera_front</span>
                              Start Session
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={() => handleStatusUpdate(appt.id, 'selesai')}
                              disabled={updating === appt.id}
                              className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm hover:bg-secondary/90 transition-colors disabled:opacity-50"
                            >
                              {updating === appt.id ? '...' : 'Complete'}
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={() => handleStatusUpdate(appt.id, 'dibatalkan')}
                              disabled={updating === appt.id}
                              className="px-4 py-2 border border-error text-error rounded-lg font-label-sm text-label-sm hover:bg-error/5 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">New Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Patient Name *</label>
                <input
                  required
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="Full name"
                  className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.patientEmail}
                    onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                    placeholder="patient@mail.com"
                    className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">WhatsApp</label>
                  <input
                    value={form.patientWa}
                    onChange={(e) => setForm({ ...form, patientWa: e.target.value })}
                    placeholder="+62 812-xxxx"
                    className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Service *</label>
                <select
                  required
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Time *</label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Mode</label>
                <div className="flex gap-3">
                  {['online', 'offline'].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        value={m}
                        checked={form.mode === m}
                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                        className="accent-primary"
                      />
                      <span className="text-sm text-on-surface">{m === 'online' ? 'Online' : 'In-Person'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Fee (Rp)</label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder="200000"
                  className="w-full h-11 px-4 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Notes / Complaint</label>
                <textarea
                  value={form.complaint}
                  onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </PortalLayout>
  );
}
