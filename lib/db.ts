import { supabase, toCamelCase } from './supabase';

export async function createNotification(userId: string, title: string, message: string) {
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  });
}

export async function cancelBooking(bookingId: string) {
  await supabase.from('bookings').update({ status: 'dibatalkan' }).eq('id', bookingId);
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
    status: 'dikonfirmasi',
    payment_status: 'lunas',
    created_at: new Date().toISOString(),
  }).select();
  if (error) throw error;
  await createNotification(
    data.userId,
    'Booking Dikonfirmasi',
    `Jadwal konsultasi dengan ${data.psychologistName} pada ${data.date} pukul ${data.time} telah dikonfirmasi.`
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
  await supabase.from('users').update({ favorites: updated }).eq('id', userId);
}

export async function saveNotificationSettings(userId: string, settings: Record<string, boolean>) {
  await supabase.from('users').update({ notification_settings: settings }).eq('id', userId);
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
  await supabase.from('moods').upsert(
    { user_id: userId, date: today, mood, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' }
  );
}

export async function getTodayMood(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('moods')
    .select('mood')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
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
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
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
  await supabase.from('reviews').insert({
    booking_id: data.bookingId,
    user_id: data.userId,
    psychologist_id: data.psychologistId,
    rating: data.rating,
    comment: data.comment,
    created_at: new Date().toISOString(),
  });
}

export async function getUserAverageRating(userId: string) {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('user_id', userId);
  if (!data || data.length === 0) return null;
  const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / data.length).toFixed(1);
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
  await supabase.from('users').update({ saved_articles: updated }).eq('id', userId);
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
  const { count: psychologistCount } = await supabase
    .from('psychologists')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: sessionCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'selesai');

  return {
    psychologistCount: psychologistCount || 0,
    sessionCount: sessionCount || 0,
  };
}
