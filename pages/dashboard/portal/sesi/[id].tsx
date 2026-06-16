import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import PortalLayout from '../../../../components/dashboard/portal/Layout';
import VideoCall from '../../../../components/VideoCall';

export default function PortalSession() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const { id } = router.query;
  const [joined, setJoined] = useState(false);

  if (loading || !user || !id) return null;

  const roomName = `PsyOasis-${(id as string).replace(/-/g, '').slice(0, 12)}`;

  return (
    <PortalLayout title="Video Session" doctorName={user?.displayName || 'Dr. Smith'}>
      <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Video Session</h2>
            </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/portal/jadwal')}
              className="px-5 py-2.5 border border-error text-error rounded-lg font-label-md text-label-md hover:bg-error/5 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          {!joined ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">video_camera_front</span>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Ready to start the session?
              </p>
              <button
                onClick={() => setJoined(true)}
                className="px-8 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">videocam</span>
                Join Session
              </button>
            </div>
          ) : (
            <VideoCall
              roomName={roomName}
              displayName={user?.displayName || 'Doctor'}
              onLeave={() => router.push('/dashboard/portal/jadwal')}
            />
          )}
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
