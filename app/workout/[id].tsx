import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info, Video } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseGuideModal, WorkoutInfoModal } from '../../components/ExerciseGuide';
import { RestTimer } from '../../components/RestTimer';
import { SetRow } from '../../components/SetRow';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/theme';
import { completeWorkout, Exercise, getExercisePersonalBest, getWorkoutWithExercises, logSet, startWorkoutLog, WorkoutTemplate } from '../../lib/workoutService';

export default function ActiveWorkout() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // State for tracking sets
    const [logs, setLogs] = useState<any>({});
    const [showTimer, setShowTimer] = useState(false);
    const [timerDuration] = useState(90);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [showExerciseGuide, setShowExerciseGuide] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showWorkoutInfo, setShowWorkoutInfo] = useState(false);
    
    // Progressive Overload State
    const [previousBests, setPreviousBests] = useState<Record<string, {weight: number, reps: number}>>({});

    useEffect(() => {
        loadWorkout();
    }, [id]);

    async function loadWorkout() {
        setLoading(true);
        const data = await getWorkoutWithExercises(id as string);

        if (data) {
            setWorkout(data);

            // Initialize logs for each exercise
            const initialLogs: any = {};
            data.exercises?.forEach(ex => {
                initialLogs[ex.id] = Array(ex.sets).fill(null).map(() => ({
                    weight: '',
                    reps: '',
                    completed: false
                }));
            });
            setLogs(initialLogs);

            // Fetch previous performance for all exercises
            const bests: Record<string, {weight: number, reps: number}> = {};
            if (data.exercises) {
                await Promise.all(data.exercises.map(async (ex) => {
                    const pb = await getExercisePersonalBest(ex.exercise_id);
                    if (pb) {
                        bests[ex.id] = pb;
                    }
                }));
            }
            setPreviousBests(bests);

            // Start workout log
            const logId = await startWorkoutLog(data.id, data.name);
            if (logId) {
                setWorkoutLogId(logId);
                setStartTime(new Date());
            }
        }

        setLoading(false);
    }

    const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setLogs((prev: any) => {
            const newExLogs = [...prev[exerciseId]];
            newExLogs[setIndex] = { ...newExLogs[setIndex], [field]: value };
            return { ...prev, [exerciseId]: newExLogs };
        });
    };

    const toggleSetComplete = async (exerciseId: string, setIndex: number, exerciseDbId: string) => {
        const currentSet = logs[exerciseId][setIndex];
        const isCompleting = !currentSet.completed;

        setLogs((prev: any) => {
            const newExLogs = [...prev[exerciseId]];
            newExLogs[setIndex] = { ...newExLogs[setIndex], completed: isCompleting };
            return { ...prev, [exerciseId]: newExLogs };
        });

        // Show timer if completing a set
        if (isCompleting) {
            setShowTimer(true);

            // Log to database
            if (workoutLogId) {
                await logSet(
                    workoutLogId,
                    exerciseDbId,
                    setIndex + 1,
                    parseFloat(currentSet.weight) || 0,
                    parseInt(currentSet.reps) || 0
                );
            }
        }
    };

    const openExerciseGuide = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setShowExerciseGuide(true);
    };

    const finishWorkout = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (workoutLogId && startTime) {
                const durationMinutes = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
                await completeWorkout(workoutLogId, durationMinutes);
            }

            Alert.alert(
                "Workout Completed!",
                "Workout saved. Nice work today 💪",
                [{ text: "Go Home", onPress: () => router.navigate('/(tabs)') }]
            );
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save workout. Please try again.");
            setIsSaving(false);
        }
    };

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
                <Text className="text-white text-xl font-bold mb-2">Workout not found</Text>
                <Text className="text-muted text-center mb-6">This workout template doesn't exist or hasn't been set up yet.</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">{workout.name}</Text>
                <TouchableOpacity onPress={() => setShowWorkoutInfo(true)} className="p-2">
                    <Info color={COLORS.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {(!workout.exercises || workout.exercises.length === 0) ? (
                    <View className="bg-card p-8 rounded-xl items-center">
                        <Text className="text-white text-lg font-bold mb-2">No exercises found</Text>
                        <Text className="text-muted text-center">This workout template doesn't have any exercises linked yet.</Text>
                    </View>
                ) : (
                    workout.exercises.map((ex, exIndex) => (
                        <Animated.View
                            key={ex.id}
                            entering={FadeInDown.delay(exIndex * 100).duration(500)}
                            className="mb-8"
                        >
                            <View className="flex-row items-baseline justify-between mb-4">
                                <Text className="text-white text-xl font-bold flex-1 mr-2">{ex.exercise?.name || 'Exercise'}</Text>
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    onPress={() => ex.exercise && openExerciseGuide(ex.exercise)}
                                >
                                    <Video size={16} color={COLORS.secondary} />
                                    <Text className="text-secondary text-xs ml-1 font-bold">Watch Guide</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-muted text-xs">Target: {ex.target_reps} reps</Text>
                                {previousBests[ex.id] && (
                                    <View className="bg-secondary/20 px-2 py-0.5 rounded-full flex-row items-center">
                                        <Text className="text-secondary font-bold text-xs">
                                            ⚡ PB: {previousBests[ex.id].weight}kg x {previousBests[ex.id].reps}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="bg-card rounded-xl p-3">
                                <View className="flex-row mb-2 px-2">
                                    <Text className="text-muted w-8 text-xs font-bold text-center">SET</Text>
                                    <Text className="text-muted flex-1 text-center text-xs font-bold">KG</Text>
                                    <Text className="text-muted flex-1 text-center text-xs font-bold">REPS</Text>
                                    <View className="w-8" />
                                </View>

                                {logs[ex.id]?.map((set: any, setIndex: number) => (
                                    <SetRow
                                        key={setIndex}
                                        setNumber={setIndex + 1}
                                        weight={set.weight}
                                        reps={set.reps}
                                        isCompleted={set.completed}
                                        onUpdate={(field, val) => updateSet(ex.id, setIndex, field, val)}
                                        onToggleComplete={() => toggleSetComplete(ex.id, setIndex, ex.exercise_id)}
                                    />
                                ))}
                            </View>
                        </Animated.View>
                    ))
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Footer Actions */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-border">
                <Button
                    title={isSaving ? "Saving..." : "Finish Workout"}
                    onPress={finishWorkout}
                    size="lg"
                    loading={isSaving}
                    disabled={isSaving}
                />
            </View>

            {/* Rest Timer Modal/Overlay */}
            {showTimer && (
                <RestTimer
                    isOpen={showTimer}
                    onClose={() => setShowTimer(false)}
                    initialSeconds={timerDuration}
                />
            )}

            {/* Exercise Guide Modal */}
            <ExerciseGuideModal
                visible={showExerciseGuide}
                exercise={selectedExercise}
                onClose={() => setShowExerciseGuide(false)}
            />

            {/* Workout Info Modal */}
            <WorkoutInfoModal
                visible={showWorkoutInfo}
                workout={workout}
                onClose={() => setShowWorkoutInfo(false)}
            />
        </SafeAreaView>
    );
}
