-- =============================================================================
-- PALACE DRUM CLINIC ADMIN PORTAL - DATABASE MIGRATIONS
-- =============================================================================
-- 
-- Run these migrations in the Supabase SQL Editor in order.
-- REVIEW EACH SECTION before running - some tables may already exist.
-- 
-- Created: 24 December 2025
-- =============================================================================

-- =============================================================================
-- SECTION 1: ADMIN ROLE SYSTEM
-- =============================================================================

-- 1.1 Add admin role column to AppUser table (if not exists)
-- Check if the column exists first by running:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'AppUser' AND column_name = 'role';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AppUser' AND column_name = 'role'
  ) THEN
    ALTER TABLE "AppUser"
    ADD COLUMN "role" TEXT DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'super_admin'));
  END IF;
END $$;

-- 1.2 Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "AppUser"
    WHERE "authUserID" = user_id::text
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.3 Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

-- 1.4 Create admin users view for easy querying
CREATE OR REPLACE VIEW admin_users AS
SELECT id, "authUserID", "firstName", "lastName", email, role
FROM "AppUser"
WHERE role IN ('admin', 'super_admin');

-- =============================================================================
-- SECTION 2: SCHEDULED NOTIFICATIONS TABLE
-- =============================================================================

-- 2.1 Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  target_audience JSONB DEFAULT '{"type": "all"}'::jsonb,
  -- target_audience examples:
  -- {"type": "all"} - all users
  -- {"type": "segment", "filter": {"hasStreak": true}} - users with streaks
  -- {"type": "users", "userIds": ["uuid1", "uuid2"]} - specific users
  data JSONB, -- additional payload data for the notification
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  error_message TEXT -- stores error if status = 'failed'
);

-- 2.2 Create index for efficient querying of pending notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status_scheduled 
ON public.scheduled_notifications(status, scheduled_for)
WHERE status = 'pending';

-- 2.3 Enable RLS on scheduled_notifications
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- 2.4 RLS policy - only admins can manage notifications
DROP POLICY IF EXISTS "Admins can manage scheduled notifications" ON public.scheduled_notifications;
CREATE POLICY "Admins can manage scheduled notifications"
  ON public.scheduled_notifications
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 2.5 Updated_at trigger for scheduled_notifications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scheduled_notifications_updated_at ON public.scheduled_notifications;
CREATE TRIGGER update_scheduled_notifications_updated_at
  BEFORE UPDATE ON public.scheduled_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECTION 3: NOTIFICATION TEMPLATES (Optional - for reusable notifications)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience JSONB DEFAULT '{"type": "all"}'::jsonb,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =============================================================================
-- SECTION 4: CONTENT MANAGEMENT TABLES
-- =============================================================================

-- 4.1 Artists table (if not exists)
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Artists readable by all authenticated users
DROP POLICY IF EXISTS "Artists are viewable by authenticated users" ON public.artists;
CREATE POLICY "Artists are viewable by authenticated users"
  ON public.artists
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify artists
DROP POLICY IF EXISTS "Admins can manage artists" ON public.artists;
CREATE POLICY "Admins can manage artists"
  ON public.artists
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 4.2 Video Series table (if not exists)
CREATE TABLE IF NOT EXISTS public.video_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  artist_id UUID REFERENCES public.artists(id),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_series ENABLE ROW LEVEL SECURITY;

-- Series readable by authenticated users (only published for non-admins)
DROP POLICY IF EXISTS "Published series viewable by all" ON public.video_series;
CREATE POLICY "Published series viewable by all"
  ON public.video_series
  FOR SELECT
  TO authenticated
  USING (is_published = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage series" ON public.video_series;
CREATE POLICY "Admins can manage series"
  ON public.video_series
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 4.3 Videos table (if not exists)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  series_id UUID REFERENCES public.video_series(id),
  artist_id UUID REFERENCES public.artists(id),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  tags TEXT[] DEFAULT '{}',
  pdf_url TEXT, -- attached PDF resource
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false, -- free preview content
  display_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Videos readable by authenticated users (only published for non-admins)
DROP POLICY IF EXISTS "Published videos viewable by all" ON public.videos;
CREATE POLICY "Published videos viewable by all"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (is_published = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos"
  ON public.videos
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =============================================================================
-- SECTION 5: ANALYTICS TABLES
-- =============================================================================

-- 5.1 Video view tracking
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Users can see their own views, admins can see all
DROP POLICY IF EXISTS "Users can view own video views" ON public.video_views;
CREATE POLICY "Users can view own video views"
  ON public.video_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own video views" ON public.video_views;
CREATE POLICY "Users can insert own video views"
  ON public.video_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own video views" ON public.video_views;
CREATE POLICY "Users can update own video views"
  ON public.video_views
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 5.2 Create index for video view analytics
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON public.video_views(created_at);

-- =============================================================================
-- SECTION 6: GOALS & CHALLENGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('practice_time', 'video_completion', 'streak', 'custom')),
  target_value INTEGER NOT NULL, -- e.g., 30 minutes, 5 videos, 7 day streak
  target_unit TEXT, -- 'minutes', 'videos', 'days'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  badge_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Goals viewable by authenticated users" ON public.goals;
CREATE POLICY "Goals viewable by authenticated users"
  ON public.goals
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage goals" ON public.goals;
CREATE POLICY "Admins can manage goals"
  ON public.goals
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- User goal progress
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goal progress" ON public.user_goals;
CREATE POLICY "Users can view own goal progress"
  ON public.user_goals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can manage own goal progress" ON public.user_goals;
CREATE POLICY "Users can manage own goal progress"
  ON public.user_goals
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- SECTION 7: DRUM ZONE BOOKINGS
-- =============================================================================

-- 7.1 Drum Zone Sites
CREATE TABLE IF NOT EXISTS public.drum_zone_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'Australia/Sydney',
  is_active BOOLEAN DEFAULT true,
  opening_hours JSONB, -- {"monday": {"open": "09:00", "close": "21:00"}, ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drum_zone_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sites viewable by authenticated users" ON public.drum_zone_sites;
CREATE POLICY "Sites viewable by authenticated users"
  ON public.drum_zone_sites
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage sites" ON public.drum_zone_sites;
CREATE POLICY "Admins can manage sites"
  ON public.drum_zone_sites
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 7.2 Drum Zone Rooms/Kits
CREATE TABLE IF NOT EXISTS public.drum_zone_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.drum_zone_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  kit_description TEXT, -- description of the drum kit
  image_url TEXT,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drum_zone_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rooms viewable by authenticated users" ON public.drum_zone_rooms;
CREATE POLICY "Rooms viewable by authenticated users"
  ON public.drum_zone_rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage rooms" ON public.drum_zone_rooms;
CREATE POLICY "Admins can manage rooms"
  ON public.drum_zone_rooms
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 7.3 Bookings
CREATE TABLE IF NOT EXISTS public.drum_zone_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.drum_zone_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  total_price DECIMAL(10,2),
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drum_zone_bookings ENABLE ROW LEVEL SECURITY;

-- Users can see their own bookings, admins can see all
DROP POLICY IF EXISTS "Users can view own bookings" ON public.drum_zone_bookings;
CREATE POLICY "Users can view own bookings"
  ON public.drum_zone_bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create bookings" ON public.drum_zone_bookings;
CREATE POLICY "Users can create bookings"
  ON public.drum_zone_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bookings" ON public.drum_zone_bookings;
CREATE POLICY "Users can update own bookings"
  ON public.drum_zone_bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.drum_zone_bookings;
CREATE POLICY "Admins can delete bookings"
  ON public.drum_zone_bookings
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Index for efficient booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_room_time 
ON public.drum_zone_bookings(room_id, start_time, end_time)
WHERE status != 'cancelled';

-- =============================================================================
-- SECTION 8: PRACTICE LOGS (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  practice_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own practice logs" ON public.practice_logs;
CREATE POLICY "Users can view own practice logs"
  ON public.practice_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create practice logs" ON public.practice_logs;
CREATE POLICY "Users can create practice logs"
  ON public.practice_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_practice_logs_user_date 
ON public.practice_logs(user_id, practice_date);

-- =============================================================================
-- SECTION 9: STORAGE BUCKETS (Run in Supabase Dashboard > Storage)
-- =============================================================================
-- These need to be created via Supabase Dashboard or API, not SQL:
-- 
-- 1. videos - for video files
-- 2. thumbnails - for video/series thumbnails  
-- 3. pdfs - for PDF attachments
-- 4. avatars - for user/artist profile images
--
-- Example bucket policies (set in Dashboard):
-- videos: Authenticated users can read, admins can write
-- thumbnails: Public read, admins can write
-- pdfs: Authenticated users can read, admins can write
-- avatars: Authenticated users can read/write own, admins can manage all

-- =============================================================================
-- SECTION 10: HELPER VIEWS FOR ANALYTICS
-- =============================================================================

-- Daily active users view
CREATE OR REPLACE VIEW daily_active_users AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM (
  SELECT user_id, created_at FROM public.video_views
  UNION ALL
  SELECT user_id, created_at FROM public.practice_logs
  UNION ALL
  SELECT user_id, created_at FROM public.drum_zone_bookings
) activity
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Video performance view
CREATE OR REPLACE VIEW video_performance AS
SELECT 
  v.id,
  v.title,
  v.series_id,
  vs.title as series_title,
  v.view_count,
  COUNT(vv.id) as unique_viewers,
  COALESCE(AVG(vv.watched_seconds), 0) as avg_watch_time,
  COUNT(CASE WHEN vv.completed THEN 1 END) as completions
FROM public.videos v
LEFT JOIN public.video_series vs ON v.series_id = vs.id
LEFT JOIN public.video_views vv ON v.id = vv.video_id
GROUP BY v.id, v.title, v.series_id, vs.title, v.view_count;

-- User engagement summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
  u.id,
  u."firstName",
  u."lastName",
  u.email,
  u.role,
  u."createdAt",
  (SELECT COUNT(*) FROM public.video_views vv WHERE vv.user_id::text = u."authUserID") as videos_watched,
  (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.practice_logs pl WHERE pl.user_id::text = u."authUserID") as total_practice_minutes,
  (SELECT COUNT(*) FROM public.drum_zone_bookings b WHERE b.user_id::text = u."authUserID") as total_bookings
FROM "AppUser" u;

-- =============================================================================
-- SECTION 11: SET YOUR FIRST ADMIN
-- =============================================================================
-- Replace 'your-email@example.com' with your actual email
-- Run this AFTER you've logged in to the app at least once

-- UPDATE "AppUser" 
-- SET role = 'super_admin' 
-- WHERE email = 'your-email@example.com';

-- =============================================================================
-- DONE! 
-- =============================================================================
-- After running these migrations:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Set your user as super_admin (Section 11)
-- 3. Test the admin portal
-- =============================================================================
