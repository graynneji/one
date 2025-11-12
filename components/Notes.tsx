import { Colors } from "@/constants/Colors";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGetById } from "@/hooks/useCrud";
import { NOTE_TYPES, PatientNote } from "@/types";
import { formatDateTime } from "@/utils";
import React, { Fragment } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { NOTE_TYPES, PatientNote } from "./TherapistDashboard";
interface Note {
    notes: []
}
interface NotesProps {
    openAddNoteModal: () => void;
    selectedPatient: {
        id: string | number
        patient_notes: PatientNote[];
    }
    getNoteTypeColor: (type: PatientNote['type']) => '#6c757d' | '#dc3545' | '#007AFF' | '#28a745' | '#ffc107';
}

const Notes: React.FC<NotesProps> = ({ openAddNoteModal, selectedPatient, getNoteTypeColor }) => {
    const { data: patientNotes, error } = useGetById("patient_notes", { patient_id: selectedPatient?.id }, "*", undefined, {})
    const notesCount = patientNotes?.result?.length || 0;
    const hasNotes = notesCount > 0;
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    return (
        <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
                <Text style={styles.cardTitle}>Notes ({notesCount})</Text>
                <TouchableOpacity
                    style={styles.addNoteButton}
                    onPress={openAddNoteModal}
                >
                    <Text style={styles.addNoteButtonText}>+ Add Note</Text>
                </TouchableOpacity>
            </View>

            {!hasNotes ? (
                <Text style={styles.noNotesText}>No notes yet. Add the first note!</Text>
            ) : (
                patientNotes?.result?.map(note => (
                    <Fragment key={`note-${note.id}-${note.type}`}>
                        <View style={styles.noteItem}>
                            <View style={styles.noteHeader}>
                                <View style={styles.noteHeaderLeft}>
                                    <View style={[
                                        styles.noteTypeBadge,
                                        { backgroundColor: getNoteTypeColor(note.type) || "" }
                                    ]}>

                                        <Text style={styles.noteTypeText}>
                                            {NOTE_TYPES.find(t => t.value === note.type)?.label}
                                        </Text>
                                    </View>
                                    {note.is_private && (
                                        <View style={styles.privateBadge}>
                                            <Text style={styles.privateBadgeText}>Private</Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteNoteButton}
                                // onPress={() => deleteNote(note.id)}
                                >
                                    <Text style={styles.deleteNoteButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.noteDate}>
                                {formatDateTime(note.created_at)}
                            </Text>
                            <Text style={styles.noteContent}>{note.content}</Text>
                        </View>
                    </Fragment>
                ))
            )}
        </View>
    )
}
const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    notesCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
        borderColor: colors.border,
        borderWidth: 1,
    },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addNoteButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addNoteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    noNotesText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
        fontStyle: 'italic',
    },
    noteItem: {
        backgroundColor: colors.item,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        // borderColor: colors.border,
        // borderWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    noteHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    noteTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    noteTypeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    privateBadge: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    privateBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    deleteNoteButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#dc3545',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteNoteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    noteDate: {
        fontSize: 12,
        color: colors.text,
        marginBottom: 8,
    },
    noteContent: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
})
export default Notes


