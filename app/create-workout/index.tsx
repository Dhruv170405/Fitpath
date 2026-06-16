import { useRouter } from 'expo-router';
import { ChevronLeft, GripVertical, Minus, Plus, Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../lib/theme';
import { Exercise, createCustomWorkout, getExercises } from '../../lib/workoutService';

interface SelectedExercise {
    exercise: Exercise;
    sets: number;
    targetReps: string;
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'];

export default function CreateWorkout() {
    const router = useRouter();
    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All');

    useEffect(() => {
        loadExercises();
    }, []);

    async function loadExercises() {
        setLoading(true);
        const data = await getExercises();
        setExercises(data);
        setLoading(false);
    }

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = selectedGroup === 'All' ||
            ex.muscle_group.toLowerCase() === selectedGroup.toLowerCase();
        const notAlreadySelected = !selectedExercises.some(s => s.exercise.id === ex.id);
        return matchesSearch && matchesGroup && notAlreadySelected;
    });

    const addExercise = (exercise: Exercise) => {
        setSelectedExercises([...selectedExercises, {
            exercise,
            sets: 3,
            targetReps: '8-12',
        }]);
        setShowExercisePicker(false);
        setSearchQuery('');
    };

    const removeExercise = (exerciseId: string) => {
        setSelectedExercises(selectedExercises.filter(s => s.exercise.id !== exerciseId));
    };

    const updateSets = (exerciseId: string, delta: number) => {
        setSelectedExercises(selectedExercises.map(s => {
            if (s.exercise.id === exerciseId) {
                const newSets = Math.max(1, Math.min(10, s.sets + delta));
                return { ...s, sets: newSets };
            }
            return s;
        }));
    };

    const updateReps = (exerciseId: string, reps: string) => {
        setSelectedExercises(selectedExercises.map(s => {
            if (s.exercise.id === exerciseId) {
                return { ...s, targetReps: reps };
            }
            return s;
        }));
    };

    async function saveWorkout() {
        if (!workoutName.trim()) {
            Alert.alert('Missing Name', 'Please give your workout a name');
            return;
        }
        if (selectedExercises.length === 0) {
            Alert.alert('No Exercises', 'Add at least one exercise to your workout');
            return;
        }

        setSaving(true);
        const { success, error } = await createCustomWorkout(
            workoutName.trim(),
            selectedExercises.map((s, index) => ({
                exerciseId: s.exercise.id,
                sets: s.sets,
                targetReps: s.targetReps,
                orderIndex: index + 1,
            }))
        );

        if (success) {
            Alert.alert('Success!', 'Your custom workout has been saved', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', `Failed to save workout: ${error || 'Unknown error'}`);
        }
        setSaving(false);
    }

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
            <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Create Workout</Text>
                <TouchableOpacity
                    onPress={saveWorkout}
                    disabled={saving}
                    className="bg-primary px-4 py-2 rounded-lg"
                >
                    <Text className="text-white font-bold">{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                    {/* Workout Name */}
                    <View className="mb-6">
                        <Text className="text-muted text-sm font-medium mb-2">Workout Name</Text>
                        <TextInput
                            placeholder="e.g., Morning Upper Body"
                            placeholderTextColor={COLORS.muted}
                            value={workoutName}
                            onChangeText={setWorkoutName}
                            className="bg-card text-white p-4 rounded-xl border border-border text-lg"
                        />
                    </View>

                    {/* Selected Exercises */}
                    <View className="mb-4">
                        <Text className="text-white font-bold text-lg mb-3">
                            Exercises ({selectedExercises.length})
                        </Text>

                        {selectedExercises.map((item, index) => (
                            <Animated.View
                                key={item.exercise.id}
                                entering={FadeInRight.duration(300)}
                                className="bg-card rounded-xl p-4 mb-3 border border-border"
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-6 mr-2">
                                            <GripVertical size={16} color={COLORS.muted} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-bold">{item.exercise.name}</Text>
                                            <Text
                                                className="text-xs capitalize"
                                                style={{ color: getMuscleGroupColor(item.exercise.muscle_group) }}
                                            >
                                                {item.exercise.muscle_group}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => removeExercise(item.exercise.id)}
                                            className="p-2"
                                        >
                                            <X size={20} color={COLORS.muted} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Sets and Reps */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Text className="text-muted mr-3">Sets:</Text>
                                        <TouchableOpacity
                                            onPress={() => updateSets(item.exercise.id, -1)}
                                            className="bg-background p-2 rounded-lg"
                                        >
                                            <Minus size={16} color="white" />
                                        </TouchableOpacity>
                                        <Text className="text-white font-bold text-lg mx-4">{item.sets}</Text>
                                        <TouchableOpacity
                                            onPress={() => updateSets(item.exercise.id, 1)}
                                            className="bg-background p-2 rounded-lg"
                                        >
                                            <Plus size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center">
                                        <Text className="text-muted mr-2">Reps:</Text>
                                        <TextInput
                                            value={item.targetReps}
                                            onChangeText={(text) => updateReps(item.exercise.id, text)}
                                            className="bg-background text-white px-3 py-2 rounded-lg w-20 text-center"
                                            placeholder="8-12"
                                            placeholderTextColor={COLORS.muted}
                                        />
                                    </View>
                                </View>
                            </Animated.View>
                        ))}

                        {/* Add Exercise Button */}
                        <TouchableOpacity
                            onPress={() => setShowExercisePicker(true)}
                            className="border-2 border-dashed border-border rounded-xl p-4 items-center flex-row justify-center"
                        >
                            <Plus size={20} color={COLORS.primary} />
                            <Text className="text-primary font-bold ml-2">Add Exercise</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Exercise Picker Modal */}
            {showExercisePicker && (
                <View className="absolute inset-0 bg-background">
                    <SafeAreaView className="flex-1">
                        {/* Picker Header */}
                        <View className="flex-row items-center p-4 border-b border-border">
                            <TouchableOpacity onPress={() => setShowExercisePicker(false)} className="mr-4">
                                <X color="white" size={24} />
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-lg">Add Exercise</Text>
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
                                    autoFocus
                                />
                            </View>
                        </View>

                        {/* Muscle Group Filters */}
                        <View className="mb-2">
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
                            >
                                {MUSCLE_GROUPS.map((group) => (
                                    <TouchableOpacity
                                        key={group}
                                        onPress={() => setSelectedGroup(group)}
                                        className={`px-4 py-2 flex-row items-center justify-center rounded-full mr-2 border ${selectedGroup === group ? 'bg-primary border-transparent' : 'bg-card border-border'
                                            }`}
                                    >
                                        <Text className={selectedGroup === group ? 'text-white font-bold' : 'text-muted'}>
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
                                        className="bg-card rounded-xl p-4 mb-2 border border-border flex-row items-center"
                                        onPress={() => addExercise(exercise)}
                                    >
                                        <View className="flex-1">
                                            <Text className="text-white font-bold">{exercise.name}</Text>
                                            <Text
                                                className="text-xs capitalize"
                                                style={{ color: getMuscleGroupColor(exercise.muscle_group) }}
                                            >
                                                {exercise.muscle_group}
                                            </Text>
                                        </View>
                                        <Plus size={20} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        />
                    </SafeAreaView>
                </View>
            )}
        </SafeAreaView>
    );
}
