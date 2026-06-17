import { supabase, toCamelCase } from './supabase';

function sanitizeUuid(val: string): string {
  return val.replace(/[^a-fA-F0-9\-]/g, '');
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string = 'default'
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    read: false,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function createNotificationRpc(
  userId: string | null,
  psychologistId: string | null,
  title: string,
  message: string,
  type: string = 'default'
) {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_psychologist_id: psychologistId,
    p_title: title,
    p_message: message,
    p_type: type,
  });
  if (error) throw error;
}

export async function cancelBooking(bookingId: string, psychologistId?: string, patientName?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'dibatalkan', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select('psychologist_id, user_name');
  if (error) throw error;
  if (data && data.length > 0 && psychologistId) {
    const name = patientName || data[0]?.user_name || 'Pasien';
    await createNotificationRpc(null, psychologistId, 'Pesanan Dibatalkan', `${name} membatalkan jadwal konsultasi.`, 'booking');
  }
}

export async function createBooking(data: {
  userId: string
  userName: string
  userEmail: string
  userWa: string
  psychologistId: string
  psychologistName: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  mode: string
  complaint: string
  fee: string
}) {
  const { data: inserted, error } = await supabase.from('bookings').insert({
    user_id: data.userId,
    user_name: data.userName,
    user_email: data.userEmail,
    user_wa: data.userWa,
    psychologist_id: data.psychologistId,
    psychologist_name: data.psychologistName,
    service_id: data.serviceId,
    service_name: data.serviceName,
    date: data.date,
    time: data.time,
    mode: data.mode,
    complaint: data.complaint,
    fee: data.fee,
    status: 'menunggu',
    payment_status: 'pending',
    created_at: new Date().toISOString(),
  }).select();
  if (error) throw error;
  await createNotification(
    data.userId,
    'Booking Baru',
    `Jadwal konsultasi dengan ${data.psychologistName} pada ${data.date} pukul ${data.time} sedang menunggu konfirmasi psikolog.`,
    'booking'
  );
  await createNotificationRpc(
    null,
    data.psychologistId,
    'Pesanan Baru',
    `${data.userName} memesan jadwal konsultasi pada ${data.date} pukul ${data.time}. Segera konfirmasi.`,
    'booking'
  );
  return inserted?.[0] || null;
}

export async function getUserBookings(userId: string) {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function getUserFavorites(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('favorites')
    .eq('id', userId)
    .single();
  return (data as any)?.favorites || [];
}

export async function toggleFavorite(userId: string, psychologistId: string) {
  const current = await getUserFavorites(userId);
  const favs: string[] = current || [];
  const updated = favs.includes(psychologistId)
    ? favs.filter((id: string) => id !== psychologistId)
    : [...favs, psychologistId];
  const { error } = await supabase.from('users').update({ favorites: updated }).eq('id', userId);
  if (error) throw error;
}

export async function saveNotificationSettings(userId: string, settings: Record<string, boolean>) {
  const { error } = await supabase.from('users').update({ notification_settings: settings }).eq('id', userId);
  if (error) throw error;
}

export async function getNotificationSettings(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('notification_settings')
    .eq('id', userId)
    .single();
  return (data as any)?.notification_settings || {};
}

export async function saveMood(userId: string, mood: number) {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('moods').upsert(
    { user_id: userId, date: today, mood, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' }
  );
  if (error) throw error;
}

export async function getTodayMood(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('moods')
    .select('mood')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();
  return (data as any)?.mood ?? null;
}

export async function getMoodHistory(userId: string) {
  const { data } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return toCamelCase(data || []);
}

export async function getUserNotifications(userId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

export async function getUnreadNotificationCount(userId: string) {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  return count || 0;
}

export async function submitReview(data: {
  bookingId: string
  userId: string
  psychologistId: string
  rating: number
  comment: string
}) {
  const { error: insertError } = await supabase.from('reviews').insert({
    booking_id: data.bookingId,
    user_id: data.userId,
    psychologist_id: data.psychologistId,
    rating: data.rating,
    comment: data.comment,
    created_at: new Date().toISOString(),
  });
  if (insertError) throw insertError;

  const { data: reviews, error: fetchError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('psychologist_id', data.psychologistId);
  if (fetchError) throw fetchError;

  const count = reviews.length;
  const avg = count > 0
    ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / count) * 10) / 10
    : 0;

  const { error: updateError } = await supabase
    .from('psychologists')
    .update({ rating: avg, reviews_count: count })
    .eq('id', data.psychologistId);
  if (updateError) throw updateError;
}

export async function getPsychologistReviews(psychologistId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getUserAverageRating(userId: string) {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, psychologist_id')
    .eq('user_id', userId)
    .eq('status', 'selesai');
  if (!bookings || bookings.length === 0) return null;
  const psychologistIds = [...new Set(bookings.map(b => b.psychologist_id).filter(Boolean))];
  if (psychologistIds.length === 0) return null;
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, psychologist_id')
    .in('psychologist_id', psychologistIds)
    .eq('user_id', userId);
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
}

export async function getSavedArticles(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('saved_articles')
    .eq('id', userId)
    .single();
  return (data as any)?.saved_articles || [];
}

export async function toggleSavedArticle(userId: string, articleId: string) {
  const current = await getSavedArticles(userId);
  const saved: string[] = current || [];
  const updated = saved.includes(articleId)
    ? saved.filter((id: string) => id !== articleId)
    : [...saved, articleId];
  const { error } = await supabase.from('users').update({ saved_articles: updated }).eq('id', userId);
  if (error) throw error;
}

export async function getArticles() {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function getArticleById(id: string) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  return toCamelCase(data);
}

export async function getPsychologists(category?: string) {
  let query = supabase
    .from('psychologists')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (category) {
    query = query.contains('tags', [category]);
  }

  const { data } = await query;
  return toCamelCase(data || []);
}

export async function getPaymentHistory(userId: string) {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'selesai')
    .order('date', { ascending: false });
  return toCamelCase(data || []);
}

export async function getLandingStats() {
  const { data, error } = await supabase.rpc('get_landing_stats');
  if (error) {
    console.error('getLandingStats error:', error);
    return { psychologistCount: 0, sessionCount: 0 };
  }
  return {
    psychologistCount: (data as any)?.[0]?.psychologist_count || 0,
    sessionCount: (data as any)?.[0]?.session_count || 0,
  };
}

export async function getPatientChatContacts(userId: string) {
  const uid = sanitizeUuid(userId);
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
    .order('created_at', { ascending: false });

  const contactIds = new Set<string>();
  for (const m of messages || []) {
    const cid = m.sender_id === userId ? m.receiver_id : m.sender_id;
    if (cid) contactIds.add(cid);
  }

  const contacts: any[] = [];
  for (const cid of contactIds) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', cid).single();
    const { data: psyData } = await supabase.from('psychologists').select('id, name, specialty, photo_url').eq('user_id', cid).maybeSingle();
    const lastMsg = messages?.find(
      (m) => (m.sender_id === cid || m.receiver_id === cid)
    );
    if (userData) {
      contacts.push({
        id: cid,
        displayName: psyData?.name || userData.display_name || userData.email?.split('@')[0] || 'Unknown',
        photoURL: psyData?.photo_url || userData.photo_url || '',
        specialty: psyData?.specialty || '',
        lastMessage: lastMsg?.message || '',
        lastMessageTime: lastMsg?.created_at || '',
        unread: messages?.filter(
          (m) => m.sender_id === cid && m.receiver_id === userId && !m.read
        ).length || 0,
      });
    }
  }

  return contacts.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

export async function getPatientChatMessages(userId: string, contactId: string) {
  const uid = sanitizeUuid(userId);
  const cid = sanitizeUuid(contactId);
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${cid}),and(sender_id.eq.${cid},receiver_id.eq.${uid})`)
    .order('created_at', { ascending: true });
  return toCamelCase(data || []);
}

export async function sendPatientMessage(userId: string, receiverId: string, message: string) {
  const { error } = await supabase.from('messages').insert({
    sender_id: userId,
    sender_role: 'user',
    receiver_id: receiverId,
    message,
    read: false,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function markPatientMessagesRead(senderId: string, receiverId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('read', false);
  if (error) throw error;
}
