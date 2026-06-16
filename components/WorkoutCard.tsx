import { BarChart2, Clock } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../lib/theme';
import { Workout } from '../types';

interface WorkoutCardProps {
    workout: Workout;
    onPress: () => void;
    featured?: boolean;
}

export const WorkoutCard = ({ workout, onPress, featured = false }: WorkoutCardProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className={`rounded-2xl overflow-hidden mb-4 ${featured ? 'h-48' : 'h-32'}`}
        >
            <View className="flex-1 bg-card p-4 justify-between">
                <View>
                    <Text className="text-white font-bold text-xl mb-1">{workout.name}</Text>
                    <Text className="text-muted text-sm" numberOfLines={2}>{workout.description}</Text>
                </View>

                <View className="flex-row items-center space-x-4">
                    <View className="flex-row items-center">
                        <Clock size={14} color={COLORS.primary} />
                        <Text className="text-muted text-xs ml-1">{workout.duration_minutes} min</Text>
                    </View>
                    <View className="flex-row items-center">
                        <BarChart2 size={14} color={COLORS.secondary} />
                        <Text className="text-muted text-xs ml-1 capitalize">{workout.difficulty}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
