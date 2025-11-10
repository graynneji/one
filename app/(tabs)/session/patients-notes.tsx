// import { Colors } from '@/constants/Colors';
// import { useGetById } from '@/hooks/useCrud';
// import { PatientNote, Patients } from '@/types';
// import { capitalizeFirstLetter, formatDate } from '@/utils';
// import { Ionicons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     useColorScheme,
//     View
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";

// const PatientNotesScreen: React.FC = () => {
//     const params = useLocalSearchParams();
//     const router = useRouter();
//     const patientId = params.id as string;
//     const patientName = params.patientName as string;

//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [filterType, setFilterType] = useState<PatientNote['type'] | 'all'>('all');
//     const [refreshing, setRefreshing] = useState(false);

//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];
//     const styles = createStyles(colors);

//     const { data, isLoading, refetch } = useGetById(
//         "patients",
//         { id: patientId },
//         "id, name, patient_notes!patient_id(*, created_at)",
//         !!patientId,
//         {}
//     );

//     const patient = data?.result[0] as Patients;
//     const allNotes = patient?.patient_notes || [];

//     const filteredNotes = allNotes.filter((note: PatientNote) => {
//         const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesType = filterType === 'all' || note.type === filterType;
//         return matchesSearch && matchesType;
//     });

//     const onRefresh = () => {
//         setRefreshing(true);
//         refetch().finally(() => setRefreshing(false));
//     };

//     const getNoteTypeColor = (type: PatientNote['type']) => {
//         switch (type) {
//             case 'session':
//                 return '#007AFF';
//             case 'observation':
//                 return '#28a745';
//             case 'goal':
//                 return '#ffc107';
//             case 'reminder':
//                 return '#dc3545';
//             default:
//                 return '#6c757d';
//         }
//     };
//     const navigation = useNavigation();

//     useFocusEffect(
//         useCallback(() => {
//             navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
//             return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
//         }, [navigation])
//     );
//     const getNoteTypeIcon = (type: PatientNote['type']) => {
//         switch (type) {
//             case 'session':
//                 return 'calendar';
//             case 'observation':
//                 return 'eye';
//             case 'goal':
//                 return 'flag';
//             case 'reminder':
//                 return 'alarm';
//             default:
//                 return 'document-text';
//         }
//     };

//     const noteTypes: Array<PatientNote['type'] | 'all'> = ['all', 'session', 'observation', 'goal', 'reminder'];

//     return (
//         <SafeAreaView style={styles.container} edges={['top']}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity
//                     onPress={() => router.back()}
//                     style={styles.backButton}
//                 >
//                     <Ionicons name="chevron-back" size={28} color={colors.icon} />
//                 </TouchableOpacity>
//                 <View style={styles.headerTextContainer}>
//                     <Text style={styles.headerTitle}>Notes</Text>
//                     <Text style={styles.headerSubtitle}>
//                         {capitalizeFirstLetter(patientName)}
//                     </Text>
//                 </View>
//                 <View style={styles.headerActions}>
//                     <TouchableOpacity style={styles.headerButton}>
//                         <Ionicons name="add-circle-outline" size={28} color={colors.icon} />
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             {/* Search Bar */}
//             <View style={styles.searchContainer}>
//                 <Ionicons name="search" size={20} color={colors.iconSecondary} style={styles.searchIcon} />
//                 <TextInput
//                     style={styles.searchInput}
//                     placeholder="Search notes..."
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                     placeholderTextColor={colors.placeholder}
//                 />
//                 {searchQuery.length > 0 && (
//                     <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
//                         <Ionicons name="close-circle" size={20} color={colors.iconSecondary} />
//                     </TouchableOpacity>
//                 )}
//             </View>

//             {/* Filter Tabs */}
//             <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={styles.filterContainer}
//                 contentContainerStyle={styles.filterContent}
//             >
//                 {noteTypes.map((type) => (
//                     <TouchableOpacity
//                         key={type}
//                         style={[
//                             styles.filterTab,
//                             filterType === type && styles.filterTabActive,
//                             filterType === type && { backgroundColor: type !== 'all' ? getNoteTypeColor(type as PatientNote['type']) : colors.primary }
//                         ]}
//                         onPress={() => setFilterType(type)}
//                     >
//                         <Text style={[
//                             styles.filterTabText,
//                             filterType === type && styles.filterTabTextActive
//                         ]}>
//                             {capitalizeFirstLetter(type)}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </ScrollView>

//             {/* Notes List */}
//             <ScrollView
//                 style={styles.notesList}
//                 refreshControl={
//                     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//                 }
//             >
//                 {isLoading ? (
//                     <View style={styles.loadingContainer}>
//                         <Text style={styles.loadingText}>Loading notes...</Text>
//                     </View>
//                 ) : filteredNotes.length === 0 ? (
//                     <View style={styles.emptyContainer}>
//                         <Ionicons name="document-text-outline" size={64} color={colors.iconSecondary} />
//                         <Text style={styles.emptyText}>
//                             {searchQuery ? 'No notes found' : 'No notes yet'}
//                         </Text>
//                         <Text style={styles.emptySubtext}>
//                             {searchQuery ? 'Try adjusting your search' : 'Add your first note to get started'}
//                         </Text>
//                     </View>
//                 ) : (
//                     filteredNotes.map((note: PatientNote, index: number) => (
//                         <View key={note.id || index} style={styles.noteCard}>
//                             <View style={styles.noteHeader}>
//                                 <View style={[
//                                     styles.noteTypeBadge,
//                                     { backgroundColor: getNoteTypeColor(note.type) }
//                                 ]}>
//                                     <Ionicons
//                                         name={getNoteTypeIcon(note.type) as any}
//                                         size={14}
//                                         color="#fff"
//                                     />
//                                     <Text style={styles.noteTypeBadgeText}>
//                                         {capitalizeFirstLetter(note.type)}
//                                     </Text>
//                                 </View>
//                                 {note.is_private && (
//                                     <View style={styles.privateBadge}>
//                                         <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
//                                         <Text style={styles.privateBadgeText}>Private</Text>
//                                     </View>
//                                 )}
//                             </View>

//                             <Text style={styles.noteContent}>{note.content}</Text>

//                             <View style={styles.noteFooter}>
//                                 <Text style={styles.noteDate}>
//                                     {formatDate(note.created_at)}
//                                 </Text>
//                                 <View style={styles.noteActions}>
//                                     <TouchableOpacity style={styles.noteActionButton}>
//                                         <Ionicons name="create-outline" size={18} color={colors.icon} />
//                                     </TouchableOpacity>
//                                     <TouchableOpacity style={styles.noteActionButton}>
//                                         <Ionicons name="trash-outline" size={18} color={colors.danger} />
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         </View>
//                     ))
//                 )}
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.background,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         backgroundColor: colors.surface,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.divider,
//     },
//     backButton: {
//         paddingRight: 12,
//     },
//     headerTextContainer: {
//         flex: 1,
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: '700',
//         color: colors.text,
//     },
//     headerSubtitle: {
//         fontSize: 13,
//         color: colors.textSecondary,
//         marginTop: 2,
//     },
//     headerActions: {
//         flexDirection: 'row',
//         gap: 8,
//     },
//     headerButton: {
//         padding: 4,
//     },
//     searchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         backgroundColor: colors.surface,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.divider,
//     },
//     searchIcon: {
//         position: 'absolute',
//         left: 28,
//         zIndex: 1,
//     },
//     clearButton: {
//         position: 'absolute',
//         right: 28,
//         zIndex: 1,
//         padding: 4,
//     },
//     searchInput: {
//         flex: 1,
//         backgroundColor: colors.background,
//         borderRadius: 20,
//         paddingVertical: 10,
//         paddingLeft: 40,
//         paddingRight: 40,
//         fontSize: 16,
//         color: colors.text,
//         borderWidth: 1,
//         borderColor: colors.border,
//     },
//     filterContainer: {
//         backgroundColor: colors.surface,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.divider,
//     },
//     filterContent: {
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         gap: 8,
//     },
//     filterTab: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         backgroundColor: colors.background,
//         borderWidth: 1,
//         borderColor: colors.border,
//         marginRight: 8,
//     },
//     filterTabActive: {
//         borderColor: 'transparent',
//     },
//     filterTabText: {
//         fontSize: 14,
//         fontWeight: '500',
//         color: colors.text,
//     },
//     filterTabTextActive: {
//         color: '#fff',
//         fontWeight: '600',
//     },
//     notesList: {
//         flex: 1,
//         paddingHorizontal: 16,
//     },
//     loadingContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 40,
//     },
//     loadingText: {
//         fontSize: 16,
//         color: colors.textSecondary,
//     },
//     emptyContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 80,
//         paddingHorizontal: 32,
//     },
//     emptyText: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: colors.text,
//         marginTop: 16,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: colors.textSecondary,
//         marginTop: 8,
//         textAlign: 'center',
//     },
//     noteCard: {
//         backgroundColor: colors.surface,
//         borderRadius: 12,
//         padding: 16,
//         marginTop: 16,
//         borderWidth: 1,
//         borderColor: colors.border,
//     },
//     noteHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//         gap: 8,
//     },
//     noteTypeBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 12,
//         gap: 4,
//     },
//     noteTypeBadgeText: {
//         color: '#fff',
//         fontSize: 12,
//         fontWeight: '600',
//     },
//     privateBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 10,
//         backgroundColor: colors.background,
//         gap: 4,
//     },
//     privateBadgeText: {
//         color: colors.textSecondary,
//         fontSize: 11,
//         fontWeight: '500',
//     },
//     noteContent: {
//         fontSize: 15,
//         lineHeight: 22,
//         color: colors.text,
//         marginBottom: 12,
//     },
//     noteFooter: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     noteDate: {
//         fontSize: 12,
//         color: colors.textSecondary,
//     },
//     noteActions: {
//         flexDirection: 'row',
//         gap: 12,
//     },
//     noteActionButton: {
//         padding: 4,
//     },
// });

// export default PatientNotesScreen;

import AddNotesModal, { noteFormProps } from '@/components/AddNotesModal';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useCrudCreate, useGetById } from '@/hooks/useCrud';
import { PatientNote, Patients } from '@/types';
import { capitalizeFirstLetter, formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

interface NoteForm {
    content: string;
    type: PatientNote['type'];
    is_private: boolean;
    patient_id: string | number;
}

const PatientNotesScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const patientId = params.id as string;
    const patientName = params.patientName as string;
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterType, setFilterType] = useState<PatientNote['type'] | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState<boolean>(false);
    // const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null);
    const [scrollY] = useState(new Animated.Value(0));

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const styles = createStyles(colors, isDark);

    const { data, isLoading, refetch } = useGetById(
        "patients",
        { id: patientId },
        "id, name, profile_picture, patient_notes!patient_id(*, created_at)",
        !!patientId,
        {}
    );

    const patient = data?.result[0] as Patients;
    const allNotes = patient?.patient_notes || [];

    const memoFilteredNotes = useMemo(() => {
        return allNotes.filter((note: PatientNote) => {
            const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || note.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [allNotes, searchQuery, filterType])
    // const filteredNotes = allNotes.filter((note: PatientNote) => {
    //     const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    //     const matchesType = filterType === 'all' || note.type === filterType;
    //     return matchesSearch && matchesType;
    // });

    const onRefresh = () => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    };

    const getNoteTypeConfig = (type: PatientNote['type']) => {
        const configs = {
            session: {
                color: '#6366F1',
                gradient: ['#6366F1', '#8B5CF6'],
                icon: 'calendar',
                label: 'Session'
            },
            observation: {
                color: '#10B981',
                gradient: ['#10B981', '#059669'],
                icon: 'eye',
                label: 'Observation'
            },
            goal: {
                color: '#F59E0B',
                gradient: ['#F59E0B', '#EF4444'],
                icon: 'flag',
                label: 'Goal'
            },
            reminder: {
                color: '#EF4444',
                gradient: ['#EF4444', '#DC2626'],
                icon: 'alarm',
                label: 'Reminder'
            },
        };
        return configs[type] || { color: '#6B7280', gradient: ['#6B7280', '#4B5563'], icon: 'document-text', label: 'Note' };
    };

    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
            return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
        }, [navigation])
    );

    const noteTypes: Array<PatientNote['type'] | 'all'> = ['all', 'session', 'observation', 'goal', 'reminder'];

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const [noteForm, setNoteForm] = useState<noteFormProps>({
        content: '',
        type: 'session' as PatientNote['type'],
        is_private: false,
        patient_id: ''
    });

    const openAddNoteModal = () => {
        setNoteForm({
            content: '',
            type: 'session',
            is_private: false,
            patient_id: patient?.id
        });
        setIsAddNoteModalVisible(true);
    };
    const createUserMutation = useCrudCreate<NoteForm>("patient_notes", [["patient_notes"], ["patients"]]);

    // const saveNote = () => {
    //     setIsSaving(true)
    //     if (!noteForm.content.trim()) {
    //         Alert.alert('Error', 'Please enter note content');
    //         return;
    //     }

    //     if (!patient.id) return;

    //     const newNote: NoteForm = {
    //         patient_id: patient?.id,
    //         content: noteForm.content.trim(),
    //         type: noteForm.type,
    //         is_private: noteForm.is_private,
    //     };
    //     createUserMutation.mutate(noteForm);
    //     setIsAddNoteModalVisible(false);
    //     setIsSaving(false)
    // }
    const saveNote = async () => {
        setIsSaving(true);

        if (!noteForm.content.trim()) {
            Alert.alert('Error', 'Please enter note content');
            setIsSaving(false);
            return;
        }

        if (!patient?.id) {
            setIsSaving(false);
            return;
        }

        const newNote: NoteForm = {
            patient_id: patient.id,
            content: noteForm.content.trim(),
            type: noteForm.type,
            is_private: noteForm.is_private,
        };

        createUserMutation.mutate(newNote, {
            onSuccess: async () => {
                // await refetch(); // ✅ Refresh notes after creation
                setIsAddNoteModalVisible(false);
                setNoteForm({
                    content: '',
                    type: 'session',
                    is_private: false,
                    patient_id: patient.id,
                });
                setIsSaving(false);
            },
            onError: (error) => {
                console.error('Error creating note:', error);
                Alert.alert('Error', 'Failed to save note. Try again.');
                setIsSaving(false);
            },
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            {/* Floating Header with Blur */}
            <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurHeader}>
                    <View style={styles.floatingHeaderContent}>
                        <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                            {capitalizeFirstLetter(patientName)}
                        </Text>
                        <Text style={styles.floatingHeaderSubtitle}>
                            {memoFilteredNotes.length} {memoFilteredNotes.length === 1 ? 'note' : 'notes'}
                        </Text>
                    </View>
                </BlurView>
            </Animated.View>

            {/* Main Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonCircle}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </View>
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerLabel}>Patient Notes</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {capitalizeFirstLetter(patientName)}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {memoFilteredNotes.length} {memoFilteredNotes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </View>

            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={openAddNoteModal}>
                {/* <View style={styles.addButtonGradient}> */}
                <Ionicons name="document-text-outline" size={26} color="#fff" />
                {/* </View> */}
            </TouchableOpacity>

            {/* Search Bar */}
            {/* <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textSecondary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View> */}

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


            {/* Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                {noteTypes.map((type) => {
                    const isActive = filterType === type;
                    const config = type !== 'all' ? getNoteTypeConfig(type as PatientNote['type']) : null;

                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.filterPill,
                                isActive && styles.filterPillActive,
                                isActive && config && { backgroundColor: config.color }
                            ]}
                            onPress={() => setFilterType(type)}
                            activeOpacity={0.7}
                        >
                            {isActive && config && (
                                <Ionicons name={config.icon as any} size={16} color="#fff" style={styles.filterIcon} />
                            )}
                            <Text style={[
                                styles.filterPillText,
                                isActive && styles.filterPillTextActive
                            ]}>
                                {type === 'all' ? 'All Notes' : config?.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Notes List */}
            <Animated.ScrollView
                style={styles.notesList}
                contentContainerStyle={styles.notesListContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinner}>
                            <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
                        </View>
                        <Text style={styles.loadingText}>Loading notes...</Text>
                    </View>
                ) : memoFilteredNotes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        {/* <View style={styles.emptyIconCircle}> */}
                        <Ionicons
                            name={searchQuery ? "search-outline" : "document-text-outline"}
                            size={56}
                            color={colors.textSecondary}
                        />
                        {/* </View> */}
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No notes found' : 'No notes yet'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery ? 'Try adjusting your search or filters' : 'Tap the + button to create your first note'}
                        </Text>
                    </View>
                ) : (
                    memoFilteredNotes.map((note: PatientNote, index: number) => {
                        const config = getNoteTypeConfig(note.type);

                        return (
                            <View key={note.id || index} style={styles.noteCard}>
                                <View style={styles.noteCardInner}>
                                    {/* Top Bar with Type Badge */}
                                    <View style={styles.noteHeader}>
                                        <View style={[styles.noteTypeBadge, { backgroundColor: config.color }]}>
                                            <Ionicons
                                                name={config.icon as any}
                                                size={14}
                                                color="#fff"
                                            />
                                            <Text style={styles.noteTypeBadgeText}>
                                                {config.label}
                                            </Text>
                                        </View>
                                        {note.is_private && (
                                            <View style={styles.privateBadge}>
                                                <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                                            </View>
                                        )}
                                    </View>

                                    {/* Content */}
                                    <Text style={styles.noteContent} numberOfLines={4}>
                                        {note.content}
                                    </Text>

                                    {/* Footer */}
                                    <View style={styles.noteFooter}>
                                        <View style={styles.noteDateContainer}>
                                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                            <Text style={styles.noteDate}>
                                                {formatDate(note.created_at)}
                                            </Text>
                                        </View>
                                        <View style={styles.noteActions}>
                                            <TouchableOpacity style={styles.noteActionButton} activeOpacity={0.7}>
                                                <Ionicons name="create-outline" size={20} color={colors.text} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.noteActionButton} activeOpacity={0.7}>
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Accent Line */}
                                <View style={[styles.noteAccent, { backgroundColor: config.color }]} />
                            </View>
                        );
                    })
                )}
            </Animated.ScrollView>
            <AddNotesModal
                setIsAddNoteModalVisible={setIsAddNoteModalVisible}
                isAddNoteModalVisible={isAddNoteModalVisible}
                noteForm={noteForm}
                setNoteForm={setNoteForm}
                saveNote={saveNote}
                isSaving={isSaving}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        position: 'relative',
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 50,
    },
    blurHeader: {
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    floatingHeaderContent: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    floatingHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        fontFamily: Typography.heading.bold
    },
    floatingHeaderSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        fontFamily: Typography.heading.semiBold
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12
    },
    backButton: {
        marginRight: 16,
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: Typography.letterSpacing.wide,
        fontFamily: Typography.heading.semiBold,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        fontFamily: Typography.heading.bold

    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        fontFamily: Typography.heading.semiBold

    },
    addButton: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 100,
        position: 'absolute',
        bottom: 70,
        right: 16,
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    addButtonGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
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
    filterContainer: {
        maxHeight: 60,
    },
    filterContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
        gap: 10,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        gap: 6,
    },
    filterPillActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterIcon: {
        marginRight: 2,
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        fontFamily: Typography.body.medium

    },
    filterPillTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    notesList: {
        flex: 1,
    },
    notesListContent: {
        paddingHorizontal: 12,
        paddingBottom: 32,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingSpinner: {
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontFamily: Typography.body.semiBold

    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    // emptyIconCircle: {
    //     width: 120,
    //     height: 120,
    //     borderRadius: 60,
    //     backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     marginBottom: 24,
    // },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: Typography.body.regular

    },
    noteCard: {
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    noteCardInner: {
        padding: 20,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    noteTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    noteTypeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    privateBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteContent: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
        marginBottom: 16,
        fontFamily: Typography.body.regular

    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteDate: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
        fontFamily: Typography.body.medium

    },
    noteActions: {
        flexDirection: 'row',
        gap: 8,
    },
    noteActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteAccent: {
        height: 4,
        width: '100%',
    },
});

export default PatientNotesScreen;