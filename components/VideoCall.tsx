import React, { useEffect, useRef, useState } from 'react';

interface VideoCallProps {
  roomName: string;
  displayName: string;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'localhost:8000';
const JITSI_HTTP = JITSI_DOMAIN.startsWith('localhost') ? 'http' : 'https';

export default function VideoCall({ roomName, displayName, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const leftRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    leftRef.current = false;
    setLoading(true);
    setError(false);

    const script = document.createElement('script');
    script.src = `${JITSI_HTTP}://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;

    script.onload = () => {
      if (!containerRef.current) return;
      try {
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          userInfo: { displayName },
          configOverrides: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            disableSimulcast: false,
            enableNoAudioDetection: false,
            enableNoisyMicDetection: false,
            disableLobby: true,
            requireDisplayName: true,
            doNotStoreRoom: true,
            p2p: {
              enabled: true,
            },
          },
          interfaceConfigOverrides: {
            FILM_STRIP_ENABLED: true,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            DISABLE_PRESENCE_STATUS: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Partner',
            DISPLAY_NAME: displayName,
          },
        });

        apiRef.current = api;

        api.addListener('videoConferenceJoined', () => setLoading(false));

        api.addListener('readyToClose', () => {
          if (leftRef.current) return;
          leftRef.current = true;
          onLeave?.();
        });
      } catch {
        setError(true);
      }
    };

    script.onerror = () => setError(true);
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomName, displayName, onLeave]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-[#1a1c1e] rounded-xl">
        <div className="text-center max-w-sm">
          <p className="text-red-400 text-lg font-semibold mb-2">Gagal terhubung ke Jitsi</p>
          <p className="text-white/50 text-sm">Coba buka link ini di tab baru:<br />
            <a href={`https://${JITSI_DOMAIN}/${roomName}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{JITSI_DOMAIN}/{roomName}</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1c1e] z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Bergabung ke ruang video...</p>
          </div>
        </div>
      )}
    </div>
  );
}
