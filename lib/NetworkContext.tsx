import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import {
    getOfflineQueue,
    removeFromQueue,
    setLastSyncTime,
    OfflineAction
} from './offlineStorage';

interface NetworkContextType {
    isConnected: boolean;
    isSyncing: boolean;
    pendingCount: number;
    syncNow: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isSyncing: false,
    pendingCount: 0,
    syncNow: async () => { },
});

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
    children: ReactNode;
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
    const [isConnected, setIsConnected] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            // Simple ping to check connectivity
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            await fetch('https://www.google.com/generate_204', {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            setIsConnected(true);
            return true;
        } catch {
            setIsConnected(false);
            return false;
        }
    }, []);

    useEffect(() => {
        // Check initial state
        checkConnection();
        updatePendingCount();

        // Poll for network changes every 10 seconds
        const interval = setInterval(async () => {
            const wasOffline = !isConnected;
            const nowOnline = await checkConnection();

            // Auto-sync when coming back online
            if (wasOffline && nowOnline) {
                console.log('📶 Back online! Syncing...');
                syncNow();
            }

            // Update pending count
            updatePendingCount();
        }, 10000);

        return () => clearInterval(interval);
    }, [isConnected, checkConnection]);

    const updatePendingCount = async () => {
        const queue = await getOfflineQueue();
        setPendingCount(queue.length);
    };

    const syncNow = async () => {
        if (isSyncing) return;

        const online = await checkConnection();
        if (!online) return;

        setIsSyncing(true);
        console.log('🔄 Starting sync...');

        try {
            const queue = await getOfflineQueue();

            if (queue.length === 0) {
                console.log('✅ Nothing to sync');
                setIsSyncing(false);
                return;
            }

            console.log(`📤 Syncing ${queue.length} pending actions...`);

            for (const action of queue) {
                try {
                    await processOfflineAction(action);
                    await removeFromQueue(action.id);
                    console.log(`✅ Synced: ${action.type}`);
                } catch (error) {
                    console.error(`❌ Failed to sync ${action.type}:`, error);
                }
            }

            await setLastSyncTime();
            await updatePendingCount();
            console.log('✅ Sync complete!');
        } catch (error) {
            console.error('Sync failed:', error);
        }

        setIsSyncing(false);
    };

    const processOfflineAction = async (action: OfflineAction) => {
        switch (action.type) {
            case 'workout_log':
                await supabase.from('workout_logs').insert(action.payload);
                break;

            case 'set_log':
                await supabase.from('set_logs').insert(action.payload);
                break;

            case 'profile_update':
                await supabase.from('profiles').update(action.payload.data).eq('id', action.payload.userId);
                break;

            default:
                console.warn('Unknown action type:', action.type);
        }
    };

    return (
        <NetworkContext.Provider
            value={{
                isConnected,
                isSyncing,
                pendingCount,
                syncNow,
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
};
