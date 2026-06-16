import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../lib/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
}

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    textClassName = '',
    icon
}: ButtonProps) => {
    const baseStyles = "flex-row items-center justify-center rounded-xl";
    const textBaseStyles = "font-bold text-center";

    const variants = {
        primary: "bg-primary active:opacity-90",
        secondary: "bg-secondary active:opacity-90",
        outline: "bg-transparent border border-border active:bg-card",
        ghost: "bg-transparent active:bg-card/50",
        danger: "bg-danger active:opacity-90",
    };

    const sizes = {
        md: "h-12 px-4",
        sm: "h-9 px-3",
        lg: "h-14 px-8",
    };

    const textVariants = {
        primary: "text-white", // In light mode primary button text should probably be white too if primary color is orange
        secondary: "text-white",
        outline: "text-text", // In outline, text should be text color
        ghost: "text-primary",
        danger: "text-white",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : 'white'} />
            ) : (
                <Text className={`${textBaseStyles} ${textVariants[variant]} ${textClassName}`}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};
