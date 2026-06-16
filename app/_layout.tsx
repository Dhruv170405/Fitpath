import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { ToastProvider } from '../components/ui/Toast';
import '../global.css';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { NetworkProvider } from '../lib/NetworkContext';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { COLORS } from '../lib/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { session, isGuest, loading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicRoute = segments[0] === 'privacy-policy';

    // Wait until we know the onboarding status if there's a session
    if (session && isOnboarded === null) return;

    if (session) {
      if (isOnboarded) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      } else {
        const inOnboarding = segments[0] === '(auth)' && segments[1] === 'onboarding';
        if (!inOnboarding) {
          router.replace('/(auth)/onboarding');
        }
      }
    } else if (isGuest && inAuthGroup) {
      // User is guest, redirect to home if on auth screen
      router.replace('/(tabs)');
    } else if (!session && !isGuest && !inAuthGroup && !isPublicRoute) {
      // Not logged in, not guest, and trying to access protected route -> redirect to login
      router.replace('/(auth)');
    }
  }, [session, isGuest, loading, isOnboarded, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View entering={FadeIn.duration(800)} style={{ alignItems: 'center' }}>
          {/* App Logo/Name */}
          <View className="mb-6 items-center">
            <View className="h-20 w-20 bg-primary/20 rounded-3xl items-center justify-center mb-4 rotate-12">
              <FontAwesome name="bolt" size={40} color={COLORS.primary} />
            </View>
            <Text className="text-white text-4xl font-bold tracking-tighter">
              Fit<Text style={{ color: COLORS.primary }}>Path</Text>
            </Text>
            <Text className="text-muted text-sm mt-2 font-medium tracking-wide uppercase">
              Your Fitness. Your Journey.
            </Text>
          </View>

          {/* Loading Indicator */}
          <ActivityIndicator size="large" color={COLORS.primary} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineIndicator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="workout/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings/edit-profile" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="exercises/index" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-workout/index" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
