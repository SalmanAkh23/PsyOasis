import { supabase, toCamelCase } from './supabase';

export async function getAllUsers() {
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  const users = toCamelCase(data || []);
  return users.map((u: any) => ({
    ...u,
    displayName: u.displayName || u.email?.split('@')[0] || `UID: ${u.id.slice(0, 8)}`,
    email: u.email || `${u.id.slice(0, 8)} (no email)`,
  }));
}

export async function getUserById(userId: string) {
  const { data } = await supabase.from('users').select('*').eq('id', userId).single();
  return toCamelCase(data);
}

export async function updateUserRole(userId: string, role: string) {
  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function assignPsychologistRole(email: string, psychologistData?: Record<string, any>) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error || !users || users.length === 0) {
    throw new Error(`User with email ${email} not found. They must register first.`);
  }

  const userRecord = users[0];
  const userId = userRecord.id;

  const { error: roleError } = await supabase
    .from('users')
    .update({ role: 'psychologist', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (roleError) throw roleError;

  const { error: psyError } = await supabase.from('psychologists').upsert({
    user_id: userId,
    email,
    name: userRecord.display_name || email.split('@')[0],
    display_name: userRecord.display_name || email.split('@')[0],
    role: 'psychologist',
    assigned_at: new Date().toISOString(),
    status: 'active',
    ...(psychologistData || {}),
  });
  if (psyError) throw psyError;

  return userId;
}

export async function getAllPsychologists() {
  const { data } = await supabase
    .from('psychologists')
    .select('*')
    .order('assigned_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function getSystemStats() {
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { data: activePsikologs } = await supabase
    .from('psychologists')
    .select('id')
    .eq('status', 'active');
  const activePsikolog = activePsikologs?.length || 0;

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*');
  const totalBookings = allBookings?.length || 0;
  const ongoing = allBookings?.filter((b: any) => b.status === 'dikonfirmasi').length || 0;

  let totalRevenue = 0;
  for (const b of allBookings || []) {
    if (b.status === 'selesai') {
      const fee = parseInt((b.fee || '0').replace(/[^0-9]/g, '')) || 0;
      totalRevenue += fee;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = allBookings?.filter((b: any) => b.date === today).length || 0;

  return {
    totalUsers: totalUsers || 0,
    activePsikolog,
    totalBookings,
    ongoingSessions: ongoing,
    todayAppointments,
    totalRevenue,
  };
}

export async function getRecentActivity(limitCount = 10) {
  const activities: any[] = [];

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  (recentBookings || []).forEach((b: any) => {
    activities.push({
      id: b.id,
      type: 'booking',
      title: `New booking by ${b.user_name || 'Unknown'}`,
      description: `${b.psychologist_name || 'Psychologist'} • ${b.date || ''}`,
      time: b.created_at,
      color: 'bg-primary',
    });
  });

  const { data: recentUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  (recentUsers || []).forEach((u: any) => {
    if (u.created_at) {
      activities.push({
        id: u.id,
        type: 'user',
        title: `New user registered: ${u.display_name || 'Unknown'}`,
        description: `ID: ${u.id.slice(0, 8)}`,
        time: u.created_at,
        color: 'bg-secondary',
      });
    }
  });

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return activities.slice(0, limitCount);
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const { error } = await supabase
    .from('users')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
  return newStatus;
}

export async function deletePsychologist(psychologistProfileId: string) {
  const { data: profile, error: fetchError } = await supabase
    .from('psychologists')
    .select('user_id')
    .eq('id', psychologistProfileId)
    .single();
  if (fetchError) throw fetchError;
  if (!profile) throw new Error('Psychologist not found');
  const { error: userError } = await supabase
    .from('users')
    .update({ role: 'user', updated_at: new Date().toISOString() })
    .eq('id', profile.user_id);
  if (userError) throw userError;
  const { error: delError } = await supabase.from('psychologists').delete().eq('id', psychologistProfileId);
  if (delError) throw delError;
}

export async function getAllAppointments() {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  return toCamelCase(data || []);
}

export async function createArticle(data: {
  title: string
  content: string
  excerpt: string
  category: string
  authorName: string
  imageUrl?: string
}) {
  const { error } = await supabase.from('articles').insert({
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    category: data.category,
    author_name: data.authorName,
    image_url: data.imageUrl || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateArticle(articleId: string, data: {
  title?: string
  content?: string
  excerpt?: string
  category?: string
  authorName?: string
  imageUrl?: string
}) {
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) payload.title = data.title;
  if (data.content !== undefined) payload.content = data.content;
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
  if (data.category !== undefined) payload.category = data.category;
  if (data.authorName !== undefined) payload.author_name = data.authorName;
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;

  const { error } = await supabase.from('articles').update(payload).eq('id', articleId);
  if (error) throw error;
}

export async function deleteArticle(articleId: string) {
  const { error } = await supabase.from('articles').delete().eq('id', articleId);
  if (error) throw error;
}

export async function getMonthlyBookings() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const startDate = sixMonthsAgo.toISOString().split('T')[0];

  const { data } = await supabase
    .from('bookings')
    .select('date, fee, status')
    .gte('created_at', startDate)
    .order('date', { ascending: true });

  if (!data) return { monthlyCounts: [0, 0, 0, 0, 0, 0], monthlyRevenue: [0, 0, 0, 0, 0, 0] };

  const monthlyCounts = [0, 0, 0, 0, 0, 0];
  const monthlyRevenue = [0, 0, 0, 0, 0, 0];
  const now = new Date();

  for (const b of data) {
    const d = new Date(b.date);
    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    const idx = 5 - monthDiff;
    if (idx >= 0 && idx < 6) {
      monthlyCounts[idx]++;
      if (b.status === 'selesai') {
        const fee = parseInt((b.fee || '0').replace(/[^0-9]/g, '')) || 0;
        monthlyRevenue[idx] += fee;
      }
    }
  }

  return { monthlyCounts, monthlyRevenue };
}
