import Avatar from '@/components/Avatar';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { usePatientInfoContext } from '@/context/patientInfoContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { capitalizeFirstLetter, formatDate } from '@/utils';
import { generatePatientId } from '@/utils/uniqueId';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const PatientInformationScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const { patient } = usePatientInfoContext()
    const router = useRouter();
    const patientId = params.id as string;
    // const patient = JSON.parse(params.patient as string) as Patients;
    const [refreshing, setRefreshing] = useState(false);
    const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    const requestEmergencyAccess = useCallback(() => {
        Alert.alert(
            'Emergency Contact Request',
            'This will send a request to platform administrators for emergency contact information. Use only in genuine emergencies.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Access',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Request Sent', 'Emergency contact request has been sent to administrators.');
                    }
                }
            ]
        );
    }, []);

    const openChat = () => {
        router.push({
            pathname: "/session/chat",
            params: {
                id: String(patient.id),
                patientId: patient.patient_id,
                patientName: patient.name,
                profile_picture: patient.profile_picture
            },
        });
    };

    const openAppointment = () => {
        router.push({
            pathname: "/appointment",
            params: {
                id: String(patient.id),
                patientName: patient.name,
            },
        });
    };

    const openNotes = () => {
        router.push({
            pathname: "/session/patients-notes",
            params: {
                id: String(patient.id),
                patientName: patient.name,
            },
        });
    };

    if (!patient) {
        // if (isLoading || !patient) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading patient information...</Text>
                </View>
            </SafeAreaView>
        );
    }
    const totalSessions = patient?.session_count || 0;
    const totalNotes = patient.patient_notes?.length || 0;
    const daysSinceJoined = Math.floor((new Date().getTime() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.icon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Patient Profile</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.icon} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} />}
            // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Avatar profile_picture={patient.profile_picture} size={70} />
                        {patient.is_subscribed && (
                            <View style={styles.onlineIndicator} />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.patientName}>{capitalizeFirstLetter(patient.name)}</Text>
                        <Text style={styles.patientId}>
                            ID: {generatePatientId(patient.created_at, patient.id)}
                        </Text>
                        <View style={styles.statusPill}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>
                                {patient.is_subscribed ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={openChat}>
                        <View style={styles.quickActionIconGreen}>
                            <Ionicons name="chatbubble" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickActionLabel}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton} onPress={openAppointment}>
                        <View style={styles.quickActionIconBlue}>
                            <Ionicons name="calendar" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickActionLabel}>Appointment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton} onPress={openNotes}>
                        <View style={styles.quickActionIconOrange}>
                            <Ionicons name="document-text" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickActionLabel}>Notes</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                        <Text style={styles.statValue}>{totalSessions}</Text>
                        <Text style={styles.statLabel}>Total Sessions</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={24} color={colors.primary} />
                        <Text style={styles.statValue}>{daysSinceJoined}</Text>
                        <Text style={styles.statLabel}>Days Active</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="document-outline" size={24} color={colors.primary} />
                        <Text style={styles.statValue}>{totalNotes}</Text>
                        <Text style={styles.statLabel}>Clinical Notes</Text>
                    </View>
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>BASIC INFORMATION</Text>
                    <View style={styles.card}>
                        <InfoItem
                            icon="person-outline"
                            label="Full Name"
                            value={capitalizeFirstLetter(patient.name)}
                            colors={colors}
                        />
                        <InfoItem
                            icon="calendar-outline"
                            label="Member Since"
                            value={formatDate(patient.created_at)}
                            colors={colors}
                        />
                        <InfoItem
                            icon="chatbubbles-outline"
                            label="Primary Contact"
                            value="In-app messaging"
                            colors={colors}
                        />
                        <InfoItem
                            icon="shield-checkmark-outline"
                            label="Subscription"
                            value={patient.is_subscribed ? 'Active Plan' : 'No Active Plan'}
                            colors={colors}
                            valueColor={patient.is_subscribed ? colors.online : colors.offline}
                            isLast
                        />
                    </View>
                </View>

                {/* Treatment Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>TREATMENT OVERVIEW</Text>
                    <View style={styles.card}>
                        <InfoItem
                            icon="medical-outline"
                            label="Total Sessions"
                            value={`${totalSessions} session${totalSessions > 1 ? 's' : ''}`}
                            colors={colors}
                        />
                        <InfoItem
                            icon="document-text-outline"
                            label="Clinical Notes"
                            value={`${totalNotes} note${totalNotes > 1 ? 's' : ''}`}
                            colors={colors}
                        />
                        <InfoItem
                            icon="pulse-outline"
                            label="Days in Treatment"
                            value={`${daysSinceJoined} days`}
                            colors={colors}
                        />
                        <InfoItem
                            icon="trending-up-outline"
                            label="Progress"
                            value="On track"
                            colors={colors}
                            valueColor={colors.online}
                            isLast
                        />
                    </View>
                </View>

                {/* Initial Assessment - Collapsible */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.sectionHeaderRow}
                        onPress={() => setIsAssessmentExpanded(!isAssessmentExpanded)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionHeader}>INITIAL ASSESSMENT</Text>
                            <View style={styles.assessmentBadge}>
                                <Text style={styles.assessmentBadgeText}>Intake Form</Text>
                            </View>
                        </View>
                        <Ionicons
                            name={isAssessmentExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={colors.iconSecondary}
                        />
                    </TouchableOpacity>

                    {isAssessmentExpanded && (
                        <View style={styles.card}>
                            {Object.entries(patient.selected_answers[0]).map(([question, answer], index) => (
                                <QuestionItem
                                    key={index}
                                    question={question}
                                    answer={String(answer)}
                                    colors={colors}
                                    isLast={index === Object.entries(patient.selected_answers[0]).length - 1}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Emergency Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>EMERGENCY ACCESS</Text>
                    <View style={styles.card}>
                        <View style={styles.emergencyCard}>
                            <View style={styles.emergencyIconContainer}>
                                <Ionicons name="shield-checkmark" size={28} color={colors.danger} />
                            </View>
                            <Text style={styles.emergencyTitle}>Protected Information</Text>
                            <Text style={styles.emergencyDescription}>
                                Emergency contact details require special authorization. Request access only in critical situations.
                            </Text>
                            <TouchableOpacity style={styles.emergencyButton} onPress={requestEmergencyAccess}>
                                <Ionicons name="lock-open-outline" size={18} color="#fff" />
                                <Text style={styles.emergencyButtonText}>Request Emergency Access</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// Info Item Component
const InfoItem: React.FC<{
    icon: string;
    label: string;
    value: string;
    colors: typeof Colors.light;
    valueColor?: string;
    isLast?: boolean;
}> = ({ icon, label, value, colors, valueColor, isLast }) => {
    return (
        <View style={[styles.infoItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
            <View style={styles.infoLeft}>
                <View style={[styles.infoIconContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name={icon as any} size={18} color={colors.iconSecondary} />
                </View>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
            <Text style={[styles.infoValue, { color: valueColor || colors.text }]}>{value}</Text>
        </View>
    );
};

// Question Item Component
const QuestionItem: React.FC<{
    question: string;
    answer: string;
    colors: typeof Colors.light;
    isLast?: boolean;
}> = ({ question, answer, colors, isLast }) => {
    return (
        <View style={[styles.questionItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
            <Text style={[styles.questionText, { color: colors.textSecondary }]}>{question}</Text>
            <Text style={[styles.answerText, { color: colors.text }]}>{answer}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.light.divider,
    },
    backButton: {
        paddingRight: 12,
    },
    headerTitle: {
        fontSize: Typography.size['2xl'],
        fontWeight: '600',
        color: Colors.light.text,
        flex: 1,
        fontFamily: Typography.heading.bold,
        // letterSpacing: Typography.letterSpacing.wider
    },
    headerButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        fontFamily: Typography.body.regular
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 8,
        borderBottomColor: Colors.light.background,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '600',
        color: Colors.light.primaryText,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.light.online,
        borderWidth: 3,
        borderColor: Colors.light.surface,
    },
    profileInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 22,
        fontFamily: Typography.heading.medium,
        color: Colors.light.text,
        marginBottom: 4,
    },
    patientId: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        marginBottom: 8,
        fontFamily: Typography.body.regular,

    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: Colors.light.online + '20',
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.online,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.online,
        fontFamily: Typography.body.semiBold,

    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 8,
        borderBottomColor: Colors.light.background,
    },
    quickActionButton: {
        alignItems: 'center',
        gap: 8,
    },
    quickActionIconGreen: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#25D366',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIconBlue: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIconOrange: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF9500',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.light.text,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 8,
        borderBottomColor: Colors.light.background,
    },
    statItem: {
        flex: 1,
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    section: {
        paddingTop: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        fontFamily: Typography.heading.medium

    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    assessmentBadge: {
        backgroundColor: Colors.light.primary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    assessmentBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    card: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    infoIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 15,
        fontWeight: '400',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    questionItem: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    questionText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        lineHeight: 20,
    },
    answerText: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
    emergencyCard: {
        padding: 20,
        alignItems: 'center',
    },
    emergencyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.light.danger + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emergencyTitle: {
        fontSize: Typography.size.lg,
        // fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
        fontFamily: Typography.heading.medium

    },
    emergencyDescription: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: Typography.body.regular

    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.danger,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        shadowColor: Colors.light.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: Typography.body.semiBold

    },
});

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    ...styles,
    container: {
        ...styles.container,
        backgroundColor: colors.background,
    },
    header: {
        ...styles.header,
        backgroundColor: colors.surface,
        borderBottomColor: colors.divider,
    },
    headerTitle: {
        ...styles.headerTitle,
        color: colors.text,
    },
    loadingText: {
        ...styles.loadingText,
        color: colors.textSecondary,
    },
    profileHeader: {
        ...styles.profileHeader,
        backgroundColor: colors.surface,
        borderBottomColor: colors.background,
    },
    avatar: {
        ...styles.avatar,
        backgroundColor: colors.primary,
    },
    avatarText: {
        ...styles.avatarText,
        color: colors.primaryText,
    },
    onlineIndicator: {
        ...styles.onlineIndicator,
        backgroundColor: colors.online,
        borderColor: colors.surface,
    },
    patientName: {
        ...styles.patientName,
        color: colors.text,
    },
    patientId: {
        ...styles.patientId,
        color: colors.textSecondary,
    },
    statusPill: {
        ...styles.statusPill,
        backgroundColor: colors.online + '20',
    },
    statusDot: {
        ...styles.statusDot,
        backgroundColor: colors.online,
    },
    statusText: {
        ...styles.statusText,
        color: colors.online,
    },
    quickActions: {
        ...styles.quickActions,
        backgroundColor: colors.surface,
        borderBottomColor: colors.background,
    },
    quickActionLabel: {
        ...styles.quickActionLabel,
        color: colors.text,
    },
    statsGrid: {
        ...styles.statsGrid,
        backgroundColor: colors.surface,
        borderBottomColor: colors.background,
    },
    statItem: {
        ...styles.statItem,
        backgroundColor: colors.background,
        borderColor: colors.border,
    },
    statValue: {
        ...styles.statValue,
        color: colors.text,
    },
    statLabel: {
        ...styles.statLabel,
        color: colors.textSecondary,
    },
    sectionHeader: {
        ...styles.sectionHeader,
        color: colors.textSecondary,
    },
    assessmentBadge: {
        ...styles.assessmentBadge,
        backgroundColor: colors.primary + '20',
    },
    assessmentBadgeText: {
        ...styles.assessmentBadgeText,
        color: colors.primary,
    },
    card: {
        ...styles.card,
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    emergencyIconContainer: {
        ...styles.emergencyIconContainer,
        backgroundColor: colors.danger + '15',
    },
    emergencyTitle: {
        ...styles.emergencyTitle,
        color: colors.text,
    },
    emergencyDescription: {
        ...styles.emergencyDescription,
        color: colors.textSecondary,
    },
    emergencyButton: {
        ...styles.emergencyButton,
        backgroundColor: colors.danger,
        shadowColor: colors.danger,
    },
});

export default PatientInformationScreen;