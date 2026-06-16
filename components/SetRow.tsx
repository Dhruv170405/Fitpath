import { CheckCircle, Circle } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SetRowProps {
    setNumber: number;
    weight?: string;
    reps?: string;
    isCompleted: boolean;
    onUpdate: (field: 'weight' | 'reps', value: string) => void;
    onToggleComplete: () => void;
}

import { COLORS } from '../lib/theme';

export const SetRow = ({ setNumber, weight, reps, isCompleted, onUpdate, onToggleComplete }: SetRowProps) => {
    const mutedColor = COLORS.muted;
    const primaryColor = COLORS.primary;
    const textColor = 'white';

    return (
        <View className={`flex-row items-center justify-between py-2 mb-2 rounded-lg px-2 ${isCompleted ? 'bg-green-500/10' : 'bg-transparent'}`}>
            <View className="w-8 items-center justify-center bg-card h-8 rounded-full mr-2">
                <Text className="text-muted font-bold text-xs">{setNumber}</Text>
            </View>

            <View className="flex-1 flex-row space-x-4 mx-2">
                <View className="flex-1">
                    <TextInput
                        placeholder="0"
                        placeholderTextColor={mutedColor}
                        value={weight}
                        onChangeText={(text) => onUpdate('weight', text)}
                        keyboardType="numeric"
                        className="bg-card text-center text-text font-bold h-10 rounded-md border border-border"
                        style={{ color: textColor }}
                    />
                    <Text className="text-muted text-[10px] text-center mt-1">kg</Text>
                </View>
                <View className="flex-1">
                    <TextInput
                        placeholder="0"
                        placeholderTextColor={mutedColor}
                        value={reps}
                        onChangeText={(text) => onUpdate('reps', text)}
                        keyboardType="numeric"
                        className="bg-card text-center text-text font-bold h-10 rounded-md border border-border"
                        style={{ color: textColor }}
                    />
                    <Text className="text-muted text-[10px] text-center mt-1">reps</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onToggleComplete} className="ml-2">
                {isCompleted ? (
                    <CheckCircle size={28} color={primaryColor} fill={primaryColor} />
                ) : (
                    <Circle size={28} color={mutedColor} />
                )}
            </TouchableOpacity>
        </View>
    );
};
