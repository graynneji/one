import { Typography } from '@/constants/Typography';
import { capitalizeFirstLetter } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    PanResponder,
    PanResponderGestureState,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Avatar from './Avatar';

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = -240;
const VELOCITY_THRESHOLD = 0.5;

const SwipeablePatientCard: React.FC<any> = ({
    patient,
    onPress,
    onArchive,
    onViewNotes,
    onViewInfo,
    isArchived,
    getLastMessage,
    getLastMessageTime,
    getUnreadCount,
    isNavigating,
    colors,
    styles
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isOpen, setIsOpen] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only activate if horizontal swipe is detected
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                const hasMovedEnough = Math.abs(gestureState.dx) > 5;
                return isHorizontalSwipe && hasMovedEnough;
            },
            onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                // Prevent interference with nested touchables
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderGrant: () => {
                setIsSwiping(true);
                // Stop any ongoing animations
                translateX.stopAnimation();
            },
            onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
                const { dx } = gestureState;

                // Only allow left swipe
                if (dx < 0) {
                    // Calculate new position with resistance
                    let newValue = dx;

                    // Add resistance at the edges
                    if (dx < MAX_SWIPE) {
                        const overflow = Math.abs(dx - MAX_SWIPE);
                        newValue = MAX_SWIPE - (overflow * 0.2); // Resistance factor
                    }

                    translateX.setValue(newValue);
                } else if (dx > 0 && isOpen) {
                    // Allow closing the swipe with right gesture
                    const closeValue = Math.min(dx - MAX_SWIPE, 0);
                    translateX.setValue(closeValue);
                } else if (dx > 0 && !isOpen) {
                    // Add resistance when swiping right from closed position
                    translateX.setValue(dx * 0.1);
                }
            },
            onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
                const { dx, vx } = gestureState;

                setIsSwiping(false);

                // Determine if should open or close based on position and velocity
                const shouldOpen = dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD;
                const shouldClose = (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) && isOpen;

                if (shouldOpen) {
                    // Open the swipe actions
                    openSwipe();
                } else if (shouldClose || (!isOpen && dx > 0)) {
                    // Close the swipe actions
                    closeSwipe();
                } else if (isOpen) {
                    // Keep it open
                    openSwipe();
                } else {
                    // Keep it closed
                    closeSwipe();
                }
            },
            onPanResponderTerminate: () => {
                // Handle gesture termination (e.g., another gesture takes over)
                setIsSwiping(false);
                if (isOpen) {
                    openSwipe();
                } else {
                    closeSwipe();
                }
            },
        })
    ).current;

    const openSwipe = () => {
        setIsOpen(true);
        Animated.spring(translateX, {
            toValue: MAX_SWIPE,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
            velocity: 0,
        }).start();
    };

    const closeSwipe = () => {
        setIsOpen(false);
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
            velocity: 0,
        }).start();
    };

    const handleAction = (action: () => void) => {
        closeSwipe();
        // Add slight delay to allow close animation to start
        setTimeout(() => {
            action();
        }, 100);
    };

    const lastMessage = getLastMessage(patient);
    const unreadCount = getUnreadCount(patient);
    const truncatedMessage = lastMessage.length > 50
        ? lastMessage.substring(0, 50) + '...'
        : lastMessage;
    // const unreadCount = patient.patient_notes?.length || 0;
    const notesCount = patient?.patient_notes?.length || 0;

    return (
        <View style={styles.swipeContainer}>
            {/* Swipe Actions - Three buttons */}
            <View style={styles.swipeActionsContainer}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleAction(() => onViewInfo())}
                    style={[styles.swipeAction, { backgroundColor: '#007AFF' }]}
                >
                    <Ionicons name="information-circle" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleAction(() => onViewNotes())}
                    style={[styles.swipeAction, { backgroundColor: '#34C759' }]}
                >
                    <Ionicons name="document-text" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Notes</Text>
                    {notesCount > 0 && (
                        <View style={styles.notesCountBadge}>
                            <Text style={styles.notesCountText}>{notesCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleAction(() => onArchive())}
                    style={[styles.swipeAction, { backgroundColor: colors.danger }]}
                >
                    <Ionicons
                        name={isArchived ? "apps" : "archive"}
                        size={24}
                        color="#fff"
                    />
                    <Text style={styles.swipeActionText}>
                        {isArchived ? 'Unarchive' : 'Archive'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Animated.View
                style={[
                    styles.patientCardWrapper,
                    {
                        transform: [{ translateX }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    style={styles.patientCard}
                    onPress={onPress}
                    disabled={isSwiping || isNavigating}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarContainer}>
                        {/* <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                            </Text>
                        </View> */}
                        <Avatar profile_picture={patient?.profile_picture} />
                        {patient.is_subscribed && (
                            <View style={[
                                styles.onlineIndicator,
                                { backgroundColor: colors.online }
                            ]} />
                        )}
                    </View>

                    <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                            <Text style={styles.patientName} numberOfLines={1}>
                                {capitalizeFirstLetter(patient.name) || 'Patient'}
                            </Text>
                            <Text style={styles.messageTime}>
                                {getLastMessageTime(patient)}
                            </Text>
                        </View>
                        <View style={styles.messagePreview}>
                            <Text style={[styles.lastMessage, { fontFamily: unreadCount ? Typography.body.semiBold : Typography.body.regular }]} numberOfLines={1}>
                                {truncatedMessage}
                            </Text>
                            {unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        {/* Patient metadata badges */}
                        <View style={styles.patientMetadata}>
                            {patient.session_count > 0 && (
                                <View style={[styles.metadataBadge, { color: '#00C49A' }]}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={10}
                                        // color={colors.textSecondary}
                                        color='#00C49A'
                                    />
                                    <Text style={[styles.metadataText, { color: '#00C49A' }]}>
                                        {patient.session_count} sessions
                                    </Text>
                                </View>
                            )}
                            {notesCount > 0 && (
                                <View style={styles.metadataBadge}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={10}
                                        // color={colors.textSecondary}
                                        color='#8E7AB5'
                                    />
                                    <Text style={[styles.metadataText, { color: '#8E7AB5' }]}>
                                        {notesCount} notes
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default React.memo(SwipeablePatientCard);