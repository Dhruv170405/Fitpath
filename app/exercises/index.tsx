import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseGuideModal } from '../../components/ExerciseGuide';
import { COLORS } from '../../lib/theme';
import { Exercise, getExercises } from '../../lib/workoutService';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'];

export default function ExerciseLibrary() {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadExercises();
    }, []);

    async function loadExercises() {
        if (exercises.length === 0) setLoading(true);
        const data = await getExercises();
        setExercises(data);
        setLoading(false);
    }

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = selectedGroup === 'All' ||
            ex.muscle_group.toLowerCase() === selectedGroup.toLowerCase();
        return matchesSearch && matchesGroup;
    });

    const getMuscleGroupColor = (group: string) => {
        const colors: Record<string, string> = {
            chest: '#EF4444',
            back: '#3B82F6',
            legs: '#22C55E',
            shoulders: '#F59E0B',
            biceps: '#8B5CF6',
            triceps: '#EC4899',
            core: '#06B6D4',
            cardio: '#F97316',
        };
        return colors[group.toLowerCase()] || COLORS.primary;
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-xl flex-1">Exercise Library</Text>
                <Text className="text-muted">{filteredExercises.length} exercises</Text>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
                <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-border">
                    <Search color={COLORS.muted} size={20} />
                    <TextInput
                        placeholder="Search exercises..."
                        placeholderTextColor={COLORS.muted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 text-white ml-3"
                    />
                </View>
            </View>

            {/* Muscle Group Filters */}
            <View className="mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {MUSCLE_GROUPS.map((group) => (
                        <TouchableOpacity
                            key={group}
                            onPress={() => setSelectedGroup(group)}
                            className={`px-5 py-2.5 flex-row items-center justify-center rounded-full mr-3 border ${selectedGroup === group
                                ? 'bg-primary border-transparent'
                                : 'bg-card border-border'
                                }`}
                        >
                            <Text
                                className={`${selectedGroup === group ? 'text-white font-bold' : 'text-muted'
                                    }`}
                            >
                                {group}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: exercise }) => (
                    <Animated.View
                        entering={FadeInDown.duration(200)}
                    >
                        <TouchableOpacity
                            className="bg-card rounded-xl p-4 mb-3 border border-border"
                            onPress={() => {
                                setSelectedExercise(exercise);
                                setModalVisible(true);
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: getMuscleGroupColor(exercise.muscle_group) + '30' }}
                                    >
                                        <Dumbbell size={20} color={getMuscleGroupColor(exercise.muscle_group)} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold">{exercise.name}</Text>
                                        <Text
                                            className="text-xs font-medium capitalize"
                                            style={{ color: getMuscleGroupColor(exercise.muscle_group) }}
                                        >
                                            {exercise.muscle_group}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {exercise.description && (
                                <Text className="text-muted text-sm" numberOfLines={2}>
                                    {exercise.description}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-10">
                        <Dumbbell size={48} color={COLORS.muted} />
                        <Text className="text-muted mt-4">No exercises found</Text>
                    </View>
                }
            />

            <ExerciseGuideModal
                visible={modalVisible}
                exercise={selectedExercise}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedExercise(null);
                }}
            />
        </SafeAreaView>
    );
}
