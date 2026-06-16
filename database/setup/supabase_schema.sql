-- ============================================
-- FITPATH DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. EXERCISES TABLE (Global exercise library)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL, -- chest, back, legs, shoulders, arms, core, cardio
    description TEXT,
    video_url TEXT,
    is_default BOOLEAN DEFAULT true, -- true for predefined exercises
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKOUT TEMPLATES TABLE (Predefined workout routines)
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
    duration_minutes INT DEFAULT 45,
    day_of_week TEXT, -- optional: monday, tuesday, etc.
    is_default BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id), -- NULL for system templates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKOUT TEMPLATE EXERCISES (Exercises in each template)
CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    sets INT DEFAULT 3,
    target_reps TEXT DEFAULT '8-12',
    order_index INT DEFAULT 0
);

-- 4. USER WORKOUT LOGS (Track completed workouts)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.workout_templates(id),
    workout_name TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_minutes INT,
    notes TEXT
);

-- 5. SET LOGS (Individual sets within a workout)
CREATE TABLE IF NOT EXISTS public.set_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    set_number INT NOT NULL,
    weight DECIMAL(6,2),
    reps INT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

-- Exercises: Everyone can read default exercises
CREATE POLICY "Anyone can read exercises" ON public.exercises FOR SELECT USING (true);

-- Workout Templates: Everyone can read default templates, users can create their own
CREATE POLICY "Anyone can read templates" ON public.workout_templates FOR SELECT USING (true);
CREATE POLICY "Users can create templates" ON public.workout_templates FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Template Exercises: Anyone can read
CREATE POLICY "Anyone can read template exercises" ON public.workout_template_exercises FOR SELECT USING (true);

-- Workout Logs: Users can only see/modify their own
CREATE POLICY "Users can read own logs" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id);

-- Set Logs: Users can only see/modify their own (via workout_log ownership)
CREATE POLICY "Users can read own sets" ON public.set_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.workout_logs WHERE id = set_logs.workout_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own sets" ON public.set_logs FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.workout_logs WHERE id = set_logs.workout_log_id AND user_id = auth.uid()));

-- ============================================
-- SEED DEFAULT EXERCISES
-- ============================================

INSERT INTO public.exercises (name, muscle_group, description) VALUES
-- Chest
('Bench Press', 'chest', 'Classic compound movement for chest development'),
('Incline Dumbbell Press', 'chest', 'Upper chest focused pressing movement'),
('Push Ups', 'chest', 'Bodyweight chest exercise'),
('Cable Flyes', 'chest', 'Isolation exercise for chest'),

-- Back
('Pull Ups', 'back', 'Bodyweight pulling movement for lats'),
('Barbell Row', 'back', 'Compound rowing movement for back thickness'),
('Lat Pulldown', 'back', 'Machine-based lat exercise'),
('Seated Cable Row', 'back', 'Horizontal pulling for mid-back'),

-- Legs
('Barbell Squat', 'legs', 'King of leg exercises'),
('Leg Press', 'legs', 'Machine-based quad dominant exercise'),
('Romanian Deadlift', 'legs', 'Hamstring and glute focused'),
('Leg Curl', 'legs', 'Isolation for hamstrings'),
('Calf Raises', 'legs', 'Isolation for calves'),

-- Shoulders
('Overhead Press', 'shoulders', 'Compound pressing for shoulders'),
('Lateral Raises', 'shoulders', 'Side delt isolation'),
('Face Pulls', 'shoulders', 'Rear delt and rotator cuff'),

-- Arms
('Barbell Curl', 'arms', 'Classic bicep builder'),
('Tricep Pushdown', 'arms', 'Tricep isolation'),
('Hammer Curl', 'arms', 'Bicep and forearm development'),
('Skull Crushers', 'arms', 'Tricep isolation'),

-- Core
('Plank', 'core', 'Isometric core stability'),
('Crunches', 'core', 'Basic ab exercise'),
('Hanging Leg Raises', 'core', 'Advanced ab exercise'),

-- Cardio
('Treadmill Run', 'cardio', 'Running on treadmill'),
('Cycling', 'cardio', 'Stationary bike cardio'),
('Jump Rope', 'cardio', 'High intensity cardio');

-- ============================================
-- SEED DEFAULT WORKOUT TEMPLATES
-- ============================================

-- Push Day
INSERT INTO public.workout_templates (id, name, description, difficulty, duration_minutes, day_of_week)
VALUES ('11111111-1111-1111-1111-111111111111', 'Push Day', 'Chest, Shoulders, and Triceps workout', 'beginner', 45, 'monday');

-- Pull Day
INSERT INTO public.workout_templates (id, name, description, difficulty, duration_minutes, day_of_week)
VALUES ('22222222-2222-2222-2222-222222222222', 'Pull Day', 'Back and Biceps workout', 'beginner', 45, 'wednesday');

-- Leg Day
INSERT INTO public.workout_templates (id, name, description, difficulty, duration_minutes, day_of_week)
VALUES ('33333333-3333-3333-3333-333333333333', 'Leg Day', 'Complete lower body workout', 'beginner', 50, 'friday');

-- Full Body
INSERT INTO public.workout_templates (id, name, description, difficulty, duration_minutes)
VALUES ('44444444-4444-4444-4444-444444444444', 'Full Body Basics', 'Great for beginners - hit all muscle groups', 'beginner', 60);

-- Link exercises to templates (using exercise names to get IDs)
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '11111111-1111-1111-1111-111111111111', id, 4, '8-10', 1 FROM public.exercises WHERE name = 'Bench Press'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111111', id, 3, '10-12', 2 FROM public.exercises WHERE name = 'Incline Dumbbell Press'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111111', id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Overhead Press'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111111', id, 3, '12-15', 4 FROM public.exercises WHERE name = 'Lateral Raises'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111111', id, 3, '10-12', 5 FROM public.exercises WHERE name = 'Tricep Pushdown';

INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '22222222-2222-2222-2222-222222222222', id, 4, 'AMRAP', 1 FROM public.exercises WHERE name = 'Pull Ups'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 4, '8-10', 2 FROM public.exercises WHERE name = 'Barbell Row'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Lat Pulldown'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 3, '10-12', 4 FROM public.exercises WHERE name = 'Barbell Curl'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 3, '12-15', 5 FROM public.exercises WHERE name = 'Hammer Curl';

INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '33333333-3333-3333-3333-333333333333', id, 4, '6-8', 1 FROM public.exercises WHERE name = 'Barbell Squat'
UNION ALL
SELECT '33333333-3333-3333-3333-333333333333', id, 3, '10-12', 2 FROM public.exercises WHERE name = 'Leg Press'
UNION ALL
SELECT '33333333-3333-3333-3333-333333333333', id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Romanian Deadlift'
UNION ALL
SELECT '33333333-3333-3333-3333-333333333333', id, 3, '12-15', 4 FROM public.exercises WHERE name = 'Leg Curl'
UNION ALL
SELECT '33333333-3333-3333-3333-333333333333', id, 4, '15-20', 5 FROM public.exercises WHERE name = 'Calf Raises';

INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '44444444-4444-4444-4444-444444444444', id, 3, '8-10', 1 FROM public.exercises WHERE name = 'Barbell Squat'
UNION ALL
SELECT '44444444-4444-4444-4444-444444444444', id, 3, '8-10', 2 FROM public.exercises WHERE name = 'Bench Press'
UNION ALL
SELECT '44444444-4444-4444-4444-444444444444', id, 3, '8-10', 3 FROM public.exercises WHERE name = 'Barbell Row'
UNION ALL
SELECT '44444444-4444-4444-4444-444444444444', id, 3, '8-10', 4 FROM public.exercises WHERE name = 'Overhead Press'
UNION ALL
SELECT '44444444-4444-4444-4444-444444444444', id, 3, '30-60s', 5 FROM public.exercises WHERE name = 'Plank';
-- Add missing exercises identified from user screenshots
-- Run this in your Supabase Query Editor

INSERT INTO public.exercises (name, muscle_group, description) VALUES
-- Abs/Core
('Cable Crunch', 'core', 'Weighted ab isolation. Kneel, hold rope, crunch down.'),
('Hanging Leg Raise', 'core', 'Advanced core. Hang from bar, raise legs to parallel or higher.'),
('Pallof Press', 'core', 'Anti-rotation core stability. Press cable handle out from chest.'),
('Farmer''s Walk', 'core', 'Functional core/grip. Walk carrying heavy weights at sides.'),

-- Legs
('Hack Squat', 'legs', 'Machine squat. Back supported, fixed path leg press.'),
('Pendulum Squat', 'legs', 'Arc-motion machine squat. Deep knee bend emphasis.'),
('Standing Calf Raise', 'legs', 'Calf isolation. Straight legs, raise heels.'),

-- Arms
('Close-Grip Machine Press', 'triceps', 'Tricep focus press. Narrow grip, keeping elbows close.'),
('EZ-Bar Curl', 'biceps', 'Bicep isolation. Semi-supinated grip reduces wrist strain.'),
('Wrist Curl', 'arms', 'Forearm flexors. Palms up, curl wrists.'),
('Reverse Wrist Curl', 'arms', 'Forearm extensors. Palms down, extend wrists.'),

-- Shoulders
('Machine Lateral Raise', 'shoulders', 'Side delt isolation. Fixed path machine raise.'),

-- Back
('Chest-Supported Row', 'back', 'Upper back focus. Chest on pad to minimize momentum.'),
('Neutral-Grip Lat Pulldown', 'back', 'Lats focus. Palms facing each other grip.'),
('Cable Pullover', 'back', 'Lat isolation. Standing or kneeling, straight arms, pull bar to hips.'), -- Ensuring this is present

-- Cardio/Mobility
('Shoulder + Hip Mobility', 'cardio', 'Dynamic stretching routine for joint health.');
