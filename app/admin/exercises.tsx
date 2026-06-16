import { router } from 'expo-router';
import { ArrowLeft, Dumbbell, Plus, Search, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

interface DBExercise {
  id: string;
  name: string;
  muscle_group: string;
  description: string | null;
  video_url: string | null;
}

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<DBExercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<DBExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState('chest');
  const [newDesc, setNewDesc] = useState('');
  
  const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'cardio', 'arms', 'other'];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredExercises(
        exercises.filter(e => e.name.toLowerCase().includes(lowerQuery))
      );
    }
  }, [searchQuery, exercises]);

  async function loadExercises() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Failed to load exercises', error);
      Alert.alert('Error', 'Failed to load exercises from database');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${name}"? This cannot be undone and might affect users who have logged this exercise.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('exercises')
                .delete()
                .eq('id', id);
                
              if (error) throw error;
              setExercises(exercises.filter(e => e.id !== id));
            } catch (error) {
              console.error('Failed to delete', error);
              Alert.alert('Error', 'Failed to delete exercise. It might be in use by workout templates.');
            }
          }
        }
      ]
    );
  }

  async function handleAddExercise() {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Exercise name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if it already exists
      const exists = exercises.some(e => e.name.toLowerCase() === newName.trim().toLowerCase());
      if (exists) {
        Alert.alert('Error', 'An exercise with this name already exists in the database');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: newName.trim(),
          muscle_group: newMuscle,
          description: newDesc.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update state
      setExercises([...exercises, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Reset and close
      setNewName('');
      setNewDesc('');
      setNewMuscle('chest');
      setModalVisible(false);
      
      Alert.alert('Success', 'Exercise added to the global database successfully!');
    } catch (error) {
      console.error('Failed to add exercise', error);
      Alert.alert('Error', 'Failed to add exercise. Please check permissions.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const getMuscleGroupColor = (group: string) => {
    const colors: Record<string, string> = {
        chest: '#EF4444',
        back: '#3B82F6',
        legs: '#22C55E',
        shoulders: '#F59E0B',
        arms: '#8B5CF6',
        core: '#06B6D4',
        cardio: '#F97316',
    };
    return colors[group?.toLowerCase()] || COLORS.primary;
  };

  const renderItem = ({ item }: { item: DBExercise }) => (
    <View className="bg-card p-4 rounded-2xl mb-3 border border-border flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-white font-bold text-lg mr-2" numberOfLines={1}>{item.name}</Text>
          <View 
            className="px-2 py-0.5 rounded-full" 
            style={{ backgroundColor: getMuscleGroupColor(item.muscle_group) + '30' }}
          >
            <Text className="text-xs font-bold capitalize" style={{ color: getMuscleGroupColor(item.muscle_group) }}>
              {item.muscle_group}
            </Text>
          </View>
        </View>
        <Text className="text-muted text-sm" numberOfLines={2}>
          {item.description || 'No description provided'}
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => handleDelete(item.id, item.name)}
        className="h-10 w-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/20"
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
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
          <Text className="text-white text-2xl font-bold">Exercise Database</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-primary/20 p-2 rounded-full border border-primary/30"
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="bg-card flex-row items-center px-4 py-3 rounded-xl border border-border">
          <Search size={20} color={COLORS.muted} />
          <TextInput
            placeholder="Search exercises..."
            placeholderTextColor={COLORS.muted}
            className="flex-1 text-white ml-3 font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Text className="text-muted text-xs mt-2 ml-1">
          Showing {filteredExercises.length} custom database exercises
        </Text>
      </View>

      {/* List */}
      <View className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-muted mt-4">Loading database...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Dumbbell size={48} color={COLORS.muted} />
                <Text className="text-white font-bold text-lg mt-4">No exercises found</Text>
                <Text className="text-muted text-center mt-2">
                  {searchQuery ? 'Try adjusting your search query' : 'Click the + button to add an exercise to the global database.'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/80"
        >
          <View className="bg-card rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Add New Exercise</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={isSubmitting}>
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-muted font-medium mb-2">Exercise Name *</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Barbell Bench Press"
                placeholderTextColor={COLORS.muted}
                className="bg-background text-white p-4 rounded-xl border border-border font-medium"
              />
            </View>

            <View className="mb-4">
              <Text className="text-muted font-medium mb-2">Muscle Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {MUSCLE_GROUPS.map(group => (
                  <TouchableOpacity
                    key={group}
                    onPress={() => setNewMuscle(group)}
                    className={`px-4 py-2 rounded-full mr-2 border ${
                      newMuscle === group 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-background border-border'
                    }`}
                  >
                    <Text className={`capitalize font-bold ${
                      newMuscle === group ? 'text-primary' : 'text-muted'
                    }`}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-muted font-medium mb-2">Description / Instructions</Text>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Enter step-by-step instructions..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={4}
                className="bg-background text-white p-4 rounded-xl border border-border font-medium text-left"
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
            </View>

            <TouchableOpacity 
              onPress={handleAddExercise}
              disabled={isSubmitting}
              className={`py-4 rounded-xl items-center mb-6 ${
                isSubmitting ? 'bg-primary/50' : 'bg-primary'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Add to Database</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
