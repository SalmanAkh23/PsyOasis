import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  getPatientChatContacts,
  getPatientChatMessages,
  sendPatientMessage,
  markPatientMessagesRead,
} from '../../lib/db';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function toCamelCase(obj: any) {
  return {
    id: obj.id,
    message: obj.message,
    senderId: obj.sender_id,
    senderRole: obj.sender_role,
    receiverId: obj.receiver_id,
    read: obj.read,
    createdAt: obj.created_at,
  };
}

export default function PesanPage() {
  const router = useRouter();
  const { user, loading } = useAuth() as any;
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getPatientChatContacts(user.uid).then((c) => {
      setContacts(c);
    }).finally(() => setDataLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedContact || !user) return;
    setMessagesLoading(true);
    getPatientChatMessages(user.uid, selectedContact.id).then((msgs) => {
      setMessages(msgs);
      markPatientMessagesRead(selectedContact.id, user.uid);
      setContacts((prev) =>
        prev.map((c) => (c.id === selectedContact.id ? { ...c, unread: 0 } : c))
      );
    }).finally(() => setMessagesLoading(false));
  }, [selectedContact, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user || !selectedContact) return;
    const channel = supabase
      .channel('patient-messages-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `or(and(sender_id.eq.${user.uid},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.uid}))`
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, toCamelCase(newMsg)];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedContact]);

  const handleSend = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    setSending(true);
    try {
      await sendPatientMessage(user.uid, selectedContact.id, newMessage.trim());
      setNewMessage('');
      getPatientChatContacts(user.uid).then(setContacts);
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
    <>
      <Head><title>Pesan – PsyOasis</title></Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1a1c1e] font-['Poppins']">Pesan</h1>
          <p className="text-xs text-[#434652] mt-0.5 font-['Inter']">Chat dengan psikolog Anda</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#c4c6d4] overflow-hidden flex h-[600px]">
          {/* Contact list */}
          <div className="w-80 border-r border-[#c4c6d4] flex flex-col shrink-0">
            <div className="p-4 border-b border-[#c4c6d4]">
              <h3 className="font-semibold text-[#1a1c1e]">Kontak</h3>
              <p className="text-xs text-[#434652] mt-0.5">{contacts.length} psikolog</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {dataLoading ? (
                <div className="p-4 text-sm text-[#434652] text-center">Memuat...</div>
              ) : contacts.length === 0 ? (
                <div className="p-4 text-sm text-[#747783] text-center">Belum ada percakapan. Booking konsultasi untuk memulai.</div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-[#c4c6d4]/50 ${
                      selectedContact?.id === c.id ? 'bg-[#DCEEF8]' : 'hover:bg-[#eeeef0]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#002768] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(c.displayName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1a1c1e] truncate">{c.displayName}</span>
                        {c.lastMessageTime && (
                          <span className="text-[10px] text-[#747783] shrink-0 ml-2">
                            {new Date(c.lastMessageTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#434652] truncate">{c.lastMessage || 'Pesan pertama'}</span>
                        {c.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#002768] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {c.unread > 9 ? '9+' : c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          {selectedContact ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-[#c4c6d4] flex items-center gap-3 bg-[#eeeef0]">
                <button onClick={() => setSelectedContact(null)} className="lg:hidden mr-1">
                  <ArrowLeftIcon className="w-5 h-5 text-[#434652]" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#002768] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(selectedContact.displayName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1a1c1e]">{selectedContact.displayName}</span>
                  {selectedContact.specialty && (
                    <span className="block text-[10px] text-[#002768]">{selectedContact.specialty}</span>
                  )}
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
                    const isMe = m.senderId === user.uid;
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
                <span className="text-5xl">💬</span>
                <p className="mt-2 text-sm">Pilih psikolog untuk memulai percakapan</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
