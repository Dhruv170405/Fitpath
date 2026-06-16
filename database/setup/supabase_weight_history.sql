-- ============================================
-- WEIGHT HISTORY TABLE
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.weight_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    weight DECIMAL(5,1) NOT NULL, -- kg
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

-- Policies
-- Policies
DROP POLICY IF EXISTS "Users can read own weight history" ON public.weight_history;
CREATE POLICY "Users can read own weight history" ON public.weight_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weight entry" ON public.weight_history;
CREATE POLICY "Users can insert own weight entry" ON public.weight_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own weight entry" ON public.weight_history;
CREATE POLICY "Users can delete own weight entry" ON public.weight_history
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create a trigger to update the main profile's current_weight 
-- whenever a new weight entry is added.
CREATE OR REPLACE FUNCTION public.update_profile_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET current_weight = NEW.weight,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_weight_entry_added ON public.weight_history;
CREATE TRIGGER on_weight_entry_added
    AFTER INSERT ON public.weight_history
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_weight();
