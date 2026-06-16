-- =============================================================
-- PsyOasis Supabase Migration Schema
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- =============================================================

-- Users (profiles, linked to auth.users via trigger)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  photo_url TEXT,
  phone_number TEXT,
  bio TEXT,
  birth_date TEXT,
  gender TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  favorites JSONB DEFAULT '[]'::jsonb,
  saved_articles JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Psychologists
CREATE TABLE IF NOT EXISTS psychologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'psychologist',
  status TEXT DEFAULT 'active',
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS fee TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS rating REAL DEFAULT 0;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS service_ids TEXT[] DEFAULT '{}';
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS gelar TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Allow patients to view psychologist profiles for booking/recommendations
DROP POLICY IF EXISTS psychologists_select ON psychologists;
CREATE POLICY psychologists_select ON psychologists FOR SELECT USING (true);
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  mood INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Bookings / appointments
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_email TEXT,
  user_wa TEXT,
  psychologist_id UUID REFERENCES psychologists(id),
  psychologist_name TEXT,
  service_id TEXT,
  service_name TEXT,
  date TEXT,
  time TEXT,
  mode TEXT,
  complaint TEXT,
  notes TEXT,
  fee TEXT,
  status TEXT DEFAULT 'dikonfirmasi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  psychologist_id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  user_id UUID REFERENCES users(id),
  psychologist_id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  excerpt TEXT,
  category TEXT DEFAULT 'article',
  author_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  sender_role TEXT DEFAULT 'user',
  receiver_id UUID REFERENCES users(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Psychologist weekly schedules (recurring)
CREATE TABLE IF NOT EXISTS psychologist_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(psychologist_id, day_of_week)
);

-- Psychologist time-off (specific dates)
CREATE TABLE IF NOT EXISTS psychologist_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  UNIQUE(psychologist_id, date)
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologist_time_off ENABLE ROW LEVEL SECURITY;

-- === RLS POLICIES ===

-- Helper function to check admin role (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;

-- Users: read/update own profile; admins read/update all
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_insert_signup ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_update_admin ON users;
DROP POLICY IF EXISTS users_insert_admin ON users;
CREATE POLICY users_select_own ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY users_insert_signup ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_select_admin ON users FOR SELECT USING (public.is_admin());
CREATE POLICY users_update_admin ON users FOR UPDATE USING (public.is_admin());

-- Bookings: user sees own; psychologist sees assigned; admin sees all
DROP POLICY IF EXISTS bookings_select_own ON bookings;
DROP POLICY IF EXISTS bookings_select_psychologist ON bookings;
DROP POLICY IF EXISTS bookings_select_admin ON bookings;
DROP POLICY IF EXISTS bookings_insert_own ON bookings;
DROP POLICY IF EXISTS bookings_update_own ON bookings;
DROP POLICY IF EXISTS bookings_update_psychologist ON bookings;
DROP POLICY IF EXISTS bookings_update_admin ON bookings;
CREATE POLICY bookings_select_own ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY bookings_select_psychologist ON bookings FOR SELECT USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY bookings_select_admin ON bookings FOR SELECT USING (public.is_admin());
CREATE POLICY bookings_insert_own ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY bookings_update_own ON bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY bookings_update_psychologist ON bookings FOR UPDATE USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY bookings_update_admin ON bookings FOR UPDATE USING (public.is_admin());

-- Psychologists: admin full access; psychologists can update own profile; anyone can view (patients need to browse)
DROP POLICY IF EXISTS psychologists_select ON psychologists;
DROP POLICY IF EXISTS psychologists_insert ON psychologists;
DROP POLICY IF EXISTS psychologists_update ON psychologists;
DROP POLICY IF EXISTS psychologists_delete ON psychologists;
CREATE POLICY psychologists_select ON psychologists FOR SELECT USING (true);
CREATE POLICY psychologists_insert ON psychologists FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY psychologists_update ON psychologists FOR UPDATE USING (
  public.is_admin() OR user_id = auth.uid()
);
CREATE POLICY psychologists_delete ON psychologists FOR DELETE USING (public.is_admin());

-- Notifications: user sees own; psychologist sees assigned
DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_select_psychologist ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_select_psychologist ON notifications FOR SELECT USING (psychologist_id = auth.uid());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Moods: own only
DROP POLICY IF EXISTS moods_select_own ON moods;
DROP POLICY IF EXISTS moods_insert_own ON moods;
DROP POLICY IF EXISTS moods_update_own ON moods;
CREATE POLICY moods_select_own ON moods FOR SELECT USING (user_id = auth.uid());
CREATE POLICY moods_insert_own ON moods FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY moods_update_own ON moods FOR UPDATE USING (user_id = auth.uid());

-- Reviews: insert for own; select for all
DROP POLICY IF EXISTS reviews_insert_own ON reviews;
DROP POLICY IF EXISTS reviews_select_all ON reviews;
CREATE POLICY reviews_insert_own ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY reviews_select_all ON reviews FOR SELECT USING (true);

-- Articles: select all; insert/delete admin only
DROP POLICY IF EXISTS articles_select_all ON articles;
DROP POLICY IF EXISTS articles_insert_admin ON articles;
DROP POLICY IF EXISTS articles_delete_admin ON articles;
CREATE POLICY articles_select_all ON articles FOR SELECT USING (true);
CREATE POLICY articles_insert_admin ON articles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY articles_delete_admin ON articles FOR DELETE USING (public.is_admin());

-- Messages: involved parties
DROP POLICY IF EXISTS messages_select_involved ON messages;
DROP POLICY IF EXISTS messages_insert_sender ON messages;
DROP POLICY IF EXISTS messages_update_receiver ON messages;
CREATE POLICY messages_select_involved ON messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY messages_insert_sender ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY messages_update_receiver ON messages FOR UPDATE USING (receiver_id = auth.uid());

-- Psychologist schedules: own only
DROP POLICY IF EXISTS schedules_select_own ON psychologist_schedules;
DROP POLICY IF EXISTS schedules_insert_own ON psychologist_schedules;
DROP POLICY IF EXISTS schedules_update_own ON psychologist_schedules;
DROP POLICY IF EXISTS schedules_delete_own ON psychologist_schedules;
CREATE POLICY schedules_select_own ON psychologist_schedules FOR SELECT USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY schedules_insert_own ON psychologist_schedules FOR INSERT WITH CHECK (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY schedules_update_own ON psychologist_schedules FOR UPDATE USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY schedules_delete_own ON psychologist_schedules FOR DELETE USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);

-- Psychologist time-off: own only
DROP POLICY IF EXISTS timeoff_select_own ON psychologist_time_off;
DROP POLICY IF EXISTS timeoff_insert_own ON psychologist_time_off;
DROP POLICY IF EXISTS timeoff_delete_own ON psychologist_time_off;
CREATE POLICY timeoff_select_own ON psychologist_time_off FOR SELECT USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY timeoff_insert_own ON psychologist_time_off FOR INSERT WITH CHECK (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);
CREATE POLICY timeoff_delete_own ON psychologist_time_off FOR DELETE USING (
  psychologist_id IN (SELECT id FROM psychologists WHERE user_id = auth.uid())
);

-- Storage bucket untuk foto profil psikolog
INSERT INTO storage.buckets (id, name, public)
VALUES ('psychologist-photos', 'psychologist-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "psychologist_photos_select" ON storage.objects;
CREATE POLICY "psychologist_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'psychologist-photos');

DROP POLICY IF EXISTS "psychologist_photos_insert" ON storage.objects;
CREATE POLICY "psychologist_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'psychologist-photos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "psychologist_photos_update" ON storage.objects;
CREATE POLICY "psychologist_photos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'psychologist-photos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "psychologist_photos_delete" ON storage.objects;
CREATE POLICY "psychologist_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'psychologist-photos'
    AND auth.role() = 'authenticated'
  );
