-- Run in Supabase SQL Editor after schema.sql (Phase 2 tables/columns)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_id text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_offset text DEFAULT 'NONE';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_at timestamptz;

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'system',
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  weekly_digest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
DROP POLICY IF EXISTS "settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "settings_upsert_own" ON public.user_settings;
DROP POLICY IF EXISTS "settings_update_own" ON public.user_settings;

CREATE POLICY "categories_select_own" ON public.categories FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "categories_insert_own" ON public.categories FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid()::text = user_id);

GRANT ALL ON public.categories TO anon, authenticated, service_role;
GRANT ALL ON public.user_settings TO anon, authenticated, service_role;
