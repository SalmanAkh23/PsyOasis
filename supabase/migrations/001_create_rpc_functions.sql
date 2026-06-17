-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- RPC function for patients to check booked times (bypasses RLS safely)
CREATE OR REPLACE FUNCTION get_booked_times(p_psychologist_id UUID, p_date TEXT)
RETURNS TABLE(booked_time TEXT) AS $$
  SELECT time FROM bookings
  WHERE psychologist_id = p_psychologist_id
    AND date = p_date
    AND status != 'dibatalkan'
  ORDER BY time;
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC function for landing page stats (bypasses RLS for public counts)
CREATE OR REPLACE FUNCTION get_landing_stats()
RETURNS TABLE(psychologist_count BIGINT, session_count BIGINT) AS $$
  SELECT
    (SELECT COUNT(*) FROM psychologists WHERE status = 'active'),
    (SELECT COUNT(*) FROM bookings WHERE status = 'selesai');
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC function to create notifications (bypasses RLS for cross-user notifications)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID DEFAULT NULL,
  p_psychologist_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT '',
  p_message TEXT DEFAULT '',
  p_type TEXT DEFAULT 'booking'
) RETURNS VOID AS $$
  INSERT INTO notifications (user_id, psychologist_id, title, message, type, read, created_at)
  VALUES (p_user_id, p_psychologist_id, p_title, p_message, p_type, false, NOW());
$$ LANGUAGE sql SECURITY DEFINER;
