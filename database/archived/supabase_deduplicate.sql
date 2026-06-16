-- ============================================
-- DEDUPLICATE EXERCISES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Delete duplicate exercises, keeping the one with the smallest ID
DELETE FROM public.exercises
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (partition BY lower(name) ORDER BY id) as rnum
        FROM public.exercises
    ) t
    WHERE t.rnum > 1
);

-- 2. Add a unique constraint to prevent future duplicates
-- Using a DO block to safely add constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exercises_name_unique'
    ) THEN
        ALTER TABLE public.exercises ADD CONSTRAINT exercises_name_unique UNIQUE (name);
    END IF;
END $$;
