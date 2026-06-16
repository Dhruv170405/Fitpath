
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Bell, ChevronRight, LogOut, Settings, Shield, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Platform, RefreshControl, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../lib/AuthContext';
import { cancelAllNotifications, getRemainingReminderCount, registerForPushNotificationsAsync, scheduleDailyReminder } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

interface UserProfile {
    full_name: string;
    age: number;
    height: number;
    current_weight: number;
    goal: string;
    avatar_url?: string;
    role: string;
}

export default function ProfileScreen() {
    const [notifications, setNotifications] = useState(false);
    // Default to 8:00 AM so first-time users don't get an immediate notification
    const [reminderTime, setReminderTime] = useState(() => {
        const d = new Date();
        d.setHours(8, 0, 0, 0);
        return d;
    });
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const { signOut } = useAuth();

    // Reload profile and top-up reminders when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadProfile();
            loadSettings();
            topUpRemindersIfNeeded();
        }, [])
    );

    async function topUpRemindersIfNeeded() {
        try {
            const enabled = await AsyncStorage.getItem('reminder_enabled');
            if (enabled !== 'true') return;

            const remaining = await getRemainingReminderCount();
            // Re-batch if fewer than 7 days of reminders remain (< 1 week)
            if (remaining < 7) {
                const savedTime = await AsyncStorage.getItem('reminder_time');
                const t = savedTime ? new Date(savedTime) : (() => { const d = new Date(); d.setHours(8, 0, 0, 0); return d; })();
                await scheduleDailyReminder(t.getHours(), t.getMinutes());
                console.log('🔄 Auto top-up: rescheduled workout reminders');
            }
        } catch (e) {
            // Non-critical — fail silently
        }
    }

    async function loadSettings() {
        try {
            const enabled = await AsyncStorage.getItem('reminder_enabled');
            const time = await AsyncStorage.getItem('reminder_time');

            if (enabled === 'true') {
                setNotifications(true);
            }
            if (time) {
                setReminderTime(new Date(time));
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }

    async function loadProfile() {
        if (!profile) setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, age, height, current_weight, goal, avatar_url, role')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
            }
        }
        setLoading(false);
    }

    async function handleSignOut() {
        await signOut();
        // Router replacement is handled by AuthContext listener in _layout
    }

    const getGoalEmoji = (goal: string) => {
        switch (goal) {
            case 'lose_weight': return '🔥';
            case 'build_muscle': return '💪';
            case 'get_stronger': return '🏋️';
            case 'improve_endurance': return '🏃';
            case 'maintain': return '⚖️';
            default: return '🎯';
        }
    };

    const getGoalLabel = (goal: string) => {
        switch (goal) {
            case 'lose_weight': return 'Lose Weight';
            case 'build_muscle': return 'Build Muscle';
            case 'get_stronger': return 'Get Stronger';
            case 'improve_endurance': return 'Improve Endurance';
            case 'maintain': return 'Maintain';
            default: return 'Set a goal';
        }
    };

    const SettingRow = ({ icon: Icon, label, value, onPress, isSwitch, onValueChange }: any) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={isSwitch}
            className="flex-row items-center justify-between p-4 bg-card rounded-xl mb-3"
        >
            <View className="flex-row items-center">
                <View className="w-8">
                    <Icon size={20} color={COLORS.muted} />
                </View>
                <Text className="text-white font-medium">{label}</Text>
            </View>

            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: COLORS.card, true: COLORS.primary }}
                    thumbColor={'white'}
                />
            ) : (
                <ChevronRight size={20} color={COLORS.muted} />
            )}
        </TouchableOpacity>
    );

    const getInitials = (name: string) => {
        if (!name) return 'FP';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 p-5">
                    {/* View Header Skeleton */}
                    <View className="items-center mb-8 mt-4">
                        <Skeleton width={96} height={96} borderRadius={48} style={{ marginBottom: 16 }} />
                        <Skeleton width={150} height={32} style={{ marginBottom: 8 }} />
                        <Skeleton width={100} height={20} />
                    </View>

                    {/* Stats Row Skeleton */}
                    <View className="flex-row bg-card rounded-xl p-4 justify-between mb-8">
                        <View className="flex-1 items-center">
                            <Skeleton width={80} height={24} style={{ marginBottom: 4 }} />
                            <Skeleton width={40} height={12} />
                        </View>
                        <View className="w-[1px] bg-border mx-2" />
                        <View className="flex-1 items-center">
                            <Skeleton width={80} height={24} style={{ marginBottom: 4 }} />
                            <Skeleton width={40} height={12} />
                        </View>
                        <View className="w-[1px] bg-border mx-2" />
                        <View className="flex-1 items-center">
                            <Skeleton width={80} height={24} style={{ marginBottom: 4 }} />
                            <Skeleton width={40} height={12} />
                        </View>
                    </View>

                    {/* Account Settings Skeleton */}
                    <Skeleton width={80} height={20} style={{ marginBottom: 12 }} />
                    <View className="mb-6">
                        <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
                        <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
                    </View>

                    {/* App Settings Skeleton */}
                    <Skeleton width={50} height={20} style={{ marginBottom: 12 }} />
                    <View>
                        <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
                        <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadProfile} tintColor={COLORS.primary} />
                }
            >

                {/* Profile Header */}
                <View className="items-center mb-8 mt-4">
                    <View className="h-24 w-24 bg-card rounded-full items-center justify-center border-2 border-primary mb-4 overflow-hidden">
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Text className="text-white text-3xl font-bold">{getInitials(profile?.full_name || '')}</Text>
                        )}
                    </View>
                    <Text className="text-white text-2xl font-bold">{profile?.full_name || 'Fitpath User'}</Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-muted">{getGoalEmoji(profile?.goal || '')} {getGoalLabel(profile?.goal || '')}</Text>
                    </View>
                </View>

                {/* Stats Summary */}
                <View className="flex-row bg-card rounded-xl p-4 justify-between mb-8">
                    <View className="items-center flex-1">
                        <Text className="text-white font-bold text-lg">{profile?.current_weight ? `${profile.current_weight} kg` : '-'}</Text>
                        <Text className="text-muted text-xs">Weight</Text>
                    </View>
                    <View className="w-[1px] bg-border" />
                    <View className="items-center flex-1">
                        <Text className="text-white font-bold text-lg">{profile?.height ? `${profile.height} cm` : '-'}</Text>
                        <Text className="text-muted text-xs">Height</Text>
                    </View>
                    <View className="w-[1px] bg-border" />
                    <View className="items-center flex-1">
                        <Text className="text-white font-bold text-lg">{profile?.age || '-'}</Text>
                        <Text className="text-muted text-xs">Age</Text>
                    </View>
                </View>

                {/* Settings Group */}
                <Text className="text-muted font-bold mb-2 ml-1">Account</Text>
                <View className="mb-6">
                    <SettingRow
                        icon={User}
                        label="Edit Profile"
                        onPress={() => router.push('/settings/edit-profile')}
                    />
                    <SettingRow
                        icon={Bell}
                        label="Daily Reminders"
                        isSwitch
                        value={notifications}
                        onValueChange={async (value: boolean) => {
                            if (value) {
                                const hasPermission = await registerForPushNotificationsAsync();
                                if (!hasPermission) {
                                    Alert.alert(
                                        'Permission Required',
                                        'Please enable notifications in your system settings to use daily reminders.',
                                        [{ text: 'OK' }]
                                    );
                                    setNotifications(false);
                                    await AsyncStorage.setItem('reminder_enabled', 'false');
                                    return;
                                }

                                if (Platform.OS === 'android') {
                                    // On Android: show the picker first, scheduling happens in onChange
                                    setShowTimePicker(true);
                                } else {
                                    // On iOS: the inline picker is always visible once notifications is true;
                                    // schedule with current time right away (user adjusts inline)
                                    await scheduleDailyReminder(reminderTime.getHours(), reminderTime.getMinutes());
                                    await AsyncStorage.setItem('reminder_time', reminderTime.toISOString());
                                }
                            } else {
                                setShowTimePicker(false);
                                await cancelAllNotifications();
                            }
                            setNotifications(value);
                            await AsyncStorage.setItem('reminder_enabled', String(value));
                        }}
                    />

                    {notifications && (
                        <View className="px-4 py-4 bg-card rounded-xl mb-3">
                            <View className="flex-row justify-between items-center bg-background/50 p-3 rounded-lg">
                                <Text className="text-muted">Reminder Time</Text>
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={reminderTime}
                                        mode="time"
                                        display="default"
                                        onChange={async (event, selectedDate) => {
                                            const currentDate = selectedDate || reminderTime;
                                            setReminderTime(currentDate);
                                            await AsyncStorage.setItem('reminder_time', currentDate.toISOString());
                                            await scheduleDailyReminder(currentDate.getHours(), currentDate.getMinutes());
                                        }}
                                        themeVariant="dark"
                                    />
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => setShowTimePicker(true)}
                                        className="bg-primary/20 px-3 py-1 rounded-md"
                                    >
                                        <Text className="text-primary font-bold">
                                            {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {Platform.OS === 'android' && showTimePicker && (
                                <DateTimePicker
                                    value={reminderTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                onChange={async (event, selectedDate) => {
                                        setShowTimePicker(false);
                                        // Use selectedDate if user confirmed, otherwise fall back to
                                        // the current reminderTime (saved or 8 AM default)
                                        const chosenDate = selectedDate ?? reminderTime;
                                        setReminderTime(chosenDate);
                                        await AsyncStorage.setItem('reminder_time', chosenDate.toISOString());
                                        await scheduleDailyReminder(chosenDate.getHours(), chosenDate.getMinutes());
                                    }}
                                />
                            )}
                        </View>
                    )}

                </View>

                <Text className="text-muted font-bold mb-2 ml-1">App</Text>
                <View className="mb-8">
                    {profile?.role === 'admin' && (
                        <SettingRow
                            icon={Shield}
                            label="Admin Dashboard"
                            onPress={() => router.push('/admin' as any)}
                        />
                    )}
                    <SettingRow
                        icon={Settings}
                        label="General Settings"
                        onPress={() => router.push('/settings/general')}
                    />
                    <SettingRow
                        icon={Shield}
                        label="Privacy Policy"
                        onPress={() => router.push('/privacy-policy')}
                    />
                    <SettingRow icon={LogOut} label="Sign Out" onPress={handleSignOut} />
                </View>


            </ScrollView>
        </SafeAreaView>
    );
}
