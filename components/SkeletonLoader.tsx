import React from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

// Skeleton loading component
const SkeletonLoader: React.FC = () => {
    const shimmerValue = React.useRef(new Animated.Value(0)).current;
    const fadeValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Fade in animation
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Shimmer animation
        const shimmerAnimation = Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );

        shimmerAnimation.start();

        return () => {
            shimmerAnimation.stop();
        };
    }, []);

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeValue }
                ]}
            >
                {/* Header Skeleton */}
                <View style={styles.headerSkeleton}>
                    <View style={styles.skeletonItem}>
                        {/* <View style={styles.skeletonAvatar} /> */}
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                    <View style={[styles.skeletonItem, styles.skeletonTitle]}>
                        <View style={styles.skeletonLine} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                    <View style={[styles.skeletonItem, styles.skeletonSubtitle]}>
                        <View style={styles.skeletonLineSmall} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Content Cards Skeleton */}
                <View style={styles.cardsSkeleton}>
                    {[...Array(3)].map((_, index) => (
                        <View key={index} style={styles.skeletonCard}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.skeletonItem, styles.cardTitle]}>
                                    <View style={styles.skeletonLine} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            {
                                                transform: [{ translateX }],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.skeletonItem}>
                                    <View style={styles.skeletonBadge} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            {
                                                transform: [{ translateX }],
                                            },
                                        ]}
                                    />
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.skeletonItem}>
                                    <View style={[styles.skeletonLine, { width: '90%' }]} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            {
                                                transform: [{ translateX }],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.skeletonItem}>
                                    <View style={[styles.skeletonLine, { width: '70%' }]} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            {
                                                transform: [{ translateX }],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.skeletonItem}>
                                    <View style={[styles.skeletonLineSmall, { width: '50%' }]} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            {
                                                transform: [{ translateX }],
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bottom Action Skeleton */}
                <View style={styles.bottomSkeleton}>
                    <View style={styles.skeletonItem}>
                        {/* <View style={styles.skeletonButton} /> */}
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Loading indicator */}
                <View style={styles.loadingIndicator}>
                    <LoadingDots />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

// Loading dots component
const LoadingDots: React.FC = () => {
    const dot1 = React.useRef(new Animated.Value(0.3)).current;
    const dot2 = React.useRef(new Animated.Value(0.3)).current;
    const dot3 = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        const createAnimation = (value: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(value, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );

        const animation1 = createAnimation(dot1, 0);
        const animation2 = createAnimation(dot2, 200);
        const animation3 = createAnimation(dot3, 400);

        animation1.start();
        animation2.start();
        animation3.start();

        return () => {
            animation1.stop();
            animation2.stop();
            animation3.stop();
        };
    }, []);

    return (
        <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
    );
};

// Simple spinner alternative
export const SimpleSpinner: React.FC = () => {
    const spinValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        );
        spin.start();
        return () => spin.stop();
    }, []);

    const rotate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.centerContent}>
                <Animated.View
                    style={[
                        styles.simpleSpinner,
                        { transform: [{ rotate }] },
                    ]}
                />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header Skeleton
    headerSkeleton: {
        marginBottom: 32,
        paddingTop: 20,
    },

    // Skeleton Items
    skeletonItem: {
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 12,
    },
    // skeletonAvatar: {
    //     width: 60,
    //     height: 60,
    //     borderRadius: 30,
    //     backgroundColor: '#f0f0f0',
    //     alignSelf: 'center',
    //     marginBottom: 16,
    // },
    skeletonTitle: {
        alignItems: 'center',
    },
    skeletonSubtitle: {
        alignItems: 'center',
    },
    skeletonLine: {
        height: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        width: '60%',
    },
    skeletonLineSmall: {
        height: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        width: '40%',
    },
    skeletonBadge: {
        height: 24,
        width: 60,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
    },
    skeletonButton: {
        height: 44,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '100%',
    },

    // Cards Skeleton
    cardsSkeleton: {
        flex: 1,
    },
    skeletonCard: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        flex: 1,
        marginRight: 12,
    },
    cardContent: {
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        paddingTop: 12,
    },

    // Bottom Skeleton
    bottomSkeleton: {
        marginTop: 20,
    },

    // Shimmer Effect
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },

    // Loading Indicator
    loadingIndicator: {
        alignItems: 'center',
        marginTop: 32,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#999999',
        marginHorizontal: 4,
    },

    // Simple Spinner
    simpleSpinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#e5e5e5',
        borderTopColor: '#999999',
        marginBottom: 20,
    },
    loadingText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SkeletonLoader;