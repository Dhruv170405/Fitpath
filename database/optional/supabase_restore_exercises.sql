-- ============================================
-- RESTORE MISSING EXERCISES
-- Run this in Supabase SQL Editor
-- ============================================

-- This adds the exercises you were looking for (Treadmill, Pec Deck, etc.)
-- to the database so they can be saved in workouts.

INSERT INTO public.exercises (name, muscle_group, description) VALUES
-- Chest
('Incline Barbell Bench Press', 'chest', 'Upper chest builder. Incline bench, grip bar, press up.'),
('Pec Deck Fly', 'chest', 'Machine isolation. Seat, arm pads, squeeze chest together.'),

-- Back
('Single Arm Cable Row', 'back', 'Unilateral back. Cable set mid-height, row to hip, squeeze lat.'),
('Cable Pullover', 'back', 'Lat isolation. Standing or kneeling, straight arms, pull bar to hips.'),

-- Shoulders
('Cable Lateral Raise', 'shoulders', 'Constant tension side delt. Cable low, raise arm to side.'),
('Reverse Pec Deck', 'shoulders', 'Rear delt isolation. Face machine, fly arms back.'),

-- Cardio
('Treadmill', 'cardio', 'Cardiovascular endurance. Walk or run at steady pace or incline.'),
('Stair Climber', 'cardio', 'Simulated stair climbing for cardio and lower body endurance.'),
('Jump Rope', 'cardio', 'High intensity cardio and coordination.')

-- Skip duplicates just in case
ON CONFLICT DO NOTHING;
