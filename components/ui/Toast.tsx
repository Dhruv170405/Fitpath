import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    show: (message: string, type?: ToastType) => void;
    hide: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const insets = useSafeAreaInsets();

    const show = useCallback((msg: string, t: ToastType = 'info') => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setMessage(msg);
        setType(t);
        setVisible(true);

        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, 3000);
    }, []);

    const hide = useCallback(() => {
        setVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} color="#22c55e" />;
            case 'error': return <AlertCircle size={24} color="#ef4444" />;
            default: return <Info size={24} color="#3b82f6" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-green-500';
            case 'error': return 'border-red-500';
            default: return 'border-blue-500';
        }
    }

    return (
        <ToastContext.Provider value={{ show, hide }}>
            {children}
            {visible && (
                <View className="absolute top-0 left-0 right-0 z-50 items-center" style={{ marginTop: insets.top + 10 }} pointerEvents="box-none">
                    <Animated.View
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                        className={`bg-card w-[90%] flex-row items-center p-4 rounded-xl shadow-lg border-l-4 ${getBorderColor()}`}
                    >
                        {getIcon()}
                        <Text className="flex-1 ml-3 text-white font-medium">{message}</Text>
                        <X size={20} color="#9ca3af" onPress={hide} />
                        {/* Note: onPress on X won't work well if View has pointer-events-none. 
                            We should move pointer-events-none to container but enable for toast. 
                            However, positioning absolute on top of everything might block touches if not careful.
                            For now, let's remove pointer-events-none from container and making sure it doesn't block full screen.
                        */}
                    </Animated.View>
                </View>
            )}
        </ToastContext.Provider>
    );
};
