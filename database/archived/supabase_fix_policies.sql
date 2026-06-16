-- ============================================
-- FIX RLS POLICIES FOR CUSTOM WORKOUTS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Allow users to DELETE their own workout templates
-- Without this, the "Delete" button looks like it works but fails silently or throws an error on the server
CREATE POLICY "Users can delete own templates" ON public.workout_templates 
    FOR DELETE USING (auth.uid() = created_by);

-- 2. Allow users to ADD exercises to their own templates
-- This fixes the "Error creating custom workout: 42501" (RLS violation)
CREATE POLICY "Users can add exercises to own templates" ON public.workout_template_exercises 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_templates 
            WHERE id = workout_template_exercises.template_id 
            AND created_by = auth.uid()
        )
    );

-- 3. Allow users to DELETE exercises from their own templates (cascading delete usually handles this, but good to have)
CREATE POLICY "Users can delete exercises from own templates" ON public.workout_template_exercises 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workout_templates 
            WHERE id = workout_template_exercises.template_id 
            AND created_by = auth.uid()
        )
    );

-- 4. OPTIONAL: Allow users to UPDATE their own templates (if we add editing later)
CREATE POLICY "Users can update own templates" ON public.workout_templates 
    FOR UPDATE USING (auth.uid() = created_by);
