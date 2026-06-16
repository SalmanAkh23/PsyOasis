import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import VideoCall from '../../../../components/VideoCall';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PatientSession() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const { id } = router.query;
  const [joined, setJoined] = useState(false);

  if (loading || !user || !id) return null;

  const roomName = `PsyOasis-${(id as string).replace(/-/g, '').slice(0, 12)}`;

  return (
    <>
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/konsultasi')}
                className="p-2 rounded-xl hover:bg-[#f0f1f5] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-[#434652]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Video Session</h1>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/konsultasi')}
              className="px-5 py-2.5 text-sm font-semibold font-['Inter'] text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Leave Session
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black shadow-[0_8px_30px_rgba(0,0,0,0.12)]" style={{ height: 'calc(100vh - 200px)', minHeight: '460px' }}>
            {!joined ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 bg-white">
                <div className="w-20 h-20 rounded-full bg-[#002768]/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#002768]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <p className="text-sm text-[#434652] font-['Inter']">Ready to join the session?</p>
                <button
                  onClick={() => setJoined(true)}
                  className="px-8 py-3 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Join Now
                </button>
              </div>
            ) : (
              <VideoCall
                roomName={roomName}
                displayName={user?.displayName || 'Patient'}
                onLeave={() => router.push('/dashboard/konsultasi')}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
