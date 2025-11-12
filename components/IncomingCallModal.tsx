import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface IncomingCallModalProps {
    visible: boolean;
    callerName: string;
    callType: 'audio' | 'video';
    onAnswer: () => void;
    onReject: () => void;
}

// const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
//     visible,
//     callerName,
//     callType,
//     onAnswer,
//     onReject,
// }) => {
//     const [pulseAnim] = useState(new Animated.Value(1));
//     const [rippleAnim] = useState(new Animated.Value(0));
//     const rejectButtonStyle = { backgroundColor: '#f44336' };
//     const answerButtonStyle = { backgroundColor: '#4CAF50' };
//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];
//     const styles = createStyles(colors);

//     useEffect(() => {
//         if (visible) {
//             // Start pulsing animation
//             Animated.loop(
//                 Animated.sequence([
//                     Animated.timing(pulseAnim, {
//                         toValue: 1.1,
//                         duration: 1000,
//                         useNativeDriver: true,
//                     }),
//                     Animated.timing(pulseAnim, {
//                         toValue: 1,
//                         duration: 1000,
//                         useNativeDriver: true,
//                     }),
//                 ])
//             ).start();

//             // Start ripple animation
//             Animated.loop(
//                 Animated.timing(rippleAnim, {
//                     toValue: 1,
//                     duration: 2000,
//                     useNativeDriver: true,
//                 })
//             ).start();
//         } else {
//             pulseAnim.setValue(1);
//             rippleAnim.setValue(0);
//         }
//     }, [visible]);

//     const rippleScale = rippleAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: [1, 1.5],
//     });

//     const rippleOpacity = rippleAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: [0.7, 0],
//     });

//     return (
//         <Modal
//             visible={visible}
//             transparent
//             animationType="fade"
//             statusBarTranslucent
//         >
//             <View style={styles.container}>
//                 {Platform.OS === 'ios' ? (
//                     <BlurView intensity={50} style={StyleSheet.absoluteFill} />
//                 ) : (
//                     <View style={styles.androidBlur} />
//                 )}

//                 <View style={styles.content}>
//                     {/* Caller Avatar with Ripple Effect */}
//                     <View style={styles.avatarContainer}>
//                         {/* Animated Ripples */}
//                         <Animated.View
//                             style={[
//                                 styles.ripple,
//                                 {
//                                     transform: [{ scale: rippleScale }],
//                                     opacity: rippleOpacity,
//                                 },
//                             ]}
//                         />
//                         <Animated.View
//                             style={[
//                                 styles.ripple,
//                                 {
//                                     transform: [{ scale: rippleScale }],
//                                     opacity: rippleOpacity,
//                                 },
//                             ]}
//                         />

//                         {/* Avatar */}
//                         <Animated.View
//                             style={[
//                                 styles.avatar,
//                                 {
//                                     transform: [{ scale: pulseAnim }],
//                                 },
//                             ]}
//                         >
//                             <Ionicons name="person" size={80} color="#fff" />
//                         </Animated.View>
//                     </View>

//                     {/* Caller Info */}
//                     <Text style={styles.callerName}>{callerName}</Text>
//                     <View style={styles.callTypeContainer}>
//                         <Ionicons
//                             name={callType === 'video' ? 'videocam' : 'call'}
//                             size={20}
//                             color="#4CAF50"
//                         />
//                         <Text style={styles.callType}>
//                             Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
//                         </Text>
//                     </View>

//                     {/* Call Actions */}
//                     <View style={styles.actionsContainer}>
//                         {/* Reject Button */}
//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.rejectButton]}
//                             onPress={onReject}
//                             activeOpacity={0.8}
//                         >
//                             <View style={[styles.buttonContent, rejectButtonStyle]}>
//                                 <Ionicons name="close" size={32} color="#fff" />
//                             </View>
//                             <Text style={styles.actionLabel}>Decline</Text>
//                         </TouchableOpacity>

//                         {/* Answer Button */}
//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.answerButton]}
//                             onPress={onAnswer}
//                             activeOpacity={0.8}
//                         >
//                             <View style={[styles.buttonContent, answerButtonStyle]}>
//                                 <Ionicons name="call" size={32} color="#fff" />
//                             </View>
//                             <Text style={styles.actionLabel}>Accept</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    androidBlur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    avatarContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#4CAF50',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.placeholder,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    callerName: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    callTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 60,
    },
    callType: {
        fontSize: 18,
        color: '#4CAF50',
        marginLeft: 8,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: 350,
    },
    actionButton: {
        alignItems: 'center',
    },
    buttonContent: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    rejectButton: {
        opacity: 1,
    },
    answerButton: {
        opacity: 1,
    },
    actionLabel: {
        fontSize: 16,
        color: colors.textTertiary,
        fontWeight: '600',
    },
});

// Fix for nested button styles
const rejectButtonStyle = {
    backgroundColor: '#f44336',
};

const answerButtonStyle = {
    backgroundColor: '#4CAF50',
};

// Export with corrected styles
// export default IncomingCallModal;

// Updated component with fixed button styles
export const IncomingCallModalFixed: React.FC<IncomingCallModalProps> = ({
    visible,
    callerName,
    callType,
    onAnswer,
    onReject,
}) => {
    const [pulseAnim] = useState(new Animated.Value(1));
    const [rippleAnim] = useState(new Animated.Value(0));
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(1000),
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.timing(rippleAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [visible]);

    const rippleScale = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    const rippleOpacity = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 0],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.container}>
                {Platform.OS === 'ios' ? (
                    <BlurView intensity={50} style={StyleSheet.absoluteFill} />
                ) : (
                    <View style={styles.androidBlur} />
                )}

                <View style={styles.content}>
                    <View style={styles.avatarContainer}>
                        <Animated.View
                            style={[
                                styles.ripple,
                                {
                                    transform: [{ scale: rippleScale }],
                                    opacity: rippleOpacity,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.ripple,
                                {
                                    transform: [{ scale: rippleScale }],
                                    opacity: rippleOpacity,
                                },
                            ]}
                        />

                        <Animated.View
                            style={[
                                styles.avatar,
                                {
                                    transform: [{ scale: pulseAnim }],
                                },
                            ]}
                        >
                            <Ionicons name="person" size={80} color="#fff" />
                        </Animated.View>
                    </View>

                    <Text style={styles.callerName}>{callerName}</Text>
                    <View style={styles.callTypeContainer}>
                        <Ionicons
                            name={callType === 'video' ? 'videocam' : 'call'}
                            size={20}
                            color="#4CAF50"
                        />
                        <Text style={styles.callType}>
                            Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
                        </Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onReject}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.buttonContent, rejectButtonStyle]}>
                                <Ionicons name="close" size={32} color="#fff" />
                            </View>
                            <Text style={styles.actionLabel}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onAnswer}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.buttonContent, answerButtonStyle]}>
                                <Ionicons name="call" size={32} color="#fff" />
                            </View>
                            <Text style={styles.actionLabel}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};