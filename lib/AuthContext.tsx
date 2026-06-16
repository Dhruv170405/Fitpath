import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
    session: Session | null;
    isGuest: boolean;
    loading: boolean;
    isOnboarded: boolean | null;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
    completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    isGuest: false,
    loading: true,
    isOnboarded: null,
    signInAsGuest: async () => { },
    signOut: async () => { },
    completeOnboarding: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        // Initial load
        const loadAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    // Check if it's a network error
                    if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
                        console.warn('Network error during session fetch. Proceeding with offline mode if session exists.');
                        // In offline mode we don't throw, we just use the session we might have
                    } else {
                        throw error;
                    }
                }
                
                setSession(session);

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarding_completed')
                        .eq('id', session.user.id)
                        .single();
                    setIsOnboarded(profile?.onboarding_completed || false);
                } else {
                    setIsOnboarded(null);
                }

                // Check Guest
                const guestStatus = await AsyncStorage.getItem('user_is_guest');
                setIsGuest(guestStatus === 'true');
            } catch (e: any) {
                if (e?.message?.includes('Refresh Token Not Found') || e?.message?.includes('Invalid Refresh Token')) {
                    console.log('Session expired or invalid, requiring re-login.');
                    setSession(null);
                    setIsOnboarded(null);
                    // Optionally clear any stale data here
                } else {
                    console.error('Auth load failed', e);
                }
            } finally {
                setLoading(false);
            }
        };
        loadAuth();

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                // If we get a session, we are definitely not a guest anymore
                setIsGuest(false);
                AsyncStorage.removeItem('user_is_guest');

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('onboarding_completed')
                    .eq('id', session.user.id)
                    .single();
                setIsOnboarded(profile?.onboarding_completed || false);
            } else {
                setIsOnboarded(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInAsGuest = async () => {
        try {
            await AsyncStorage.setItem('user_is_guest', 'true');
            setIsGuest(true);
        } catch (e) {
            console.error('Failed to set guest status', e);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('user_is_guest');
        setIsGuest(false);
        setSession(null);
        setIsOnboarded(null);
    };

    const completeOnboarding = () => {
        setIsOnboarded(true);
    };

    return (
        <AuthContext.Provider value={{ session, isGuest, loading, isOnboarded, signInAsGuest, signOut, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
}
