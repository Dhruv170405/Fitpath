import { router } from 'expo-router';
import { ArrowLeft, Users, Dumbbell, Activity } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkouts: 0,
    totalExercises: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      // Very basic queries to get row counts
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: workoutsCount } = await supabase.from('workout_logs').select('*', { count: 'exact', head: true });
      const { count: exercisesCount } = await supabase.from('exercises').select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalWorkouts: workoutsCount || 0,
        totalExercises: exercisesCount || 0,
      });
    } catch (error) {
      console.error('Failed to load admin stats', error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View className="bg-card p-5 rounded-2xl flex-1 m-1 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-muted font-medium text-sm">{title}</Text>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-white text-3xl font-bold">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-white text-lg font-bold mb-4">Overview</Text>

        {loading ? (
          <Text className="text-muted">Loading stats...</Text>
        ) : (
          <View>
            <View className="flex-row justify-between mb-2">
              <StatCard
                title="Users"
                value={stats.totalUsers}
                icon={Users}
                color="#60a5fa"
              />
              <StatCard
                title="Workouts"
                value={stats.totalWorkouts}
                icon={Activity}
                color="#34d399"
              />
            </View>
            <View className="flex-row justify-between mb-6">
              <StatCard
                title="Exercises"
                value={stats.totalExercises}
                icon={Dumbbell}
                color="#f472b6"
              />
              <View className="flex-1 m-1" />
            </View>
          </View>
        )}

        <Text className="text-white text-lg font-bold mb-4 mt-6">Management</Text>
        
        <TouchableOpacity 
          className="bg-card p-5 rounded-2xl mb-3 flex-row items-center border border-border"
          onPress={() => router.push('/admin/users' as any)}
        >
          <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mr-4">
            <Users size={24} color="#60a5fa" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg mb-1">User Management</Text>
            <Text className="text-muted text-sm">View and manage user profiles</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-card p-5 rounded-2xl mb-3 flex-row items-center border border-border"
          onPress={() => router.push('/admin/exercises' as any)}
        >
          <View className="w-12 h-12 bg-pink-500/20 rounded-full items-center justify-center mr-4">
            <Dumbbell size={24} color="#f472b6" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg mb-1">Exercise Library</Text>
            <Text className="text-muted text-sm">Add or edit default exercises</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
