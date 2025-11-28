import Avatar from '@/components/Avatar';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/DarkLightModeContext';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateCrud } from '@/hooks/useCrud';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import Constants from "expo-constants";
import { EncodingType, getInfoAsync, readAsStringAsync } from "expo-file-system/legacy";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";

import { useColorScheme } from '@/hooks/useColorScheme';
import { notificationService } from '@/services/notificationService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    therapistName: string;
    nextSession: string;
    sessionsCompleted: number;
}

interface TabItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconFill: keyof typeof Ionicons.glyphMap;
}

export interface PickedImage {
    uri: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
}


const tabs: TabItem[] = [
    { id: 'profile', title: 'Profile', icon: 'person-outline', iconFill: 'person' },
    { id: 'security', title: 'Security', icon: 'lock-closed-outline', iconFill: 'lock-closed' },
    { id: 'settings', title: 'Settings', icon: 'settings-outline', iconFill: 'settings' },
];

const More: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('profile');
    const { session, loading: isPending } = useCheckAuth()
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const initialUser = {
        name: session?.user?.user_metadata?.full_name || 'User',
        email: session?.user?.email,
        phone: session?.user?.user_metadata?.phone || "+234 (80) 123-4567",
        profile_picture: session?.user?.user_metadata?.profile_picture
    };
    const patientTherapist = session?.user?.user_metadata?.designation === 'patient' ? { table: 'patients', column: 'patient_id' } : { table: 'therapist', column: 'therapist_id' }
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [notifications, setNotifications] = useState<boolean>(true);
    const [biometricAuth, setBiometricAuth] = useState<boolean>(false);
    const updateCrudAuthMutaion = useUpdateCrud("auth")
    const updateCrudUserMutaion = useUpdateCrud("user")
    const updateCrudPatientOrTherapistMutaion = useUpdateCrud(patientTherapist?.table)
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { isDark, themeMode, setThemeMode } = useTheme();

    // Toggle dark mode
    const toggleTheme = () => {
        setThemeMode(isDark ? 'light' : 'dark');
    };

    const { loading, logout } = useAuth()

    const toggleEdit = () => {
        if (isEditing) {
            // Reset form back to original if cancelled
            setUser(initialUser);
        }
        setIsEditing(!isEditing);
    };

    const pickSingleImage = async (maxSizeKB: number = 200): Promise<PickedImage | null> => {
        const { status } = await requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "We need access to your photo library to select your profile picture.");
            return null;
        }

        const result = await launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled || !result.assets?.[0]) return null;

        const asset = result.assets[0];
        const maxSizeBytes = maxSizeKB * 1024; // 🔥 Fixed: KB to bytes

        const fileInfo = await getInfoAsync(asset.uri);
        const fileSize = (fileInfo.exists && 'size' in fileInfo ? fileInfo.size : null) ?? asset.fileSize ?? 0;

        if (fileSize > maxSizeBytes) {
            Alert.alert(
                "Image Too Large",
                `The selected image is ${(fileSize / 1024).toFixed(0)}KB.\nPlease choose one smaller than ${maxSizeKB}KB.`
            );
            return null;
        }

        return {
            uri: asset.uri,
            fileName: asset.fileName ?? undefined,
            fileSize: fileSize, // 🔥 Return actual file size
            mimeType: asset.mimeType,
        };
    };



    const updateProfileInfo = async () => {
        const hasChanged =
            user.name !== initialUser.name ||
            user.phone !== initialUser.phone ||
            user.profile_picture !== initialUser.profile_picture;

        if (!hasChanged) {
            Toast.show({
                type: "info",
                text1: "No changes detected",
                text2: "Edit your profile",
            });
            return;
        }

        setIsSaving(true);

        try {
            let imageUrl = user.profile_picture;

            // Upload new image if it's a local URI (not already hosted)
            if (user.profile_picture && user.profile_picture.startsWith("file://")) {
                const imageName = `${session?.user?.id}-${Date.now()}.jpg`;
                const base64 = await readAsStringAsync(user.profile_picture, {
                    encoding: EncodingType.Base64,
                });

                const arrayBuffer = Buffer.from(base64, 'base64');
                const supabase = createClient(
                    process.env.SUPABASE_URL! ?? Constants.expoConfig?.extra?.supabaseUrl,
                    process.env.SUPABASE_ANON_KEY! ??
                    Constants.expoConfig?.extra?.supabaseAnonKey
                );
                const { data, error: uploadError } = await supabase.storage
                    .from("profile_pictures")
                    .upload(imageName, arrayBuffer, {
                        contentType: "image/jpeg",
                        upsert: true,
                    });

                if (uploadError) throw uploadError;
                const { data: publicUrlData } = supabase.storage
                    .from("profile_pictures")
                    .getPublicUrl(imageName);

                imageUrl = publicUrlData.publicUrl;
            }

            // Now update auth + user + therapist/patient
            await Promise.all([
                updateCrudAuthMutaion.mutateAsync({
                    payload: { data: { full_name: user.name, profile_picture: imageUrl } },
                }),
                updateCrudUserMutaion.mutateAsync({
                    payload: { name: user.name, phone: user.phone, profile_picture: imageUrl },
                    column: "user_id",
                    id: session?.user?.id,
                }),
                updateCrudPatientOrTherapistMutaion.mutateAsync({
                    payload: { name: user.name, profile_picture: imageUrl },
                    column: patientTherapist?.column,
                    id: session?.user?.id,
                }),
            ]);

            Toast.show({
                type: "success",
                text1: "Profile updated!",
                text2: "Your profile was successfully updated",
            });
            useCheckAuth()
        } catch (err) {
            Toast.show({
                type: "error",
                text1: "Failed to save changes",
                text2: "Your profile was not updated",
            });
        } finally {
            setIsSaving(false);
        }
    };


    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }
        Alert.alert('Success', 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const signOut = async () => {
        await notificationService.removePushToken();
        await logout()
        if (session?.user.user_metadata?.designation === "therapist") {
            router.replace('/auth/therapist-signin')
        } else {
            // router.replace('/auth/therapist-signin')
            router.replace('/auth/signin')
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={async () => {
                                    if (isEditing) {
                                        const picked = await pickSingleImage();
                                        if (picked?.uri) {
                                            setUser((prev) => ({ ...prev, profile_picture: picked.uri }));
                                        }
                                    }
                                }}
                                disabled={!isEditing}
                            >
                                {/* <Image source={{ uri: user?.profile }} style={styles.avatar} /> */}
                                <Avatar profile_picture={user?.profile_picture} size={60} />
                                {isEditing && (
                                    <View style={styles.avatarEditBadge}>
                                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={styles.profileInfo}>
                                <Text style={styles.userName}>{user?.name}</Text>
                                {/* <Text style={styles.userRole}>
                                    {session?.user?.user_metadata?.designation === "patient"
                                        ? "Therapy Client"
                                        : "Therapy Provider"}
                                </Text> */}
                                <Text style={styles.therapistInfo}>TherapyPlus</Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.editButton}
                                onPress={toggleEdit}
                            >
                                <Text style={styles.editButtonText}>
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    value={user.name}
                                    onChangeText={(text) => setUser({ ...user, name: text })}
                                    editable={isEditing}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={user.email}
                                    editable={false}
                                    keyboardType="email-address"
                                />
                                <Text style={styles.inputHelper}>Email cannot be changed</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    value={user.phone}
                                    onChangeText={(text) => setUser({ ...user, phone: text })}
                                    editable={isEditing}
                                    keyboardType="phone-pad"
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            {isEditing && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.saveButton}
                                    onPress={() => {
                                        // handleSaveProfile();
                                        setIsEditing(false);
                                        updateProfileInfo()
                                    }}
                                >
                                    <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );

            case 'security':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Change Password</Text>
                            <Text style={styles.sectionSubtitle}>
                                Keep your account secure by using a strong password
                            </Text>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.currentPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, currentPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Enter current password"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.newPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, newPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.confirmPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, confirmPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.changePasswordButton}
                                onPress={handleChangePassword}
                            >
                                <Text style={styles.changePasswordButtonText}>
                                    Change Password
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.securityOptions}>
                            <View style={styles.securityOption}>
                                <View>
                                    <Text style={styles.optionTitle}>Biometric Authentication</Text>
                                    <Text style={styles.optionSubtitle}>
                                        Unlock app with fingerprint or face ID
                                    </Text>
                                </View>
                                <Switch
                                    value={biometricAuth}
                                    onValueChange={setBiometricAuth}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor={biometricAuth ? '#FFFFFF' : '#F3F4F6'}
                                />
                            </View>
                        </View>
                    </View>
                );

            case 'settings':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.settingsSection}>
                            <Text style={styles.sectionTitle}>Preferences</Text>

                            <View style={styles.settingItem}>
                                <View>
                                    <Text style={styles.settingTitle}>Push Notifications</Text>
                                    <Text style={styles.settingSubtitle}>
                                        Receive reminders and updates
                                    </Text>
                                </View>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor={notifications ? '#FFFFFF' : '#F3F4F6'}
                                />
                            </View>

                            <TouchableOpacity activeOpacity={0.7} style={styles.settingItem}>
                                <View>
                                    <Text style={styles.settingTitle}>Language</Text>
                                    <Text style={styles.settingSubtitle}>English</Text>
                                </View>
                                <Text style={styles.settingArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.settingItem}>
                                <View>
                                    <Text style={styles.settingTitle}>Privacy Policy</Text>
                                    <Text style={styles.settingSubtitle}>
                                        Review our privacy practices
                                    </Text>
                                </View>
                                <Text style={styles.settingArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.settingItem}>
                                <View>
                                    <Text style={styles.settingTitle}>Terms of Service</Text>
                                    <Text style={styles.settingSubtitle}>
                                        Read our terms and conditions
                                    </Text>
                                </View>
                                <Text style={styles.settingArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.settingItem, styles.dangerItem]}
                                onPress={signOut}
                            >
                                <View>
                                    <Text style={[styles.settingTitle, styles.dangerText]}>
                                        {loading ? "Signing Out..." : "Sign Out"}
                                    </Text>
                                    <Text style={styles.settingSubtitle}>
                                        Sign out of your account
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={24} color={isDark ? 'white' : 'black'} onPress={toggleTheme} />
            </View>

            {/* Tab Bar */}
            <View style={styles.tabContainer}>
                <View style={styles.tabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Ionicons
                                name={activeTab === tab.id ? tab.iconFill : tab.icon}
                                size={20}
                                color={activeTab === tab.id ? colors.primary : '#6B7280'}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.id && styles.activeTabText,
                                ]}
                            >
                                {tab.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderTabContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    tabContainer: {},
    tabBar: {
        flexDirection: 'row',
        paddingTop: 12,
        gap: 8,
        paddingVertical: 10
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '100',
        color: colors.textTertiary,
        paddingTop: 10
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderColor: colors.border,
        borderWidth: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
        backgroundColor: colors.item,
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 12
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    therapistInfo: {
        fontSize: 12,
        color: colors.primary,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    formSection: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 12,
        borderColor: colors.border,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    inputDisabled: {
        backgroundColor: colors.item,
        color: colors.textSecondary,
    },
    inputHelper: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    changePasswordButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    changePasswordButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    securityOptions: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        borderColor: colors.border,
        borderWidth: 1,
    },
    securityOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    settingsSection: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        borderColor: colors.border,
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    settingArrow: {
        fontSize: 20,
        color: colors.textTertiary,
    },
    dangerItem: {
        borderBottomWidth: 0,
    },
    dangerText: {
        color: '#EF4444',
    },
});

export default More;