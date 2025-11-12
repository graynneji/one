import Avatar from '@/components/Avatar';
import SwipeablePatientCard from '@/components/SwipeablePatientCard';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useCheckAuth } from '@/context/AuthContext';
import { usePatientInfoContext } from '@/context/patientInfoContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGetById } from '@/hooks/useCrud';
import { useIndividualUnreadCounts, useLastMessages } from '@/hooks/useMsg';
import { PatientNote, Patients } from '@/types';
import { formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { Suspense, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { noteFormProps } from '../../../components/AddNotesModal';
import EarningModal from '../../../components/EarningModal';
import SkeletonLoader from '../../../components/SkeletonLoader';

interface PatientUserData {
    result?: Patients[];
    [key: string]: any
}

interface NoteForm {
    content: string;
    type: PatientNote['type'];
    is_private: boolean;
    patient_id: string | number;
}

const TherapistDashboard: React.FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null);
    const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isEarningsModalVisible, setIsEarningsModalVisible] = useState<boolean>(false);
    const [activeEarningsTab, setActiveEarningsTab] = useState<'overview' | 'banking' | 'payout'>('overview');
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const [archivedPatients, setArchivedPatients] = useState<string[]>([]);
    const { setPatient } = usePatientInfoContext()
    const router = useRouter()
    const { session } = useCheckAuth()
    const staleTime = 1000 * 60 * 60 * 24
    const gcTime = 1000 * 60 * 60 * 24
    const refetchOnWindowFocus = false
    const refetchOnReconnect = false
    const refetchOnMount = false
    const senderId = session?.user?.id!
    const { data: therapistData, isLoading: isLoad, error: therapistError, refetch: refetch1, isError } = useGetById("therapist",
        { therapist_id: senderId },
        "id, balance, pending, total_earning",
        !!senderId,
        {},
        staleTime,
        gcTime,
        refetchOnWindowFocus,
        refetchOnReconnect,
        refetchOnMount
    )

    const therapistId = therapistData?.result[0]?.id;
    const { data, isLoading, error, refetch } = useGetById("patients", { therapist: therapistId }, "id, created_at, name, therapist, patient_id, profile_picture, session_count, selected_answers, is_subscribed, subscription, patient_notes!patient_id(*)", !!therapistId, {})
    const [refreshing, setRefreshing] = useState(false);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    const handleRefetch = () => {
        refetch1()
        refetch()
    }

    const onRefresh = () => {
        try {
            setRefreshing(true);
            handleRefetch();
        } finally {
            setRefreshing(false);
        }
    };

    const [noteForm, setNoteForm] = useState<noteFormProps>({
        content: '',
        type: 'session' as PatientNote['type'],
        is_private: false,
        patient_id: ''
    });

    const allPatients = data?.result ?? [];
    const activePatients = allPatients.filter((p: Patients) => !archivedPatients.includes(p.id.toString()));
    const archived = allPatients.filter((p: Patients) => archivedPatients.includes(p.id.toString()));

    const displayPatients = showArchived ? archived : activePatients;

    const filteredPatients = displayPatients?.filter((patient: Patients) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []

    // const getStatusColor = (status: Patients['subscription']) => {
    //     switch (status) {
    //         case 'active':
    //             return colors.online;
    //         case 'pending':
    //             return colors.sending;
    //         case 'inactive':
    //             return colors.offline;
    //         default:
    //             return colors.offline;
    //     }
    // };

    // const getNoteTypeColor: (type: PatientNote['type']) => '#007AFF' | '#6c757d' | '#dc3545' | '#28a745' | '#ffc107' = (type) => {
    //     switch (type) {
    //         case 'session':
    //             return '#007AFF';
    //         case 'observation':
    //             return '#28a745';
    //         case 'goal':
    //             return '#ffc107';
    //         case 'reminder':
    //             return '#dc3545';
    //         default:
    //             return '#6c757d';
    //     }
    // };

    // const openAddNoteModal = () => {
    //     setNoteForm({
    //         content: '',
    //         type: 'session',
    //         is_private: false,
    //         patient_id: selectedPatient?.id
    //     });
    //     setIsAddNoteModalVisible(true);
    // };

    // const createUserMutation = useCrudCreate<NoteForm>("patient_notes");

    // const saveNote = () => {
    //     if (!noteForm.content.trim()) {
    //         Alert.alert('Error', 'Please enter note content');
    //         return;
    //     }

    //     if (!selectedPatient) return;

    //     const newNote: NoteForm = {
    //         patient_id: selectedPatient?.id,
    //         content: noteForm.content.trim(),
    //         type: noteForm.type,
    //         is_private: noteForm.is_private,
    //     };
    //     createUserMutation.mutate(noteForm);
    //     setIsAddNoteModalVisible(false);
    // }

    const openChat = (patient: Patients) => {
        router.push({
            pathname: "/(tabs)/session/chat",
            params: {
                id: String(patient.id),
                patientId: patient.patient_id,
                patientName: patient.name,
                profile_picture: patient.profile_picture
            },
        });
    };

    const openPatientNotes = (patient: Patients) => {
        // router.push("/(tabs)/session/patients-notes/");
        router.push({
            pathname: "/(tabs)/session/patients-notes",
            params: {
                id: String(patient.id),
                patientName: patient.name,
            },
        });
        // setPatient(patient) // remove the patient context later
    };

    const openPatientInfo = (patient: Patients) => {
        router.push("/(tabs)/session/patients-info/");
        setPatient(patient);
    };

    const toggleArchive = (patientId: string) => {
        if (archivedPatients.includes(patientId)) {
            setArchivedPatients(archivedPatients.filter(id => id !== patientId));
        } else {
            setArchivedPatients([...archivedPatients, patientId]);
        }
    };

    const requestEmergencyAccess = (patient: Patients) => {
        Alert.alert(
            'Emergency Contact Request',
            'This will send a request to platform administrators for emergency contact information. Use only in genuine emergencies.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Access',
                    style: 'destructive',
                    onPress: () => {
                        console.log(`Emergency contact request for patient ${patient.patient_id}`);
                        Alert.alert('Request Sent', 'Emergency contact request has been sent to administrators.');
                    }
                }
            ]
        );
    };

    // const getLastMessage = (patient: Patients) => {
    //     return "No messages yet";
    // };
    const patientIds = data?.result?.map((p: Patients) => p.patient_id) || [];

    const { lastMessages, loading: messagesLoading } = useLastMessages({
        table: "messages",
        senderId: senderId,
        receiverIds: patientIds,
        enabled: !!therapistId && patientIds.length > 0,
    });
    const { unreadCounts } = useIndividualUnreadCounts(
        {
            table: "messages",
            senderId: senderId,
            receiverIds: patientIds,
            enabled: !!therapistId && patientIds.length > 0,
        }
    )
    console.log(unreadCounts, "unread")
    const getUnreadCount = (patient: Patients) => unreadCounts[patient?.patient_id] || null;
    // Update getLastMessage function
    const getLastMessage = (patient: Patients) => {

        const lastMsg = lastMessages[patient?.patient_id];

        if (!lastMsg) return "No messages yet";

        const prefix = lastMsg.sender_id === senderId ? "You: " : "";
        const content = lastMsg.message || "No messages yet";

        return content.length > 50 ? prefix + content.slice(0, 50) + "..." : prefix + content;
    };

    const getLastMessageTime = (patient: Patients) => {
        const msg = lastMessages[patient?.patient_id];
        if (!msg) return "";

        const date = new Date(msg.created_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return formatDate(date);
    };


    if (isLoad || isLoading) {
        return <SkeletonLoader />
    }
    //    name: session?.user?.user_metadata?.full_name || User.name,
    //         email: session?.user?.email || User.email,
    //         phone: "+234 (80) 123-4567", // fallback phone
    //         profile: session?.user?.user_metadata?.profile_picture
    // if (!selectedPatient) {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Enhanced Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.logoText}>TheraPlus</Text>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Avatar profile_picture={session?.user?.user_metadata?.profile_picture} />
                        <View>
                            <Text style={styles.headerTitle}>{session?.user?.user_metadata?.full_name}</Text>
                            <Text style={styles.headerSubtitle}>
                                {activePatients.length} active patient{activePatients.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => setIsEarningsModalVisible(true)}
                            style={styles.headerButton}
                        >
                            <Ionicons name="wallet-outline" size={24} color={colors.icon} />
                        </TouchableOpacity>

                    </View>
                </View>

                {/* <View style={styles.headerDivider} /> */}
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <TouchableOpacity
                        onPress={() => setShowArchived(!showArchived)}
                        style={styles.headerButton}
                    >
                        <Ionicons
                            name={showArchived ? "apps-outline" : "archive-outline"}
                            size={24}
                            color={colors.icon}
                        />
                    </TouchableOpacity>
                </View>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.iconSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.placeholder}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={colors.iconSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showArchived && (
                <View style={styles.archivedBanner}>
                    <Ionicons name="archive" size={16} color={colors.textSecondary} />
                    <Text style={styles.archivedBannerText}>Archived Chats</Text>
                </View>
            )}

            <ScrollView
                style={styles.patientsList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Suspense fallback={<Text style={{ marginTop: 12, color: colors.text }}>Loading...</Text>}>
                    {(error || therapistError || isError) ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color={colors.failed} />
                            <Text style={styles.errorText}>Error loading patients</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRefetch}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredPatients.length === 0 ? (
                        <View style={styles.noPatients}>
                            <Ionicons name={showArchived ? "archive-outline" : "chatbubbles-outline"} size={64} color={colors.iconSecondary} />
                            <Text style={styles.noPatientsText}>
                                {showArchived ? 'No archived chats' : 'No patients yet'}
                            </Text>
                            <Text style={styles.noPatientsSubtext}>
                                {showArchived
                                    ? 'Archived conversations will appear here'
                                    : 'You will be matched with patients to get started'}
                            </Text>
                        </View>
                    ) : (
                        filteredPatients.map((patient: Patients) => (
                            <SwipeablePatientCard
                                key={patient.id}
                                patient={patient}
                                onPress={() => openChat(patient)}
                                onArchive={() => toggleArchive(patient.id.toString())}
                                onViewNotes={() => openPatientNotes(patient)}
                                onViewInfo={() => openPatientInfo(patient)}
                                isArchived={showArchived}
                                getLastMessage={getLastMessage}
                                getLastMessageTime={getLastMessageTime}
                                getUnreadCount={getUnreadCount}
                                colors={colors}
                                styles={styles}
                            />
                        ))
                    )}
                </Suspense>
            </ScrollView>

            <EarningModal
                isEarningsModalVisible={isEarningsModalVisible}
                setIsEarningsModalVisible={setIsEarningsModalVisible}
                therapistData={therapistData}
                activeEarningsTab={activeEarningsTab}
                setActiveEarningsTab={setActiveEarningsTab}
            />
        </SafeAreaView>
    );
}

// return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//         <View style={styles.header}>
//             <TouchableOpacity
//                 onPress={() => setSelectedPatient(null)}
//                 style={styles.backButton}
//             >
//                 <View style={styles.backButtonTextCon}>
//                     <Ionicons name="chevron-back-outline" size={26} color={colors.icon} />
//                     <Text style={styles.backButtonText}>Back</Text>
//                 </View>
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>{capitalizeFirstLetter(selectedPatient.name)}</Text>
//             <TouchableOpacity onPress={() => openChat(selectedPatient)}>
//                 <Ionicons name='chatbubbles-outline' size={24} color={colors.icon} />
//             </TouchableOpacity>
//         </View>

//         <ScrollView style={styles.patientDetailContainer}>
//             <View style={styles.infoCard}>
//                 <Text style={styles.cardTitle}>Patient Information</Text>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Patient ID:</Text>
//                     <Text style={styles.infoValue}>{generatePatientId(selectedPatient?.created_at, selectedPatient?.id)}</Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Joined:</Text>
//                     <Text style={styles.infoValue}>
//                         {formatDate(selectedPatient.created_at)}
//                     </Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Communication:</Text>
//                     <Text style={[styles.infoValue, styles.commPref]}>
//                         In-app
//                     </Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Subscription:</Text>
//                     <View style={[
//                         styles.statusBadge,
//                         { backgroundColor: getStatusColor(selectedPatient.is_subscribed ? 'active' : 'inactive') }
//                     ]}>
//                         <Text style={styles.statusText}>{selectedPatient.is_subscribed ? 'active' : 'inactive'}</Text>
//                     </View>
//                 </View>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Sessions:</Text>
//                     <Text style={styles.infoValue}>{selectedPatient.appointment?.length || 0} sessions</Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                     <Text style={styles.infoLabel}>Emergency Contact:</Text>
//                     <View style={styles.emergencyContactRow}>
//                         <Text style={[
//                             styles.infoValue,
//                             { color: true ? colors.online : colors.danger }
//                         ]}>
//                             {true ? 'Available' : 'Not provided'}
//                         </Text>
//                         {true && (
//                             <TouchableOpacity
//                                 style={styles.emergencyButton}
//                                 onPress={() => requestEmergencyAccess(selectedPatient)}
//                             >
//                                 <Text style={styles.emergencyButtonText}>Emergency Access</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 </View>
//             </View>

//             <View style={styles.actionCard}>
//                 <Text style={styles.cardTitle}>Quick Actions</Text>
//                 <View style={styles.actionButtons}>
//                     <TouchableOpacity
//                         style={styles.actionButton}
//                         onPress={() => router.push("schedule")}
//                     >
//                         <Text style={styles.actionButtonText}>Schedule Session</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         style={[styles.actionButton, styles.secondaryButton]}
//                         onPress={() => openChat(selectedPatient)}
//                     >
//                         <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
//                             Secure Message
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <Notes
//                 openAddNoteModal={openAddNoteModal}
//                 selectedPatient={selectedPatient}
//                 getNoteTypeColor={getNoteTypeColor}
//             />
//         </ScrollView>

//         <AddNotesModal
//             setIsAddNoteModalVisible={setIsAddNoteModalVisible}
//             isAddNoteModalVisible={isAddNoteModalVisible}
//             noteForm={noteForm}
//             setNoteForm={setNoteForm}
//             saveNote={saveNote}
//         />
// </SafeAreaView>
// );
// };

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    logoText: {
        color: colors.text,
        paddingHorizontal: 16,
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 12,
        fontFamily: Typography.logo.bold
    },
    headerContainer: {
        backgroundColor: colors.surface,
        // borderBottomWidth: 1,
        // borderBottomColor: colors.divider,
        marginBottom: 8
    },
    headerTitleContainer: {
        paddingHorizontal: 16,
        paddingBottom: 4,
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    therapistAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    therapistAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primaryText,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        fontFamily: Typography.heading.medium
    },
    headerSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        padding: 6,
        borderRadius: 8,
    },
    backButton: {
        paddingRight: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backButtonTextCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backButtonText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 28,
        zIndex: 1,
    },
    clearButton: {
        position: 'absolute',
        right: 28,
        zIndex: 1,
        padding: 4,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 10,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    archivedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        backgroundColor: colors.surface,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    archivedBannerText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    errorContainer: {
        alignItems: 'center',
        padding: 20,
        minHeight: 400,
        justifyContent: 'center',
    },
    errorText: {
        color: colors.failed,
        marginTop: 12,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: colors.primaryText,
        fontWeight: '600',
    },
    noPatients: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    noPatientsText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
        fontFamily: Typography.body.semiBold
    },
    noPatientsSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: Typography.body.regular
    },
    patientsList: {
        flex: 1,
    },
    swipeContainer: {
        position: 'relative',
        marginBottom: 0,
        height: 96,
    },
    swipeActionsContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        width: 240,
    },
    swipeAction: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    swipeActionText: {
        color: '#fff',
        fontSize: 11,
        marginTop: 4,
        fontFamily: Typography.body.regular
    },
    notesCountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    notesCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    patientCardWrapper: {
        backgroundColor: colors.background,
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
        height: 96,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
        borderBlockColor: colors.divider,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primaryText,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.background,
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    patientName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.inputText,
        flex: 1,
        fontFamily: Typography.heading.medium
    },
    messageTime: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 8,
    },
    messagePreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    lastMessage: {
        fontSize: 16,
        color: colors.textSecondary,
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadText: {
        color: colors.primaryText,
        fontSize: 11,
        fontWeight: '700',
    },
    patientMetadata: {
        flexDirection: 'row',
        gap: 8,
    },
    metadataBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        // backgroundColor: colors.surface,
        borderRadius: 10,
    },
    metadataText: {
        fontSize: 12,
        // color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    patientDetailContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderColor: colors.border,
        borderWidth: 1,
    },
    actionCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderColor: colors.border,
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    commPref: {
        textTransform: 'capitalize',
    },
    emergencyContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyButton: {
        backgroundColor: colors.danger,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    actionButtonText: {
        color: colors.primaryText,
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: colors.primary,
    },
});

export default TherapistDashboard;