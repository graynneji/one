import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Author {
    id: string;
    name: string;
    profile_picture?: string;

}

interface Comment {
    id: string;
    content: string;
    author: Author;
    timestamp: string;
    likes: number;
    isLiked: boolean;
}

interface Discussion {
    id: string;
    title: string;
    content: string;
    author: Author;
    category: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    views: number;
    isUrgent?: boolean;
    comments?: Comment[];
}

interface DiscussionsProps {
    setDiscussion: (discussion: Discussion) => void;
    getCategoryColor: (categoryId: string) => string;
    getCategoryIcon: (categoryId: string) => keyof typeof Ionicons.glyphMap;
    setShowDiscussionView: (show: boolean) => void;
    activeCategory: string;
    searchTerm: string;
    initialDiscussions: Discussion[];
    setViews: (views: number) => void;
    setCommentCount: (count: number) => void;
    commentCount: number;
    handleLikes: (userId: string, discussionId: string) => Promise<void>;
}

const Discussions: React.FC<DiscussionsProps> = ({
    setDiscussion,
    getCategoryColor,
    getCategoryIcon,
    setShowDiscussionView,
    activeCategory,
    searchTerm,
    initialDiscussions,
    setViews,
    setCommentCount,
    commentCount,
    handleLikes,
}) => {
    const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions || []);
    const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);

    useEffect(() => {
        let filtered = discussions;

        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(discussion =>
                discussion.category === activeCategory
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(discussion =>
                discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discussion.author.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDiscussions(filtered);
    }, [activeCategory, searchTerm, discussions]);

    const formatTime = (timestamp: string): string => {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}w ago`;
    };

    const handleDiscussionPress = (discussion: Discussion): void => {
        setDiscussion(discussion);
        setViews(discussion.views || 0);
        setCommentCount(discussion.comments?.length || 0);
        setShowDiscussionView(true);
    };

    const handleLikePress = (discussion: Discussion): void => {
        handleLikes(discussion.author.id, discussion.id);
    };

    const renderDiscussion = ({ item }: { item: Discussion }) => (
        <TouchableOpacity
            style={styles.discussionCard}
            onPress={() => handleDiscussionPress(item)}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.discussionHeader}>
                <View style={styles.authorInfo}>
                    <Image
                        source={{ uri: item.author.profile_picture || 'https://via.placeholder.com/32' }}
                        style={styles.avatar}
                    />
                    <View style={styles.authorDetails}>
                        <Text style={styles.authorName}>{item.author.name}</Text>
                        <Text style={styles.timeStamp}>{formatTime(item.timestamp)}</Text>
                    </View>
                </View>

                <View style={[
                    styles.categoryBadge,
                    { backgroundColor: `${getCategoryColor(item.category)}20` }
                ]}>
                    <Ionicons
                        name={getCategoryIcon(item.category)}
                        size={12}
                        color={getCategoryColor(item.category)}
                    />
                    <Text style={[
                        styles.categoryText,
                        { color: getCategoryColor(item.category) }
                    ]}>
                        {item.category}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.discussionContent}>
                <Text style={styles.discussionTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.discussionPreview} numberOfLines={3}>
                    {item.content}
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.discussionFooter}>
                <View style={styles.stats}>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => handleLikePress(item)}
                    >
                        <Ionicons
                            name={item.isLiked ? "heart" : "heart-outline"}
                            size={16}
                            color={item.isLiked ? "#ef4444" : "#6b7280"}
                        />
                        <Text style={styles.statText}>{item.likes || 0}</Text>
                    </TouchableOpacity>

                    <View style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
                        <Text style={styles.statText}>{item.comments?.length || 0}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={16} color="#6b7280" />
                        <Text style={styles.statText}>{item.views || 0}</Text>
                    </View>
                </View>

                {item.isUrgent && (
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Recent Discussions</Text>
                <Text style={styles.discussionCount}>
                    {filteredDiscussions.length} posts
                </Text>
            </View>

            {filteredDiscussions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No discussions found</Text>
                    <Text style={styles.emptyText}>
                        {searchTerm
                            ? `No discussions match "${searchTerm}"`
                            : activeCategory !== 'all'
                                ? `No discussions in ${activeCategory} category`
                                : 'Be the first to start a discussion!'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDiscussions}
                    renderItem={renderDiscussion}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    discussionCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    listContainer: {
        paddingBottom: 20,
    },
    discussionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    discussionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    authorDetails: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    timeStamp: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    discussionContent: {
        marginBottom: 16,
    },
    discussionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 22,
    },
    discussionPreview: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    discussionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 4,
    },
    urgentBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#dc2626',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default Discussions;