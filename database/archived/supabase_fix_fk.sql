-- ============================================
-- FIX FOREIGN KEY CONSTRAINT
-- Run this in Supabase SQL Editor
-- ============================================

-- THE PROBLEM:
-- You cannot delete a workout template because it is referenced by a workout log.
-- The database is protecting your history by preventing the deletion of the template.

-- THE SOLUTION:
-- We will change the rule to "ON DELETE SET NULL".
-- This means if you delete a template, the workout log will keeping existing but
-- the 'template_id' link will become NULL. The textual 'workout_name' remains,
-- so your history is preserved.

-- 1. Drop the existing strict constraint
ALTER TABLE public.workout_logs
DROP CONSTRAINT IF EXISTS workout_logs_template_id_fkey;

-- 2. Add the new flexible constraint
ALTER TABLE public.workout_logs
ADD CONSTRAINT workout_logs_template_id_fkey
FOREIGN KEY (template_id)
REFERENCES public.workout_templates(id)
ON DELETE SET NULL;
