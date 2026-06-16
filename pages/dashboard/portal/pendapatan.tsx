import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { getEarningsData, getAppointmentsByDateRange, getPsychologistByUserId } from '../../../lib/db-psikolog';
import PortalLayout from '../../../components/dashboard/portal/Layout';

function formatFee(fee: string): number {
  return parseInt((fee || '0').replace(/[^0-9]/g, '')) || 0;
}

export default function PortalPendapatan() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [earnings, setEarnings] = useState<any>({ total: 0, sessions: 0, monthlyEarnings: {} });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [psychologistId, setPsychologistId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) setPsychologistId(prof.id);
    });
  }, [user]);

  useEffect(() => {
    if (!psychologistId) return;
    setDataLoading(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    Promise.all([
      getEarningsData(psychologistId),
      getAppointmentsByDateRange(psychologistId, startOfMonth, endOfMonth),
    ])
      .then(([earn, txns]) => {
        setEarnings(earn);
        setRecentTransactions(txns as any[]);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [psychologistId]);

  if (loading || !user) return null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <PortalLayout title="Earnings" doctorName={user?.displayName || 'Dr. Smith'}>
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Earnings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Track your earnings and transactions.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div
          className="bg-surface-container-lowest rounded-xl p-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Earnings</p>
          <h3 className="font-display-lg text-display-lg text-primary">
            {dataLoading ? '-' : `Rp${(earnings.total || 0).toLocaleString('id-ID')}`}
          </h3>
          <p className="font-caption text-caption text-on-surface-variant mt-1">Lifetime earnings</p>
        </div>
        <div
          className="bg-surface-container-lowest rounded-xl p-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Sessions Completed</p>
          <h3 className="font-display-lg text-display-lg text-primary">
            {dataLoading ? '-' : earnings.sessions || 0}
          </h3>
          <p className="font-caption text-caption text-on-surface-variant mt-1">Total sessions</p>
        </div>
        <div
          className="bg-surface-container-lowest rounded-xl p-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Monthly Average</p>
          <h3 className="font-display-lg text-display-lg text-primary">
            {dataLoading
              ? '-'
              : `Rp${(
                  (earnings.total || 0) /
                  Math.max(Object.keys(earnings.monthlyEarnings || {}).length, 1)
                ).toLocaleString('id-ID')}`}
          </h3>
          <p className="font-caption text-caption text-on-surface-variant mt-1">Per month average</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div
          className="bg-surface-container-lowest rounded-xl p-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Monthly Breakdown</h3>
          {dataLoading ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant">
              Loading...
            </div>
          ) : Object.keys(earnings.monthlyEarnings || {}).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-4xl text-outline">bar_chart</span>
              <p className="font-body-md">No earnings data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(earnings.monthlyEarnings as Record<string, number>)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, amount]) => {
                  const [y, m] = month.split('-');
                  const label = `${monthNames[parseInt(m) - 1]} ${y}`;
                  const maxAmount = Math.max(...Object.values(earnings.monthlyEarnings as Record<string, number>));
                  const percent = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                  return (
                    <div key={month} className="flex items-center gap-4">
                      <span className="font-label-sm text-label-sm text-on-surface-variant w-20">{label}</span>
                      <div className="flex-1 bg-surface-container-highest rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface w-24 text-right">
                        Rp{(amount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div
          className="bg-surface-container-lowest rounded-xl p-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
        >
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Recent Transactions</h3>
          {dataLoading ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant">
              Loading...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
              <p className="font-body-md">No transactions this month</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentTransactions.slice(0, 10).map((txn: any) => {
                const statusColor =
                  txn.status === 'selesai'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : txn.status === 'dikonfirmasi'
                    ? 'bg-primary-fixed text-primary-fixed-variant'
                    : 'bg-surface-variant text-on-surface-variant';
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-container-low transition-colors"
                  >
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        {txn.userName || 'Patient'}
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {txn.date} • {txn.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-label-md text-label-md text-on-surface">{txn.fee || 'N/A'}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </PortalLayout>
  );
}
