import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { WorkoutCard } from '../../components/WorkoutCard';
import { COLORS } from '../../lib/theme';
import { deleteCustomWorkout, getUserCustomWorkouts, getWorkoutTemplates, WorkoutTemplate } from '../../lib/workoutService';

export default function WorkoutScreen() {
    const router = useRouter();
    const [defaultTemplates, setDefaultTemplates] = useState<WorkoutTemplate[]>([]);
    const [myWorkouts, setMyWorkouts] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Reload when screen comes into focus (after creating a workout)
    useFocusEffect(
        useCallback(() => {
            loadTemplates();
        }, [])
    );

    async function loadTemplates() {
        setLoading(true);

        // Fetch all templates
        const allTemplates = await getWorkoutTemplates();
        const defaultOnes = allTemplates.filter(t => t.is_default);
        setDefaultTemplates(defaultOnes);

        // Fetch user's custom workouts
        const custom = await getUserCustomWorkouts();
        setMyWorkouts(custom);

        setLoading(false);
    }

    const handleDeleteWorkout = (workout: WorkoutTemplate) => {
        Alert.alert(
            'Delete Workout',
            `Are you sure you want to delete "${workout.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteCustomWorkout(workout.id);
                        if (success) {
                            setMyWorkouts(prev => prev.filter(w => w.id !== workout.id));
                        }
                    }
                }
            ]
        );
    };

    const filterWorkouts = (workouts: WorkoutTemplate[]) => {
        if (!searchQuery.trim()) return workouts;
        return workouts.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="p-5">
                    {/* Header Skeleton */}
                    <View className="mb-6">
                        <Skeleton width={150} height={32} style={{ marginBottom: 8 }} />
                        <Skeleton width={250} height={20} />
                    </View>

                    {/* Search Bar Skeleton */}
                    <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 24 }} />

                    {/* Action Buttons Skeleton */}
                    <View className="flex-row mb-6">
                        <Skeleton width="48%" height={56} borderRadius={12} style={{ marginRight: '4%' }} />
                        <Skeleton width="48%" height={56} borderRadius={12} />
                    </View>

                    {/* My Workouts Section Title */}
                    <Skeleton width={120} height={24} style={{ marginBottom: 12 }} />

                    {/* Workout Card Skeletons */}
                    {[1, 2, 3].map(i => (
                        <View key={i} className="bg-card/50 p-4 rounded-xl mb-4 border border-border">
                            <Skeleton width="70%" height={24} style={{ marginBottom: 8 }} />
                            <Skeleton width="90%" height={16} style={{ marginBottom: 16 }} />
                            <View className="flex-row">
                                <Skeleton width={60} height={16} style={{ marginRight: 16 }} />
                                <Skeleton width={60} height={16} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    const filteredDefaults = filterWorkouts(defaultTemplates);
    const filteredMyWorkouts = filterWorkouts(myWorkouts);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadTemplates} tintColor={COLORS.primary} />
                }
            >

                <Animated.View entering={FadeInDown.duration(600)} className="mb-6">
                    <Text className="text-white text-3xl font-bold mb-2">Workouts</Text>
                    <Text className="text-muted text-lg">Find or create your perfect workout.</Text>
                </Animated.View>

                {/* Search Bar */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} className="flex-row items-center space-x-3 mb-6">
                    <View className="flex-1 bg-card flex-row items-center px-4 rounded-xl border border-border h-12">
                        <Search size={20} color={COLORS.muted} />
                        <TextInput
                            placeholder="Search workouts..."
                            placeholderTextColor={COLORS.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 ml-3 text-white h-full"
                        />
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} className="flex-row mb-6">
                    <TouchableOpacity
                        onPress={() => router.push('/create-workout')}
                        className="flex-1 bg-primary rounded-xl p-4 flex-row items-center justify-center mr-2"
                    >
                        <Plus size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Create Workout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/exercises')}
                        className="flex-1 bg-card rounded-xl p-4 flex-row items-center justify-center border border-border"
                    >
                        <BookOpen size={20} color={COLORS.muted} />
                        <Text className="text-muted font-bold ml-2">Exercise Library</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* My Workouts Section */}
                {myWorkouts.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mb-6">
                        <Text className="text-white font-bold text-lg mb-3">My Workouts</Text>
                        {filteredMyWorkouts.map((workout) => (
                            <View key={workout.id} className="relative">
                                <WorkoutCard
                                    workout={{
                                        id: workout.id,
                                        name: workout.name,
                                        description: workout.description,
                                        difficulty: 'custom' as any,
                                        duration_minutes: workout.duration_minutes,
                                    }}
                                    onPress={() => router.push(`/workout/${workout.id}`)}
                                />
                                <TouchableOpacity
                                    onPress={() => handleDeleteWorkout(workout)}
                                    className="absolute top-4 right-4 bg-red-500/20 p-2 rounded-lg"
                                >
                                    <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Default Templates */}
                <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                    <Text className="text-white font-bold text-lg mb-3">
                        {myWorkouts.length > 0 ? 'Suggested Workouts' : 'All Workouts'}
                    </Text>

                    {filteredDefaults.length === 0 && filteredMyWorkouts.length === 0 ? (
                        <View className="bg-card p-8 rounded-xl items-center">
                            <Text className="text-white text-lg font-bold mb-2">No workouts found</Text>
                            <Text className="text-muted text-center">
                                {defaultTemplates.length === 0
                                    ? "Run the SQL schema in Supabase to add default workout templates."
                                    : "Try a different search term."
                                }
                            </Text>
                        </View>
                    ) : (
                        filteredDefaults.map((workout) => (
                            <WorkoutCard
                                key={workout.id}
                                workout={{
                                    id: workout.id,
                                    name: workout.name,
                                    description: workout.description,
                                    difficulty: workout.difficulty as any,
                                    duration_minutes: workout.duration_minutes,
                                }}
                                onPress={() => router.push(`/workout/${workout.id}`)}
                            />
                        ))
                    )}
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}
