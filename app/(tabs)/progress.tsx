import { useRouter } from 'expo-router';
import { Award, Calendar as CalendarIcon, ChevronRight, Clock, Plus, TrendingUp, Trophy, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimpleLineChart } from '../../components/SimpleLineChart';
import { Skeleton } from '../../components/Skeleton';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';
import { getUserStatistics, getUserWeightHistory, getUserWorkoutHistory, logUserWeight, WorkoutLog } from '../../lib/workoutService';

export default function ProgressScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'activity' | 'body'>('activity');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        bestStreak: 0,
        activeDays: 0,
        personalRecords: 0,
        thisWeekCount: 0,
    });
    const [activityChartData, setActivityChartData] = useState<{ label: string; value: number }[]>([]);
    const [weightChartData, setWeightChartData] = useState<{ label: string; value: number }[]>([]);
    const [historyList, setHistoryList] = useState<WorkoutLog[]>([]);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);
    const [userHeight, setUserHeight] = useState<number | null>(null);

    // Modal state
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [savingWeight, setSavingWeight] = useState(false);

    useEffect(() => {
        loadProgress();
    }, []);

    async function loadProgress() {
        setLoading(true);

        // Fetch workout history
        const history = (await getUserWorkoutHistory()) || [];

        // Fetch weight history
        const weightHistory = (await getUserWeightHistory()) || [];

        // Get user profile for height
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('height, current_weight')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserHeight(profile.height);
                setCurrentWeight(profile.current_weight);
            }
        }
        // Fetch enhanced stats
        const advancedStats = await getUserStatistics();

        // Calculate Activity Stats
        const totalWorkouts = advancedStats.totalWorkouts || history.length;
        const totalVolume = advancedStats.totalVolume;

        const uniqueDays = new Set(
            history.map(w => w.started_at?.split('T')[0]).filter(Boolean)
        );
        const activeDays = uniqueDays.size;

        // Calculate This Week (since Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - diffToMonday);
        lastMonday.setHours(0, 0, 0, 0);

        const thisWeekWorkouts = history.filter(w => {
            if (!w.started_at) return false;
            const wDate = new Date(w.started_at);
            return wDate >= lastMonday;
        });

        // Calculate "Best Streak" (Consecutive Days)
        let bestStreak = 0;
        let currentSequence = 0;
        const sortedDates = Array.from(uniqueDays).sort();

        sortedDates.forEach((dateStr, index) => {
            if (index === 0) {
                currentSequence = 1;
            } else {
                const prev = new Date(sortedDates[index - 1]);
                const curr = new Date(dateStr);
                const diffTime = Math.abs(curr.getTime() - prev.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentSequence++;
                } else {
                    bestStreak = Math.max(bestStreak, currentSequence);
                    currentSequence = 1;
                }
            }
        });
        bestStreak = Math.max(bestStreak, currentSequence);

        setStats({
            totalWorkouts,
            bestStreak,
            activeDays,
            personalRecords: advancedStats.thisWeekSets || 0, // Now using thisWeekSets
            thisWeekCount: thisWeekWorkouts.length,
        });

        // Build Activity Chart Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData: { label: string; value: number }[] = [];

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentHistory = history.filter(w => {
            if (!w.started_at) return false;
            return new Date(w.started_at) >= thirtyDaysAgo;
        });

        setHistoryList(recentHistory);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = days[date.getDay()];

            const dayWorkouts = history.filter(w => w.started_at?.startsWith(dateStr));
            const totalMinutes = dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

            weekData.push({ label: dayLabel, value: totalMinutes });
        }
        setActivityChartData(weekData);


        // Build Weight Chart Data
        // If we have history, show it. Otherwise show just current weight or empty.
        if (weightHistory.length > 0) {
            const weightData = weightHistory.map((entry: any) => ({
                label: new Date(entry.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: entry.weight
            }));
            setWeightChartData(weightData.slice(-7)); // Show last 7 entries for clarity
        } else if (currentWeight) {
            setWeightChartData([{ label: 'Now', value: currentWeight }]);
        } else {
            setWeightChartData([]);
        }

        setLoading(false);
    }

    const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) => (
        <View className="bg-card w-[48%] p-4 rounded-xl mb-4 border border-border">
            <View className="flex-row justify-between items-start mb-2">
                <View className="p-2 rounded-lg bg-background">
                    <Icon size={20} color={color} />
                </View>
            </View>
            <Text className="text-white text-2xl font-bold mb-1">{value}</Text>
            <Text className="text-muted text-xs">{title}</Text>
        </View>
    );

    const calculateBMI = (weight: number, heightCm: number) => {
        const heightM = heightCm / 100;
        return (weight / (heightM * heightM)).toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="p-5">
                    {/* Header Title Skeleton */}
                    <Skeleton width={200} height={40} style={{ marginBottom: 24 }} />

                    {/* Weekly Summary Card Skeleton */}
                    <View className="bg-card/50 p-6 rounded-2xl mb-8 border border-border">
                        <Skeleton width={150} height={20} style={{ marginBottom: 10 }} />
                        <Skeleton width={100} height={36} style={{ marginBottom: 10 }} />
                        <View className="h-[1px] bg-border w-full my-4" />
                        <View className="flex-row justify-between">
                            <Skeleton width={100} height={20} />
                            <Skeleton width={100} height={20} />
                        </View>
                    </View>

                    {/* Tabs Skeleton */}
                    <Skeleton width="100%" height={45} borderRadius={12} style={{ marginBottom: 24 }} />

                    {/* Chart Card Skeleton */}
                    <View className="bg-card/50 p-4 rounded-2xl mb-6 border border-border">
                        <Skeleton width={200} height={24} style={{ marginBottom: 16 }} />
                        <Skeleton width="100%" height={200} borderRadius={16} />
                    </View>

                    {/* Stat Grid Skeleton */}
                    <View className="flex-row flex-wrap justify-between">
                        {[1, 2, 3, 4].map(i => (
                            <View key={i} className="bg-card/50 w-[48%] p-4 rounded-xl mb-4 border border-border">
                                <Skeleton width={32} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
                                <Skeleton width={60} height={28} style={{ marginBottom: 4 }} />
                                <Skeleton width={80} height={14} />
                            </View>
                        ))}
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const handleSaveWeight = async () => {
        if (!newWeight || isNaN(parseFloat(newWeight))) return;

        setSavingWeight(true);
        const success = await logUserWeight(parseFloat(newWeight));
        setSavingWeight(false);

        if (success) {
            setShowWeightModal(false);
            setNewWeight('');
            loadProgress(); // Refresh data
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Animated.View entering={FadeInDown.duration(600)}>
                    <Text className="text-white text-3xl font-bold mb-6">Your Progress</Text>

                    {/* Weekly Summary Card (NEW) */}
                    <View className="bg-primary/20 p-6 rounded-2xl mb-8 border border-primary/50">
                        <Text className="text-primary font-bold text-lg mb-2">Weekly Summary</Text>
                        <Text className="text-white text-3xl font-bold mb-1">
                            {stats.thisWeekCount} workouts
                        </Text>
                        <Text className="text-muted mb-4">completed this week</Text>

                        <View className="h-[1px] bg-primary/30 w-full my-2" />

                        <View className="flex-row justify-between mt-2">
                            <Text className="text-muted">Total All Time</Text>
                            <Text className="text-white font-bold">{stats.totalWorkouts} Workouts</Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row bg-card p-1 rounded-xl mb-6">
                        <TouchableOpacity
                            onPress={() => setActiveTab('activity')}
                            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'activity' ? 'bg-background' : ''}`}
                        >
                            <Text className={`font-bold ${activeTab === 'activity' ? 'text-white' : 'text-muted'}`}>Activity</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('body')}
                            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'body' ? 'bg-background' : ''}`}
                        >
                            <Text className={`font-bold ${activeTab === 'body' ? 'text-white' : 'text-muted'}`}>Body Stats</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'activity' ? (
                        <>
                            {/* Activity Content */}
                            <View className="bg-card p-4 rounded-2xl mb-6">
                                <Text className="text-white font-bold text-lg mb-4">
                                    Workout Duration (min) - Last 7 Days
                                </Text>
                                <SimpleLineChart
                                    data={activityChartData}
                                    color={COLORS.primary}
                                    valueUnit=" min"
                                />
                            </View>

                            <View className="flex-row flex-wrap justify-between">
                                <StatCard title="Total Workouts" value={stats.totalWorkouts.toString()} icon={Trophy} color="#EAB308" />
                                <StatCard title="Best Streak" value={`${stats.bestStreak} days`} icon={Zap} color="#3B82F6" />
                                <StatCard title="Active Days" value={stats.activeDays.toString()} icon={CalendarIcon} color="#22C55E" />
                                <StatCard title="Sets This Week" value={stats.personalRecords.toString()} icon={Award} color="#F97316" />
                            </View>

                            <View className="mb-6">
                                <Text className="text-white font-bold text-lg mb-4">Recent Workouts (Last 30 Days)</Text>
                                {historyList.length === 0 ? (
                                    <Text className="text-muted text-center">No workouts logged yet.</Text>
                                ) : (
                                    historyList.map((workout) => (
                                        <TouchableOpacity
                                            key={workout.id}
                                            onPress={() => router.push(`/history/${workout.id}` as any)}
                                            className="bg-card p-4 rounded-xl mb-3 border border-border flex-row justify-between items-center"
                                        >
                                            <View>
                                                <Text className="text-white font-bold text-lg">{workout.workout_name}</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <CalendarIcon size={14} color={COLORS.muted} />
                                                    <Text className="text-muted text-xs ml-1 mr-4">
                                                        {new Date(workout.started_at).toLocaleDateString()}
                                                    </Text>
                                                    {!!workout.duration_minutes && (
                                                        <>
                                                            <Clock size={14} color={COLORS.muted} />
                                                            <Text className="text-muted text-xs ml-1">
                                                                {workout.duration_minutes} min
                                                            </Text>
                                                        </>
                                                    )}
                                                </View>
                                            </View>
                                            <ChevronRight size={20} color={COLORS.muted} />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Body Stats Content */}
                            <View className="bg-card p-4 rounded-2xl mb-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-white font-bold text-lg">
                                        Weight History (kg)
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowWeightModal(true)}
                                        className="bg-primary px-3 py-1 rounded-full flex-row items-center"
                                    >
                                        <Plus size={14} color="white" />
                                        <Text className="text-white text-xs font-bold ml-1">Log Weight</Text>
                                    </TouchableOpacity>
                                </View>
                                {weightChartData.length > 0 ? (
                                    <SimpleLineChart
                                        data={weightChartData}
                                        color={COLORS.primary}
                                        valueUnit=" kg"
                                    />
                                ) : (
                                    <View className="h-40 items-center justify-center">
                                        <Text className="text-muted">No weight history data yet</Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row flex-wrap justify-between">
                                <StatCard
                                    title="Current Weight"
                                    value={currentWeight ? `${currentWeight} kg` : '-'}
                                    icon={TrendingUp}
                                    color="#3B82F6"
                                />
                                <StatCard
                                    title="Height"
                                    value={userHeight ? `${userHeight} cm` : '-'}
                                    icon={TrendingUp}
                                    color="#22C55E"
                                />
                                {currentWeight && userHeight && (
                                    <View className="bg-card w-full p-4 rounded-xl mb-4 border border-border">
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <Text className="text-white text-2xl font-bold mb-1">
                                                    {calculateBMI(currentWeight, userHeight)}
                                                </Text>
                                                <Text className="text-muted text-xs">BMI Score</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-primary font-bold">{getBMICategory(parseFloat(calculateBMI(currentWeight, userHeight)))}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                </Animated.View>
            </ScrollView>

            {/* Log Weight Modal */}
            <Modal
                visible={showWeightModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowWeightModal(false)}
            >
                <View className="flex-1 bg-black/80 items-center justify-center p-4">
                    <View className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border">
                        <Text className="text-white text-xl font-bold mb-4">Log Current Weight</Text>

                        <Text className="text-muted text-sm mb-2">Weight (kg)</Text>
                        <TextInput
                            className="bg-background text-white p-4 rounded-xl border border-border mb-6 text-lg"
                            placeholder="e.g. 75.5"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="decimal-pad"
                            value={newWeight}
                            onChangeText={setNewWeight}
                            autoFocus
                        />

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setShowWeightModal(false)}
                                className="flex-1 bg-background p-4 rounded-xl border border-border items-center"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveWeight}
                                disabled={savingWeight}
                                className="flex-1 bg-primary p-4 rounded-xl items-center"
                            >
                                {savingWeight ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}
