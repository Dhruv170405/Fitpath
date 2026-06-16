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
