import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Clock, Dumbbell } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../lib/theme';
import { getWorkoutDetails } from '../../lib/workoutService';

export default function HistoryDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadDetails();
        }
    }, [id]);

    async function loadDetails() {
        setLoading(true);
        const data = await getWorkoutDetails(id as string);
        setWorkout(data);
        setLoading(false);
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
                <Text className="text-white text-lg text-center mb-4">Workout not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg flex-1" numberOfLines={1}>
                    {workout.workout_name}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Summary Card */}
                <Animated.View entering={FadeInDown.duration(500)} className="bg-card p-6 rounded-2xl mb-6 border border-border">
                    <View className="flex-row justify-between mb-4">
                        <View>
                            <Text className="text-muted text-sm mb-1">Date</Text>
                            <View className="flex-row items-center">
                                <Calendar size={16} color={COLORS.primary} />
                                <Text className="text-white font-bold ml-2">
                                    {new Date(workout.started_at).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'long', day: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-muted text-sm mb-1 text-right">Duration</Text>
                            <View className="flex-row items-center justify-end">
                                <Clock size={16} color={COLORS.primary} />
                                <Text className="text-white font-bold ml-2">
                                    {workout.duration_minutes || '--'} min
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Exercises List */}
                <Text className="text-white font-bold text-xl mb-4">Exercises Performed</Text>

                {workout.exercises?.map((item: any, index: number) => (
                    <Animated.View
                        key={item.exercise?.id || index}
                        entering={FadeInDown.delay(index * 100).duration(500)}
                        className="bg-card rounded-xl overflow-hidden mb-4 border border-border"
                    >
                        {/* Exercise Header */}
                        <View className="p-4 bg-card-light border-b border-border flex-row items-center">
                            <View className="bg-primary/20 p-2 rounded-lg mr-3">
                                <Dumbbell size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">
                                    {item.exercise?.name || 'Unknown Exercise'}
                                </Text>
                                <Text className="text-muted text-xs capitalize">
                                    {item.exercise?.muscle_group || 'General'}
                                </Text>
                            </View>
                        </View>

                        {/* Sets Table */}
                        <View className="p-4">
                            <View className="flex-row border-b border-border/50 pb-2 mb-2">
                                <Text className="text-muted text-xs w-10 text-center">SET</Text>
                                <Text className="text-muted text-xs flex-1 text-center">WEIGHT (kg)</Text>
                                <Text className="text-muted text-xs flex-1 text-center">REPS</Text>
                            </View>
                            {item.sets.map((set: any, i: number) => (
                                <View key={i} className="flex-row py-2">
                                    <View className="w-10 items-center justify-center bg-background/50 rounded mr-2">
                                        <Text className="text-white font-bold text-xs">{set.set_number}</Text>
                                    </View>
                                    <Text className="text-white flex-1 text-center font-medium">
                                        {set.weight > 0 ? set.weight : '-'}
                                    </Text>
                                    <Text className="text-white flex-1 text-center font-medium">
                                        {set.reps}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                ))}

                {(!workout.exercises || workout.exercises.length === 0) && (
                    <Text className="text-muted text-center italic mt-4">
                        No sets recorded for this workout.
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
