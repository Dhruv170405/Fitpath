export interface Exercise {
    id: string;
    name: string;
    muscle_group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
    video_url?: string;
    description?: string;
}

export interface WorkoutExercise {
    id: string;
    exercise_id: string;
    workout_id: string;
    order: number;
    sets: number;
    reps: string; // e.g. "8-12"
    exercise?: Exercise;
}

export interface Workout {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration_minutes: number;
    exercises?: WorkoutExercise[];
}

export interface UserStats {
    workouts_completed: number;
    minutes_spent: number;
    current_streak: number;
    calories_burned: number;
}
