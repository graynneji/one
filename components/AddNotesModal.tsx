import { Colors } from "@/constants/Colors";
import { NOTE_TYPES, PatientNote } from "@/types";
import React, { Dispatch, SetStateAction } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface noteFormProps {
    content: string,
    type: "session" | "observation" | "goal" | "reminder",
    is_private: boolean
    patient_id: string | undefined | number
}
interface AddNotesModalProps {
    setIsAddNoteModalVisible: Dispatch<SetStateAction<boolean>>
    isAddNoteModalVisible: boolean
    noteForm: noteFormProps
    isSaving: boolean
    setNoteForm: Dispatch<SetStateAction<noteFormProps>>
    saveNote: () => void
}

const AddNotesModal: React.FC<AddNotesModalProps> = ({
    setIsAddNoteModalVisible,
    isAddNoteModalVisible,
    noteForm,
    setNoteForm,
    saveNote,
    isSaving
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    return (
        <Modal
            visible={isAddNoteModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom', 'left', 'right']}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setIsAddNoteModalVisible(false)}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Note</Text>
                    <TouchableOpacity
                        onPress={saveNote}
                        style={styles.saveButton}
                        disabled={isSaving}
                    >
                        <Text style={[styles.saveButtonText, isSaving && { color: colors.placeholder }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Note Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.typeContainer}>
                                {NOTE_TYPES.map(type => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        key={type.value}
                                        style={[
                                            styles.typeButton,
                                            noteForm.type === type.value && styles.typeButtonSelected
                                        ]}
                                        onPress={() => setNoteForm(prev => ({ ...prev, type: type.value as PatientNote['type'] }))}
                                    >
                                        <Text style={[
                                            styles.typeButtonText,
                                            noteForm.type === type.value && styles.typeButtonTextSelected
                                        ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Content <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={noteForm.content}
                            onChangeText={(text) => setNoteForm(prev => ({ ...prev, content: text }))}
                            placeholder="Enter note content..."
                            multiline
                            numberOfLines={6}
                            maxLength={150}
                            autoFocus
                            placeholderTextColor={colors.placeholder}
                        />
                        <Text style={styles.charCount}>{noteForm.content.length}/280</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        activeOpacity={1}
                        onPress={() => setNoteForm(prev => ({ ...prev, is_private: !prev.is_private }))}
                    >
                        <View style={[
                            styles.checkbox,
                            noteForm.is_private && styles.checkboxChecked
                        ]}>
                            {noteForm.is_private && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Make this note private</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    cancelButton: {
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
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
        color: colors.text,
    },
    required: {
        color: '#ef4444'
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: 'right',
        marginTop: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    typeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: colors.surface,
        marginRight: 8,
    },
    typeButtonSelected: {
        backgroundColor: colors.primary,
    },
    typeButtonText: {
        fontSize: 12,
        color: colors.textTertiary,
        fontWeight: '500',
    },
    typeButtonTextSelected: {
        color: '#fff',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: colors.inputBorder,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: colors.text,
    },
})

export default AddNotesModal