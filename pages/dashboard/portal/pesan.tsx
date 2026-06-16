import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getPsychologistByUserId,
  getChatPatients,
  getChatMessages,
  sendMessageToPatient,
  markMessagesRead,
} from '../../../lib/db-psikolog';
import PortalLayout from '../../../components/dashboard/portal/Layout';

export default function PortalPesan() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) {
        setPsychologistId(prof.id);
        getChatPatients(prof.id).then((pats) => {
          setPatients(pats);
        }).finally(() => setDataLoading(false));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!selectedPatient || !psychologistId) return;
    setMessagesLoading(true);
    getChatMessages(psychologistId, selectedPatient.id).then((msgs) => {
      setMessages(msgs);
      markMessagesRead(selectedPatient.id, psychologistId);
      setPatients((prev) =>
        prev.map((p) => (p.id === selectedPatient.id ? { ...p, unread: 0 } : p))
      );
    }).finally(() => setMessagesLoading(false));
  }, [selectedPatient, psychologistId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!psychologistId || !selectedPatient || !newMessage.trim()) return;
    setSending(true);
    try {
      await sendMessageToPatient(psychologistId, selectedPatient.id, newMessage.trim());
      const updated = await getChatMessages(psychologistId, selectedPatient.id);
      setMessages(updated);
      setNewMessage('');
      getChatPatients(psychologistId).then(setPatients);
    } catch (err) {
      console.error('Send error:', err);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading || !user) return null;

  return (
    <PortalLayout title="Messages" doctorName={user?.displayName || 'Dr. Smith'}>
      <div className="bg-white rounded-2xl border border-[#c4c6d4] overflow-hidden flex h-[600px]">
        <div className="w-80 border-r border-[#c4c6d4] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#c4c6d4]">
            <h3 className="font-semibold text-[#1a1c1e]">Percakapan</h3>
            <p className="text-xs text-[#434652] mt-0.5">{patients.length} pasien</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {dataLoading ? (
              <div className="p-4 text-sm text-[#434652] text-center">Memuat...</div>
            ) : patients.length === 0 ? (
              <div className="p-4 text-sm text-[#747783] text-center">Belum ada percakapan.</div>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-[#c4c6d4]/50 ${
                    selectedPatient?.id === p.id ? 'bg-[#DCEEF8]' : 'hover:bg-[#eeeef0]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#002768] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(p.displayName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1a1c1e] truncate">{p.displayName}</span>
                      {p.lastMessageTime && (
                        <span className="text-[10px] text-[#747783] shrink-0 ml-2">
                          {new Date(p.lastMessageTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#434652] truncate">{p.lastMessage || 'Pesan pertama'}</span>
                      {p.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#002768] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {p.unread > 9 ? '9+' : p.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedPatient ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-[#c4c6d4] flex items-center gap-3 bg-[#eeeef0]">
              <div className="w-10 h-10 rounded-full bg-[#002768] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(selectedPatient.displayName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1a1c1e]">{selectedPatient.displayName}</span>
                <button
                  onClick={() => router.push(`/dashboard/portal/pasien/${selectedPatient.id}`)}
                  className="block text-[10px] text-[#002768] hover:underline"
                >
                  Lihat profil pasien
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="text-center text-sm text-[#434652] py-8">Memuat pesan...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-[#747783] py-8">
                  Belum ada pesan. Kirim pesan pertama untuk memulai percakapan.
                </div>
              ) : (
                messages.map((m: any, idx: number) => {
                  const isMe = m.senderId === psychologistId || m.senderRole === 'psychologist';
                  return (
                    <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-[#002768] text-white rounded-br-md'
                            : 'bg-[#f2f4f5] text-[#1a1c1e] rounded-bl-md'
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[#747783]'}`}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-[#c4c6d4] bg-[#eeeef0]">
              <div className="flex items-center gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#c4c6d4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002768]/30 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-2.5 bg-[#002768] text-white rounded-xl text-sm font-semibold hover:bg-[#003b95] transition-all disabled:opacity-50"
                >
                  {sending ? '...' : 'Kirim'}
                </button>
              </div>
              <p className="text-[10px] text-[#747783] mt-1">Enter untuk kirim</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#747783]">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl">chat</span>
              <p className="mt-2 text-sm">Pilih pasien untuk memulai percakapan</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </PortalLayout>
  );
}
