import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCrudCreate, useGetById, useRpc } from '@/hooks/useCrud';
import { sendMessage } from '@/types';
import { capitalizeFirstLetter, formatDate, formatDateTime } from '@/utils';
import { generatePatientId } from '@/utils/uniqueId';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

// Define the two individual filter types
type TherapistFilter = { therapist_id: string };
type PatientFilter = { patient_id: string };

// Define the combined type for the generic T
type AppointmentBaseFilter = {
    therapist_id?: string;
    patient_id?: string;
};

// Database appointment interface
interface DbAppointment {
    id: number;
    title: string;
    time: string;
    background_color: string;
    border_color: string;
    description?: string;
}

// Event interface
interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    color: string;
    category: string;
}

// Patient interface
interface Patient {
    id: string;
    name: string;
    patient_id: string;
    created_at: string;
}

// Color palette for events
const EVENT_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
];

const EVENT_CATEGORIES = [
    'Work',
    'Personal',
    'Health',
    'Social',
    'Education',
    'Travel',
    'Other'
];

const Schedule: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [showPatientPicker, setShowPatientPicker] = useState<boolean>(false);
    const createAppointmentMutaion = useCrudCreate("appointment", [["messages"], ["appointment"]]);
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const createMessageMutation = useCrudCreate<sendMessage>("messages")

    const { session } = useCheckAuth();
    const userId = session?.user?.id!;
    const isTherapist = session?.user?.user_metadata?.designation === "therapist";

    const therapistFilter: TherapistFilter = {
        therapist_id: userId
    };
    const patientFilter: PatientFilter = {
        patient_id: userId
    };

    const { data: therapistIdPatientUser, isLoading, error: therapistIdPatientUserError } = useGetById(
        "user",
        { user_id: userId },
        "therapist(name, therapist_id)",
        !!userId && !isTherapist,
        {},
    )
    // Fetch appointments
    const { data, error, refetch } = useGetById(
        "appointment",
        isTherapist
            ? (therapistFilter as Partial<AppointmentBaseFilter>)
            : (patientFilter as Partial<AppointmentBaseFilter>),
        "id, time, title, background_color, border_color, description",
        !!userId,
        {}
    );
    // Fetch therapist data
    const { data: therapistData, error: therapyError } = useGetById(
        "therapist",
        { therapist_id: userId },
        "id",
        !!userId && isTherapist,
        {}
    );

    const therapistId = therapistData?.result[0]?.id;

    // Fetch patients (only for therapists)
    const { data: patientsData, error: patientError } = useGetById(
        "patients",
        { therapist: therapistId },
        "id, name, patient_id, created_at",
        !!therapistId,
        {}
    );

    const patients = patientsData?.result || [];
    // Convert database appointments to calendar events
    useEffect(() => {
        if (data?.result) {
            const convertedEvents: CalendarEvent[] = data.result.map((apt: DbAppointment) => {
                const appointmentDate = new Date(apt.time);
                const dateString = appointmentDate.toISOString().split('T')[0];
                const timeString = appointmentDate.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

                return {
                    id: apt.id.toString(),
                    title: apt.title,
                    description: apt.description ?? '', // Ensure description is always a string
                    date: dateString,
                    time: timeString,
                    color: apt.background_color,
                    category: 'Health', // Default category, update based on your needs
                };
            });
            setEvents(convertedEvents);
        }
    }, [data]);

    // Form state
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        time: new Date(),
        color: EVENT_COLORS[0],
        category: EVENT_CATEGORIES[0],
    });

    // Generate marked dates for calendar
    const getMarkedDates = () => {
        const marked: { [key: string]: any } = {};

        events.forEach(event => {
            if (!marked[event.date]) {
                marked[event.date] = { dots: [] };
            }
            marked[event.date].dots.push({ color: event.color });
        });

        // Add selection styling
        if (selectedDate) {
            marked[selectedDate] = {
                ...marked[selectedDate],
                selected: true,
                selectedColor: '#007AFF',
            };
        }

        return marked;
    };

    // Handle date selection
    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString === selectedDate ? '' : day.dateString);
    };

    // Open modal for new event
    const openAddEventModal = () => {
        setEventForm({
            title: '',
            description: '',
            time: new Date(),
            color: EVENT_COLORS[0],
            category: EVENT_CATEGORIES[0],
        });
        setSelectedPatient('');
        setEditingEvent(null);
        setIsModalVisible(true);
    };

    // Open modal for editing event
    const openEditEventModal = (event: CalendarEvent) => {
        const [hours, minutes] = event.time.split(':');
        const eventTime = new Date();
        eventTime.setHours(parseInt(hours), parseInt(minutes));

        setEventForm({
            title: event.title,
            description: event.description,
            time: eventTime,
            color: event.color,
            category: event.category,
        });
        setEditingEvent(event);
        setIsModalVisible(true);
    };
    const mergeDateTime = (date: string, time: Date): string => {
        const [year, month, day] = date.split("-").map(Number);

        const merged = new Date(year, month - 1, day); // start with the selected date
        merged.setHours(time.getHours(), time.getMinutes(), 0, 0); // keep hours/minutes from time picker

        return merged.toISOString(); // store as ISO string in DB
    };
    const rpcViewMutation = useRpc("increment_patient_session", ["patients"])
    // Save event
    const saveEvent = async () => {
        setIsSaving(true)
        if (!eventForm.title.trim()) {
            Alert.alert('Error', 'Please enter an event title');
            return;
        }

        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date first');
            return;
        }

        if (isTherapist && !selectedPatient && !editingEvent) {
            Alert.alert('Error', 'Please select a patient');
            return;
        }

        const timeString = eventForm.time.toTimeString().slice(0, 5);

        if (editingEvent) {
            // Update existing event in database
            // TODO: Call your update API here
            setEvents(prev => prev.map(event =>
                event.id === editingEvent.id
                    ? {
                        ...event,
                        title: eventForm.title,
                        description: eventForm.description,
                        time: timeString,
                        color: eventForm.color,
                        category: eventForm.category,
                    }
                    : event
            ));
        } else {
            // Add new event
            // TODO: Call your create API here with selectedPatient for therapists
            const newEvent = {
                // id: Date.now().toString(),
                title: eventForm.title,
                description: eventForm.description,
                // date: selectedDate,
                time: mergeDateTime(selectedDate, eventForm.time),
                // time: timeString,
                background_color: eventForm.color,
                border_color: eventForm.color,
                patient_id: !isTherapist ? userId : selectedPatient,
                therapist_id: isTherapist ? userId : therapistId
                // color: eventForm.color,
                // category: eventForm.category,
            };
            // setEvents(prev => [...prev, newEvent]);
            const result = await createAppointmentMutaion.mutateAsync(newEvent)

            const result2 = await rpcViewMutation.mutateAsync({ p_patient_id: !isTherapist ? userId : selectedPatient })
            console.log(result2, "yesss")
            const insertSchToMessage = {
                sender_id: userId,
                reciever_id: !isTherapist ? therapistIdPatientUser?.result[0].therapist?.therapist_id : selectedPatient,
                // message: `New appointment scheduled on`,
                message: `New appointment scheduled on ${formatDateTime(result.data.created_at)}`,
                appointment_id: result.data.id,
            }
            const messageResult = await createMessageMutation.mutateAsync(insertSchToMessage)

            // Refetch appointments after creating
            // setTimeout(() => refetch(), 500);
        }
        setIsModalVisible(false);
        setIsSaving(false)
    };

    // Delete event
    const deleteEvent = (eventId: string) => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Call your delete API here
                        setEvents(prev => prev.filter(event => event.id !== eventId));
                        setTimeout(() => refetch(), 500);
                    },
                },
            ]
        );
    };

    // Get events for selected date
    const getEventsForDate = (date: string) => {
        return events
            .filter(event => event.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Handle time picker
    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setEventForm(prev => ({ ...prev, time: selectedTime }));
        }
    };

    const calendarTheme = {
        backgroundColor: colors.surface,
        calendarBackground: colors.surface,
        textSectionTitleColor: colors.textTertiary,
        selectedDayBackgroundColor: '#007AFF',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#007AFF',
        dayTextColor: colors.text,
        textDisabledColor: colors.textTertiary,
        dotColor: '#00adf5',
        selectedDotColor: '#ffffff',
        arrowColor: '#007AFF',
        disabledArrowColor: '#d9e1e8',
        monthTextColor: colors.text,
        indicatorColor: '#007AFF',

    }


    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Appointment</Text>
            </View>
            <TouchableOpacity
                style={styles.createAppointmentBtn}
                onPress={openAddEventModal}
                disabled={!selectedDate}
            >
                <Ionicons name='calendar-outline' size={30} color='#fff' />
            </TouchableOpacity>

            <Calendar
                key={colorScheme}
                style={styles.calendar}
                initialDate={today}
                onDayPress={onDayPress}
                markingType="multi-dot"
                markedDates={getMarkedDates()}
                // theme={{
                //     backgroundColor: '#ffffff',
                //     calendarBackground: '#ffffff',
                //     textSectionTitleColor: '#b6c1cd',
                //     selectedDayBackgroundColor: '#007AFF',
                //     selectedDayTextColor: '#ffffff',
                //     todayTextColor: '#007AFF',
                //     dayTextColor: '#2d4150',
                //     textDisabledColor: '#d9e1e8',
                //     dotColor: '#00adf5',
                //     selectedDotColor: '#ffffff',
                //     arrowColor: '#007AFF',
                //     disabledArrowColor: '#d9e1e8',
                //     monthTextColor: '#2d4150',
                //     indicatorColor: '#007AFF',
                // }}
                theme={calendarTheme}
            />

            {selectedDate && (
                <View style={styles.eventsSection}>
                    <Text style={styles.eventsSectionTitle}>
                        {formatDate(selectedDate)} - Appointments
                    </Text>
                    <ScrollView style={styles.eventsList}>
                        {getEventsForDate(selectedDate).map(event => (
                            <TouchableOpacity
                                key={event.id}
                                style={[styles.eventItem, { borderLeftColor: event.color }]}
                                onPress={() => openEditEventModal(event)}
                            >
                                <View style={styles.eventHeader}>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <TouchableOpacity
                                        // style={styles.deleteButton}
                                        onPress={() => deleteEvent(event.id)}
                                    >
                                        <Ionicons name='close-outline' color={colors.text} size={18} />
                                        {/* <Text style={styles.deleteButtonText}>×</Text> */}
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.eventTime}>{event.time}</Text>
                                <Text style={styles.eventCategory}>{event.category}</Text>
                                {event.description ? (
                                    <Text style={styles.eventDescription}>{event.description}</Text>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                        {getEventsForDate(selectedDate).length === 0 && (
                            <Text style={styles.noEventsText}>No appointments for this day</Text>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Add/Edit Event Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(false)}
                            style={styles.cancelBtn}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editingEvent ? 'Edit Event' : 'Add Event'}
                        </Text>
                        <TouchableOpacity
                            onPress={saveEvent}
                            style={styles.saveButton}
                            disabled={isSaving}
                        >
                            <Text style={[styles.saveButtonText, isSaving && { color: colors.placeholder }]}>{isSaving ? 'Saving' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Patient Selection - Only for Therapists */}
                        {isTherapist && !editingEvent && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Select Patient <Text style={styles.required}>*</Text></Text>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.patientButton}
                                    onPress={() => setShowPatientPicker(true)}
                                >
                                    <Text style={styles.patientButtonText}>
                                        {selectedPatient
                                            ? capitalizeFirstLetter(patients.find((p: Patient) => p.patient_id === selectedPatient)?.name)
                                            : 'Choose a patient'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Title <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.textInput}
                                value={eventForm.title}
                                onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                                placeholder="Enter event title"
                                autoFocus={!isTherapist}
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={eventForm.description}
                                onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                                placeholder="Enter event description"
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Time</Text>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.timeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.timeButtonText}>
                                    {eventForm.time.toTimeString().slice(0, 5)}
                                </Text>
                            </TouchableOpacity>

                            {showTimePicker && (
                                <DateTimePicker
                                    value={eventForm.time}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.categoryContainer}>
                                    {EVENT_CATEGORIES.map(category => (
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            key={category}
                                            style={[
                                                styles.categoryButton,
                                                eventForm.category === category && styles.categoryButtonSelected
                                            ]}
                                            onPress={() => setEventForm(prev => ({ ...prev, category }))}
                                        >
                                            <Text style={[
                                                styles.categoryButtonText,
                                                eventForm.category === category && styles.categoryButtonTextSelected
                                            ]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Color</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.colorContainer}>
                                    {EVENT_COLORS.map(color => (
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            key={color}
                                            style={[
                                                styles.colorButton,
                                                { backgroundColor: color },
                                                eventForm.color === color && styles.colorButtonSelected
                                            ]}
                                            onPress={() => setEventForm(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </SafeAreaView>
                {/* <Modal
                    visible={showPatientPicker}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.pickerModalOverlay}>
                        <View style={styles.pickerModalContent}>
                            <View style={styles.pickerHeader}>
                                <Text style={styles.pickerTitle}>Select Patient</Text>
                                <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                                    <Ionicons name="close" size={24} color="#2d4150" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.patientList}>
                                {patients.map((patient: Patient) => (
                                    <TouchableOpacity
                                        key={patient.patient_id}
                                        style={[
                                            styles.patientItem,
                                            selectedPatient === patient.patient_id && styles.patientItemSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedPatient(patient.patient_id);
                                            setShowPatientPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.patientItemText,
                                            selectedPatient === patient.patient_id && styles.patientItemTextSelected
                                        ]}>
                                            {patient.name}
                                        </Text>
                                        {selectedPatient === patient.patient_id && (
                                            <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal> */}
                <Modal
                    visible={showPatientPicker}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.pickerModalOverlay}>
                        <View style={styles.pickerModalContent}>
                            <View style={styles.pickerHeader}>
                                <Text style={styles.pickerTitle}>Select Patient</Text>
                                <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Patient Count Badge */}
                            <View style={styles.patientCountBadge}>
                                <Ionicons name="people" size={16} color="#4CAF50" />
                                <Text style={styles.patientCountText}>
                                    {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'}
                                </Text>
                            </View>

                            <ScrollView style={styles.patientList}>
                                {patients.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="person-add-outline" size={48} color="#9ca3af" />
                                        <Text style={styles.emptyStateText}>No patients found</Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            Add patients to schedule appointments
                                        </Text>
                                    </View>
                                ) : (
                                    patients.map((patient: Patient) => (
                                        <TouchableOpacity
                                            key={patient.patient_id}
                                            style={[
                                                styles.patientItem,
                                                selectedPatient === patient.patient_id && styles.patientItemSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedPatient(patient.patient_id);
                                                setShowPatientPicker(false);
                                            }}
                                        >
                                            {/* Avatar Circle */}
                                            {/* <View style={[
                                                styles.patientAvatar,
                                                selectedPatient === patient.patient_id && styles.patientAvatarSelected
                                            ]}>
                                                <Text style={styles.patientAvatarText}>
                                                    {patient.name?.charAt(0)?.toUpperCase()}
                                                </Text>
                                            </View> */}

                                            {/* Patient Info */}
                                            <View style={styles.patientInfo}>
                                                <Text style={[
                                                    styles.patientItemText,
                                                    selectedPatient === patient.patient_id && styles.patientItemTextSelected
                                                ]}>
                                                    {capitalizeFirstLetter(patient?.name)}
                                                </Text>
                                                <View style={styles.patientIdContainer}>
                                                    <Ionicons name="card-outline" size={12} color={colors.textSecondary} />
                                                    <Text style={styles.patientIdText}>
                                                        ID: {generatePatientId(patient?.created_at, patient?.id)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Checkmark */}
                                            {selectedPatient === patient.patient_id && (
                                                <View style={styles.checkmarkCircle}>
                                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </Modal>

            {/* Patient Picker Modal */}
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        position: 'relative',
    },
    createAppointmentBtn: {
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        // marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    calendar: {
        marginBottom: 8,
    },
    eventsSection: {
        flex: 1,
        backgroundColor: colors.surface,
        marginTop: 8,
        paddingTop: 16,
    },
    eventsSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    eventsList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    eventItem: {
        backgroundColor: colors.item,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: 12,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#dc3545',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    eventTime: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: 4,
    },
    eventCategory: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        color: colors.textTertiary,
        lineHeight: 20,
    },
    noEventsText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 32,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    cancelBtn: {
        padding: 4,
    },
    cancelBtnText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    saveButton: {
        paddingVertical: 8,
    },
    saveButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    required: {
        color: '#ef4444'
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.inputBackground,
        color: colors.inputText
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        color: colors.inputText
    },
    timeButton: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.inputBackground,
        marginBottom: 5,
    },
    timeButtonText: {
        fontSize: 16,
        color: colors.inputText,
    },
    patientButton: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.inputBackground,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    patientButtonText: {
        fontSize: 16,
        color: colors.inputText,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        marginRight: 8,
    },
    categoryButtonSelected: {
        backgroundColor: colors.primary,
    },
    categoryButtonText: {
        fontSize: 14,
        color: colors.textTertiary,
        fontWeight: '500',
    },
    categoryButtonTextSelected: {
        color: colors.text,
    },
    colorContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorButtonSelected: {
        borderColor: colors.text,
    },
    // pickerModalOverlay: {
    //     flex: 1,
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
    //     justifyContent: 'flex-end',
    // },
    // pickerModalContent: {
    //     backgroundColor: 'white',
    //     borderTopLeftRadius: 20,
    //     borderTopRightRadius: 20,
    //     maxHeight: '70%',
    // },
    // pickerHeader: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     padding: 16,
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#e9ecef',
    // },
    // pickerTitle: {
    //     fontSize: 18,
    //     fontWeight: '600',
    //     color: '#2d4150',
    // },
    // patientList: {
    //     maxHeight: 400,
    // },
    // patientItem: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     padding: 16,
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#f0f0f0',
    // },
    // patientItemSelected: {
    //     backgroundColor: '#f0fdf4',
    // },
    // patientItemText: {
    //     fontSize: 16,
    //     color: '#2d4150',
    // },
    // patientItemTextSelected: {
    //     fontWeight: '600',
    //     color: '#4CAF50',
    // },
    pickerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerModalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    patientCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.item,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: 12,
        marginBottom: 8,
    },
    patientCountText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: 6,
    },
    patientList: {
        maxHeight: 500,
        paddingBottom: 20,
    },
    patientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        backgroundColor: Colors.light ? colors.surface : colors.item,
        borderColor: colors.border,
        borderWidth: 1,
        // borderColor: 'transparent',
    },
    patientItemSelected: {
        backgroundColor: colors.item,
        borderColor: colors.primary,
        borderWidth: 2,
    },
    patientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientAvatarSelected: {
        backgroundColor: colors.primary,
    },
    patientAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    patientInfo: {
        flex: 1,
    },
    patientItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    patientItemTextSelected: {
        color: colors.primary,
    },
    patientIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    patientIdText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    checkmarkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: colors.textTertiary,
        textAlign: 'center',
    },
});

export default Schedule;