import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimpleLineChart } from '../../components/SimpleLineChart'; // Chart component
import { Skeleton } from '../../components/Skeleton';
import { WorkoutCard } from '../../components/WorkoutCard';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';
import { getUserWorkoutHistory, getWorkoutTemplates, WorkoutTemplate } from '../../lib/workoutService';

export default function Dashboard() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ workouts: 0, minutes: 0, streak: 0 });
  const [weeklyData, setWeeklyData] = useState<{ label: string; value: number }[]>([]);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [userName, setUserName] = useState('Athlete');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (templates.length === 0) setLoading(true);

    // Fetch user profile for name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }

    // Fetch workout templates from Supabase
    const workoutTemplates = await getWorkoutTemplates();
    setTemplates(workoutTemplates);

    // Fetch user's workout history for stats
    const history = await getUserWorkoutHistory();
    const totalMinutes = history.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

    // Calculate Weekly Data (Last 7 Days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData: { label: string; value: number }[] = [];
    let thisWeekTotalMinutes = 0;
    let thisWeekTotalWorkouts = 0;

    // Last 7 days loop
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = days[date.getDay()];

      const dayWorkouts = history.filter(w => w.started_at?.startsWith(dateStr));
      const dayMinutes = dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

      weekData.push({ label: dayLabel, value: dayMinutes });

      thisWeekTotalMinutes += dayMinutes;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysWorkouts = history.filter(w => w.started_at && new Date(w.started_at) >= thirtyDaysAgo).length;

    setStats({
      workouts: last30DaysWorkouts,
      minutes: thisWeekTotalMinutes,
      streak: calculateStreak(history),
    });

    setWeeklyData(weekData);
    setWeeklyMinutes(thisWeekTotalMinutes);

    setLoading(false);
  }

  // Simple streak calculation (consecutive days)
  function calculateStreak(history: any[]): number {
    if (history.length === 0) return 0;
    // For now, return a simple count. Can be enhanced later.
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (history.some(w => w.started_at?.startsWith(dateStr))) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  }

  const StatBox = ({ label, value }: { label: string, value: string }) => (
    <View className="bg-card rounded-xl p-3 flex-1 mr-2 items-center">
      <Text className="text-white font-bold text-lg">{value}</Text>
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-5">
          {/* Header Skeleton */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
              <Skeleton width={180} height={32} />
            </View>
            <Skeleton width={50} height={50} borderRadius={25} />
          </View>

          {/* Stats Row Skeleton */}
          <View className="flex-row mb-6 justify-between">
            <Skeleton width="31%" height={80} borderRadius={16} />
            <Skeleton width="31%" height={80} borderRadius={16} />
            <Skeleton width="31%" height={80} borderRadius={16} />
          </View>

          {/* Weekly Chart Skeleton */}
          <View className="bg-card/50 p-4 rounded-2xl mb-6 border border-border">
            <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={16} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={150} borderRadius={12} />
          </View>

          {/* Today's Suggestion Skeleton */}
          <View className="mb-8">
            <Skeleton width={150} height={24} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={180} borderRadius={24} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const suggestedWorkout = templates[0];
  const popularWorkouts = templates.slice(1, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-muted text-sm">{getGreeting()},</Text>
            <Text className="text-white text-2xl font-bold">{userName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="h-10 w-10 bg-card rounded-full items-center justify-center border border-border overflow-hidden"
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text className="text-white font-bold">
                {userName === 'Athlete' ? 'FP' : userName.slice(0, 2).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="flex-row mb-6">
          <StatBox label="Workouts (30d)" value={stats.workouts.toString()} />
          <StatBox label="Minutes (7d)" value={stats.minutes.toString()} />
          <StatBox label="Streak" value={stats.streak > 0 ? `${stats.streak} 🔥` : '0'} />
        </Animated.View>

        {/* Weekly Activity Graph */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/progress' as any)}
            className="bg-card p-4 rounded-2xl mb-6 border border-border"
          >
            <View className="mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-lg font-bold">Weekly Activity</Text>
                <Text className="text-muted text-xs">Tap for details</Text>
              </View>
              <Text className="text-muted text-xs mt-1">
                You've trained <Text className="text-primary font-bold">{weeklyMinutes} min</Text> in the last 7 days.
              </Text>
            </View>
            {/* Width = Window Width - 40 (Screen Padding) - 32 (Card Padding) = -72 */}
            <SimpleLineChart
              data={weeklyData}
              color={COLORS.primary}
              height={150}
              valueUnit=" min"
              width={Dimensions.get('window').width - 72}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Workout */}
        {suggestedWorkout && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mb-8">
            <Text className="text-white text-lg font-bold mb-3">Today's Suggestion</Text>
            <WorkoutCard
              workout={{
                id: suggestedWorkout.id,
                name: suggestedWorkout.name,
                description: suggestedWorkout.description,
                difficulty: suggestedWorkout.difficulty as any,
                duration_minutes: suggestedWorkout.duration_minutes,
              }}
              featured
              onPress={() => router.push(`/workout/${suggestedWorkout.id}`)}
            />
          </Animated.View>
        )}

        {/* Popular Workouts */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-bold">Available Programs</Text>
            <Text className="text-primary text-sm font-bold">See All</Text>
          </View>

          {templates.length === 0 ? (
            <View className="bg-card p-6 rounded-xl items-center">
              <Text className="text-muted text-center">No workout templates available yet.</Text>
              <Text className="text-muted text-center text-xs mt-2">Run the SQL schema to add default workouts.</Text>
            </View>
          ) : (
            popularWorkouts.map(workout => (
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
