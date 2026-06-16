import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../lib/theme';

export default function PrivacyPolicy() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Privacy Policy',
                headerTintColor: COLORS.text,

                presentation: 'modal',
            }} />
            <ScrollView className="flex-1 px-6 py-4">
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-primary mb-4">Privacy Policy</Text>
                    <Text className="text-muted text-base leading-6 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                    </Text>

                    <Text className="text-xl font-bold text-text mb-2">1. Introduction</Text>
                    <Text className="text-muted text-base leading-6 mb-6">
                        Welcome to Fitpath. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights and how the law protects you.
                    </Text>

                    <Text className="text-xl font-bold text-text mb-2">2. Data Migration</Text>
                    <Text className="text-muted text-base leading-6 mb-6">
                        We collect data that you provide to us directly. This includes:
                        {'\n'}• Identity Data (Username, etc.)
                        {'\n'}• Contact Data (Email address)
                        {'\n'}• Health Data (Workout logs, weight history)
                    </Text>

                    <Text className="text-xl font-bold text-text mb-2">3. How We Use Your Data</Text>
                    <Text className="text-muted text-base leading-6 mb-6">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        {'\n'}• To manage your account.
                        {'\n'}• To provide workout tracking features.
                        {'\n'}• To improve our application.
                    </Text>

                    <Text className="text-xl font-bold text-text mb-2">4. Data Security</Text>
                    <Text className="text-muted text-base leading-6 mb-6">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </Text>

                    <Text className="text-xl font-bold text-text mb-2">5. Guest Mode</Text>
                    <Text className="text-muted text-base leading-6 mb-6">
                        If you use Fitpath in Guest Mode, your data is stored locally on your device. Clearing your app data or uninstalling the app will result in the permanent loss of this data.
                    </Text>

                    <View className="h-10" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
