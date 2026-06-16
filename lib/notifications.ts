import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true, // iOS 16+
        shouldShowList: true,   // iOS 16+
    }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
    if (Platform.OS === 'android') {
        // Channels MUST be set up before scheduling on Android.
        await Notifications.setNotificationChannelAsync('default', {
            name: 'General',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync('workout-reminders', {
            name: 'Workout Reminders',
            description: 'Daily reminders to keep you consistent with your fitness goals.',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 300, 200, 300],
            lightColor: '#F97316',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: false,
                allowSound: true,
            },
        });
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

// 21 motivational quotes — rotate through them so each day feels different
const MOTIVATIONAL_REMINDERS = [
    { title: "Time to Grind! 💪", body: "Champions are made in the moments they want to quit. Don't stop now." },
    { title: "Fitpath Daily Reminder 🔥", body: "Your only competition is who you were yesterday. Let's level up." },
    { title: "Rise & Grind! 🚀", body: "The harder you work today, the stronger you'll be tomorrow." },
    { title: "Stay Consistent! ⚡", body: "You don't have to be extreme, just consistent. Show up today." },
    { title: "Let's Do This! 🏋️", body: "Small progress is still progress. One workout at a time." },
    { title: "Discipline = Freedom 🛡️", body: "The body achieves what the mind believes. Your workout is waiting." },
    { title: "Feel the Energy! 🔋", body: "Feeling tired? A workout is the best cure. Let's move!" },
    { title: "Invest in Yourself! 💎", body: "Every rep, every set is an investment in the best version of you." },
    { title: "Sweat & Shine ✨", body: "Pain is temporary. The pride of finishing is forever. Go train!" },
    { title: "No Days Off 🏆", body: "Don't wish for a good body. Work for it. Today is the day." },
    { title: "Fitpath Reminder 📈", body: "Track your progress. Beat your personal best. You've got this!" },
    { title: "Consistency is Key 🔑", body: "It gets easier. But first, you have to make yourself do it. Go!" },
    { title: "You Got This! 💥", body: "A one-hour workout is just 4% of your day. No excuses!" },
    { title: "Push Your Limits! 🌟", body: "The weight you lift today is the weakness you eliminate forever." },
    { title: "Stay Strong! 🦁", body: "Don't count the days. Make the days count. Workout time!" },
    { title: "Move Your Body! 🏃", body: "Motion creates emotion. Start moving and feel the difference." },
    { title: "Built Different 🔱", body: "While others rest, you improve. That's how champions are made." },
    { title: "Get After It! 🎯", body: "Focus, grind, succeed. Your workout won't do itself." },
    { title: "Progressive Overload 📊", body: "Lift a little more than last time. That's how you grow stronger." },
    { title: "Mindset Matters 🧠", body: "Your body can handle almost anything. It's your mind you have to convince." },
    { title: "Be Unstoppable! ⚡️", body: "Every workout is progress. Even on bad days, showing up wins." },
];

// How many days to schedule ahead. iOS allows max 64 scheduled notifications;
// we use 60 so there's headroom for other app notifications.
const DAYS_TO_SCHEDULE = 60;

/**
 * Schedules 60 daily notifications (one per day starting tomorrow) each with a
 * rotating motivational message. Using explicit calendar-date triggers is the
 * most reliable cross-platform approach — a single repeating DAILY trigger works
 * but shows the same message every day forever.
 *
 * Call this whenever the user enables reminders OR changes the time.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
    // Always cancel first to avoid duplicates
    await cancelAllNotifications();

    try {
        // Shuffle the message list so the rotation order is different each time
        // the user saves their settings — adds variety without complexity.
        const shuffled = [...MOTIVATIONAL_REMINDERS].sort(() => 0.5 - Math.random());

        const now = new Date();

        for (let i = 0; i < DAYS_TO_SCHEDULE; i++) {
            // Calculate the target date for this notification (starting from tomorrow)
            const triggerDate = new Date(now);
            triggerDate.setDate(now.getDate() + i + 1);
            triggerDate.setHours(hour, minute, 0, 0);

            const reminder = shuffled[i % shuffled.length];

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: reminder.title,
                    body: reminder.body,
                    sound: 'default',
                    // Android: attach to the high-priority channel for reliable delivery
                    ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
                },
                trigger: {
                    type: SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
            });
        }

        console.log(`✅ Scheduled ${DAYS_TO_SCHEDULE} workout reminders at ${hour}:${String(minute).padStart(2, '0')}`);
        return true;
    } catch (error) {
        console.error('Error scheduling notifications:', error);
        return false;
    }
}

export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Returns how many reminder notifications are still pending.
 * Useful to decide if a top-up is needed when the user opens the app.
 */
export async function getRemainingReminderCount(): Promise<number> {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return all.filter(n => n.content.sound !== null).length;
}
