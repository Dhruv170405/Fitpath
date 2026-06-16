import { Dumbbell, Info, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../lib/theme';
import { Exercise } from '../lib/workoutService';

// Exercise GIF URLs - Using verified working URLs from fitnessprogramer.com
const EXERCISE_GIFS: Record<string, string> = {
    // Chest
    'Barbell Bench Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    'Incline Dumbbell Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif',
    'Decline Bench Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif', // Proxy
    'Incline Barbell Bench Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif',
    'Pec Deck Fly': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif',
    'Dumbbell Flyes': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
    'Cable Crossover': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif',
    'Push Ups': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
    'Machine Chest Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif', // Proxy
    'Chest Dips': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif',
    'Decline Barbell Bench Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/03/Decline-Barbell-Bench-Press.gif',

    // Back
    'Deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    'Pull Ups': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
    'Barbell Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    'Lat Pulldown': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
    'Seated Cable Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
    'T-Bar Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/04/t-bar-rows.gif',
    'Single Arm Dumbbell Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif',
    'Single Arm Cable Row': 'https://fitnessprogramer.com/wp-content/uploads/2022/02/Single-Arm-Twisting-Seated-Cable-Row.gif',
    'Cable Pullover': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rope-Straight-Arm-Pulldown.gif',
    'Face Pulls': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',

    // Legs
    'Barbell Back Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
    'Front Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/front-squat.gif',
    'Leg Press': 'https://fitnessprogramer.com/wp-content/uploads/2015/11/Leg-Press.gif',
    'Romanian Deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif',
    'Bulgarian Split Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Dumbbell-Bulgarian-Split-Squat.gif',
    'Leg Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif',
    'Leg Extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
    'Walking Lunges': 'https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif',
    'Calf Raises': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Lever-Seated-Calf-Raise.gif',
    'Hip Thrust': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif',

    // Shoulders
    'Overhead Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/07/Barbell-Standing-Military-Press.gif',
    'Dumbbell Shoulder Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
    'Lateral Raises': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    'Front Raises': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif',
    'Rear Delt Flyes': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Machine-Flys.gif',
    'Arnold Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif',
    'Upright Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif',
    'Shrugs': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shrug.gif',
    'Cable Lateral Raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif',
    'Reverse Pec Deck': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Machine-Flys.gif',

    // Biceps
    'Barbell Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
    'Dumbbell Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif',
    'Hammer Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
    'Preacher Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Lever-Preacher-Curl.gif',
    'Incline Dumbbell Curl': 'https://fitnessprogramer.com/wp-content/uploads/2022/02/Flexor-Incline-Dumbbell-Curls.gif',
    'Cable Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/cable-curl.gif',

    // Triceps
    'Tricep Pushdown': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif',
    'Skull Crushers': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Skull-Crusher.gif',
    'Close Grip Bench Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif',
    'Overhead Tricep Extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif',
    'Tricep Dips': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif',
    'Diamond Push Ups': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Diamond-Push-up.gif',

    // Core
    'Plank': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif',
    'Crunches': 'https://fitnessprogramer.com/wp-content/uploads/2015/11/Crunch.gif',
    'Leg Raises': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif',
    'Russian Twists': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif',
    'Ab Wheel Rollout': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Ab-Wheel-Rollout.gif',
    'Cable Woodchops': 'https://fitnessprogramer.com/wp-content/uploads/2022/05/Twist.gif',

    // Cardio
    'Jump Rope': 'https://fitnessprogramer.com/wp-content/uploads/2023/10/Skip-Jump-Rope.gif',
    'Treadmill': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Treadmill-.gif',
    'Stair Climber': 'https://fitnessprogramer.com/wp-content/uploads/2021/10/Walking-on-Stepmill.gif',

    // New Additions 
    'Cable Crunch': 'https://fitnessprogramer.com/wp-content/uploads/2015/11/Crunch.gif', // Proxy
    'Hanging Leg Raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif', // Proxy
    'Pallof Press': 'https://fitnessprogramer.com/wp-content/uploads/2022/05/Twist.gif', // Proxy
    'Farmer\'s Walk': 'https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif', // Proxy
    'Wrist Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Wrist-Curl.gif',
    'Reverse Wrist Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Wrist-Curl.gif', // Proxy
    'Shoulder + Hip Mobility': '', // Let fallback handle this
    'Hack Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sled-Hack-Squat.gif',
    'Pendulum Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sled-Hack-Squat.gif', // Proxy with Hack Squat if specific not found
    'Standing Calf Raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Lever-Seated-Calf-Raise.gif', // Proxy
    'Close-Grip Machine Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Press-Machine.gif',
    'EZ-Bar Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif', // Proxy
    'Machine Lateral Raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif', // Proxy
    'Chest-Supported Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif', // Proxy
    'Neutral-Grip Lat Pulldown': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif', // Proxy using standard
};

// Exercise instructions
const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
    'Barbell Bench Press': [
        'Lie flat on the bench with feet on the floor',
        'Grip the bar slightly wider than shoulder-width',
        'Unrack and lower the bar to mid-chest',
        'Press up explosively until arms are extended',
        'Keep your back slightly arched and core tight'
    ],
    'Pull Ups': [
        'Hang from the bar with an overhand grip',
        'Grip slightly wider than shoulder-width',
        'Pull yourself up until chin is over the bar',
        'Lower with control to full arm extension',
        'Avoid swinging or using momentum'
    ],
    'Barbell Back Squat': [
        'Position bar on upper traps, not neck',
        'Stand with feet shoulder-width apart',
        'Brace core and descend by bending knees and hips',
        'Go down until thighs are parallel or below',
        'Drive through heels to stand back up'
    ],
    'Deadlift': [
        'Stand with feet hip-width apart, bar over midfoot',
        'Hinge at hips and grip bar outside knees',
        'Keep back flat, chest up, shoulders over bar',
        'Drive through heels and extend hips and knees',
        'Lock out at top, then reverse the movement'
    ],
    'Overhead Press': [
        'Stand with feet hip-width apart',
        'Hold bar at shoulder height, grip just outside shoulders',
        'Brace core and press bar straight overhead',
        'Lock out arms and bring head through at top',
        'Lower with control back to shoulders'
    ],
    'Lateral Raises': [
        'Stand with dumbbells at your sides',
        'Keep a slight bend in your elbows',
        'Raise arms out to sides until parallel to floor',
        'Pause briefly at the top',
        'Lower slowly with control'
    ],
    'Tricep Pushdown': [
        'Stand facing the cable machine',
        'Grip the bar with palms facing down',
        'Keep elbows pinned to your sides',
        'Push the bar down until arms are extended',
        'Slowly return to starting position'
    ],
    'Barbell Curl': [
        'Stand with feet shoulder-width apart',
        'Hold barbell with underhand grip',
        'Keep elbows close to your sides',
        'Curl the weight up to shoulder level',
        'Lower slowly, fully extending arms'
    ],
    'Incline Barbell Bench Press': [
        'Lie on an incline bench set to 30-45 degrees',
        'Grip the bar slightly wider than shoulder-width',
        'Unrack and lower the bar to your upper chest',
        'Press the bar up until arms are fully extended',
        'Lower the bar back down with control'
    ],
    'Pec Deck Fly': [
        'Sit on the machine with your back flat against the pad',
        'Gulp handles or pads with forearms vertical',
        'Bring your arms together in front of your chest',
        'Squeeze your chest muscles at the peak contraction',
        'Slowly return to the starting position'
    ],
    'Cable Crunch': [
        'Kneel below a high pulley with a rope attachment',
        'Grasp the rope and lower it behind your head',
        'Crunch your body downward, bringing elbows to thighs',
        'Pause and squeeze your abs at the bottom',
        'Slowly return to the starting position'
    ],
    'Hanging Leg Raise': [
        'Hang from a pull-up bar with an overhand grip',
        'Keep legs straight or slightly bent',
        'Raise your legs until they are parallel to the floor',
        'Lower them slowly without swinging',
        'Keep your core tight throughout'
    ],
    'Pallof Press': [
        'Stand sideways to a cable machine, holding handle with both hands',
        'Step away to create tension',
        'Press the handle partially out, resisting the pull',
        'Hold for a moment, then return to your chest',
        'Keep your core engaged to prevent rotation'
    ],
    'Farmer\'s Walk': [
        'Hold a heavy dumbbell or kettlebell in each hand',
        'Keep your shoulders back and chest up',
        'Walk forward with short, controlled steps',
        'Maintain a strong grip and upright posture',
        'Breathe naturally'
    ],
    'Wrist Curl': [
        'Sit on a bench with forearms on your thighs',
        'Hold a barbell or dumbbells with palms facing up',
        'Curl your wrists upward',
        'Lower the weight back down',
        'Focus on the forearm muscles'
    ],
    'Reverse Wrist Curl': [
        'Sit on a bench with forearms on your thighs',
        'Hold a barbell or dumbbells with palms facing down',
        'Extension your wrists upward',
        'Lower the weight back down',
        'Focus on the forearm extensors'
    ],
    'Shoulder + Hip Mobility': [
        'Perform arm circles, varying size and direction',
        'Do leg swings, forward/backward and side-to-side',
        'Incorporate torso twists',
        'Perform hip circles',
        'Move through a full range of motion controlled'
    ],
    'Hack Squat': [
        'Place your back against the machine pad',
        'Place feet shoulder-width apart on the platform',
        'Lower the weight by bending knees',
        'Push back up through your heels',
        'Do not lock your knees at the top'
    ],
    'Pendulum Squat': [
        'Position yourself in the machine',
        'Lower yourself into a deep squat',
        'Drive back up to the starting position',
        'Keep your back flat against the pad',
        'Control the descent'
    ],
    'Standing Calf Raise': [
        'Stand on the edge of a step or machine platform',
        'Lower your heels as far as possible',
        'Raise your heels as high as possible',
        'Pause at the top for a squeeze',
        'Lower slowly'
    ],
    'Close-Grip Machine Press': [
        'Adjust the seat height so handles are at chest level',
        'Use a neutral or close grip',
        'Press the weight forward, focusing on triceps',
        'Return slowly to the start',
        'Keep elbows tucked in'
    ],
    'EZ-Bar Curl': [
        'Hold the EZ bar with an underhand grip',
        'Stand with feet shoulder-width apart',
        'Curl the bar up towards your chest',
        'Squeeze biceps at the top',
        'Lower slowly to the start'
    ],
    'Machine Lateral Raise': [
        'Sit in the machine and adjust the seat',
        'Place your elbows against the pads',
        'Raise your arms to the side until parallel',
        'Pause and squeeze shoulders',
        'Lower slowly'
    ],
    'Chest-Supported Row': [
        'Adjust chest pad so you can reach handles comfortably',
        'Pull the handles towards your waist',
        'Squeeze your shoulder blades together',
        'Return slowly to full extension',
        'Keep your chest against the pad'
    ],
    'Neutral-Grip Lat Pulldown': [
        'Attach a neutral grip handle or V-bar',
        'Sit down and secure your knees',
        'Pull the handle down to your upper chest',
        'Squeeze your lats',
        'Return slowly to the start'
    ],
};

interface ExerciseGuideModalProps {
    visible: boolean;
    exercise: Exercise | null;
    onClose: () => void;
}

export const ExerciseGuideModal = ({ visible, exercise, onClose }: ExerciseGuideModalProps) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset states when exercise changes
    useEffect(() => {
        if (exercise?.name) {
            setImageLoading(true);
            setImageError(false);
            setCurrentImageIndex(0);
        }
    }, [exercise?.name]);

    // Animate static images if a true GIF isn't available
    useEffect(() => {
        if (exercise?.images && exercise.images.length > 1 && (!exercise.name || !EXERCISE_GIFS[exercise.name])) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % exercise.images!.length);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [exercise?.name, exercise?.images]);

    if (!exercise) return null;

    const gifUrl = EXERCISE_GIFS[exercise.name];
    const isImageSequence = !gifUrl && exercise.images && exercise.images.length > 0;
    
    const instructions = EXERCISE_INSTRUCTIONS[exercise.name] || 
                         (exercise.description ? exercise.description.split('\n').filter(s => s.trim().length > 0) : null) || [
        'Keep proper form throughout the movement',
        'Control the weight on both lifting and lowering',
        'Breathe out during exertion, in during release',
        'Start with lighter weight to master the form',
        'Rest 60-90 seconds between sets'
    ];

    const getMuscleGroupColor = (group: string) => {
        const colors: Record<string, string> = {
            chest: '#EF4444',
            back: '#3B82F6',
            legs: '#22C55E',
            shoulders: '#F59E0B',
            arms: '#8B5CF6',
            core: '#06B6D4',
            cardio: '#F97316',
        };
        return colors[group?.toLowerCase()] || COLORS.primary;
    };

    const getMuscleGroupEmoji = (group: string) => {
        const emojis: Record<string, string> = {
            chest: '🏋️',
            back: '💪',
            legs: '🦵',
            shoulders: '🎯',
            arms: '💪',
            core: '🎯',
            cardio: '🏃',
        };
        return emojis[group?.toLowerCase()] || '🏋️';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-border mt-12">
                    <TouchableOpacity onPress={onClose} className="p-2">
                        <X color="white" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Exercise Guide</Text>
                    <View className="w-10" />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {/* Exercise Title */}
                    <View className="items-center mb-6">
                        <Text className="text-white text-2xl font-bold text-center">{exercise.name}</Text>
                        <View
                            className="px-3 py-1 rounded-full mt-2"
                            style={{ backgroundColor: getMuscleGroupColor(exercise.muscle_group) + '30' }}
                        >
                            <Text
                                className="font-bold capitalize"
                                style={{ color: getMuscleGroupColor(exercise.muscle_group) }}
                            >
                                {exercise.muscle_group}
                            </Text>
                        </View>
                    </View>

                    {/* GIF Container */}
                    <View className="bg-card rounded-2xl overflow-hidden mb-6 border border-border">
                        {((gifUrl || isImageSequence) && !imageError) ? (
                            <View style={{ minHeight: 280 }}>
                                {imageLoading && currentImageIndex === 0 && (
                                    <View
                                        className="absolute inset-0 items-center justify-center bg-card z-10"
                                        style={{ height: 280 }}
                                    >
                                        <ActivityIndicator size="large" color={COLORS.primary} />
                                        <Text className="text-muted mt-3">Loading exercise animation...</Text>
                                    </View>
                                )}
                                
                                {isImageSequence ? (
                                    exercise.images!.map((imgUrl, idx) => (
                                        <Image
                                            key={idx}
                                            source={{ uri: imgUrl }}
                                            style={{
                                                position: idx === 0 ? 'relative' : 'absolute',
                                                top: 0, left: 0, bottom: 0, right: 0,
                                                width: '100%',
                                                height: 280,
                                                opacity: currentImageIndex === idx ? 1 : 0,
                                                backgroundColor: '#1a1a1a'
                                            }}
                                            resizeMode="contain"
                                            onLoadStart={() => {
                                                if (idx === 0) setImageLoading(true);
                                                setImageError(false);
                                            }}
                                            onLoad={() => {
                                                if (idx === 0) setImageLoading(false);
                                            }}
                                            onError={() => {
                                                if (idx === 0) {
                                                    setImageLoading(false);
                                                    setImageError(true);
                                                }
                                            }}
                                        />
                                    ))
                                ) : (
                                    <Image
                                        source={{ uri: gifUrl! }}
                                        style={{
                                            width: '100%',
                                            height: 280,
                                            backgroundColor: '#1a1a1a'
                                        }}
                                        resizeMode="contain"
                                        onLoadStart={() => {
                                            setImageLoading(true);
                                            setImageError(false);
                                        }}
                                        onLoad={() => {
                                            setImageLoading(false);
                                        }}
                                        onError={() => {
                                            console.log('GIF load error for:', exercise.name, gifUrl);
                                            setImageLoading(false);
                                            setImageError(true);
                                        }}
                                    />
                                )}
                            </View>
                        ) : (
                            <View className="items-center justify-center py-10">
                                <Text className="text-6xl mb-3">{getMuscleGroupEmoji(exercise.muscle_group)}</Text>
                                <Dumbbell size={40} color={COLORS.muted} />
                                <Text className="text-muted mt-3 text-center px-4">
                                    {imageError ? 'Unable to load animation' : 'No animation available'}
                                </Text>
                                <Text className="text-muted text-sm mt-1">Follow the instructions below</Text>
                            </View>
                        )}
                    </View>

                    {/* Description - Removing this since we map description to instructions for API exercises now, but keeping for local ones if needed */}
                    {exercise.description && !EXERCISE_INSTRUCTIONS[exercise.name] && exercise.images === undefined && (
                        <View className="bg-card rounded-xl p-4 mb-6 border border-border">
                            <Text className="text-white leading-5">{exercise.description}</Text>
                        </View>
                    )}

                    {/* Instructions */}
                    <View className="mb-6">
                        <Text className="text-white font-bold text-lg mb-4">How to Perform</Text>
                        {instructions.map((instruction, index) => (
                            <View key={index} className="flex-row mb-3">
                                <View
                                    className="w-7 h-7 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <Text className="text-white font-bold text-sm">{index + 1}</Text>
                                </View>
                                <Text className="text-muted flex-1 leading-5">{instruction}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Tips */}
                    <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                        <Text className="text-primary font-bold mb-2">💡 Pro Tips</Text>
                        <Text className="text-muted leading-5">
                            • Focus on mind-muscle connection{'\n'}
                            • Don't sacrifice form for heavier weight{'\n'}
                            • Track your progress for progressive overload
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

// Workout Info Modal
interface WorkoutInfoModalProps {
    visible: boolean;
    workout: { name: string; description?: string; exercises?: any[] } | null;
    onClose: () => void;
}

export const WorkoutInfoModal = ({ visible, workout, onClose }: WorkoutInfoModalProps) => {
    if (!workout) return null;

    const getMuscleGroups = () => {
        if (!workout.exercises) return [];
        const groups = new Set(workout.exercises.map(e => e.exercise?.muscle_group || e.muscle_group || 'General'));
        return Array.from(groups);
    };

    const muscleGroups = getMuscleGroups();

    const getMuscleGroupColor = (group: string) => {
        const colors: Record<string, string> = {
            chest: '#EF4444',
            back: '#3B82F6',
            legs: '#22C55E',
            shoulders: '#F59E0B',
            arms: '#8B5CF6',
            core: '#06B6D4',
            cardio: '#F97316',
        };
        return colors[group?.toLowerCase()] || COLORS.primary;
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 items-center justify-center p-4">
                <View className="bg-card w-full rounded-2xl max-h-[80%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-border">
                        <Info color={COLORS.primary} size={24} />
                        <Text className="text-white font-bold text-lg">Workout Info</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color={COLORS.muted} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {/* Workout Title */}
                        <Text className="text-white text-2xl font-bold mb-2">{workout.name}</Text>
                        <Text className="text-muted mb-6">{workout.description || 'Custom workout routine'}</Text>

                        {/* Muscle Groups */}
                        {muscleGroups.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-white font-bold text-lg mb-3">Target Muscles</Text>
                                <View className="flex-row flex-wrap">
                                    {muscleGroups.map((group, index) => (
                                        <View
                                            key={index}
                                            className="px-3 py-2 rounded-lg mr-2 mb-2"
                                            style={{ backgroundColor: getMuscleGroupColor(group as string) + '30' }}
                                        >
                                            <Text
                                                className="font-bold capitalize"
                                                style={{ color: getMuscleGroupColor(group as string) }}
                                            >
                                                {group}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Exercises List */}
                        {workout.exercises && workout.exercises.length > 0 && (
                            <View>
                                <Text className="text-white font-bold text-lg mb-3">
                                    Exercises ({workout.exercises.length})
                                </Text>
                                {workout.exercises.map((ex, index) => (
                                    <View key={index} className="flex-row items-center py-3 border-b border-border">
                                        <Text className="text-muted w-6">{index + 1}.</Text>
                                        <Text className="text-white flex-1">{ex.exercise?.name || ex.name || 'Exercise'}</Text>
                                        <Text className="text-primary font-bold">{ex.sets} × {ex.target_reps || ex.reps}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
