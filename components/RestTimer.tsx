import { Pause, Play, RotateCcw, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../lib/theme';


export const RestTimer = ({
    initialSeconds = 60,
    isOpen,
    onClose,
    onComplete
}: {
    initialSeconds?: number;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const mutedColor = COLORS.muted;

    useEffect(() => {
        setSecondsLeft(initialSeconds);
        setIsActive(true); // Auto-start on open
    }, [initialSeconds, isOpen]);

    useEffect(() => {
        let interval: any;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft(initialSeconds);
    };

    const addTime = (Amount: number) => setSecondsLeft(prev => prev + Amount);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    };

    if (!isOpen) return null;

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-8 z-50 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-text font-bold text-lg">Rest Timer</Text>
                <TouchableOpacity onPress={onClose}>
                    <X size={24} color={mutedColor} />
                </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
                <Text className="text-primary text-5xl font-mono font-bold tracking-widest">
                    {formatTime(secondsLeft)}
                </Text>
            </View>

            <View className="flex-row justify-center space-x-6 mb-4">
                <TouchableOpacity onPress={() => addTime(-10)} className="bg-card border border-border px-4 py-2 rounded-lg">
                    <Text className="text-white">-10s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleTimer} className="bg-primary p-4 rounded-full">
                    {isActive ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addTime(10)} className="bg-card border border-border px-4 py-2 rounded-lg">
                    <Text className="text-white">+10s</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={resetTimer} className="items-center">
                <View className="flex-row items-center">
                    <RotateCcw size={14} color={COLORS.muted} />
                    <Text className="text-muted text-xs ml-1">Reset</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};
