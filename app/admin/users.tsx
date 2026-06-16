import { router } from 'expo-router';
import { ArrowLeft, User as UserIcon, Shield, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  avatar_url?: string;
  goal?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(u => 
          (u.full_name && u.full_name.toLowerCase().includes(lowerQuery)) || 
          (u.email && u.email.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, users]);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, goal')
        .order('full_name');

      if (error) throw error;
      
      // Since emails might be in auth.users and we might not have access to it from the client
      // we just use the profiles table data. If there is an email column in profiles, we use it.
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    Alert.alert(
      'Change Role',
      `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: async () => {
            setUpdating(userId);
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);
                
              if (error) throw error;
              
              // Update local state
              setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } catch (error) {
              console.error('Failed to update role', error);
              Alert.alert('Error', 'Failed to update user role. You may not have permission.');
            } finally {
              setUpdating(null);
            }
          }
        }
      ]
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View className="bg-card p-4 rounded-2xl mb-3 border border-border flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="h-12 w-12 bg-primary/20 rounded-full items-center justify-center mr-4 overflow-hidden">
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text className="text-primary font-bold">{getInitials(item.full_name)}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>
            {item.full_name || 'Unknown User'}
          </Text>
          <Text className="text-muted text-xs capitalize mt-1">
            {item.goal ? item.goal.replace('_', ' ') : 'No goal set'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        disabled={updating === item.id}
        onPress={() => toggleRole(item.id, item.role || 'user')}
        className={`px-3 py-1.5 rounded-lg border flex-row items-center ${
          item.role === 'admin' 
            ? 'bg-blue-500/20 border-blue-500/50' 
            : 'bg-card border-border'
        }`}
      >
        {updating === item.id ? (
          <ActivityIndicator size="small" color={item.role === 'admin' ? '#60a5fa' : COLORS.muted} />
        ) : (
          <>
            {item.role === 'admin' && <Shield size={14} color="#60a5fa" style={{ marginRight: 6 }} />}
            <Text className={item.role === 'admin' ? 'text-blue-400 font-bold' : 'text-muted font-medium'}>
              {(item.role || 'user').toUpperCase()}
            </Text>
          </>
        )}
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
          <Text className="text-white text-2xl font-bold">Users</Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="bg-card flex-row items-center px-4 py-3 rounded-xl border border-border">
          <Search size={20} color={COLORS.muted} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor={COLORS.muted}
            className="flex-1 text-white ml-3 font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-muted mt-4">Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <UserIcon size={48} color={COLORS.muted} />
                <Text className="text-white font-bold text-lg mt-4">No users found</Text>
                <Text className="text-muted text-center mt-2">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no other users in the database.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
