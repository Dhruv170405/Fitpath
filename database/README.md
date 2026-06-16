# Fitpath Database Setup

This directory contains all SQL scripts for setting up and managing your Supabase database.

## 📁 Directory Structure

### `/setup` - Core Database Files
**Run these in order when setting up a new database:**

1. **`supabase_schema.sql`** - 🔴 **REQUIRED**
   - Creates all core tables (exercises, workout_templates, workout_logs, set_logs)
   - Sets up Row Level Security (RLS) policies
   - Seeds basic exercises and workout templates
   - **Run this first**

2. **`supabase_profiles.sql`** - 🔴 **REQUIRED**
   - Creates the user profiles table
   - Sets up auto-trigger to create profile on user signup
   - Stores user data (name, age, goals, fitness level)
   - **Run this second**

3. **`supabase_avatars.sql`** - 🟡 **RECOMMENDED**
   - Creates storage bucket for profile pictures
   - Adds `avatar_url` column to profiles
   - Sets up storage policies for avatar uploads
   - **Required for profile picture feature**

4. **`supabase_weight_history.sql`** - 🟡 **RECOMMENDED**
   - Creates weight tracking table
   - Sets up automatic profile weight updates via trigger
   - **Required for progress tracking feature**

---

### `/optional` - Enhancement Files
**Optional scripts to enhance functionality:**

1. **`supabase_exercises_expanded.sql`**
   - Adds 50+ exercises with detailed descriptions
   - Splits biceps/triceps into separate muscle groups
   - **⚠️ Warning: Deletes existing exercises and re-links templates**
   - Use this for a comprehensive exercise library

2. **`supabase_restore_exercises.sql`**
   - Adds specific missing exercises (Treadmill, Pec Deck, etc.)
   - Safe to run multiple times (uses ON CONFLICT DO NOTHING)
   - Use this to add individual exercises without replacing the entire library

---

### `/archived` - One-Time Fix Files
**These were used to fix specific database issues. Keep as reference or delete:**

1. **`supabase_fix_policies.sql`**
   - Fixes RLS policies for custom workout deletion
   - Allows users to delete their own templates and exercises
   - **Only needed once if you encountered permission errors**

2. **`supabase_deduplicate.sql`**
   - Removes duplicate exercises from the database
   - Adds unique constraint on exercise names
   - **Only needed once for cleanup**

3. **`supabase_fix_fk.sql`**
   - Changes foreign key constraint to ON DELETE SET NULL
   - Allows template deletion while preserving workout history
   - **Only needed once**

---

## 🚀 Quick Start

### For a fresh database, run in this order:

```sql
-- 1. Core schema (REQUIRED)
-- Run: database/setup/supabase_schema.sql

-- 2. User profiles (REQUIRED)
-- Run: database/setup/supabase_profiles.sql

-- 3. Profile pictures (RECOMMENDED)
-- Run: database/setup/supabase_avatars.sql

-- 4. Weight tracking (RECOMMENDED)
-- Run: database/setup/supabase_weight_history.sql

-- 5. (OPTIONAL) Add more exercises
-- Run: database/optional/supabase_exercises_expanded.sql
-- OR: database/optional/supabase_restore_exercises.sql
```

### If you have an existing database with issues:

- Permission errors when deleting workouts? → Run `archived/supabase_fix_policies.sql`
- Duplicate exercises? → Run `archived/supabase_deduplicate.sql`
- Can't delete workout templates? → Run `archived/supabase_fix_fk.sql`

---

## 📝 Notes

- All scripts are idempotent where possible (safe to run multiple times)
- Scripts use `IF NOT EXISTS`, `ON CONFLICT`, and `DROP POLICY IF EXISTS` to prevent errors
- Row Level Security (RLS) is enabled on all tables for data protection
- Users can only access their own workout logs, set logs, and profiles

---

## 🗑️ Cleaning Up

If your database is working correctly, you can safely **delete the `/archived` folder**. The fix scripts were only needed once to resolve specific issues.

Keep `/setup` and `/optional` folders for future reference or if you need to rebuild your database.
