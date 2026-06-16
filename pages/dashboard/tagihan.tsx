import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getPaymentHistory } from '../../lib/db'
import { CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatFee(fee: string): number {
  return parseInt((fee || '0').replace(/[^0-9]/g, '')) || 0;
}

export default function TagihanPage() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    getPaymentHistory(user.uid)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) return null;

  const grouped: Record<string, any[]> = {};
  for (const t of transactions) {
    const monthKey = t.date ? t.date.substring(0, 7) : 'unknown';
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(t);
  }

  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const totalSpent = transactions.reduce((sum, t) => sum + formatFee(t.fee), 0);

  return (
    <>
      <Head><title>Tagihan â€“ PsyOasis</title></Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Riwayat Pembayaran</h1>
          <p className="text-xs text-[#434652] mt-0.5 font-['Inter']">Riwayat transaksi konsultasi Anda</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#c4c6d4] shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#002768]/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-[#002768]" />
            </div>
            <div>
              <p className="text-xs text-[#434652] font-['Inter']">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-[#1a1c1e] font-['Poppins']">
                Rp{totalSpent.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-[#747783] font-['Inter']">{transactions.length} sesi selesai</p>
            </div>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#434652]">Memuat...</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-[#434652] gap-2">
            <DocumentTextIcon className="w-8 h-8 text-[#c4c6d4]" />
            <span>Belum ada transaksi</span>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
              const [y, m] = monthKey.split('-');
              const label = `${monthNames[parseInt(m) - 1]} ${y}`;
              const monthTotal = grouped[monthKey].reduce((sum, t) => sum + formatFee(t.fee), 0);
              return (
                <div key={monthKey}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1a1c1e] font-['Poppins']">{label}</h3>
                    <span className="text-xs font-semibold text-[#002768] font-['Inter']">
                      Rp{monthTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {grouped[monthKey].map((txn: any) => (
                      <div
                        key={txn.id}
                        className="rounded-xl bg-white p-4 border border-[#c4c6d4] flex items-center justify-between hover:bg-[#eeeef0] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#f2f4f5] flex items-center justify-center text-xs font-bold text-[#002768]">
                            {(txn.psychologistName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1a1c1e] font-['Inter']">
                              {txn.psychologistName || 'Psikolog'}
                            </p>
                            <p className="text-[10px] text-[#434652] font-['Inter']">
                              {txn.date} â€¢ {txn.time} â€¢ {txn.serviceName || 'Konsultasi'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1a1c1e] font-['Inter']">
                            Rp{formatFee(txn.fee).toLocaleString('id-ID')}
                          </p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 font-['Inter']">
                            Lunas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
