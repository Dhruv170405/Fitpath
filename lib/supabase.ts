import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('Supabase URL:', supabaseUrl ? 'LOADED' : 'MISSING');
console.log('Supabase Key:', supabaseAnonKey ? 'LOADED' : 'MISSING');

// Helper for safe Supabase calls with standardized error handling
export async function safeSupabaseCall<T>(
    promise: Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
    try {
        const response = await promise;
        if (response.error) {
            console.error('[Supabase Error]:', response.error.message);
            // Optional: Add Toast trigger here if we passed a dispatch function
        }
        return response;
    } catch (err: any) {
        console.error('[Supabase Exception]:', err);
        return { data: null, error: { message: err.message || 'An unexpected error occurred' } };
    }
}

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})
