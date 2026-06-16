import React, { useEffect, useRef, useState, useCallback } from 'react';

interface VideoCallProps {
  roomName: string;
  displayName: string;
  signalingUrl?: string;
  onLeave?: () => void;
}

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export default function VideoCall({ roomName, displayName, signalingUrl, onLeave }: VideoCallProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [peerPresent, setPeerPresent] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const pendingCandidatesRef = useRef<any[]>([]);

  const url = signalingUrl || process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:3002';

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setCallActive(false);
    setPeerPresent(false);
  }, []);

  const createPeerConnection = useCallback((ws: WebSocket, myPeerId: string) => {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          to: peerId,
          candidate: event.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        cleanup();
      }
    };

    pc.onsignalingstatechange = () => {
      if (pc.signalingState === 'closed') cleanup();
    };

    pcRef.current = pc;
    return pc;
  }, [cleanup, peerId]);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallActive(true);
    } catch (err) {
      console.error('Camera/mic access denied:', err);
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case 'connected':
          setPeerId(msg.peerId);
          ws.send(JSON.stringify({ type: 'join-room', roomId: roomName }));
          break;

        case 'room-joined':
          if (msg.peerCount > 1) setPeerPresent(true);
          break;

        case 'peer-joined':
          setPeerPresent(true);
          if (callActive) {
            const pc = createPeerConnection(ws, msg.peerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', to: msg.peerId, sdp: pc.localDescription }));
          }
          break;

        case 'offer':
          if (callActive) {
            const pc = createPeerConnection(ws, msg.from);
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', to: msg.from, sdp: pc.localDescription }));
            for (const c of pendingCandidatesRef.current) {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingCandidatesRef.current = [];
          }
          break;

        case 'answer':
          if (pcRef.current && callActive) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            for (const c of pendingCandidatesRef.current) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingCandidatesRef.current = [];
          }
          break;

        case 'ice-candidate':
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } else {
            pendingCandidatesRef.current.push(msg.candidate);
          }
          break;

        case 'peer-left':
          setPeerPresent(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      cleanup();
    };

    return () => {
      ws.close();
      cleanup();
    };
  }, [roomName, callActive, createPeerConnection, cleanup, url]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const enabled = !micOn;
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = enabled);
      setMicOn(enabled);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const enabled = !camOn;
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = enabled);
      setCamOn(enabled);
    }
  };

  const endCall = () => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'leave-room' }));
    }
    cleanup();
    onLeave?.();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#1a1c1e] rounded-xl overflow-hidden">
      {!callActive ? (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">Enable camera & microphone to start</p>
          <button
            onClick={startCall}
            className="px-8 py-3 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Start Camera & Mic
          </button>
        </div>
      ) : (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-36 h-28 object-cover rounded-xl shadow-lg border-2 border-white/20 bg-[#2a2c2e]"
          />

          {!peerPresent && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-white/80 text-lg font-semibold">Waiting for other participant...</p>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-full transition-all ${micOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/80'}`}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 10.5 4.5-4.5m-4.5 4.5 4.5 4.5m-4.5-4.5L12 6m4.5 4.5L12 15M12 6l-4.5 4.5M12 6v8.25m0 0L7.5 18M12 14.25 16.5 18" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleCam}
              className={`p-3.5 rounded-full transition-all ${camOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/80'}`}
              title={camOn ? 'Camera off' : 'Camera on'}
            >
              {camOn ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 10.5 4.5-4.5m-4.5 4.5 4.5 4.5m-4.5-4.5L12 6m4.5 4.5L12 15M12 6l-4.5 4.5M12 6v8.25m0 0L7.5 18M12 14.25 16.5 18" />
                </svg>
              )}
            </button>
            <button
              onClick={endCall}
              className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 transition-all"
              title="End call"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 16.5 12 12m0 0-4.5 4.5M12 12l4.5-4.5m-4.5 4.5-4.5-4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          </div>
        </>
      )}

      {!connected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500/90 text-white text-sm rounded-lg">
          Connecting to signaling server...
        </div>
      )}
    </div>
  );
}
