import { useRouter } from 'expo-router';
import { ChevronLeft, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

type Goal = 'lose_weight' | 'build_muscle' | 'get_stronger' | 'improve_endurance' | 'maintain' | '';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | '';

export default function EditProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile data
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [goal, setGoal] = useState<Goal>('');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('');

    const [workoutDays, setWorkoutDays] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);



    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setName(profile.full_name || '');
                setAge(profile.age?.toString() || '');
                setHeight(profile.height?.toString() || '');
                setWeight(profile.current_weight?.toString() || '');
                setGoalWeight(profile.goal_weight?.toString() || '');
                setGoal(profile.goal || '');
                setActivityLevel(profile.activity_level || '');
                setWorkoutDays(profile.workout_days_per_week?.toString() || '3');
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
            }
        }
        setLoading(false);
    }

    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                    await uploadImage(asset.base64);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    }

    async function uploadImage(base64Data: string) {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const fileName = `${user.id}/${Date.now()}.jpg`;
            const contentType = 'image/jpeg';

            // On Android, base64 might contain newlines which decode() doesn't like?
            // Usually expo-image-picker returns clean base64.
            // But let's check if we accidentally passed the URI or something else.

            const arrayBuffer = decode(base64Data);

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, arrayBuffer, {
                    contentType,
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setSaving(false);
        }
    }

    async function saveProfile() {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert('Error', 'No user found');
            setSaving(false);
            return;
        }

        // Input Validation
        if (age && isNaN(parseInt(age))) {
            Alert.alert('Invalid Input', 'Age must be a valid number');
            setSaving(false);
            return;
        }
        if (height && isNaN(parseFloat(height))) {
            Alert.alert('Invalid Input', 'Height must be a valid number');
            setSaving(false);
            return;
        }
        if (weight && isNaN(parseFloat(weight))) {
            Alert.alert('Invalid Input', 'Weight must be a valid number');
            setSaving(false);
            return;
        }

        // Calculate BMI
        const heightM = parseFloat(height) / 100;
        const weightKg = parseFloat(weight);
        const bmi = (heightM > 0 && weightKg > 0) ? weightKg / (heightM * heightM) : 0;

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: name,
                age: age ? parseInt(age) : null,
                height: height ? parseFloat(height) : null,
                current_weight: weight ? parseFloat(weight) : null,
                goal_weight: goalWeight ? parseFloat(goalWeight) : null,
                bmi: bmi > 0 ? parseFloat(bmi.toFixed(1)) : null,
                goal,
                activity_level: activityLevel,
                workout_days_per_week: workoutDays ? parseInt(workoutDays) : 3,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Profile updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }
        setSaving(false);
    }

    const GoalOption = ({ label, value, emoji }: { label: string; value: Goal; emoji: string }) => (
        <TouchableOpacity
            onPress={() => setGoal(value)}
            className={`p-3 rounded-xl mb-2 border ${goal === value ? 'bg-primary/20 border-primary' : 'bg-card border-border'}`}
        >
            <Text className={`font-medium text-center ${goal === value ? 'text-primary' : 'text-white'}`}>
                {emoji} {label}
            </Text>
        </TouchableOpacity>
    );

    const ActivityOption = ({ label, value }: { label: string; value: ActivityLevel }) => (
        <TouchableOpacity
            onPress={() => setActivityLevel(value)}
            className={`flex-1 py-2 rounded-xl mr-2 border ${activityLevel === value ? 'bg-primary/20 border-primary' : 'bg-card border-border'}`}
        >
            <Text className={`text-center text-xs font-medium ${activityLevel === value ? 'text-primary' : 'text-white'}`}>{label}</Text>
        </TouchableOpacity>
    );

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
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Edit Profile</Text>
                <TouchableOpacity onPress={saveProfile} disabled={saving} className="p-2">
                    <Save color={saving ? 'gray' : COLORS.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <Animated.View entering={FadeInDown.duration(700).springify()}>

                    {/* Avatar Selection */}
                    <View className="items-center mb-8">
                        <TouchableOpacity onPress={pickImage} className="relative">
                            <View className="h-28 w-28 rounded-full bg-card border-2 border-primary overflow-hidden items-center justify-center">
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Text className="text-white text-3xl font-bold">{name ? name.substring(0, 2).toUpperCase() : 'FP'}</Text>
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-background">
                                <Camera size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-primary font-bold mt-3">Change Photo</Text>
                    </View>

                    {/* Personal Info */}
                    <Text className="text-white font-bold text-lg mb-4">Personal Info</Text>
                    <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
                    <View className="h-3" />
                    <Input label="Age" placeholder="30" value={age} onChangeText={setAge} keyboardType="numeric" />

                    {/* Body Metrics */}
                    <Text className="text-white font-bold text-lg mb-4 mt-8">Body Metrics</Text>

                    <Input label="Height (cm)" placeholder="175" value={height} onChangeText={setHeight} keyboardType="numeric" />
                    <View className="h-3" />
                    <Input label="Current Weight (kg)" placeholder="75" value={weight} onChangeText={setWeight} keyboardType="numeric" />
                    <View className="h-3" />
                    <Input label="Goal Weight (kg)" placeholder="70" value={goalWeight} onChangeText={setGoalWeight} keyboardType="numeric" />

                    {/* Fitness Goal */}
                    <Text className="text-white font-bold text-lg mb-4 mt-8">Fitness Goal</Text>

                    <GoalOption label="Lose Weight" value="lose_weight" emoji="🔥" />
                    <GoalOption label="Build Muscle" value="build_muscle" emoji="💪" />
                    <GoalOption label="Get Stronger" value="get_stronger" emoji="🏋️" />
                    <GoalOption label="Improve Endurance" value="improve_endurance" emoji="🏃" />
                    <GoalOption label="Maintain Fitness" value="maintain" emoji="⚖️" />

                    {/* Activity Level */}
                    <Text className="text-white font-bold text-lg mb-4 mt-8">Activity Level</Text>
                    <View className="flex-row">
                        <ActivityOption label="Sedentary" value="sedentary" />
                        <ActivityOption label="Light" value="light" />
                        <ActivityOption label="Moderate" value="moderate" />
                        <ActivityOption label="Active" value="active" />
                    </View>

                    {/* Workout Frequency */}
                    <Text className="text-white font-bold text-lg mb-4 mt-8">Workout Preference</Text>
                    <Input
                        label="Days per week"
                        placeholder="3"
                        value={workoutDays}
                        onChangeText={setWorkoutDays}
                        keyboardType="numeric"
                    />



                </Animated.View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
                <Button title="Save Changes" onPress={saveProfile} loading={saving} size="lg" />
            </View>
        </SafeAreaView>
    );
}
