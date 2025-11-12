import { useCheckAuth } from '@/context/AuthContext'; // Adjust path as needed
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors } from '../constants/Colors'; // Adjust path as needed

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
    variant?: 'contacts' | 'chats' | 'auto';
    itemCount?: number;
    showHeader?: boolean;
}

// Main Skeleton Loader Component
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'auto',
    itemCount = 8,
    showHeader = true,
}) => {
    const { session } = useCheckAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getColors(isDark);

    const shimmerValue = React.useRef(new Animated.Value(0)).current;
    const fadeValue = React.useRef(new Animated.Value(0)).current;

    // Auto-detect variant based on user designation
    const effectiveVariant = React.useMemo(() => {
        if (variant !== 'auto') return variant;

        const designation = session?.user?.user_metadata?.designation;
        return designation === 'therapist' ? 'chats' : 'contacts';
    }, [variant, session]);

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

    const skeletonStyles = getSkeletonStyles(colors, isDark);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeValue }
                ]}
            >
                {/* Header with Search Bar */}
                {showHeader && (
                    <View style={styles.headerSection}>
                        {/* Logo */}
                        <View style={[styles.skeletonItem, styles.logoSkeleton]}>
                            <View style={[
                                styles.skeletonLine,
                                skeletonStyles.skeletonBase,
                                { width: '45%', height: 32, borderRadius: 8 }
                            ]} />
                            <Animated.View
                                style={[
                                    styles.shimmer,
                                    skeletonStyles.shimmer,
                                    { transform: [{ translateX }] },
                                ]}
                            />
                        </View>

                        {/* User Header Section */}
                        <View style={styles.userHeader}>
                            <View style={styles.userHeaderLeft}>
                                <View style={[styles.skeletonItem, styles.headerAvatar]}>
                                    <View style={[
                                        styles.skeletonAvatar,
                                        skeletonStyles.skeletonBase,
                                        { width: 44, height: 44 }
                                    ]} />
                                    <Animated.View
                                        style={[
                                            styles.shimmer,
                                            skeletonStyles.shimmer,
                                            { transform: [{ translateX }] },
                                        ]}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={[styles.skeletonItem, { marginBottom: 6 }]}>
                                        <View style={[
                                            styles.skeletonLine,
                                            skeletonStyles.skeletonBase,
                                            { width: '60%', height: 18 }
                                        ]} />
                                        <Animated.View
                                            style={[
                                                styles.shimmer,
                                                skeletonStyles.shimmer,
                                                { transform: [{ translateX }] },
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.skeletonItem}>
                                        <View style={[
                                            styles.skeletonLine,
                                            skeletonStyles.skeletonBase,
                                            { width: '40%', height: 14 }
                                        ]} />
                                        <Animated.View
                                            style={[
                                                styles.shimmer,
                                                skeletonStyles.shimmer,
                                                { transform: [{ translateX }] },
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.skeletonItem, styles.headerButton]}>
                                <View style={[
                                    styles.skeletonCircle,
                                    skeletonStyles.skeletonBase,
                                ]} />
                                <Animated.View
                                    style={[
                                        styles.shimmer,
                                        skeletonStyles.shimmer,
                                        { transform: [{ translateX }] },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Messages Title and Archive Button */}
                        <View style={styles.titleRow}>
                            <View style={[styles.skeletonItem, { flex: 1 }]}>
                                <View style={[
                                    styles.skeletonLine,
                                    skeletonStyles.skeletonBase,
                                    { width: '35%', height: 22 }
                                ]} />
                                <Animated.View
                                    style={[
                                        styles.shimmer,
                                        skeletonStyles.shimmer,
                                        { transform: [{ translateX }] },
                                    ]}
                                />
                            </View>
                            <View style={[styles.skeletonItem, styles.headerButton]}>
                                <View style={[
                                    styles.skeletonCircle,
                                    skeletonStyles.skeletonBase,
                                ]} />
                                <Animated.View
                                    style={[
                                        styles.shimmer,
                                        skeletonStyles.shimmer,
                                        { transform: [{ translateX }] },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Search Bar */}
                        <View style={[styles.skeletonItem, styles.searchBar]}>
                            <View style={[
                                styles.skeletonSearchBar,
                                skeletonStyles.skeletonBase,
                            ]} />
                            <Animated.View
                                style={[
                                    styles.shimmer,
                                    skeletonStyles.shimmer,
                                    { transform: [{ translateX }] },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* List Items */}
                <View style={styles.listContainer}>
                    {[...Array(itemCount)].map((_, index) => (
                        <View key={index}>
                            {effectiveVariant === 'contacts' ? (
                                <ContactSkeletonItem
                                    translateX={translateX}
                                    skeletonStyles={skeletonStyles}
                                />
                            ) : (
                                <ChatSkeletonItem
                                    translateX={translateX}
                                    skeletonStyles={skeletonStyles}
                                />
                            )}
                        </View>
                    ))}
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

// Contact List Item Skeleton (for patients)
const ContactSkeletonItem: React.FC<{
    translateX: Animated.AnimatedInterpolation<string | number>;
    skeletonStyles: any;
}> = ({ translateX, skeletonStyles }) => {
    return (
        <View style={styles.listItem}>
            {/* Avatar */}
            <View style={[styles.skeletonItem, styles.avatar]}>
                <View style={[styles.skeletonAvatar, skeletonStyles.skeletonBase]} />
                <Animated.View
                    style={[
                        styles.shimmer,
                        skeletonStyles.shimmer,
                        { transform: [{ translateX }] },
                    ]}
                />
            </View>

            {/* Content */}
            <View style={styles.listItemContent}>
                <View style={styles.skeletonItem}>
                    <View style={[
                        styles.skeletonLine,
                        skeletonStyles.skeletonBase,
                        { width: '70%', height: 16 }
                    ]} />
                    <Animated.View
                        style={[
                            styles.shimmer,
                            skeletonStyles.shimmer,
                            { transform: [{ translateX }] },
                        ]}
                    />
                </View>

                <View style={[styles.skeletonItem, { marginTop: 8 }]}>
                    <View style={[
                        styles.skeletonLine,
                        skeletonStyles.skeletonBase,
                        { width: '50%', height: 14 }
                    ]} />
                    <Animated.View
                        style={[
                            styles.shimmer,
                            skeletonStyles.shimmer,
                            { transform: [{ translateX }] },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

// Chat List Item Skeleton (for therapists)
const ChatSkeletonItem: React.FC<{
    translateX: Animated.AnimatedInterpolation<string | number>;
    skeletonStyles: any;
}> = ({ translateX, skeletonStyles }) => {
    return (
        <View style={styles.listItem}>
            {/* Avatar */}
            <View style={[styles.skeletonItem, styles.avatar]}>
                <View style={[styles.skeletonAvatar, skeletonStyles.skeletonBase]} />
                <Animated.View
                    style={[
                        styles.shimmer,
                        skeletonStyles.shimmer,
                        { transform: [{ translateX }] },
                    ]}
                />
            </View>

            {/* Content */}
            <View style={styles.chatItemContent}>
                <View style={styles.chatItemHeader}>
                    <View style={[styles.skeletonItem, { flex: 1 }]}>
                        <View style={[
                            styles.skeletonLine,
                            skeletonStyles.skeletonBase,
                            { width: '60%', height: 16 }
                        ]} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                skeletonStyles.shimmer,
                                { transform: [{ translateX }] },
                            ]}
                        />
                    </View>

                    <View style={[styles.skeletonItem, { marginLeft: 8 }]}>
                        <View style={[
                            styles.skeletonLine,
                            skeletonStyles.skeletonBase,
                            { width: 40, height: 12 }
                        ]} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                skeletonStyles.shimmer,
                                { transform: [{ translateX }] },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.chatItemBottom}>
                    <View style={[styles.skeletonItem, { flex: 1 }]}>
                        <View style={[
                            styles.skeletonLine,
                            skeletonStyles.skeletonBase,
                            { width: '80%', height: 14 }
                        ]} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                skeletonStyles.shimmer,
                                { transform: [{ translateX }] },
                            ]}
                        />
                    </View>

                    <View style={[styles.skeletonItem, { marginLeft: 8 }]}>
                        <View style={[
                            styles.skeletonBadge,
                            skeletonStyles.skeletonBase,
                        ]} />
                        <Animated.View
                            style={[
                                styles.shimmer,
                                skeletonStyles.shimmer,
                                { transform: [{ translateX }] },
                            ]}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

// Helper function to get skeleton styles based on theme
const getSkeletonStyles = (colors: any, isDark: boolean) => {
    return {
        skeletonBase: {
            backgroundColor: isDark ? colors.item : '#f0f0f0',
        },
        shimmer: {
            backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
        },
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },

    // Header Section
    headerSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    logoSkeleton: {
        marginBottom: 12,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerAvatar: {
        marginRight: 0,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerButton: {
        width: 36,
        height: 36,
    },
    skeletonCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    searchBar: {
        marginBottom: 8,
    },
    skeletonSearchBar: {
        height: 40,
        borderRadius: 20,
        width: '100%',
    },

    // List Container
    listContainer: {
        flex: 1,
    },

    // List Item
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },

    // Avatar
    avatar: {
        marginRight: 12,
    },
    skeletonAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },

    // Skeleton Items
    skeletonItem: {
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonLine: {
        borderRadius: 4,
    },
    skeletonBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },

    // Contact List Content
    listItemContent: {
        flex: 1,
        justifyContent: 'center',
    },

    // Chat List Content
    chatItemContent: {
        flex: 1,
    },
    chatItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    chatItemBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Shimmer Effect
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default SkeletonLoader;

// Export variants for easy use
export const ContactsSkeletonLoader: React.FC<{ itemCount?: number }> = ({ itemCount }) => (
    <SkeletonLoader variant="contacts" itemCount={itemCount} />
);

export const ChatsSkeletonLoader: React.FC<{ itemCount?: number }> = ({ itemCount }) => (
    <SkeletonLoader variant="chats" itemCount={itemCount} />
);