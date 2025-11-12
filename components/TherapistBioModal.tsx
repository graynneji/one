import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface TherapistProps {
    name: string;
    specialization: string;
    license: string
    summary: string
    profile_picture: string;
    years_of_experience: number
}

interface TherapistBioModalProps {
    showTherapistBio: boolean;
    setShowTherapistBio: Dispatch<SetStateAction<boolean>>
    therapist: TherapistProps
}


const TherapistBioModal: React.FC<TherapistBioModalProps> = ({ showTherapistBio, setShowTherapistBio, therapist }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const therapistInfo = {
        name: 'Dr. Sarah Johnson',
        specialty: 'Clinical Psychologist',
        experience: '8 years',
        education: 'PhD in Clinical Psychology, Stanford University',
        specializations: ['Anxiety', 'Depression', 'Trauma', 'Relationships'],
        bio: 'Dr. Sarah is a licensed clinical psychologist with extensive experience in cognitive behavioral therapy and mindfulness-based interventions.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        sessions: 1247,
    };
    return (
        <Modal
            visible={showTherapistBio}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.bioModalOverlay}>
                <View style={styles.bioContainer}>
                    <View style={styles.bioHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowTherapistBio(false)}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bioContent}>
                        {therapist?.profile_picture ? <Image
                            source={{ uri: therapist?.profile_picture }}
                            style={styles.therapistImage}
                        /> :
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={30} color={colors.primary} />
                            </View>
                        }
                        <View>

                            <Text style={styles.therapistName}>{therapist?.name}</Text>
                            {/* <VerifiedBadge plan='gold' therapist={true} isSubscribed={true} /> */}
                        </View>
                        <Text style={styles.therapistSpecialty}>{therapist?.specialization}</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{therapistInfo.rating}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                                <Ionicons name="star" size={16} color="#FFD700" />
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{therapistInfo.sessions}</Text>
                                <Text style={styles.statLabel}>Sessions</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{therapist?.years_of_experience}</Text>
                                <Text style={styles.statLabel}>Experience</Text>
                            </View>
                        </View>

                        <Text style={styles.bioSectionTitle}>License number</Text>
                        <Text style={styles.bioText}>{therapist.license}</Text>

                        <Text style={styles.bioSectionTitle}>Specializations</Text>
                        <View style={styles.specializationsContainer}>

                            <View style={styles.specializationTag}>
                                <Text style={styles.specializationText}>{therapist?.specialization}</Text>
                            </View>

                            {/* {therapistInfo.specializations.map((spec, index) => (
                                <View key={index} style={styles.specializationTag}>
                                    <Text style={styles.specializationText}>{spec}</Text>
                                </View>
                            ))} */}
                        </View>

                        <Text style={styles.bioSectionTitle}>About</Text>
                        <Text style={styles.bioText}>{therapist.summary}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    // Bio Modal Styles
    bioModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bioContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.textTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bioContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarPlaceholder: {
        backgroundColor: '#a3676086',
        alignItems: 'center',
        justifyContent: 'center',
    },
    therapistImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 50,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16
    },
    avatarText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 26,
    },
    therapistName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    therapistSpecialty: {
        fontSize: 16,
        color: colors.textTertiary,
        textAlign: 'center',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 32,
        paddingVertical: 20,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: 4,
    },
    bioSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.placeholder,
        marginBottom: 8,
        marginTop: 20,
    },
    bioText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    specializationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    specializationTag: {
        backgroundColor: '#e8f5e8',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    specializationText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
})

export default TherapistBioModal