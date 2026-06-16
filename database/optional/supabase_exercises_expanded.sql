-- ============================================
-- FITPATH EXPANDED EXERCISE LIBRARY
-- Run this in Supabase SQL Editor
-- This adds 50+ exercises to your database
-- ============================================

-- Clear existing exercises and add comprehensive library
DELETE FROM public.workout_template_exercises;
DELETE FROM public.exercises;

-- ============================================
-- CHEST EXERCISES (8)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Barbell Bench Press', 'chest', 'Classic compound movement. Lie flat, grip bar shoulder-width, lower to chest, press up.'),
('Incline Dumbbell Press', 'chest', 'Upper chest focus. Set bench to 30-45°, press dumbbells up and together.'),
('Decline Bench Press', 'chest', 'Lower chest emphasis. Decline bench, grip bar, lower to lower chest, press up.'),
('Dumbbell Flyes', 'chest', 'Isolation stretch movement. Lie flat, arc dumbbells out wide, squeeze together.'),
('Cable Crossover', 'chest', 'Constant tension isolation. High to low cable movement, squeeze at center.'),
('Push Ups', 'chest', 'Bodyweight classic. Hands shoulder-width, lower chest to ground, push up.'),
('Chest Dips', 'chest', 'Lean forward on dip bars to emphasize chest. Lower slowly, press up.'),
('Machine Chest Press', 'chest', 'Guided pressing motion. Great for beginners or high-rep finishers.');

-- ============================================
-- BACK EXERCISES (8)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Deadlift', 'back', 'King of back exercises. Hip hinge, grip bar, drive through heels, stand tall.'),
('Pull Ups', 'back', 'Bodyweight lat builder. Grip bar wider than shoulders, pull chin over bar.'),
('Barbell Row', 'back', 'Compound thickness builder. Hinge forward, pull bar to lower chest.'),
('Lat Pulldown', 'back', 'Machine lat exercise. Wide grip, pull bar to upper chest, squeeze lats.'),
('Seated Cable Row', 'back', 'Mid-back thickness. Pull handle to stomach, squeeze shoulder blades.'),
('T-Bar Row', 'back', 'Heavy back builder. Straddle bar, pull to chest, control the negative.'),
('Single Arm Dumbbell Row', 'back', 'Unilateral back work. Hand on bench, row dumbbell to hip.'),
('Face Pulls', 'back', 'Rear delt and upper back. Cable at face height, pull to ears, external rotate.');

-- ============================================
-- LEGS EXERCISES (10)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Barbell Back Squat', 'legs', 'King of leg exercises. Bar on traps, squat to parallel or below.'),
('Front Squat', 'legs', 'Quad dominant. Bar on front delts, upright torso, squat deep.'),
('Leg Press', 'legs', 'Machine quad builder. Feet shoulder-width, lower sled, press up.'),
('Romanian Deadlift', 'legs', 'Hamstring and glute focus. Slight knee bend, hip hinge, stretch hamstrings.'),
('Bulgarian Split Squat', 'legs', 'Single leg strength. Rear foot elevated, lunge down, drive up.'),
('Leg Curl', 'legs', 'Hamstring isolation. Lying or seated, curl weight toward glutes.'),
('Leg Extension', 'legs', 'Quad isolation. Seated, extend legs straight, squeeze at top.'),
('Walking Lunges', 'legs', 'Functional leg work. Step forward, drop knee, alternate legs.'),
('Calf Raises', 'legs', 'Calf builder. Rise onto toes, hold at top, lower with control.'),
('Hip Thrust', 'legs', 'Glute builder. Back on bench, drive hips up, squeeze glutes at top.');

-- ============================================
-- SHOULDERS EXERCISES (8)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Overhead Press', 'shoulders', 'Compound shoulder builder. Press bar from shoulders to overhead.'),
('Dumbbell Shoulder Press', 'shoulders', 'Seated or standing. Press dumbbells overhead, control the negative.'),
('Lateral Raises', 'shoulders', 'Side delt isolation. Raise dumbbells to sides until parallel to floor.'),
('Front Raises', 'shoulders', 'Front delt focus. Raise weights in front to shoulder height.'),
('Rear Delt Flyes', 'shoulders', 'Rear delt isolation. Bent over or on machine, fly arms back.'),
('Arnold Press', 'shoulders', 'Rotational press hitting all delt heads. Start palms in, rotate as you press.'),
('Upright Row', 'shoulders', 'Traps and side delts. Pull bar up to chin, elbows high.'),
('Shrugs', 'shoulders', 'Trap builder. Hold heavy weight, shrug shoulders to ears.');

-- ============================================
-- ARMS - BICEPS (6)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Barbell Curl', 'biceps', 'Classic bicep builder. EZ or straight bar, curl with strict form.'),
('Dumbbell Curl', 'biceps', 'Alternating or together. Curl with supination for peak contraction.'),
('Hammer Curl', 'biceps', 'Brachialis and forearm. Neutral grip, curl to shoulders.'),
('Preacher Curl', 'biceps', 'Isolated bicep stretch. Arm on pad, curl with control.'),
('Incline Dumbbell Curl', 'biceps', 'Long head emphasis. Incline bench, let arms hang, curl up.'),
('Cable Curl', 'biceps', 'Constant tension. Cable from low pulley, curl with squeeze at top.');

-- ============================================
-- ARMS - TRICEPS (6)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Tricep Pushdown', 'triceps', 'Cable isolation. Push bar/rope down, lock out elbows, squeeze.'),
('Skull Crushers', 'triceps', 'Lying tricep extension. Lower bar to forehead, extend up.'),
('Close Grip Bench Press', 'triceps', 'Compound tricep builder. Narrow grip, elbows close, press.'),
('Overhead Tricep Extension', 'triceps', 'Long head stretch. Dumbbell or cable overhead, extend arms.'),
('Tricep Dips', 'triceps', 'Bodyweight builder. Upright torso, lower and press, lock out.'),
('Diamond Push Ups', 'triceps', 'Bodyweight isolation. Hands together forming diamond, push up.');

-- ============================================
-- CORE EXERCISES (6)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Plank', 'core', 'Isometric core stability. Hold position with straight body line.'),
('Crunches', 'core', 'Upper ab focus. Curl shoulders off ground, squeeze at top.'),
('Leg Raises', 'core', 'Lower ab focus. Lying or hanging, raise legs with control.'),
('Russian Twists', 'core', 'Oblique work. Seated, twist side to side with weight.'),
('Ab Wheel Rollout', 'core', 'Advanced core. Roll wheel out, maintain core tension, roll back.'),
('Cable Woodchops', 'core', 'Rotational power. Diagonal cable chop from high to low or reverse.');

-- ============================================
-- CARDIO EXERCISES (4)
-- ============================================
INSERT INTO public.exercises (name, muscle_group, description) VALUES
('Treadmill Running', 'cardio', 'Steady state or intervals. Great for endurance and fat burn.'),
('Rowing Machine', 'cardio', 'Full body cardio. Drive with legs, pull with back, extend arms.'),
('Stair Climber', 'cardio', 'Lower body cardio. Climbing motion, great for legs and conditioning.'),
('Jump Rope', 'cardio', 'High intensity. Great for coordination, conditioning, and calorie burn.');

-- ============================================
-- RE-LINK DEFAULT TEMPLATES TO NEW EXERCISE IDs
-- ============================================

-- Push Day
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '11111111-1111-1111-1111-111111111111'::uuid, id, 4, '8-10', 1 FROM public.exercises WHERE name = 'Barbell Bench Press'
UNION ALL SELECT '11111111-1111-1111-1111-111111111111'::uuid, id, 3, '10-12', 2 FROM public.exercises WHERE name = 'Incline Dumbbell Press'
UNION ALL SELECT '11111111-1111-1111-1111-111111111111'::uuid, id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Overhead Press'
UNION ALL SELECT '11111111-1111-1111-1111-111111111111'::uuid, id, 3, '12-15', 4 FROM public.exercises WHERE name = 'Lateral Raises'
UNION ALL SELECT '11111111-1111-1111-1111-111111111111'::uuid, id, 3, '10-12', 5 FROM public.exercises WHERE name = 'Tricep Pushdown';

-- Pull Day
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '22222222-2222-2222-2222-222222222222'::uuid, id, 4, 'AMRAP', 1 FROM public.exercises WHERE name = 'Pull Ups'
UNION ALL SELECT '22222222-2222-2222-2222-222222222222'::uuid, id, 4, '8-10', 2 FROM public.exercises WHERE name = 'Barbell Row'
UNION ALL SELECT '22222222-2222-2222-2222-222222222222'::uuid, id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Lat Pulldown'
UNION ALL SELECT '22222222-2222-2222-2222-222222222222'::uuid, id, 3, '10-12', 4 FROM public.exercises WHERE name = 'Barbell Curl'
UNION ALL SELECT '22222222-2222-2222-2222-222222222222'::uuid, id, 3, '12-15', 5 FROM public.exercises WHERE name = 'Hammer Curl';

-- Leg Day
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, id, 4, '6-8', 1 FROM public.exercises WHERE name = 'Barbell Back Squat'
UNION ALL SELECT '33333333-3333-3333-3333-333333333333'::uuid, id, 3, '10-12', 2 FROM public.exercises WHERE name = 'Leg Press'
UNION ALL SELECT '33333333-3333-3333-3333-333333333333'::uuid, id, 3, '10-12', 3 FROM public.exercises WHERE name = 'Romanian Deadlift'
UNION ALL SELECT '33333333-3333-3333-3333-333333333333'::uuid, id, 3, '12-15', 4 FROM public.exercises WHERE name = 'Leg Curl'
UNION ALL SELECT '33333333-3333-3333-3333-333333333333'::uuid, id, 4, '15-20', 5 FROM public.exercises WHERE name = 'Calf Raises';

-- Full Body
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sets, target_reps, order_index)
SELECT '44444444-4444-4444-4444-444444444444'::uuid, id, 3, '8-10', 1 FROM public.exercises WHERE name = 'Barbell Back Squat'
UNION ALL SELECT '44444444-4444-4444-4444-444444444444'::uuid, id, 3, '8-10', 2 FROM public.exercises WHERE name = 'Barbell Bench Press'
UNION ALL SELECT '44444444-4444-4444-4444-444444444444'::uuid, id, 3, '8-10', 3 FROM public.exercises WHERE name = 'Barbell Row'
UNION ALL SELECT '44444444-4444-4444-4444-444444444444'::uuid, id, 3, '8-10', 4 FROM public.exercises WHERE name = 'Overhead Press'
UNION ALL SELECT '44444444-4444-4444-4444-444444444444'::uuid, id, 3, '30-60s', 5 FROM public.exercises WHERE name = 'Plank';
