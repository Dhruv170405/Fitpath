import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        console.log('Attempting signup with:', email);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        console.log('Signup response:', { data, error });

        if (error) {
            Alert.alert('Error', error.message);
            setLoading(false);
            return;
        }

        // If session exists, user is auto-logged in (email confirmation disabled)
        if (data.session) {
            console.log('Session exists, redirecting to onboarding');
            // Redirect to onboarding to collect user info
            router.replace('/(auth)/onboarding');
            return;
        }

        // If user exists but no session, might need confirmation
        if (data.user && !data.session) {
            Alert.alert('Check Email', 'Email confirmation may still be required. Check your Supabase settings.');
            setLoading(false);
            return;
        }

        // If no session, email confirmation is required
        Alert.alert('Success', 'Please check your inbox for email verification!');
        router.back();
        setLoading(false);
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-6 justify-center">
            <Animated.View entering={FadeInUp.delay(200).duration(1000)} className="items-center mb-10">
                <Text className="text-primary text-4xl font-extrabold tracking-tighter">Fitpath</Text>
                <Text className="text-muted text-lg mt-2">Start your journey today.</Text>
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
                        title="Create Account"
                        onPress={signUpWithEmail}
                        loading={loading}
                    />
                </View>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-muted">Already have an account? </Text>
                    <Link href="/" asChild>
                        <Text className="text-primary font-bold">Sign In</Text>
                    </Link>
                </View>

                <View className="flex-row justify-center mt-6">
                    <Link href="/privacy-policy" asChild>
                        <Text className="text-xs text-muted text-center">
                            By signing up, you agree to our{' '}
                            <Text className="text-primary underline">Privacy Policy</Text>
                        </Text>
                    </Link>
                </View>
            </Animated.View>
        </SafeAreaView >
    );
}
