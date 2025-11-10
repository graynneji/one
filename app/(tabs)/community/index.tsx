// import { Comment, LikesProps } from '@/app/(tabs)/discussion-view';
// import CategoryList from '@/components/CategoryList';
// import CreatePostModal from '@/components/CreatePostModal';
// import ErrorMessage from '@/components/ErrorMessage';
// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useCrudCreate, useGetAll, useRpc } from '@/hooks/useCrud';
// import { capitalizeFirstLetter, formatNumber, formatThreadTime } from '@/utils';
// import { initialDiscussions as rawInitialDiscussions } from '@/utils/communityUtilis';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useMemo, useRef, useState } from 'react';
// import {
//     Dimensions,
//     FlatList,
//     Image,
//     RefreshControl,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     useColorScheme,
//     View
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2; // For 2 images per row with padding

// interface Author {
//     id: string;
//     name: string;
//     avatar?: string;
// }

// export interface Discussion {
//     id: string;
//     title: string;
//     content: string;
//     author: string;
//     category_id: number;
//     created_at: string;
//     views: number;
//     is_urgent?: boolean;
//     is_anonymous?: boolean;
//     article_comments?: Comment[];
//     article_likes?: LikesProps[];
//     profile_picture?: string;
//     image?: string[];
// }

// interface Category {
//     id: number;
//     name: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     color: string;
// }

// interface CommunityProps {
//     initialDiscussions: Discussion[];
//     count: number;
// }

// export const categories: Category[] = [
//     { id: 0, name: "All Topics", icon: "people-outline", color: "#3b82f6" },
//     { id: 1, name: "Anxiety", icon: "heart-outline", color: "#8b5cf6" },
//     { id: 2, name: "Depression", icon: "chatbubble-outline", color: "#6366f1" },
//     { id: 3, name: "Relationships", icon: "heart", color: "#ec4899" },
//     { id: 4, name: "Career & Work", icon: "briefcase-outline", color: "#10b981" },
//     { id: 5, name: "Family", icon: "home-outline", color: "#f97316" },
//     { id: 6, name: "Self-Care", icon: "star-outline", color: "#eab308" },
//     { id: 7, name: "Personal Growth", icon: "trending-up-outline", color: "#14b8a6" },
// ];

// export const getCategoryIcon = (categoryId: number): keyof typeof Ionicons.glyphMap => {
//     const category = categories.find((cat) => cat.id === categoryId);
//     return category ? category.icon : "chatbubble-outline";
// };

// export const getCategoryColor = (categoryId: number): string => {
//     const category = categories.find((cat) => cat.id === categoryId);
//     return category ? category.color : "#6b7280";
// };

// const sanitizeDiscussions = (discussions: any[]): Discussion[] => {
//     return discussions.map(discussion => ({
//         ...discussion,
//         author: {
//             ...discussion.author,
//             id: discussion.author.id ?? "",
//         },
//         comments: discussion.comments
//             ? discussion.comments.map((comment: any) => ({
//                 ...comment,
//                 author: {
//                     ...comment.author,
//                     id: comment.author.id ?? "",
//                 },
//             }))
//             : [],
//     }));
// };

// const initialDiscussions: Discussion[] = sanitizeDiscussions(rawInitialDiscussions);

// const Community: React.FC<CommunityProps> = () => {
//     let count = initialDiscussions.length;
//     const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
//     const [activeCategory, setActiveCategory] = useState<number>(0);
//     const [commentCount, setCommentCount] = useState<number>(0);
//     const [searchTerm, setSearchTerm] = useState<string>("");
//     const [discussion, setDiscussion] = useState<Discussion>({} as Discussion);
//     const [showDiscussionView, setShowDiscussionView] = useState<boolean>(false);
//     const [views, setViews] = useState<number>(0);
//     const [showCategories, setShowCategories] = useState<boolean>(false);
//     const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
//     const flatListRef = useRef<FlatList>(null);
//     const [refreshing, setRefreshing] = useState(false);
//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];
//     const styles = createStyles(colors);
//     const router = useRouter()
//     const { session } = useCheckAuth()
//     const userId = session?.user?.id!
//     const { data, isLoading, error, refetch } = useGetAll('article', { orderBy: 'created_at', ascending: false }, "*, article_comments!article_id(*), article_likes!discussion_id(*)");

//     const onRefresh = async () => {
//         setRefreshing(true);
//         const start = Date.now();
//         await refetch();
//         const elapsed = Date.now() - start;
//         const minDuration = 500;
//         setTimeout(() => {
//             setRefreshing(false);
//         }, Math.max(0, minDuration - elapsed));
//     };

//     const filteredDiscussions = useMemo(() => {
//         if (!data?.result) return [];
//         return data.result.filter(discussion => {
//             const matchesCategory = activeCategory === 0 || discussion.category_id === activeCategory;
//             const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
//             return matchesCategory && matchesSearch;
//         });
//     }, [data?.result, activeCategory, searchTerm]);

//     const createLikesMutation = useCrudCreate("article_likes", [["article_likes"], ["articles"]])

//     const handleLikes = async (userId: string, likes: LikesProps[], discussion: Discussion): Promise<void> => {
//         if (likes?.some(like => like.user_id === userId)) return;

//         const post = {
//             user_id: userId,
//             discussion_id: discussion.id,
//         };

//         try {
//             discussion.article_likes = [
//                 ...(discussion.article_likes ?? []),
//                 {
//                     user_id: userId,
//                     id: `optimistic-${userId}-${discussion.id}`,
//                     discussion_id: discussion.id,
//                     created_at: new Date().toISOString(),
//                 }
//             ];

//             const likesResult = await createLikesMutation.mutateAsync(post);
//         } catch (err) {
//             discussion.article_likes = discussion.article_likes?.filter(
//                 l => l.user_id !== userId
//             );
//         }
//     };

//     const rpcViewMutation = useRpc("increment_views_bigint", ["article"])

//     const handleDiscussionPress = async (discussion: Discussion) => {
//         router.push({
//             pathname: "/(tabs)/discussion-view",
//             params: {
//                 discussion: JSON.stringify(discussion),
//                 icon: getCategoryIcon(discussion.category_id),
//                 color: getCategoryColor(discussion.category_id),
//                 userId: userId,
//                 fullName: session?.user?.user_metadata?.full_name || "User",
//             }
//         })

//         const result = await rpcViewMutation.mutateAsync({ article_id: discussion.id })
//     };

//     // Render images for discussion
//     const renderImages = (images?: string[]) => {
//         if (!images || images.length === 0) return null;

//         const imageCount = images.length;

//         if (imageCount === 1) {
//             return (
//                 <View style={styles.imageContainer}>
//                     <Image
//                         source={{ uri: images[0] }}
//                         style={styles.singleImage}
//                         resizeMode="cover"
//                     />
//                 </View>
//             );
//         }

//         if (imageCount === 2) {
//             return (
//                 <View style={styles.imageContainer}>
//                     <View style={styles.twoImageGrid}>
//                         <Image
//                             source={{ uri: images[0] }}
//                             style={styles.gridImage}
//                             resizeMode="cover"
//                         />
//                         <Image
//                             source={{ uri: images[1] }}
//                             style={styles.gridImage}
//                             resizeMode="cover"
//                         />
//                     </View>
//                 </View>
//             );
//         }

//         if (imageCount === 3) {
//             return (
//                 <View style={styles.imageContainer}>
//                     <View style={styles.threeImageGrid}>
//                         <Image
//                             source={{ uri: images[0] }}
//                             style={styles.largeImage}
//                             resizeMode="cover"
//                         />
//                         <View style={styles.smallImagesColumn}>
//                             <Image
//                                 source={{ uri: images[1] }}
//                                 style={styles.smallImage}
//                                 resizeMode="cover"
//                             />
//                             <Image
//                                 source={{ uri: images[2] }}
//                                 style={styles.smallImage}
//                                 resizeMode="cover"
//                             />
//                         </View>
//                     </View>
//                 </View>
//             );
//         }

//         // 4 images
//         return (
//             <View style={styles.imageContainer}>
//                 <View style={styles.fourImageGrid}>
//                     {images.slice(0, 4).map((img, idx) => (
//                         <Image
//                             key={idx}
//                             source={{ uri: img }}
//                             style={styles.quarterImage}
//                             resizeMode="cover"
//                         />
//                     ))}
//                 </View>
//             </View>
//         );
//     };

//     const renderDiscussionItem = ({ item }: { item: Discussion }) => (
//         <TouchableOpacity
//             activeOpacity={1}
//             style={styles.discussionCard}
//             onPress={() => handleDiscussionPress(item)}
//         >
//             <View style={styles.discussionHeader}>
//                 <View style={styles.authorInfo}>
//                     {item?.profile_picture ?
//                         <Image
//                             source={{ uri: item?.profile_picture || 'https://via.placeholder.com/40' }}
//                             style={styles.authorAvatar}
//                         /> :
//                         <View style={styles.avatar}>
//                             <Text style={styles.avatarText}>
//                                 {!item?.is_anonymous ? item.author.charAt(0).toUpperCase() : "A"}
//                             </Text>
//                         </View>
//                     }
//                     <View>
//                         <Text style={styles.authorName}>
//                             {!item?.is_anonymous ? capitalizeFirstLetter(item.author) : "Anonymous"}
//                         </Text>
//                         <Text style={styles.timestamp}>{formatThreadTime(item.created_at)}</Text>
//                     </View>
//                 </View>
//                 <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category_id) }]}>
//                     <Ionicons
//                         name={getCategoryIcon(item.category_id)}
//                         size={12}
//                         color="white"
//                     />
//                 </View>
//             </View>

//             {item.title && <Text style={styles.discussionTitle}>{item.title}</Text>}
//             <Text style={styles.discussionContent}>
//                 {item.content}
//             </Text>

//             {/* Render Images */}
//             {renderImages(item.image)}

//             <View style={styles.discussionFooter}>
//                 <View style={styles.stats}>
//                     <TouchableOpacity
//                         onPress={() => handleLikes(userId, item.article_likes ?? [], item)}
//                         activeOpacity={1}
//                     >
//                         <View style={styles.statItem}>
//                             <Ionicons
//                                 name={item?.article_likes?.some(like => like.user_id === userId) ? "heart" : "heart-outline"}
//                                 size={20}
//                                 color={item?.article_likes?.some(like => like.user_id === userId) ? "#ef4444" : "#6b7280"}
//                             />
//                             <Text style={styles.statText}>{item.article_likes?.length || 0}</Text>
//                         </View>
//                     </TouchableOpacity>
//                     <View style={styles.statItem}>
//                         <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
//                         <Text style={styles.statText}>{item.article_comments?.length || 0}</Text>
//                     </View>
//                     <View style={styles.statItem}>
//                         <Ionicons name="eye-outline" size={20} color="#6b7280" />
//                         <Text style={styles.statText}>{item.views}</Text>
//                     </View>
//                 </View>
//                 {item.is_urgent && (
//                     <View style={styles.urgentBadge}>
//                         <Text style={styles.urgentText}>Urgent</Text>
//                     </View>
//                 )}
//             </View>
//         </TouchableOpacity>
//     );

//     const ListHeaderComponent = () => (
//         <>
//             {showCategories && (
//                 <CategoryList
//                     categories={categories}
//                     activeCategory={activeCategory}
//                     setActiveCategory={setActiveCategory}
//                     setShowCategories={setShowCategories}
//                 />
//             )}

//             <View style={styles.quickStats}>
//                 <Text style={styles.discussionCount}>
//                     {(formatNumber(filteredDiscussions?.length ?? 0))} {(filteredDiscussions?.length === 1 ? 'thread' : 'threads')}
//                 </Text>
//                 <TouchableOpacity
//                     style={styles.statsToggle}
//                     onPress={() => setShowGuidelines(!showGuidelines)}
//                 >
//                     <Text style={styles.statsToggleText}>
//                         {showGuidelines ? 'Hide Info' : 'Community Info'}
//                     </Text>
//                     <Ionicons
//                         name={showGuidelines ? "chevron-up" : "chevron-down"}
//                         size={16}
//                         color="#6b7280"
//                     />
//                 </TouchableOpacity>
//             </View>

//             {showGuidelines && (
//                 <>
//                     <View style={styles.featuredSection}>
//                         <Text style={styles.featuredTitle}>Welcome to our support community</Text>
//                         <Text style={styles.featuredText}>
//                             Connect with others, share experiences, and find support on your mental health journey.
//                         </Text>
//                         <TouchableOpacity style={styles.guidelinesBtn}>
//                             <Text style={styles.guidelinesBtnText}>Community Guidelines</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {error && <ErrorMessage errorMessage={error.message ?? String(error)} fn={refetch} />}
//                     {isLoading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>}
//                 </>
//             )}
//         </>
//     );

//     return (
//         <SafeAreaView style={styles.container} edges={['top']}>
//             <TouchableOpacity
//                 style={styles.createPostBtn}
//                 onPress={() => setIsCreatePostOpen(true)}
//             >
//                 <Ionicons name='add-outline' size={30} color="#fff" />
//             </TouchableOpacity>

//             {!showDiscussionView && (
//                 <View style={styles.header}>
//                     <Text style={styles.title}>Support community</Text>
//                     <View style={styles.headerActions}>
//                         <TouchableOpacity
//                             activeOpacity={1}
//                             style={styles.filterBtn}
//                             onPress={() => setShowCategories(!showCategories)}
//                         >
//                             <Ionicons name="funnel-outline" size={24} color={colors.textSecondary} />
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             )}

//             <FlatList
//                 ref={flatListRef}
//                 style={styles.content}
//                 data={filteredDiscussions}
//                 renderItem={renderDiscussionItem}
//                 refreshControl={
//                     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//                 }
//                 keyExtractor={(item) => item.id}
//                 ListHeaderComponent={ListHeaderComponent}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.flatListContainer}
//                 initialNumToRender={10}
//                 maxToRenderPerBatch={5}
//                 windowSize={10}
//             />

//             <CreatePostModal
//                 visible={isCreatePostOpen}
//                 onClose={() => setIsCreatePostOpen(false)}
//                 categories={categories}
//             />
//         </SafeAreaView>
//     );
// };

// const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.background,
//         position: 'relative'
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: colors.text,
//     },
//     headerActions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//         justifyContent: 'center'
//     },
//     createPostBtn: {
//         backgroundColor: colors.primary,
//         padding: 16,
//         borderRadius: 100,
//         position: 'absolute',
//         bottom: 16,
//         right: 16,
//         zIndex: 1
//     },
//     createPostBtnText: {
//         color: 'white',
//         fontWeight: '500',
//         fontSize: 14,
//     },
//     filterBtn: {
//         padding: 8,
//     },
//     content: {
//         flex: 1,
//     },
//     flatListContainer: {
//         paddingHorizontal: 16,
//         paddingBottom: 20,
//     },
//     quickStats: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 4,
//         marginBottom: 12,
//     },
//     discussionCount: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: colors.text,
//     },
//     statsToggle: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//         padding: 8,
//     },
//     statsToggleText: {
//         fontSize: 14,
//         color: colors.textSecondary,
//         fontWeight: '500',
//     },
//     featuredSection: {
//         backgroundColor: '#3b82f6',
//         borderRadius: 12,
//         padding: 24,
//         marginBottom: 16,
//     },
//     featuredTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: 'white',
//         marginBottom: 8,
//     },
//     featuredText: {
//         color: 'rgba(255, 255, 255, 0.9)',
//         fontSize: 14,
//         lineHeight: 20,
//         marginBottom: 16,
//     },
//     guidelinesBtn: {
//         backgroundColor: 'white',
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 8,
//         alignSelf: 'flex-start',
//     },
//     guidelinesBtnText: {
//         color: '#3b82f6',
//         fontWeight: '500',
//         fontSize: 14,
//     },
//     discussionCard: {
//         backgroundColor: colors.surface,
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 12,
//         borderColor: colors.border,
//         borderWidth: 1,
//     },
//     discussionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 12,
//     },
//     authorInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     avatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#3b82f6',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 12,
//     },
//     avatarText: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     authorAvatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 12,
//     },
//     authorName: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: colors.text,
//     },
//     timestamp: {
//         fontSize: 12,
//         color: colors.textSecondary,
//         marginTop: 2,
//     },
//     categoryBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 12,
//     },
//     discussionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: colors.text,
//         marginBottom: 8,
//         lineHeight: 22,
//     },
//     discussionContent: {
//         fontSize: 14,
//         color: colors.textSecondary,
//         lineHeight: 20,
//         marginBottom: 12,
//     },
//     // Image Styles
//     imageContainer: {
//         marginBottom: 12,
//     },
//     singleImage: {
//         width: '100%',
//         height: 200,
//         borderRadius: 8,
//     },
//     twoImageGrid: {
//         flexDirection: 'row',
//         gap: 4,
//     },
//     gridImage: {
//         flex: 1,
//         height: 150,
//         borderRadius: 8,
//     },
//     threeImageGrid: {
//         flexDirection: 'row',
//         gap: 4,
//         height: 200,
//     },
//     largeImage: {
//         flex: 2,
//         borderRadius: 8,
//     },
//     smallImagesColumn: {
//         flex: 1,
//         gap: 4,
//     },
//     smallImage: {
//         flex: 1,
//         borderRadius: 8,
//     },
//     fourImageGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 4,
//     },
//     quarterImage: {
//         width: '49%',
//         height: 120,
//         borderRadius: 8,
//     },
//     discussionFooter: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     stats: {
//         flexDirection: 'row',
//         gap: 16,
//     },
//     statItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//     },
//     statText: {
//         fontSize: 12,
//         color: colors.textSecondary,
//         fontWeight: '500',
//     },
//     urgentBadge: {
//         backgroundColor: '#ef4444',
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 12,
//     },
//     urgentText: {
//         color: 'white',
//         fontSize: 12,
//         fontWeight: '600',
//     },
// });

// export default Community;

import { Comment, LikesProps } from '@/app/(tabs)/community/discussion-view';
import Avatar from '@/components/Avatar';
import CategoryList from '@/components/CategoryList';
import CreatePostModal from '@/components/CreatePostModal';
import ErrorMessage from '@/components/ErrorMessage';
import ImageViewer from '@/components/ImageViewer';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useCrudCreate, useGetAll, useRpc } from '@/hooks/useCrud';
import { capitalizeFirstLetter, formatThreadTime } from '@/utils';
import { initialDiscussions as rawInitialDiscussions } from '@/utils/communityUtilis';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Author {
    id: string;
    name: string;
    avatar?: string;
}

export interface Discussion {
    id: string;
    title: string;
    content: string;
    author: string;
    category_id: number;
    created_at: string;
    views: number;
    is_urgent?: boolean;
    is_anonymous?: boolean;
    article_comments?: Comment[];
    article_likes?: LikesProps[];
    profile_picture?: string;
    image?: string[];
}

interface Category {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface CommunityProps {
    initialDiscussions: Discussion[];
    count: number;
}

export const categories: Category[] = [
    { id: 0, name: "All Topics", icon: "people-outline", color: "#3b82f6" },
    { id: 1, name: "Anxiety", icon: "heart-outline", color: "#8b5cf6" },
    { id: 2, name: "Depression", icon: "chatbubble-outline", color: "#6366f1" },
    { id: 3, name: "Relationships", icon: "heart", color: "#ec4899" },
    { id: 4, name: "Career & Work", icon: "briefcase-outline", color: "#10b981" },
    { id: 5, name: "Family", icon: "home-outline", color: "#f97316" },
    { id: 6, name: "Self-Care", icon: "star-outline", color: "#eab308" },
    { id: 7, name: "Personal Growth", icon: "trending-up-outline", color: "#14b8a6" },
];

export const getCategoryIcon = (categoryId: number): keyof typeof Ionicons.glyphMap => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "chatbubble-outline";
};

export const getCategoryColor = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.color : "#6b7280";
};

const sanitizeDiscussions = (discussions: any[]): Discussion[] => {
    return discussions.map(discussion => ({
        ...discussion,
        author: {
            ...discussion.author,
            id: discussion.author.id ?? "",
        },
        comments: discussion.comments
            ? discussion.comments.map((comment: any) => ({
                ...comment,
                author: {
                    ...comment.author,
                    id: comment.author.id ?? "",
                },
            }))
            : [],
    }));
};

const initialDiscussions: Discussion[] = sanitizeDiscussions(rawInitialDiscussions);

const Community: React.FC<CommunityProps> = () => {
    let count = initialDiscussions.length;
    const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [commentCount, setCommentCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [discussion, setDiscussion] = useState<Discussion>({} as Discussion);
    const [showDiscussionView, setShowDiscussionView] = useState<boolean>(false);
    const [views, setViews] = useState<number>(0);
    const [showCategories, setShowCategories] = useState<boolean>(false);
    const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
    const flatListRef = useRef<FlatList>(null);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const router = useRouter()
    const { session } = useCheckAuth()
    const userId = session?.user?.id!
    const { data, isLoading, error, refetch } = useGetAll('article', { orderBy: 'created_at', ascending: false }, "*, article_comments!article_id(*), article_likes!discussion_id(*)");

    const onRefresh = async () => {
        setRefreshing(true);
        const start = Date.now();
        await refetch();
        const elapsed = Date.now() - start;
        const minDuration = 500;
        setTimeout(() => {
            setRefreshing(false);
        }, Math.max(0, minDuration - elapsed));
    };

    const filteredDiscussions = useMemo(() => {
        if (!data?.result) return [];
        return data.result.filter(discussion => {
            const matchesCategory = activeCategory === 0 || discussion.category_id === activeCategory;
            const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [data?.result, activeCategory, searchTerm]);

    const createLikesMutation = useCrudCreate("article_likes", [["article_likes"], ["articles"]])

    const handleLikes = async (userId: string, likes: LikesProps[], discussion: Discussion): Promise<void> => {
        if (likes?.some(like => like.user_id === userId)) return;

        const post = {
            user_id: userId,
            discussion_id: discussion.id,
        };

        try {
            discussion.article_likes = [
                ...(discussion.article_likes ?? []),
                {
                    user_id: userId,
                    id: `optimistic-${userId}-${discussion.id}`,
                    discussion_id: discussion.id,
                    created_at: new Date().toISOString(),
                }
            ];

            const likesResult = await createLikesMutation.mutateAsync(post);
        } catch (err) {
            discussion.article_likes = discussion.article_likes?.filter(
                l => l.user_id !== userId
            );
        }
    };

    const rpcViewMutation = useRpc("increment_views_bigint", ["article"])

    const handleDiscussionPress = async (discussion: Discussion) => {
        router.push({
            pathname: "/(tabs)/community/discussion-view",
            params: {
                discussion: JSON.stringify(discussion),
                icon: getCategoryIcon(discussion.category_id),
                color: getCategoryColor(discussion.category_id),
                userId: userId,
                fullName: session?.user?.user_metadata?.full_name || "User",
            }
        })

        const result = await rpcViewMutation.mutateAsync({ article_id: discussion.id })
    };

    const renderDiscussionItem = ({ item }: { item: Discussion }) => (
        <TouchableOpacity
            activeOpacity={0.98}
            style={styles.discussionCard}
            onPress={() => handleDiscussionPress(item)}
        >
            <View style={styles.postContent}>
                {/* {item?.profile_picture ?
                    <Image
                        source={{ uri: item?.profile_picture || 'https://via.placeholder.com/40' }}
                        style={styles.authorAvatar}
                    /> :
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {!item?.is_anonymous ? item.author.charAt(0).toUpperCase() : "A"}
                        </Text>
                    </View>
                } */}

                <Avatar profile_picture={item?.is_anonymous ? '#444' : item?.profile_picture} />

                <View style={styles.postMain}>
                    <View style={styles.postHeader}>
                        <View style={styles.authorRow}>
                            <Text style={styles.authorName}>
                                {!item?.is_anonymous ? capitalizeFirstLetter(item.author) : "Anonymous"}
                            </Text>
                            <Text style={styles.timestamp}>· {formatThreadTime(item.created_at)}</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category_id) }]}>
                            <Ionicons
                                name={getCategoryIcon(item.category_id)}
                                size={11}
                                color="white"
                            />
                        </View>
                    </View>

                    {item.title && <Text style={styles.discussionTitle}>{item.title}</Text>}
                    <Text style={styles.discussionContent}>
                        {item.content}
                    </Text>

                    {/* {renderImages(item.image)} */}
                    <ImageViewer images={item.image} />

                    <View style={styles.discussionFooter}>
                        <TouchableOpacity
                            onPress={() => handleLikes(userId, item.article_likes ?? [], item)}
                            activeOpacity={0.7}
                            style={styles.actionButton}
                        >
                            <Ionicons
                                name={item?.article_likes?.some(like => like.user_id === userId) ? "heart" : "heart-outline"}
                                size={20}
                                color={item?.article_likes?.some(like => like.user_id === userId) ? "#ef4444" : colors.textSecondary}
                            />
                            <Text style={styles.statText}>{item.article_likes?.length || 0}</Text>
                        </TouchableOpacity>

                        <View style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.statText}>{item.article_comments?.length || 0}</Text>
                        </View>

                        <View style={styles.actionButton}>
                            <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.statText}>{item.views}</Text>
                        </View>

                        {item.is_urgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>Urgent</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const ListHeaderComponent = () => (
        <>
            {showCategories && (
                <CategoryList
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    setShowCategories={setShowCategories}
                />
            )}

            <View style={styles.quickStats}>
                <Text style={styles.discussionCount}>
                    Threads
                    {/* {(formatNumber(filteredDiscussions?.length ?? 0))} {(filteredDiscussions?.length === 1 ? 'thread' : 'threads')} */}
                </Text>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.statsToggle}
                    onPress={() => setShowGuidelines(!showGuidelines)}
                >
                    <Text style={styles.statsToggleText}>
                        {showGuidelines ? 'Hide Info' : 'Community Info'}
                    </Text>
                    <Ionicons
                        name={showGuidelines ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#6b7280"
                    />
                </TouchableOpacity>
            </View>

            {showGuidelines && (
                <>
                    <View style={styles.featuredSection}>
                        <Text style={styles.featuredTitle}>Welcome to our support community</Text>
                        <Text style={styles.featuredText}>
                            Connect with others, share experiences, and find support on your mental health journey.
                        </Text>
                        <TouchableOpacity style={styles.guidelinesBtn}>
                            <Text style={styles.guidelinesBtnText}>Community Guidelines</Text>
                        </TouchableOpacity>
                    </View>

                    {error && <ErrorMessage errorMessage={error.message ?? String(error)} fn={refetch} />}
                    {isLoading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>}
                </>
            )}
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <TouchableOpacity
                style={styles.createPostBtn}
                onPress={() => setIsCreatePostOpen(true)}
            >
                <Ionicons name='add-outline' size={30} color="#fff" />
            </TouchableOpacity>

            {!showDiscussionView && (
                <View style={styles.headerContainer}>

                    <View style={styles.header}>
                        <Text style={styles.title}>Community</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.filterBtn}
                                onPress={() => setShowCategories(!showCategories)}
                            >
                                <Ionicons name="funnel-outline" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {ListHeaderComponent()}
                </View>
            )}

            <FlatList
                ref={flatListRef}
                style={styles.content}
                data={filteredDiscussions}
                renderItem={renderDiscussionItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.activityIndicator}>
                            {/* <ActivityIndicator size="large" color="#4B9CD3" /> */}
                            <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
                            <Text style={{ marginTop: 10, color: "#666" }}>Loading discussions...</Text>
                        </View>
                    ) : (
                        <View style={styles.activityIndicator}>
                            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                            <Text style={styles.noDiscussionsText}>No discussions yet.</Text>
                            <Text style={styles.noDiscussionsSubtext}>Bet the first person to post a thread</Text>
                        </View>
                    )
                }
                // ListHeaderComponent={ListHeaderComponent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
            />

            <CreatePostModal
                visible={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                categories={categories}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        position: 'relative'
    },
    headerContainer: {
        flexDirection: 'column',
        gap: 5
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        // paddingVertical: 4,
        // borderBottomWidth: 0.5,
        // borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center'
    },
    createPostBtn: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 100,
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    createPostBtnText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    filterBtn: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    activityIndicator: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginTop: 50,
    },
    noDiscussions: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    noDiscussionsText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
    },
    noDiscussionsSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        // paddingVertical: 12,
        paddingVertical: 4,
        borderBottomWidth: 0.5,
        // borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    discussionCount: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    statsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 8,
    },
    statsToggleText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    featuredSection: {
        backgroundColor: '#3b82f6',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    featuredText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    guidelinesBtn: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    guidelinesBtnText: {
        color: '#3b82f6',
        fontWeight: '500',
        fontSize: 14,
    },
    discussionCard: {
        backgroundColor: colors.background,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    postContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        marginBottom: 4,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    timestamp: {
        fontSize: 14,
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
    discussionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
        lineHeight: 22,
    },
    discussionContent: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 20,
        marginBottom: 8,
    },
    imageContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    singleImage: {
        width: '100%',
        height: 300,
        // height: 240,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    twoImageGrid: {
        flexDirection: 'row',
        gap: 2,
    },
    gridImage: {
        flex: 1,
        height: 200,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    threeImageGrid: {
        flexDirection: 'row',
        gap: 2,
        height: 240,
    },
    largeImage: {
        flex: 2,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    smallImagesColumn: {
        flex: 1,
        gap: 2,
    },
    smallImage: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    fourImageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    quarterImage: {
        width: '49.5%',
        height: 150,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    discussionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        // marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        // paddingHorizontal: 8,
        marginRight: 26,
    },
    statText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    urgentBadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 'auto',
    },
    urgentText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
});

export default Community;