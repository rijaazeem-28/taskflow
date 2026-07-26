-- Enable Supabase Realtime for live task updates (Session 2 – Task 3)
-- Run in Supabase → SQL Editor after schema.sql / schema-phase2.sql

ALTER TABLE public.tasks REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
END $$;
