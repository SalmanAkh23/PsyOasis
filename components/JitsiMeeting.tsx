import React, { useEffect, useRef } from 'react';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  email?: string;
  onLeave?: () => void;
}

export default function JitsiMeeting({ roomName, displayName, email, onLeave }: JitsiMeetingProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}#userInfo.displayName="${encodeURIComponent(displayName)}"${email ? `&userInfo.email=${encodeURIComponent(email)}` : ''}&config.disableDeepLinking=true&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false`;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture"
        className="w-full h-full border-0"
        title="Video Consultation"
        allowFullScreen
      />
    </div>
  );
}
