import { supabase, toCamelCase } from './supabase';

export async function getPsychologistByUserId(userId: string) {
  const { data } = await supabase
    .from('psychologists')
    .select('*')
    .eq('user_id', userId)
    .single();
  return toCamelCase(data);
}

export async function getPsychologistProfile(psychologistId: string) {
  const { data } = await supabase
    .from('psychologists')
    .select('*')
    .eq('id', psychologistId)
    .single();
  return toCamelCase(data);
}

export async function getTodaysAppointments(psychologistId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('date', today)
    .order('time', { ascending: true });
  return toCamelCase(data || []);
}

export async function getUpcomingAppointments(psychologistId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .gte('date', today)
    .in('status', ['dikonfirmasi', 'selesai'])
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  return toCamelCase(data || []);
}

export async function getAllPatients(psychologistId: string) {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'selesai')
    .order('created_at', { ascending: false });

  const userIds = [...new Set((bookings || []).map((b) => b.user_id))];
  const userMap = new Map<string, any>();
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, email')
      .in('id', userIds);
    for (const u of users || []) userMap.set(u.id, u);
  }

  const patientMap = new Map();
  for (const b of bookings || []) {
    if (!patientMap.has(b.user_id)) {
      const u = userMap.get(b.user_id);
      patientMap.set(b.user_id, {
        id: b.user_id,
        displayName: b.user_name || u?.display_name || 'Unknown',
        email: b.user_email || u?.email || '',
        lastVisit: b.date,
        totalSessions: 1,
        status: 'Active',
      });
    } else {
      const existing = patientMap.get(b.user_id);
      existing.totalSessions += 1;
      if (b.date > existing.lastVisit) existing.lastVisit = b.date;
    }
  }
  return Array.from(patientMap.values());
}

export async function getAppointmentsByDateRange(psychologistId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  return toCamelCase(data || []);
}

export async function getEarningsData(psychologistId: string) {
  const { data: sessions } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'selesai')
    .order('created_at', { ascending: false });

  const monthlyEarnings: Record<string, number> = {};
  let total = 0;
  for (const s of sessions || []) {
    const fee = parseInt((s.fee || '0').replace(/[^0-9]/g, '')) || 0;
    total += fee;
    const month = s.date ? s.date.substring(0, 7) : 'unknown';
    monthlyEarnings[month] = (monthlyEarnings[month] || 0) + fee;
  }
  return { total, monthlyEarnings, sessions: sessions?.length || 0 };
}

export async function updateAppointmentStatus(bookingId: string, status: string) {
  await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);
}

export async function getPsychologistNotifications(psychologistId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .order('created_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function sendMessageToPatient(psychologistId: string, patientId: string, message: string) {
  await supabase.from('messages').insert({
    sender_id: psychologistId,
    sender_role: 'psychologist',
    receiver_id: patientId,
    message,
    created_at: new Date().toISOString(),
    read: false,
  });
}

export async function getChatMessages(psychologistId: string, patientId: string) {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${psychologistId},receiver_id.eq.${patientId}),and(sender_id.eq.${patientId},receiver_id.eq.${psychologistId})`)
    .order('created_at', { ascending: true });
  return toCamelCase(data || []);
}

// === AVAILABILITY MANAGEMENT ===

export async function getWeeklySchedule(psychologistId: string) {
  const { data } = await supabase
    .from('psychologist_schedules')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .order('day_of_week', { ascending: true });
  return toCamelCase(data || []);
}

export async function upsertSchedule(schedule: {
  psychologist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}) {
  const { error } = await supabase
    .from('psychologist_schedules')
    .upsert(schedule, { onConflict: 'psychologist_id, day_of_week' });
  if (error) throw error;
}

export async function getTimeOff(psychologistId: string) {
  const { data } = await supabase
    .from('psychologist_time_off')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .order('date', { ascending: true });
  return toCamelCase(data || []);
}

export async function addTimeOff(psychologistId: string, date: string, reason?: string) {
  const { error } = await supabase
    .from('psychologist_time_off')
    .insert({ psychologist_id: psychologistId, date, reason });
  if (error) throw error;
}

export async function removeTimeOff(timeOffId: string) {
  await supabase.from('psychologist_time_off').delete().eq('id', timeOffId);
}

// === PATIENT DETAIL ===

export async function getPatientDetail(psychologistId: string, patientId: string) {
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', patientId)
    .single();
  const { data: sessions } = await supabase
    .from('bookings')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('user_id', patientId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });
  return {
    profile: toCamelCase(userData || {}),
    sessions: toCamelCase(sessions || []),
  };
}

export async function saveSessionNotes(bookingId: string, notes: string) {
  await supabase
    .from('bookings')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', bookingId);
}

// === CHAT ===

export async function getChatPatients(psychologistId: string) {
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${psychologistId},receiver_id.eq.${psychologistId}`)
    .order('created_at', { ascending: false });

  const patientIds = new Set<string>();
  for (const m of messages || []) {
    const pid = m.sender_id === psychologistId ? m.receiver_id : m.sender_id;
    if (pid) patientIds.add(pid);
  }

  const patients: any[] = [];
  for (const pid of patientIds) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', pid).single();
    const lastMsg = messages?.find(
      (m) => (m.sender_id === pid || m.receiver_id === pid)
    );
    if (userData) {
      patients.push({
        id: pid,
        displayName: userData.display_name || userData.email?.split('@')[0] || 'Unknown',
        photoURL: userData.photo_url || '',
        lastMessage: lastMsg?.message || '',
        lastMessageTime: lastMsg?.created_at || '',
        unread: messages?.filter(
          (m) => m.sender_id === pid && m.receiver_id === psychologistId && !m.read
        ).length || 0,
      });
    }
  }

  return patients.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

export async function markMessagesRead(senderId: string, receiverId: string) {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('read', false);
}

// === PROFESSIONAL PROFILE ===

export async function updatePsychologistProfile(
  psychologistId: string,
  data: {
    name?: string;
    specialty?: string;
    fee?: string;
    experience?: string;
    bio?: string;
    photo_url?: string;
    tags?: string[];
    service_ids?: string[];
    gelar?: string;
  }
) {
  const payload: Record<string, any> = { ...data, updated_at: new Date().toISOString() };
  const { data: result, error } = await supabase
    .from('psychologists')
    .update(payload)
    .eq('id', psychologistId)
    .select();
  if (error) throw error;
  if (!result || result.length === 0) {
    throw new Error('Gagal menyimpan: izin akses ditolak. Jalankan SQL update policy di Supabase SQL Editor:\n\nDROP POLICY IF EXISTS psychologists_update ON psychologists;\nCREATE POLICY psychologists_update ON psychologists FOR UPDATE USING (\n  public.is_admin() OR user_id = auth.uid()\n);');
  }
  return toCamelCase(result[0]);
}

// === BOOKING DATA ===

export async function getBookedTimes(psychologistId: string, date: string) {
  const { data } = await supabase
    .from('bookings')
    .select('time')
    .eq('psychologist_id', psychologistId)
    .eq('date', date)
    .neq('status', 'dibatalkan');
  return (data || []).map((r) => r.time);
}

export async function getPsychologists() {
  const { data } = await supabase
    .from('psychologists')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });
  return toCamelCase(data || []);
}
