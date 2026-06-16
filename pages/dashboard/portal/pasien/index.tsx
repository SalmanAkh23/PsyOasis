import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAllPatients, getPsychologistByUserId } from '../../../../lib/db-psikolog';
import PortalLayout from '../../../../components/dashboard/portal/Layout';

export default function PortalPasien() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [patients, setPatients] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    getAllPatients(psychologistId)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [psychologistId]);

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.displayName || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  });

  if (loading || !user) return null;

  return (
    <PortalLayout title="Patient Records" doctorName={user?.displayName || 'Dr. Smith'}>
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Patient Records</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            View and manage your patient records.
          </p>
        </div>
        <div className="bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-2 w-72 border border-transparent focus-within:border-primary focus-within:bg-surface transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            className="bg-transparent border-none outline-none font-body-md text-body-md w-full placeholder:text-outline text-on-surface focus:ring-0 p-0"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Patient</th>
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Email</th>
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Last Visit</th>
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Sessions</th>
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    Loading patient records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    {search ? 'No patients match your search.' : 'No patient records yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p: any) => {
                  const initials = (p.displayName || '??')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isActive = p.status === 'Active';
                  return (
                    <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/portal/pasien/${p.id}`)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-label-sm font-bold ${
                              isActive ? 'bg-primary-fixed text-primary-fixed-variant' : 'bg-tertiary-fixed text-tertiary-fixed-variant'
                            }`}
                          >
                            {initials}
                          </div>
                          <span className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors">{p.displayName}</span>
                        </div>
                      </td>
                      <td className="p-4 font-body-md text-body-md text-on-surface-variant">{p.email}</td>
                      <td className="p-4 font-body-md text-body-md text-on-surface-variant">
                        {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className="font-headline-md text-headline-md text-primary">{p.totalSessions}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded text-[10px] font-semibold ${
                            isActive
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {isActive ? 'Active' : 'Review'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {/* TODO: open chat or detail */}}
                          className="flex items-center gap-1 text-primary font-label-sm text-label-sm hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          Message
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center">
          <p className="font-caption text-caption text-on-surface-variant">
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </PortalLayout>
  );
}
