import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { analytics } from '../../lib/analytics';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInAsGuest } = useAuth();
    const toast = useToast();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.show(error.message, 'error');
            setLoading(false);
        } else {
            analytics.trackEvent('Login Success');
        }
        // Auth state listener in _layout will handle redirection
        setLoading(false);
    }

    async function continueAsGuest() {
        setLoading(true);
        try {
            await signInAsGuest();
            analytics.trackEvent('Guest Mode Activated');
            // Context will update state and _layout will handle redirect
        } catch (error) {
            console.error(error);
            toast.show('Failed to initiate guest session', 'error');
            setLoading(false);
        }
        setLoading(false);
    }


    return (
        <SafeAreaView className="flex-1 bg-background px-6 justify-center">
            <Animated.View entering={FadeInUp.delay(200).duration(1000)} className="items-center mb-10">
                <Text className="text-primary text-4xl font-extrabold tracking-tighter">Fitpath</Text>
                <Text className="text-muted text-lg mt-2">Welcome back, athlete.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(1000)} className="space-y-6">
                <Input
                    label="Email"
                    placeholder="user@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View className="pt-4">
                    <Button
                        title="Sign In"
                        onPress={signInWithEmail}
                        loading={loading}
                    />
                </View>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-muted">Don't have an account? </Text>
                    <Link href="/sign-up" asChild>
                        <Text className="text-primary font-bold">Sign Up</Text>
                    </Link>
                </View>

                <View className="pt-2">
                    <Button
                        title="Continue as Guest"
                        onPress={continueAsGuest}
                        variant="ghost"
                        loading={loading}
                    />
                </View>
            </Animated.View>
        </SafeAreaView >
    );
}
