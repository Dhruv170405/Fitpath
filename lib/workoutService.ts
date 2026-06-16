import {
    addToOfflineQueue,
    cacheExercises,
    cacheWorkoutTemplates,
    getCachedExercises,
    getCachedWorkoutTemplates
} from './offlineStorage';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Exercise {
    id: string;
    name: string;
    muscle_group: string;
    description?: string;
    video_url?: string;
    images?: string[];
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    duration_minutes: number;
    day_of_week?: string;
    is_default: boolean;
    exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
    id: string;
    exercise_id: string;
    sets: number;
    target_reps: string;
    order_index: number;
    exercise?: Exercise;
}

export interface WorkoutLog {
    id: string;
    user_id: string;
    template_id?: string;
    workout_name: string;
    started_at: string;
    completed_at?: string;
    duration_minutes?: number;
    notes?: string;
}

// Helper to check network status - try to fetch from supabase as a ping
async function isOnline(): Promise<boolean> {
    try {
        // Simple connectivity check - try a quick Supabase call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        await fetch('https://www.google.com/generate_204', {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return true;
    } catch {
        // If fetch fails, we're offline
        return false;
    }
}

// ============================================
// WORKOUT TEMPLATES (with offline caching)
// ============================================

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    try {
        const { data, error } = await supabase
            .from('workout_templates')
            .select('*')
            .order('is_default', { ascending: false });

        if (error) throw error;

        // Cache for offline use
        if (data && data.length > 0) {
            await cacheWorkoutTemplates(data);
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching templates, trying cache:', error);
        // Fallback to cache on error
        const cached = await getCachedWorkoutTemplates();
        return cached || [];
    }
}

// Fetch a single workout template with its exercises
export async function getWorkoutWithExercises(templateId: string): Promise<WorkoutTemplate | null> {
    try {
        // Get template
        const { data: template, error: templateError } = await supabase
            .from('workout_templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (templateError) throw templateError;

        // Get exercises for this template
        const { data: templateExercises, error: exError } = await supabase
            .from('workout_template_exercises')
            .select(`
        id,
        sets,
        target_reps,
        order_index,
        exercise_id,
        exercises (
          id,
          name,
          muscle_group,
          description,
          video_url
        )
      `)
            .eq('template_id', templateId)
            .order('order_index');

        if (exError) {
            console.error('Error fetching exercises:', exError);
            return template;
        }

        // Transform the data
        const exercises = templateExercises?.map(te => ({
            id: te.id,
            exercise_id: te.exercise_id,
            sets: te.sets,
            target_reps: te.target_reps,
            order_index: te.order_index,
            exercise: te.exercises as unknown as Exercise,
        })) || [];

        return { ...template, exercises };
    } catch (error) {
        console.error('Error fetching workout, trying cache:', error);
        // Fallback to cache
        const cached = await getCachedWorkoutTemplates();
        return cached?.find(t => t.id === templateId) || null;
    }
}

// ============================================
// EXERCISES (with offline caching)
// ============================================

export const LOCAL_EXERCISES: Exercise[] = [
    { id: 'ex-60', name: 'Incline Barbell Bench Press', muscle_group: 'chest', description: 'Upper chest builder. Incline bench, grip bar, press up.' },
    { id: 'ex-61', name: 'Pec Deck Fly', muscle_group: 'chest', description: 'Machine isolation. Seat, arm pads, squeeze chest together.' },
    { id: 'ex-62', name: 'Single Arm Cable Row', muscle_group: 'back', description: 'Unilateral back. Cable set mid-height, row to hip, squeeze lat.' },
    { id: 'ex-63', name: 'Cable Pullover', muscle_group: 'back', description: 'Lat isolation. Standing or kneeling, straight arms, pull bar to hips.' },
    { id: 'ex-64', name: 'Cable Lateral Raise', muscle_group: 'shoulders', description: 'Constant tension side delt. Cable low, raise arm to side.' },
    { id: 'ex-65', name: 'Reverse Pec Deck', muscle_group: 'shoulders', description: 'Rear delt isolation. Face machine, fly arms back.' },
    // Batch 2 additions
    { id: 'ex-66', name: 'Treadmill', muscle_group: 'cardio', description: 'Cardiovascular endurance. Walk or run at steady pace or incline.' },
    { id: 'ex-67', name: 'Stair Climber', muscle_group: 'cardio', description: 'Simulated stair climbing for cardio and lower body endurance.' },
    { id: 'ex-68', name: 'Jump Rope', muscle_group: 'cardio', description: 'High intensity cardio and coordination.' },
    // Batch 3 Additions (User Screenshots)
    { id: 'ex-69', name: 'Cable Crunch', muscle_group: 'core', description: 'Weighted ab isolation. Kneel, hold rope, crunch down.' },
    { id: 'ex-70', name: 'Hanging Leg Raise', muscle_group: 'core', description: 'Advanced core. Hang from bar, raise legs to parallel or higher.' },
    { id: 'ex-71', name: 'Pallof Press', muscle_group: 'core', description: 'Anti-rotation core stability. Press cable handle out from chest.' },
    { id: 'ex-72', name: 'Farmer\'s Walk', muscle_group: 'core', description: 'Functional core/grip. Walk carrying heavy weights at sides.' },
    { id: 'ex-73', name: 'Wrist Curl', muscle_group: 'arms', description: 'Forearm flexors. Palms up, curl wrists.' },
    { id: 'ex-74', name: 'Reverse Wrist Curl', muscle_group: 'arms', description: 'Forearm extensors. Palms down, extend wrists.' },
    { id: 'ex-75', name: 'Shoulder + Hip Mobility', muscle_group: 'cardio', description: 'Dynamic stretching routine for joint health.' },
    { id: 'ex-76', name: 'Hack Squat', muscle_group: 'legs', description: 'Machine squat. Back supported, fixed path leg press.' },
    { id: 'ex-77', name: 'Pendulum Squat', muscle_group: 'legs', description: 'Arc-motion machine squat. Deep knee bend emphasis.' },
    { id: 'ex-78', name: 'Standing Calf Raise', muscle_group: 'legs', description: 'Calf isolation. Straight legs, raise heels.' },
    { id: 'ex-79', name: 'Close-Grip Machine Press', muscle_group: 'triceps', description: 'Tricep focus press. Narrow grip, keeping elbows close.' },
    { id: 'ex-80', name: 'EZ-Bar Curl', muscle_group: 'biceps', description: 'Bicep isolation. Semi-supinated grip reduces wrist strain.' },
    { id: 'ex-81', name: 'Machine Lateral Raise', muscle_group: 'shoulders', description: 'Side delt isolation. Fixed path machine raise.' },
    { id: 'ex-82', name: 'Chest-Supported Row', muscle_group: 'back', description: 'Upper back focus. Chest on pad to minimize momentum.' },
    { id: 'ex-83', name: 'Neutral-Grip Lat Pulldown', muscle_group: 'back', description: 'Lats focus. Palms facing each other grip.' },
];

function mapMuscleGroup(muscle: string): string {
    if (!muscle) return 'other';
    const m = muscle.toLowerCase();
    if (m.includes('chest')) return 'chest';
    if (m.includes('back') || m.includes('lats') || m.includes('traps')) return 'back';
    if (m.includes('shoulder') || m.includes('delts')) return 'shoulders';
    if (m.includes('biceps')) return 'biceps';
    if (m.includes('triceps')) return 'triceps';
    if (m.includes('abdominals') || m.includes('core') || m.includes('obliques')) return 'core';
    if (m.includes('hamstring') || m.includes('calves') || m.includes('glutes') || m.includes('quadriceps') || m.includes('adductors') || m.includes('abductors')) return 'legs';
    if (m.includes('cardio')) return 'cardio';
    return 'arms';
}

export async function getExercises(): Promise<Exercise[]> {
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('muscle_group');

        if (error) throw error;

        // Fetch from external API for massive exercise database
        let apiExercises: Exercise[] = [];
        try {
            const CACHE_KEY = 'api_exercises_cache_v2';
            const cachedApi = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedApi) {
                apiExercises = JSON.parse(cachedApi);
            } else {
                const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
                if (response.ok) {
                    const rawData = await response.json();
                    apiExercises = rawData.map((item: any) => ({
                        id: `api-${item.id}`,
                        name: item.name,
                        muscle_group: mapMuscleGroup(item.primaryMuscles?.[0]),
                        description: item.instructions?.join('\n') || '',
                        images: item.images?.map((img: string) => encodeURI(`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`)) || []
                    }));
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiExercises));
                }
            }
        } catch (apiErr) {
            console.warn('Failed to fetch API exercises', apiErr);
        }

        // Merge DB data with local and API exercises, ensuring no duplicates by name
        const dbExercises = data || [];
        const combinedExercises = [
            ...dbExercises,
            ...LOCAL_EXERCISES.filter(local =>
                !dbExercises.some(db => db.name.toLowerCase() === local.name.toLowerCase())
            ),
            ...apiExercises.filter(apiEx =>
                !dbExercises.some(db => db.name.toLowerCase() === apiEx.name.toLowerCase()) &&
                !LOCAL_EXERCISES.some(local => local.name.toLowerCase() === apiEx.name.toLowerCase())
            )
        ];

        // Cache for offline use
        if (combinedExercises.length > 0) {
            await cacheExercises(combinedExercises);
        }

        return combinedExercises;
    } catch (error) {
        console.error('Error fetching exercises, trying cache:', error);
        const cached = await getCachedExercises();
        return cached || [];
    }
}

// ============================================
// WORKOUT LOGGING
// ============================================

export async function startWorkoutLog(templateId: string, workoutName: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from('workout_logs')
            .insert({
                user_id: user.id,
                template_id: templateId,
                workout_name: workoutName,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data?.id || null;
    } catch (error) {
        console.error('Error starting workout, queuing for later:', error);
        // Generate a temporary local ID and queue
        const tempId = `offline_${Date.now()}`;
        await addToOfflineQueue({
            type: 'workout_log',
            payload: {
                user_id: user.id,
                template_id: templateId,
                workout_name: workoutName,
                started_at: new Date().toISOString(),
            },
        });
        return tempId;
    }
}

// Log a completed set
export async function logSet(
    workoutLogId: string,
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number
): Promise<boolean> {
    const setData = {
        workout_log_id: workoutLogId,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight,
        reps,
        completed: true,
    };

    // If it's an offline workout, just queue
    if (workoutLogId.startsWith('offline_')) {
        await addToOfflineQueue({ type: 'set_log', payload: setData });
        return true;
    }

    try {
        const { error } = await supabase
            .from('set_logs')
            .insert(setData);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error logging set, queuing:', error);
        await addToOfflineQueue({ type: 'set_log', payload: setData });
        return true;
    }
}

// Complete a workout
export async function completeWorkout(workoutLogId: string, durationMinutes: number): Promise<boolean> {
    if (workoutLogId.startsWith('offline_')) {
        console.log('📱 Offline workout will sync later');
        return true;
    }

    try {
        const { error } = await supabase
            .from('workout_logs')
            .update({
                completed_at: new Date().toISOString(),
                duration_minutes: durationMinutes,
            })
            .eq('id', workoutLogId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error completing workout:', error);
        return false;
    }
}

// Get user's personal best (max weight) for an exercise
export async function getExercisePersonalBest(exerciseId: string): Promise<{ weight: number, reps: number } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from('set_logs')
            .select('weight, reps, workout_logs!inner(user_id)')
            .eq('workout_logs.user_id', user.id)
            .eq('exercise_id', exerciseId)
            .eq('completed', true)
            .order('weight', { ascending: false })
            // If weights are equal, get the one with the most reps
            .order('reps', { ascending: false })
            .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
            return {
                weight: data[0].weight,
                reps: data[0].reps
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching PB:', error);
        return null;
    }
}

// Get user's workout history
export async function getUserWorkoutHistory(): Promise<WorkoutLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data, error } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('user_id', user.id)
            .not('completed_at', 'is', null)
            .order('started_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

export async function getWorkoutDetails(logId: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
        // Get the log info
        const { data: log, error: logError } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (logError) throw logError;

        // Get the sets for this log
        const { data: sets, error: setsError } = await supabase
            .from('set_logs')
            .select(`
                *,
                exercises (
                    id,
                    name,
                    muscle_group,
                    video_url
                )
            `)
            .eq('workout_log_id', logId)
            .order('created_at', { ascending: true });

        if (setsError) throw setsError;

        // Group sets by exercise
        const exercises: any[] = [];
        const exerciseMap = new Map();

        sets?.forEach((set: any) => {
            const exId = set.exercise_id;
            if (!exerciseMap.has(exId)) {
                exerciseMap.set(exId, {
                    exercise: set.exercises,
                    sets: []
                });
                exercises.push(exerciseMap.get(exId));
            }
            exerciseMap.get(exId).sets.push({
                set_number: set.set_number,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed
            });
        });

        return { ...log, exercises };
    } catch (error) {
        console.error('Error fetching details:', error);
        return null;
    }
}

// ============================================
// CUSTOM WORKOUT MANAGEMENT
// ============================================

interface CustomExercise {
    exerciseId: string;
    sets: number;
    targetReps: string;
    orderIndex: number;
}

// Helper to ensure exercise exists in DB and get its UUID
async function ensureExerciseExists(exerciseId: string): Promise<string | null> {
    // If it looks like a UUID, it's already good
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(exerciseId)) {
        return exerciseId;
    }

    // It's a local ID (e.g., "ex-82"). Find details.
    const localExercise = LOCAL_EXERCISES.find(e => e.id === exerciseId);
    if (!localExercise) {
        console.error('Unknown local exercise ID:', exerciseId);
        return null;
    }

    try {
        // 1. Check if it exists in DB by name
        const { data: existing } = await supabase
            .from('exercises')
            .select('id')
            .eq('name', localExercise.name)
            .single();

        if (existing) {
            return existing.id;
        }

        // 2. Insert into DB to get a new UUID
        const { data: newExercise, error } = await supabase
            .from('exercises')
            .insert({
                name: localExercise.name,
                muscle_group: localExercise.muscle_group,
                description: localExercise.description,
                // video_url: localExercise.video_url // if available
            })
            .select('id')
            .single();

        if (error) throw error;
        return newExercise.id;

    } catch (error) {
        console.error(`Failed to sync local exercise ${localExercise.name}:`, error);
        return null;
    }
}

export async function createCustomWorkout(
    name: string,
    exercises: CustomExercise[]
): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
        // Resolve all exercise IDs to UUIDs
        const resolvedExercises = await Promise.all(
            exercises.map(async (ex) => {
                const uuid = await ensureExerciseExists(ex.exerciseId);
                if (!uuid) throw new Error(`Could not resolve exercise: ${ex.exerciseId}`);
                return { ...ex, exerciseId: uuid };
            })
        );

        // Create the workout template
        const { data: template, error: templateError } = await supabase
            .from('workout_templates')
            .insert({
                name,
                description: `Custom workout with ${exercises.length} exercises`,
                difficulty: 'Intermediate',
                duration_minutes: exercises.length * 10,
                is_default: false,
                created_by: user.id,
            })
            .select()
            .single();

        if (templateError) throw templateError;

        // Add exercises to the template
        const exerciseInserts = resolvedExercises.map(ex => ({
            template_id: template.id,
            exercise_id: ex.exerciseId,
            sets: ex.sets,
            target_reps: ex.targetReps,
            order_index: ex.orderIndex,
        }));

        const { error: exercisesError } = await supabase
            .from('workout_template_exercises')
            .insert(exerciseInserts);

        if (exercisesError) throw exercisesError;

        console.log('✅ Custom workout created:', name);
        return { success: true };
    } catch (error: any) {
        console.error('Error creating custom workout:', error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

export async function deleteCustomWorkout(templateId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
        // Only allow deleting user's own workouts (not defaults)
        const { error } = await supabase
            .from('workout_templates')
            .delete()
            .eq('id', templateId)
            .eq('created_by', user.id)
            .eq('is_default', false);

        if (error) throw error;
        console.log('🗑️ Custom workout deleted');
        return true;
    } catch (error) {
        console.error('Error deleting workout:', error);
        return false;
    }
}

export async function getUserCustomWorkouts(): Promise<WorkoutTemplate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data, error } = await supabase
            .from('workout_templates')
            .select('*')
            .eq('created_by', user.id)
            .eq('is_default', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching custom workouts:', error);
        return [];
    }
}

// Get user's weight history
export async function getUserWeightHistory(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data, error } = await supabase
            .from('weight_history')
            .select('*')
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching weight history:', error);
        return [];
    }
}

// Log a weight entry
export async function logUserWeight(weight: number): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
        const { error } = await supabase
            .from('weight_history')
            .insert({
                user_id: user.id,
                weight: weight,
                recorded_at: new Date().toISOString()
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error logging weight:', error);
        return false;
    }
}

// ============================================
// STATISTICS
// ============================================

export async function getUserStatistics(): Promise<{
    totalVolume: number;
    totalSets: number;
    thisWeekSets: number;
    totalWorkouts: number;
    activeStreak: number;
}> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalVolume: 0, totalSets: 0, thisWeekSets: 0, totalWorkouts: 0, activeStreak: 0 };

    try {
        // 1. Get total workouts count (completed)
        const { count: workoutCount, error: countError } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('completed_at', 'is', null);

        if (countError) throw countError;

        // 2. Get Volume & Sets
        // We need to join workout_logs to ensure we only count user's logs
        // Note: This might be heavy for large datasets. 
        // Ideally we'd have a database view or RPC, but this works for MVP.
        const { data: sets, error: setsError } = await supabase
            .from('set_logs')
            .select(`
                weight,
                reps,
                workout_logs!inner (
                    user_id,
                    started_at
                )
            `)
            .eq('workout_logs.user_id', user.id)
            .eq('completed', true);

        if (setsError) throw setsError;

        let totalVolume = 0;
        let totalSets = 0;
        let thisWeekSets = 0;
        
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - diffToMonday);
        lastMonday.setHours(0, 0, 0, 0);

        sets?.forEach((set: any) => {
            if (set.weight && set.reps) {
                totalVolume += (set.weight * set.reps);
            }
            totalSets++;
            
            if (set.workout_logs?.started_at) {
                const wDate = new Date(set.workout_logs.started_at);
                if (wDate >= lastMonday) {
                    thisWeekSets++;
                }
            }
        });

        return {
            totalVolume,
            totalSets,
            thisWeekSets,
            totalWorkouts: workoutCount || 0,
            activeStreak: 0 // Calculated on frontend for now
        };

    } catch (error) {
        console.error('Error calculating stats:', error);
        return { totalVolume: 0, totalSets: 0, thisWeekSets: 0, totalWorkouts: 0, activeStreak: 0 };
    }
}

// ============================================
// ADVANCED PROGRESS METRICS
// ============================================

export interface AdvancedStats {
    consistency: {
        activeWeeks: number; // Out of last 4
        totalWorkouts: number;
    };
    trend: {
        currentMonthMinutes: number;
        lastMonthMinutes: number;
        percentageChange: number;
        direction: 'up' | 'down' | 'neutral';
    };
    streak: {
        current: number;
        best: number;
    };
    muscleBalance: {
        [muscle: string]: number; // Percentage or count
    };
    recentMilestones: string[];
    strengthProgress: {
        exerciseName: string;
        startWeight: number;
        currentWeight: number;
        change: number;
    }[];
}

export async function getAdvancedProgressStats(): Promise<AdvancedStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Fetch all completed workout logs
    const { data: logs, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false });

    if (error) throw error;
    if (!logs || logs.length === 0) {
        return {
            consistency: { activeWeeks: 0, totalWorkouts: 0 },
            trend: { currentMonthMinutes: 0, lastMonthMinutes: 0, percentageChange: 0, direction: 'neutral' },
            streak: { current: 0, best: 0 },
            muscleBalance: {},
            recentMilestones: [],
            strengthProgress: []
        };
    }

    // --- Consistency (Last 4 Weeks) ---
    const now = new Date();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);

    const activeWeeks = new Set<string>();
    logs.forEach(log => {
        const date = new Date(log.started_at);
        if (date >= fourWeeksAgo) {
            // ISO Week number logic or simple division
            const diff = now.getTime() - date.getTime();
            const weekIndex = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
            activeWeeks.add(weekIndex.toString());
        }
    });

    // --- Time Trend (This Month vs Last Month) ---
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    let currentMonthMins = 0;
    let lastMonthMins = 0;

    logs.forEach(log => {
        const date = new Date(log.started_at);
        if (date.getMonth() === currentMonth && date.getFullYear() === now.getFullYear()) {
            currentMonthMins += (log.duration_minutes || 0);
        } else if (date.getMonth() === lastMonth) {
            lastMonthMins += (log.duration_minutes || 0);
        }
    });

    let percentageChange = 0;
    if (lastMonthMins > 0) {
        percentageChange = ((currentMonthMins - lastMonthMins) / lastMonthMins) * 100;
    } else if (currentMonthMins > 0) {
        percentageChange = 100; // Infinite growth
    }

    // --- Best Streak ---
    // Sort logs by date ascending for streak calc
    const sortedLogs = [...logs].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDateString = '';

    // Calculate streaks logic (simplified)
    if (sortedLogs.length > 0) {
        // Needs distinctive days
        const uniqueDates = Array.from(new Set(sortedLogs.map(l => l.started_at.split('T')[0]))).sort();

        uniqueDates.forEach((dateStr, index) => {
            if (index === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(uniqueDates[index - 1]);
                const currDate = new Date(dateStr);
                const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    bestStreak = Math.max(bestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        });
        bestStreak = Math.max(bestStreak, tempStreak);

        // Active streak check
        const lastLogDate = new Date(uniqueDates[uniqueDates.length - 1]);
        const diffToday = Math.ceil((now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffToday <= 1) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }
    }

    // --- Muscle Balance (Volume per muscle group) ---
    // This requires joining with set_logs -> exercises. 
    // For MVP, we'll do a separate fetch for recent sets to keep it performant.
    const muscleCounts: Record<string, number> = {
        'Chest': 0, 'Back': 0, 'Legs': 0, 'Shoulders': 0, 'Arms': 0, 'Core': 0
    };

    // Fetch last 100 sets with exercise info
    const { data: recentSets } = await supabase
        .from('set_logs')
        .select(`
            workout_logs!inner(user_id, completed_at),
            exercises!inner(muscle_group)
        `)
        .eq('workout_logs.user_id', user.id)
        .not('workout_logs.completed_at', 'is', null)
        .limit(200);

    if (recentSets) {
        recentSets.forEach((set: any) => {
            const mg = set.exercises?.muscle_group || 'Other';
            if (muscleCounts[mg] !== undefined) {
                muscleCounts[mg]++;
            } else {
                // Map common names if needed, or ignore
            }
        });
    }

    return {
        consistency: {
            activeWeeks: activeWeeks.size,
            totalWorkouts: logs.length
        },
        trend: {
            currentMonthMinutes: currentMonthMins,
            lastMonthMinutes: lastMonthMins,
            percentageChange: percentageChange,
            direction: percentageChange >= 0 ? 'up' : 'down'
        },
        streak: {
            current: currentStreak,
            best: bestStreak
        },
        muscleBalance: muscleCounts,
        recentMilestones: ['First Workout'], // Placeholder
        strengthProgress: []
    };
}
