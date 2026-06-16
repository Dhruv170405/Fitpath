-- Run this in your Supabase SQL Editor to add the role column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set yourself as an admin (replace with your email if needed)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
