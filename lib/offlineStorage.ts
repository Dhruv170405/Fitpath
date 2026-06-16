import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
    WORKOUT_TEMPLATES: 'fitpath_workout_templates',
    EXERCISES: 'fitpath_exercises',
    OFFLINE_QUEUE: 'fitpath_offline_queue',
    USER_PROFILE: 'fitpath_user_profile',
    LAST_SYNC: 'fitpath_last_sync',
};

// Types
export interface OfflineAction {
    id: string;
    type: 'workout_log' | 'set_log' | 'profile_update';
    payload: any;
    timestamp: number;
}

// ============================================
// CACHE MANAGEMENT
// ============================================

export async function cacheWorkoutTemplates(templates: any[]): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
        console.log('✅ Cached workout templates:', templates.length);
    } catch (error) {
        console.error('Failed to cache templates:', error);
    }
}

export async function getCachedWorkoutTemplates(): Promise<any[] | null> {
    try {
        const data = await AsyncStorage.getItem(KEYS.WORKOUT_TEMPLATES);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get cached templates:', error);
        return null;
    }
}

export async function cacheExercises(exercises: any[]): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
        console.log('✅ Cached exercises:', exercises.length);
    } catch (error) {
        console.error('Failed to cache exercises:', error);
    }
}

export async function getCachedExercises(): Promise<any[] | null> {
    try {
        const data = await AsyncStorage.getItem(KEYS.EXERCISES);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get cached exercises:', error);
        return null;
    }
}

export async function cacheUserProfile(profile: any): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
        console.error('Failed to cache profile:', error);
    }
}

export async function getCachedUserProfile(): Promise<any | null> {
    try {
        const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get cached profile:', error);
        return null;
    }
}

// ============================================
// OFFLINE ACTION QUEUE
// ============================================

export async function addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
        const queue = await getOfflineQueue();
        const newAction: OfflineAction = {
            ...action,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };
        queue.push(newAction);
        await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
        console.log('📥 Added to offline queue:', action.type);
    } catch (error) {
        console.error('Failed to add to offline queue:', error);
    }
}

export async function getOfflineQueue(): Promise<OfflineAction[]> {
    try {
        const data = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get offline queue:', error);
        return [];
    }
}

export async function removeFromQueue(actionId: string): Promise<void> {
    try {
        const queue = await getOfflineQueue();
        const filtered = queue.filter(a => a.id !== actionId);
        await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to remove from queue:', error);
    }
}

export async function clearOfflineQueue(): Promise<void> {
    try {
        await AsyncStorage.removeItem(KEYS.OFFLINE_QUEUE);
        console.log('🗑️ Cleared offline queue');
    } catch (error) {
        console.error('Failed to clear offline queue:', error);
    }
}

export async function getQueueCount(): Promise<number> {
    const queue = await getOfflineQueue();
    return queue.length;
}

// ============================================
// SYNC TRACKING
// ============================================

export async function setLastSyncTime(): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, Date.now().toString());
}

export async function getLastSyncTime(): Promise<number | null> {
    const time = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return time ? parseInt(time) : null;
}

// ============================================
// CLEAR ALL CACHE
// ============================================

export async function clearAllCache(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([
            KEYS.WORKOUT_TEMPLATES,
            KEYS.EXERCISES,
            KEYS.USER_PROFILE,
            KEYS.LAST_SYNC,
        ]);
        console.log('🗑️ Cleared all cache');
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}
