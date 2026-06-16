import { router } from 'expo-router';
import { Activity, ChevronLeft, Dumbbell, Target, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

const { width } = Dimensions.get('window');

type Goal = 'lose_weight' | 'build_muscle' | 'get_stronger' | 'improve_endurance' | 'maintain' | '';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
type Experience = 'beginner' | 'intermediate' | 'advanced' | '';

export default function Onboarding() {
    const { completeOnboarding: completeAuthOnboarding } = useAuth();
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

    // Step 2: Body Metrics
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');

    // Step 3: Fitness Goals
    const [goal, setGoal] = useState<Goal>('');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('');

    // Step 4: Experience & Preferences
    const [experience, setExperience] = useState<Experience>('');
    const [workoutDays, setWorkoutDays] = useState('');

    const [loading, setLoading] = useState(false);

    const canProceed = () => {
        switch (step) {
            case 1: return name && age && gender;
            case 2: return height && weight;
            case 3: return goal && activityLevel;
            case 4: return experience;
            default: return false;
        }
    };

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    async function completeOnboarding() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert('Error', 'No authenticated user found.');
            setLoading(false);
            return;
        }

        // Calculate BMI
        const heightM = parseFloat(height) / 100;
        const weightKg = parseFloat(weight);
        const bmi = weightKg / (heightM * heightM);

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: name,
                age: parseInt(age),
                gender,
                height: parseFloat(height),
                current_weight: weightKg,
                goal_weight: goalWeight ? parseFloat(goalWeight) : null,
                bmi: parseFloat(bmi.toFixed(1)),
                goal,
                activity_level: activityLevel,
                experience_level: experience,
                workout_days_per_week: workoutDays ? parseInt(workoutDays) : 3,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Onboarding error:', error);
            Alert.alert('Error', error.message);
        } else {
            completeAuthOnboarding();
            router.replace('/(tabs)');
        }
        setLoading(false);
    }

    const SelectableOption = ({ label, selected, onPress, emoji }: { label: string, selected: boolean, onPress: () => void, emoji?: string }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`p-4 rounded-xl mb-3 border ${selected ? 'bg-primary/20 border-primary' : 'bg-card border-border'}`}
        >
            <Text className={`font-bold text-center ${selected ? 'text-primary' : 'text-white'}`}>
                {emoji ? `${emoji}  ` : ''}{label}
            </Text>
        </TouchableOpacity>
    );

    const ProgressBar = () => (
        <View className="flex-row mb-6 px-2">
            {[1, 2, 3, 4].map((s) => (
                <View
                    key={s}
                    className={`flex-1 h-1 rounded-full mx-1 ${s <= step ? 'bg-primary' : 'bg-card'}`}
                />
            ))}
        </View>
    );

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step1">
                        <View className="items-center mb-8">
                            <View className="bg-primary/20 p-4 rounded-full mb-4">
                                <User size={32} color={COLORS.primary} />
                            </View>
                            <Text className="text-white text-2xl font-bold">Let's get to know you</Text>
                            <Text className="text-muted text-center mt-2">Basic info helps us personalize your experience</Text>
                        </View>

                        <Input
                            label="What's your name?"
                            placeholder="John"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />

                        <View className="h-4" />

                        <Input
                            label="How old are you?"
                            placeholder="25"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                        />

                        <View className="h-4" />

                        <Text className="text-muted text-sm font-medium mb-2 ml-1">Gender</Text>
                        <View className="flex-row">
                            {[
                                { value: 'male', label: '👨 Male' },
                                { value: 'female', label: '👩 Female' },
                                { value: 'other', label: '🧑 Other' },
                            ].map((g) => (
                                <TouchableOpacity
                                    key={g.value}
                                    onPress={() => setGender(g.value as any)}
                                    className={`flex-1 py-3 rounded-xl mr-2 border ${gender === g.value ? 'bg-primary/20 border-primary' : 'bg-card border-border'}`}
                                >
                                    <Text className={`text-center font-bold ${gender === g.value ? 'text-primary' : 'text-white'}`}>{g.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                );

            case 2:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step2">
                        <View className="items-center mb-8">
                            <View className="bg-secondary/20 p-4 rounded-full mb-4">
                                <Activity size={32} color={COLORS.secondary} />
                            </View>
                            <Text className="text-white text-2xl font-bold">Your body metrics</Text>
                            <Text className="text-muted text-center mt-2">We'll use this to track your progress</Text>
                        </View>

                        <Input
                            label="Height (cm)"
                            placeholder="175"
                            value={height}
                            onChangeText={setHeight}
                            keyboardType="numeric"
                        />

                        <View className="h-4" />

                        <Input
                            label="Current Weight (kg)"
                            placeholder="75"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                        />

                        <View className="h-4" />

                        <Input
                            label="Goal Weight (kg) - Optional"
                            placeholder="70"
                            value={goalWeight}
                            onChangeText={setGoalWeight}
                            keyboardType="numeric"
                        />
                    </Animated.View>
                );

            case 3:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step3">
                        <View className="items-center mb-6">
                            <View className="bg-green-500/20 p-4 rounded-full mb-4">
                                <Target size={32} color="#22C55E" />
                            </View>
                            <Text className="text-white text-2xl font-bold">What's your goal?</Text>
                            <Text className="text-muted text-center mt-2">We'll customize workouts based on this</Text>
                        </View>

                        <SelectableOption label="Lose Weight" emoji="🔥" selected={goal === 'lose_weight'} onPress={() => setGoal('lose_weight')} />
                        <SelectableOption label="Build Muscle" emoji="💪" selected={goal === 'build_muscle'} onPress={() => setGoal('build_muscle')} />
                        <SelectableOption label="Get Stronger" emoji="🏋️" selected={goal === 'get_stronger'} onPress={() => setGoal('get_stronger')} />
                        <SelectableOption label="Improve Endurance" emoji="🏃" selected={goal === 'improve_endurance'} onPress={() => setGoal('improve_endurance')} />
                        <SelectableOption label="Maintain Fitness" emoji="⚖️" selected={goal === 'maintain'} onPress={() => setGoal('maintain')} />

                        <View className="h-4" />
                        <Text className="text-muted text-sm font-medium mb-2 ml-1">Activity Level</Text>
                        <View className="flex-row flex-wrap">
                            {[
                                { value: 'sedentary', label: 'Sedentary' },
                                { value: 'light', label: 'Light' },
                                { value: 'moderate', label: 'Moderate' },
                                { value: 'active', label: 'Active' },
                            ].map((a) => (
                                <TouchableOpacity
                                    key={a.value}
                                    onPress={() => setActivityLevel(a.value as any)}
                                    className={`w-[48%] py-3 rounded-xl mb-2 mr-[2%] border ${activityLevel === a.value ? 'bg-primary/20 border-primary' : 'bg-card border-border'}`}
                                >
                                    <Text className={`text-center font-bold ${activityLevel === a.value ? 'text-primary' : 'text-white'}`}>{a.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                );

            case 4:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step4">
                        <View className="items-center mb-6">
                            <View className="bg-purple-500/20 p-4 rounded-full mb-4">
                                <Dumbbell size={32} color="#A855F7" />
                            </View>
                            <Text className="text-white text-2xl font-bold">Your experience</Text>
                            <Text className="text-muted text-center mt-2">This helps us suggest the right workouts</Text>
                        </View>

                        <Text className="text-muted text-sm font-medium mb-2 ml-1">Fitness Experience</Text>
                        <SelectableOption label="Beginner - Just starting out" emoji="🌱" selected={experience === 'beginner'} onPress={() => setExperience('beginner')} />
                        <SelectableOption label="Intermediate - 6+ months training" emoji="⭐" selected={experience === 'intermediate'} onPress={() => setExperience('intermediate')} />
                        <SelectableOption label="Advanced - 2+ years training" emoji="🏆" selected={experience === 'advanced'} onPress={() => setExperience('advanced')} />

                        <View className="h-4" />

                        <Input
                            label="How many days per week can you workout?"
                            placeholder="3"
                            value={workoutDays}
                            onChangeText={setWorkoutDays}
                            keyboardType="numeric"
                        />
                    </Animated.View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-2">
                {step > 1 ? (
                    <TouchableOpacity onPress={prevStep} className="p-2">
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                ) : (
                    <View className="w-10" />
                )}
                <Text className="text-muted font-medium">Step {step} of {totalSteps}</Text>
                <View className="w-10" />
            </View>

            <ProgressBar />

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {renderStep()}
            </ScrollView>

            {/* Footer Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-background">
                <Button
                    title={step === totalSteps ? "Complete Setup" : "Continue"}
                    onPress={nextStep}
                    disabled={!canProceed()}
                    loading={loading}
                    size="lg"
                />
            </View>
        </SafeAreaView>
    );
}
