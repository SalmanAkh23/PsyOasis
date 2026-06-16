import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getTodaysAppointments,
  getUpcomingAppointments,
  getAllPatients,
  getEarningsData,
  getPsychologistByUserId,
} from '../../../lib/db-psikolog';
import { getUnreadNotificationCount } from '../../../lib/db';
import PortalLayout from '../../../components/dashboard/portal/Layout';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return { hour: `${hour}:${String(m).padStart(2, '0')}`, ampm };
}

export default function PortalOverview() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [profile, setProfile] = useState<any>(null);
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({ total: 0, sessions: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  const doctorName = profile?.name || profile?.displayName || 'Dr. Smith';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);

    getPsychologistByUserId(user.uid)
      .then((prof) => {
        if (!prof?.id) {
          setDataLoading(false);
          return;
        }
        setProfile(prof);
        const pid = prof.id;
        Promise.all([
          getTodaysAppointments(pid),
          getUpcomingAppointments(pid),
          getAllPatients(pid),
          getEarningsData(pid),
          getUnreadNotificationCount(user.uid),
        ])
          .then(([today, upcoming, pats, earn, unread]) => {
            setTodayAppts(today as any[]);
            setUpcomingAppts(upcoming as any[]);
            setPatients(pats as any[]);
            setEarnings(earn as any);
            setUnreadCount(unread);
          })
          .catch(console.error)
          .finally(() => setDataLoading(false));
      })
      .catch(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) return null;

  const today = new Date();
  const dayName = weekDays[today.getDay()];
  const monthName = monthNames[today.getMonth()];
  const dateStr = `${dayName}, ${monthName} ${today.getDate()}, ${today.getFullYear()}`;

  const stats = [
    {
      label: 'Appointments Today',
      value: todayAppts.length,
      icon: 'calendar_today',
      accent: 'border-l-4 border-primary',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary-fixed-variant',
    },
    {
      label: 'Total Patients',
      value: patients.length,
      icon: 'group',
      accent: '',
      iconBg: 'bg-secondary-fixed',
      iconColor: 'text-secondary-fixed-variant',
    },
    {
      label: 'New Messages',
      value: unreadCount,
      icon: 'mail',
      accent: '',
      iconBg: 'bg-tertiary-fixed',
      iconColor: 'text-tertiary-fixed-variant',
    },
    {
      label: 'Weekly Earnings',
      value: earnings.total > 0 ? `Rp${(earnings.total / 1000).toFixed(0)}k` : 'Rp0',
      icon: 'payments',
      accent: '',
      iconBg: 'bg-surface-variant',
      iconColor: 'text-on-surface-variant',
    },
  ];

  return (
    <PortalLayout title="Overview" doctorName={doctorName}>
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {getGreeting()}, Dr. {doctorName.replace(/^Dr\.?\s*/i, '')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{dateStr}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/portal/jadwal')}
            className="bg-surface-container-lowest text-primary border border-primary px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-primary/5 transition-colors active:scale-95"
          >
            Update Schedule
          </button>
          <button
            onClick={() => router.push('/dashboard/portal/jadwal')}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">video_camera_front</span>
            Start Session
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-surface-container-lowest rounded-xl p-6 ambient-shadow flex items-start justify-between group hover:-translate-y-1 transition-transform ${s.accent}`}
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
          >
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">{s.label}</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                {dataLoading ? '-' : s.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center ${s.iconColor} group-hover:scale-110 transition-transform`}
            >
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl flex flex-col h-[500px]"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}>
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">Today&apos;s Schedule</h3>
            <button
              onClick={() => router.push('/dashboard/portal/jadwal')}
              className="text-primary font-label-sm text-label-sm hover:underline"
            >
              View Full Calendar
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">
                Loading schedule...
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-4xl text-outline">event_busy</span>
                <p className="font-body-md text-body-md">No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppts.map((appt: any, idx: number) => {
                const fmt = formatTime(appt.time);
                const initial = (appt.userName || 'U').charAt(0).toUpperCase();
                const mode = appt.mode === 'offline' ? 'In-Person Consultation' : 'Online Therapy';
                const modeColor = appt.mode === 'offline' ? 'bg-tertiary' : 'bg-secondary';
                const icon = appt.mode === 'offline' ? 'note_add' : 'videocam';
                return (
                  <div
                    key={appt.id || idx}
                    className="flex items-center gap-4 p-4 rounded-lg bg-surface hover:bg-surface-container-low transition-colors border border-outline-variant/20"
                  >
                    <div className="text-center w-16">
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{fmt.hour}</p>
                      <p className="font-caption text-caption text-outline">{fmt.ampm}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden flex items-center justify-center text-on-primary-container font-bold text-sm">
                      {initial}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-md text-label-md text-on-surface">{appt.userName || 'Patient'}</h4>
                      <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${modeColor}`}></span>
                        {mode}
                      </p>
                    </div>
                    <div>
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </button>
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-gutter h-[500px]">
          <div
            className="bg-surface-container-lowest rounded-xl p-6 flex-1 flex flex-col"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Patients</h3>
            </div>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                  Loading...
                </div>
              ) : patients.length === 0 ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                  No patients yet
                </div>
              ) : (
                patients.slice(0, 5).map((p: any) => {
                  const initials = (p.displayName || '??')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isActive = p.status === 'Active';
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold ${
                            isActive ? 'bg-primary-fixed text-primary-fixed-variant' : 'bg-tertiary-fixed text-tertiary-fixed-variant'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{p.displayName}</p>
                          <p className="font-caption text-caption text-on-surface-variant">
                            {p.lastVisit ? `Updated ${getTimeAgo(p.lastVisit)}` : 'New'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-semibold ${
                          isActive
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {isActive ? 'Active' : 'Review'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => router.push('/dashboard/portal/pasien')}
              className="w-full mt-2 py-2 text-primary font-label-sm text-label-sm hover:bg-primary-fixed/20 rounded transition-colors"
            >
              View All Patients
            </button>
          </div>

          <div
            className="bg-surface-container-lowest rounded-xl p-6 h-48 flex flex-col justify-between"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Earnings</h3>
                <p className="font-caption text-caption text-on-surface-variant">This Month</p>
              </div>
              <span className="text-secondary font-label-md text-label-md flex items-center">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +12%
              </span>
            </div>
            <div className="flex items-end justify-between h-20 gap-2 mt-4">
              {dataLoading ? (
                <div className="w-full flex items-center justify-center text-on-surface-variant text-sm">
                  Loading...
                </div>
              ) : (
                (() => {
                  const monthlyData = (Object.entries(earnings.monthlyEarnings || {}) as [string, number][])
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-4);
                  const maxVal = Math.max(...monthlyData.map(([, v]) => v), 1);
                  return monthlyData.length === 0
                    ? [0, 0, 0, 0].map((_, i) => (
                        <div key={i} className="w-full rounded-t-sm bg-surface-container-highest" style={{ height: '10%' }} />
                      ))
                    : monthlyData.map(([month, amount], i) => {
                        const heightPct = (amount / maxVal) * 80;
                        return (
                          <div
                            key={month}
                            className={`w-full rounded-t-sm ${
                              i === monthlyData.length - 1 ? 'bg-primary' : 'bg-surface-container-highest hover:bg-primary'
                            } transition-colors cursor-pointer relative group`}
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Rp{(amount / 1000).toFixed(0)}k
                            </div>
                          </div>
                        );
                      });
                })()
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .ambient-shadow {
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.04);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </PortalLayout>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
