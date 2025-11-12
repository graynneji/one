import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCrudCreate } from '@/hooks/useCrud';
import { getErrorMessage } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface newPost {
    title: string;
    content: string;
    category_id: number | undefined;
    is_urgent: boolean;
    is_anonymous: boolean
    author_id: string | number;
    author: string;
    tags: string;
    profile_picture?: string | null;
    image?: any[];
}

interface Category {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
    categories: Category[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, categories }) => {
    const { session } = useCheckAuth()
    const initialPost = {
        title: '',
        content: '',
        category_id: undefined,
        is_urgent: false,
        is_anonymous: false,
        author_id: '',
        author: '',
        tags: '',
        profile_picture: '',
        image: []
    }

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [newPost, setNewPost] = useState<newPost>(initialPost)
    const createPostMutation = useCrudCreate<newPost>("article")
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1,
            selectionLimit: 4 - (newPost.image?.length || 0),
        });

        if (!result.canceled && result.assets) {
            const maxSize = 2 * 1024 * 1024;
            const validImages = [];
            const oversizedImages = [];

            for (const asset of result.assets) {
                if (asset.fileSize && asset.fileSize > maxSize) {
                    oversizedImages.push(asset.fileName || 'Unknown');
                } else {
                    validImages.push(asset);
                }
            }

            if (oversizedImages.length > 0) {
                Alert.alert(
                    'Image Too Large',
                    `The following image(s) exceed 2MB:\n${oversizedImages.join(', ')}\nPlease select smaller images.`,
                    [{ text: 'OK' }]
                );
            }

            if (validImages.length > 0) {
                setNewPost({
                    ...newPost,
                    image: [...(newPost.image || []), ...validImages].slice(0, 4),
                });
            }
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = newPost.image?.filter((_, i) => i !== index);
        setNewPost({ ...newPost, image: updatedImages });
    };

    const handleSubmit = async (): Promise<void> => {
        if (!newPost.content.trim() || !newPost.category_id) {
            Alert.alert('Missing Information', 'Please fill in all required fields and select a category.');
            return;
        }

        setIsSubmitting(true);
        let uploadedUrls: string[] = [];

        try {
            if (newPost.image && newPost.image.length > 0) {
                const uploadPromises = newPost.image.map(async (asset) => {
                    if (!asset.uri || typeof asset.uri !== 'string') {
                        throw new Error('Image URI is not a valid string.');
                    }

                    const mimeType = asset.mimeType || 'image/jpeg'
                    const uniqueId = Crypto.randomUUID();
                    const path = `${Date.now()}_${uniqueId}_${(asset.fileName || "post").replace(/\s/g, "_")}`;
                    const base64 = await FileSystem.readAsStringAsync(asset?.uri, { encoding: 'base64' as any, })
                    const arrayBuffer = Buffer.from(base64, 'base64')
                    const supabase = createClient(
                        process.env.SUPABASE_URL! ?? Constants.expoConfig?.extra?.supabaseUrl,
                        process.env.SUPABASE_ANON_KEY! ??
                        Constants.expoConfig?.extra?.supabaseAnonKey
                    );
                    const { data, error } = await supabase.storage
                        .from('community_images')
                        .upload(path, arrayBuffer, {
                            contentType: mimeType,
                            cacheControl: '3600',
                            upsert: true,
                        });

                    if (error) throw new Error(`cannot create post with image at the moment ${error}${data}`);
                    const { data: publicUrlData } = supabase.storage.from('community_images').getPublicUrl(path);
                    return publicUrlData.publicUrl;
                });

                uploadedUrls = await Promise.all(uploadPromises);
            }

            const postData = {
                ...newPost,
                image: uploadedUrls,
                author_id: session?.user.id,
                author: session?.user.user_metadata?.full_name || "TherapyPlus User",
                profile_picture: session?.user.user_metadata?.profile_picture || null,
            };

            const result = await createPostMutation.mutateAsync(postData);

            if (result.error) {
                throw new Error(result.error.message || 'Failed to create post.');
            }

            // Alert.alert('Post Created', 'Your post has been shared with the community.', [{ text: 'OK' }]);
            Toast.show({
                type: "success",
                text1: "Post Created",
                text2: "Your post has been shared with the community."
            });
            setNewPost(initialPost);
            onClose();
        } catch (error) {
            // Alert.alert('Error', (error as Error).message || 'Failed to create post.');
            console.log(error, "error");
            Toast.show({
                type: "error",
                text1: "Failed to create post.",
                text2: getErrorMessage(error),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = (): void => {
        if (newPost.title.trim() || newPost.content.trim() || (newPost.image && newPost.image.length > 0)) {
            Alert.alert(
                'Discard Post?',
                'You have unsaved changes. Are you sure you want to close?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            setNewPost(initialPost)
                            onClose();
                        }
                    }
                ]
            );
        } else {
            onClose();
        }
    };


    const emergencyResource = () => {
        Alert.alert(
            "Crisis Resources (USA)",
            "🚨 EMERGENCY SERVICES\n" +
            "• Call 911 for police, fire, or medical emergencies\n\n" +

            "💚 MENTAL HEALTH SUPPORT\n" +
            "• Suicide & Crisis Lifeline: Call or text 988 (24/7, free, confidential)\n\n" +

            "💬 TEXT SUPPORT\n" +
            "• Crisis Text Line: Text HOME to 741741\n\n" +

            "🌐 ONLINE RESOURCES\n" +
            "• findahelpline.com\n" +
            "• nami.org/help\n\n" +
            "You are not alone. Help is available 24/7.",
            [
                {
                    text: "Call 911",
                    onPress: () => Linking.openURL("tel:911"),
                    style: "destructive",
                },
                {
                    text: "Call 988 Lifeline",
                    onPress: () => Linking.openURL("tel:988"),
                    style: "default",
                },
                {
                    text: "Close",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header - Keep original */}
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.cancelBtn}
                        onPress={handleClose}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>New Post</Text>

                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.submitBtn,
                            (!newPost.content.trim() || !newPost.category_id || isSubmitting) &&
                            styles.submitBtnDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!newPost.content.trim() || !newPost.category_id || isSubmitting}
                    >
                        <Text style={[
                            styles.submitBtnText,
                            (!newPost.content.trim() || !newPost.category_id || isSubmitting) &&
                            styles.submitBtnTextDisabled
                        ]}>
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Twitter-style Profile + Input Section */}
                    <View style={styles.tweetComposer}>
                        <View style={styles.avatarContainer}>
                            {session?.user?.user_metadata?.profile_picture ? (
                                <Image
                                    source={{ uri: session?.user?.user_metadata?.profile_picture }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={20} color={colors.primary} />
                                </View>
                            )}
                        </View>

                        <View style={styles.inputWrapper}>
                            {/* Text Input */}
                            <TextInput
                                style={styles.textInput}
                                placeholder="What's on your mind?"
                                value={newPost.content}
                                onChangeText={(content) => setNewPost({ ...newPost, content })}
                                multiline
                                maxLength={280}
                                placeholderTextColor={colors.textSecondary}
                            />

                            {/* Category Pills - Show if selected */}
                            {newPost.category_id && (
                                <View style={styles.tagsContainer}>
                                    {categories
                                        .filter(cat => cat.id === newPost.category_id)
                                        .map(category => (
                                            <View key={category.id} style={styles.tagPill}>
                                                <View style={[styles.tagDot, { backgroundColor: category.color }]} />
                                                <Text style={styles.tagText}>{category.name}</Text>
                                                <TouchableOpacity
                                                    onPress={() => setNewPost({ ...newPost, category_id: undefined, tags: '' })}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </View>
                            )}

                            {/* Status Pills - Show if active */}
                            {(newPost.is_anonymous || newPost.is_urgent) && (
                                <View style={styles.statusPills}>
                                    {newPost.is_anonymous && (
                                        <View style={styles.statusPill}>
                                            <Ionicons name="eye-off" size={12} color="#6b7280" />
                                            <Text style={styles.statusText}>Anonymous</Text>
                                        </View>
                                    )}
                                    {newPost.is_urgent && (
                                        <View style={[styles.statusPill, styles.urgentPill]}>
                                            <Ionicons name="warning" size={12} color="#f59e0b" />
                                            <Text style={[styles.statusText, styles.urgentText]}>Urgent</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Image Preview Grid */}
                            {newPost.image && newPost.image.length > 0 && (
                                <View style={styles.imageGrid}>
                                    {newPost.image.map((img, index) => (
                                        <View key={index} style={styles.imageContainer}>
                                            <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                            <TouchableOpacity
                                                style={styles.removeImageBtn}
                                                onPress={() => removeImage(index)}
                                            >
                                                <Ionicons name="close-circle" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Toolbar */}
                            <View style={styles.toolbar}>
                                <TouchableOpacity
                                    style={styles.toolbarIcon}
                                    onPress={pickImage}
                                    disabled={newPost.image && newPost.image.length >= 4}
                                >
                                    <Ionicons
                                        name="image-outline"
                                        size={20}
                                        color={newPost.image && newPost.image.length >= 4 ? colors.textTertiary : colors.primary}
                                    />
                                </TouchableOpacity>

                                <View style={styles.toolbarRight}>
                                    <Text style={styles.charCount}>{newPost.content.length}/280</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Category Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Select Category *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesContainer}
                        >
                            {categories.filter(cat => cat.id !== 0).map(category => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        newPost.category_id === category.id && styles.categoryOptionSelected
                                    ]}
                                    onPress={() => setNewPost({ ...newPost, category_id: category.id, tags: category.name.toLowerCase() })}
                                >
                                    <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                                        <Ionicons name={category.icon} size={16} color="white" />
                                    </View>
                                    <Text style={[
                                        styles.categoryText,
                                        newPost.category_id === category.id && styles.categoryTextSelected
                                    ]}>
                                        {category.name}
                                    </Text>
                                    {newPost.category_id === category.id && (
                                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Post Options */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Post Options</Text>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.optionRow}
                                onPress={() => setNewPost({ ...newPost, is_anonymous: !newPost.is_anonymous })}
                            >
                                <View style={styles.optionLeft}>
                                    <View style={styles.optionIconCircle}>
                                        <Ionicons name="eye-off-outline" size={18} color="#6b7280" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={styles.optionTitle}>Post Anonymously</Text>
                                        <Text style={styles.optionDesc}>Hide your identity</Text>
                                    </View>
                                </View>
                                <View style={[styles.checkbox, newPost.is_anonymous && styles.checkboxActive]}>
                                    {newPost.is_anonymous && <Ionicons name="checkmark" size={12} color="white" />}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.optionDivider} />

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.optionRow}
                                onPress={() => setNewPost({ ...newPost, is_urgent: !newPost.is_urgent })}
                            >
                                <View style={styles.optionLeft}>
                                    <View style={styles.optionIconCircle}>
                                        <Ionicons name="warning-outline" size={18} color="#f59e0b" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={styles.optionTitle}>Mark as Urgent</Text>
                                        <Text style={styles.optionDesc}>Needs immediate support</Text>
                                    </View>
                                </View>
                                <View style={[styles.checkbox, newPost.is_urgent && styles.checkboxActive]}>
                                    {newPost.is_urgent && <Ionicons name="checkmark" size={12} color="white" />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Crisis Resources - Keep original */}
                    <View style={styles.crisisSection}>
                        <View style={styles.crisisHeader}>
                            <Ionicons name="heart" size={20} color="#ef4444" />
                            <Text style={styles.crisisTitle}>Need immediate help?</Text>
                        </View>
                        <Text style={styles.crisisText}>
                            If you're in crisis, please contact emergency services or a crisis hotline immediately.
                        </Text>
                        <TouchableOpacity style={styles.crisisBtn} onPress={emergencyResource}>
                            <Text style={styles.crisisBtnText}>View Crisis Resources</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    cancelBtn: {
        padding: 4,
    },
    cancelBtnText: {
        fontSize: 16,
        color: '#6b7280',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    submitBtnDisabled: {
        backgroundColor: "#9ca3af"
    },
    submitBtnText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    submitBtnTextDisabled: {
        color: "#6b7280",
    },
    content: {
        flex: 1,
    },
    tweetComposer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: '#a3676086',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputWrapper: {
        flex: 1,
    },
    textInput: {
        fontSize: 16,
        color: colors.text,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.divider,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        gap: 5,
    },
    tagDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    tagText: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '500',
    },
    statusPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    urgentPill: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: 11,
        color: '#6b7280',
        fontWeight: '500',
    },
    urgentText: {
        color: '#92400e',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.surface,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },
    toolbarIcon: {
        padding: 4,
    },
    toolbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    charCount: {
        fontSize: 13,
        color: colors.textTertiary,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    categoriesContainer: {
        paddingRight: 16,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.inputBackground,
    },
    categoryIconContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginRight: 4,
    },
    categoryTextSelected: {
        color: colors.text,
    },
    optionsContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 2,
    },
    optionDesc: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    optionDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 64,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    crisisSection: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    crisisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    crisisTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#dc2626',
        marginLeft: 8,
    },
    crisisText: {
        fontSize: 14,
        color: '#7f1d1d',
        lineHeight: 20,
        marginBottom: 12,
    },
    crisisBtn: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    crisisBtnText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
});

export default CreatePostModal;