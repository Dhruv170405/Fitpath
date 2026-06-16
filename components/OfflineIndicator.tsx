import { Check, CloudOff, RefreshCw, WifiOff } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../lib/NetworkContext';

export const OfflineIndicator = () => {
    const { isConnected, isSyncing, pendingCount, syncNow } = useNetwork();
    const insets = useSafeAreaInsets();

    // Don't show anything if online and no pending items
    if (isConnected && pendingCount === 0 && !isSyncing) {
        return null;
    }

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutDown.duration(300)}
            style={{
                position: 'absolute',
                bottom: insets.bottom + 20,
                left: 20,
                right: 20,
                zIndex: 50
            }}
        >
            <View
                className={`flex-row items-center justify-between px-4 py-3 rounded-xl shadow-lg ${isConnected ? 'bg-green-600' : 'bg-orange-500'
                    }`}
            >
                <View className="flex-row items-center flex-1">
                    {!isConnected ? (
                        <>
                            <WifiOff size={20} color="white" />
                            <Text className="text-white font-medium ml-3">Offline Mode</Text>
                        </>
                    ) : pendingCount > 0 ? (
                        <>
                            <CloudOff size={20} color="white" />
                            <Text className="text-white font-medium ml-3">
                                {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Check size={20} color="white" />
                            <Text className="text-white font-medium ml-3">Synced!</Text>
                        </>
                    )}
                </View>

                {isConnected && pendingCount > 0 && (
                    <TouchableOpacity
                        onPress={syncNow}
                        disabled={isSyncing}
                        className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-lg ml-2"
                    >
                        {isSyncing ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <RefreshCw size={14} color="white" />
                                <Text className="text-white font-bold ml-2 text-xs">Sync Now</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};
