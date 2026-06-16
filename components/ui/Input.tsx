import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '../../lib/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input = ({
    label,
    error,
    containerClassName = '',
    className = '',
    ...props
}: InputProps) => {
    return (
        <View className={`w-full space-y-2 ${containerClassName}`}>
            {label && <Text className="text-muted text-sm font-medium ml-1">{label}</Text>}
            <TextInput
                placeholderTextColor={COLORS.muted}
                className={`w-full h-12 bg-card rounded-xl px-4 text-white border border-border focus:border-primary ${className}`}
                {...props}
            />
            {error && <Text className="text-red-500 text-xs ml-1">{error}</Text>}
        </View>
    );
};
