-- ============================================
-- FITPATH USER PROFILES TABLE
-- Run this in Supabase SQL Editor (AFTER the main schema)
-- ============================================

-- Drop if exists for fresh start
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with comprehensive user data
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    age INT,
    gender TEXT, -- male, female, other
    
    -- Body Metrics
    height DECIMAL(5,1), -- cm
    current_weight DECIMAL(5,1), -- kg
    goal_weight DECIMAL(5,1), -- kg (optional)
    bmi DECIMAL(4,1),
    
    -- Fitness Data
    goal TEXT, -- lose_weight, build_muscle, get_stronger, improve_endurance, maintain
    activity_level TEXT, -- sedentary, light, moderate, active, very_active
    experience_level TEXT, -- beginner, intermediate, advanced
    workout_days_per_week INT DEFAULT 3,
    
    -- App State
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/write their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
