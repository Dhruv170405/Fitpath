type AnalyticsEvent = 'App Opened' | 'Login Success' | 'Guest Mode Activated' | 'Sign Up Success' | 'Page View';

class AnalyticsService {
    private static instance: AnalyticsService;

    private constructor() { }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    public trackEvent(event: AnalyticsEvent, properties?: Record<string, any>) {
        if (__DEV__) {
            console.log(`[Analytics] Event: ${event}`, properties || '');
        }
        // TODO: Integrate PostHog / Firebase / Segment here
    }

    public identifyUser(userId: string) {
        if (__DEV__) {
            console.log(`[Analytics] Identify: ${userId}`);
        }
    }

    public reset() {
        if (__DEV__) {
            console.log(`[Analytics] Reset`);
        }
    }
}

export const analytics = AnalyticsService.getInstance();
