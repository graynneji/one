import Avatar from '@/components/Avatar';
import ImageViewer from '@/components/ImageViewer';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCrudCreate, useGetById } from '@/hooks/useCrud';
import { capitalizeFirstLetter, formatDateTime } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, Discussion, getCategoryColor, getCategoryIcon } from '.';




interface Author {
    id: string;
    name: string;
    avatar?: string;
}

export interface LikesProps {
    created_at?: string;
    user_id: string;
    discussion_id?: string;
    id: string;
}
export interface Comment {
    id: string;
    content: string;
    author: string;
    created_at: string;
    user_id: string;
    article_likes: LikesProps[];
    article_id: string;
    profile_picture?: string
}

interface Category {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface DiscussionViewProps {
    setShowDiscussionView: (show: boolean) => void;
    categories: Category[];
    getCategoryIcon: (categoryId: number) => keyof typeof Ionicons.glyphMap;
    getCategoryColor: (categoryId: number) => string;
    setCommentCount: (count: number) => void;
    commentCount: number;
    views: number;
    handleLikes: (userId: string, discussionId: string) => Promise<void>;
}

const DiscussionView: React.FC<DiscussionViewProps> = ({ }) => {
    const params = useLocalSearchParams();
    const discussion: Discussion = params.discussion ? JSON.parse(params.discussion as string) : {};
    const initialLikes = { result: discussion?.article_likes || [], count: discussion?.article_likes?.length || 0 }
    const [likes, setLikes] = useState<{ result: LikesProps[] | null; count: number | null }>(initialLikes);
    const [comments, setComments] = useState<Comment[]>(discussion?.article_comments || []);
    const [newComment, setNewComment] = useState<string>('');
    const [isSending, setIsSending] = useState(false)
    const { session } = useCheckAuth()
    const router = useRouter()
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    console.log(colorScheme, 'colors, colors, coloes')
    const styles = createStyles(colors);
    const createCommentMutation = useCrudCreate("article_comments", [["article_comments"], ["article"]])
    const { data, isLoading, error } = useGetById("article_comments", { article_id: discussion?.id }, "*", !!discussion?.id, {})
    const { data: likesData, isLoading: likesLoading, error: likesError } = useGetById(
        "article_likes",
        { discussion_id: discussion?.id },
        "*",
        !!discussion?.id,
        {}
    );
    const createLikesMutation = useCrudCreate("article_likes", [["article_likes"], ["article"]])

    useEffect(() => {
        setLikes(likesData ?? initialLikes);
    }, [likesData]);

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

    const handleLikePress = async (): Promise<void> => {
        if (!discussion?.id || !params?.userId) return;

        const alreadyLiked = (likes?.result ?? []).some(
            (like) => like.user_id === params.userId
        );
        if (alreadyLiked) return;

        const optimisticLike: LikesProps = {
            user_id: params.userId as string,
            discussion_id: discussion.id,
            id: `optimistic-${params.userId}-${discussion.id}`,
            created_at: new Date().toISOString(),
        };

        setLikes((prev) => ({
            result: [...(prev?.result ?? []), optimisticLike],
            count: (prev?.count ?? 0) + 1,
        }));

        try {
            const likeResult = await createLikesMutation.mutateAsync({
                user_id: params.userId,
                discussion_id: discussion.id,
            });

            setLikes((prev) => ({
                result: (prev?.result ?? []).map((like) =>
                    like.id === optimisticLike.id && likeResult && typeof likeResult === "object" && "user_id" in likeResult && "id" in likeResult
                        ? (likeResult as LikesProps)
                        : like
                ),
                count: prev?.count ?? 0,
            }));
        } catch (err) {
            setLikes((prev) => ({
                result: (prev?.result ?? []).filter(
                    (like) => like.id !== optimisticLike.id
                ),
                count: Math.max((prev?.count ?? 1) - 1, 0),
            }));
        }
    };

    const handleAddComment = async (): Promise<void> => {
        setIsSending(true)
        Keyboard.dismiss()
        if (newComment.trim()) {
            const comment = {
                content: newComment,
                user_id: params?.userId,
                author: params?.fullName,
                article_id: discussion.id,
                profile_picture: session?.user?.user_metadata?.profile_picture
            };
            try {
                await createCommentMutation.mutateAsync(comment)
                setNewComment('');
                setIsSending(false)

            } catch (error) {
                return
            }
        }
    };

    const renderComment = (comment: Comment) => (
        <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentContent}>
                {/* {comment?.profile_picture ?
                    <Image
                        source={{ uri: comment?.profile_picture || 'https://via.placeholder.com/40' }}
                        style={styles.commentAvatar}
                    /> :
                    <View style={styles.commentAvatarPlaceholder}>
                        <Text style={styles.commentAvatarText}>
                            {comment?.author.charAt(0).toUpperCase() || "A"}
                        </Text>
                    </View>
                } */}
                <Avatar profile_picture={comment?.profile_picture} />
                <View style={styles.commentMain}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthorName}>
                            {capitalizeFirstLetter(comment.author)}
                        </Text>
                        <Text style={styles.commentTime}>· {formatTime(comment.created_at)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Thread</Text>

                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Post */}
                <View style={styles.mainPost}>
                    <View style={styles.postContent}>
                        <Avatar profile_picture={discussion?.is_anonymous ? '#444' : discussion?.profile_picture} />
                        <View style={styles.postMain}>
                            <View style={styles.postHeader}>
                                <View style={styles.authorRow}>
                                    <Text style={styles.authorName}>
                                        {discussion?.is_anonymous ? 'Anonymous' : capitalizeFirstLetter(discussion.author)}
                                    </Text>
                                    {/* <Text style={styles.postTime}>· {formatTime(discussion.created_at)}</Text> */}
                                </View>
                                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(discussion.category_id) }]}>
                                    <Ionicons
                                        name={getCategoryIcon(discussion.category_id)}
                                        size={11}
                                        color="white"
                                    />
                                    <Text style={styles.categoryName}>{categories[discussion.category_id].name}</Text>
                                </View>
                            </View>

                            {discussion?.title && (
                                <Text style={styles.discussionTitle}>{discussion.title}</Text>
                            )}

                            <Text style={styles.discussionContent}>{discussion.content}</Text>
                            <ImageViewer images={discussion.image} />

                            {/* Stats */}
                            <View>
                                <Text style={styles.dateTime}>{formatDateTime(discussion.created_at)}</Text>
                                <View style={styles.statsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.statButton}
                                        onPress={handleLikePress}
                                    >
                                        <Ionicons
                                            name={likes?.result?.some(like => like.user_id === params?.userId) ? "heart" : "heart-outline"}
                                            size={20}
                                            color={likes?.result?.some(like => like.user_id === params?.userId) ? "#ef4444" : colors.textSecondary}
                                        />
                                        <Text style={styles.statText}>
                                            {(likes?.result?.length || 0)}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.statButton}>
                                        <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                                        <Text style={styles.statText}>{data?.result?.length || 0}</Text>
                                    </View>

                                    <View style={styles.statButton}>
                                        <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
                                        <Text style={styles.statText}>{discussion?.views}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Comments Section */}
                {data?.result?.length === 0 ? (
                    <View style={styles.noComments}>
                        <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
                        <Text style={styles.noCommentsText}>No replies yet</Text>
                        <Text style={styles.noCommentsSubtext}>Be the first to reply</Text>
                    </View>
                ) : (
                    <View style={styles.commentsList}>
                        {data?.result?.map(renderComment)}
                    </View>
                )}
            </ScrollView>

            {/* Comment Input */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Reply to this thread..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={500}
                            placeholderTextColor={colors.placeholder}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                !newComment.trim() && styles.sendBtnDisabled
                            ]}
                            onPress={handleAddComment}
                            // disabled={isSending}
                            disabled={!newComment.trim() || isSending}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={newComment.trim() ? colors.primary : colors.textTertiary}
                            // color={newComment.trim() ? colors.primary : colors.textTertiary}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    moreBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    mainPost: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
        paddingBottom: 16,
    },
    postContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    postMain: {
        flex: 1,
        marginLeft: 12,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    postTime: {
        fontSize: 15,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
    },
    categoryName: {
        color: 'white',
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 4,
    },
    discussionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        lineHeight: 24,
    },
    discussionContent: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 22,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingTop: 12,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
    dateTime: {
        color: colors.textTertiary,
        paddingBottom: 5
    },
    statButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 8,
    },
    statText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    noComments: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    noCommentsText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
    },
    noCommentsSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 6,
    },
    commentsList: {
        paddingTop: 0,
    },
    commentCard: {
        backgroundColor: colors.background,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    commentContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    commentMain: {
        flex: 1,
        marginLeft: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthorName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    commentTime: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    commentText: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 20,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        backgroundColor: colors.inputBackground,
        color: colors.inputText,
    },
    sendBtn: {
        marginLeft: 12,
        padding: 8,
    },
    sendBtnDisabled: {
        opacity: 0.5,
    },
});

export default DiscussionView;