import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Info, Moon, Ruler, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../lib/theme';

export default function GeneralSettings() {
    const router = useRouter();
    const [useMetric, setUseMetric] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const SettingRow = ({ icon: Icon, label, value, onPress, isSwitch, onValueChange, rightText, isDestructive }: any) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={isSwitch}
            className="flex-row items-center justify-between p-4 bg-card rounded-xl mb-3"
        >
            <View className="flex-row items-center">
                <View className="w-8">
                    <Icon size={20} color={isDestructive ? '#ef4444' : COLORS.muted} />
                </View>
                <Text className={`font-medium ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</Text>
            </View>

            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: COLORS.card, true: COLORS.primary }}
                    thumbColor={'white'}
                />
            ) : (
                <View className="flex-row items-center">
                    {rightText && <Text className="text-muted mr-2">{rightText}</Text>}
                    <ChevronRight size={20} color={COLORS.muted} />
                </View>
            )}
        </TouchableOpacity>
    );

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">General</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="text-muted text-sm font-medium mb-2 uppercase ml-1">Preferences</Text>
                <View className="mb-6">
                    <SettingRow
                        icon={Ruler}
                        label="Units"
                        rightText={useMetric ? "Metric" : "Imperial"}
                        onPress={() => setUseMetric(!useMetric)}
                    />
                    <SettingRow
                        icon={Moon}
                        label="Dark Mode"
                        isSwitch
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                </View>

                <Text className="text-muted text-sm font-medium mb-2 uppercase ml-1">About</Text>
                <View className="mb-6">
                    <SettingRow icon={Info} label="Version" rightText="1.0.0" />
                </View>

                <Text className="text-muted text-sm font-medium mb-2 uppercase ml-1">Danger Zone</Text>
                <View className="mb-6">
                    <SettingRow
                        icon={Trash2}
                        label="Delete Account"
                        isDestructive
                        onPress={handleDeleteAccount}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
