import { Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WelcomeTipModalProp {
    showWelcomeTip: boolean;
    isNewUser: boolean
    setShowWelcomeTip: Dispatch<SetStateAction<boolean>>
}

const WelcomeTip: React.FC<WelcomeTipModalProp> = ({ showWelcomeTip, isNewUser, setShowWelcomeTip }) => (
    <Modal
        visible={showWelcomeTip && isNewUser}
        transparent={true}
        animationType="fade"
    >
        <View style={styles.modalOverlay}>
            <View style={styles.welcomeTipContainer}>
                <View style={styles.tipHeader}>
                    <Ionicons name="bulb-outline" size={24} color="#4CAF50" />
                    <Text style={styles.tipTitle}>Welcome to BetterSpace!</Text>
                </View>
                <Text style={styles.tipText}>
                    • Feel free to share what&apos;s on your mind{'\n'}
                    • Use audio/video calls when you need real-time support{'\n'}
                    • Click on Dr. Sarah&apos;s name to view her profile{'\n'}
                    • Your conversations are private and secure
                </Text>
                <TouchableOpacity
                    style={styles.tipButton}
                    onPress={() => setShowWelcomeTip(false)}
                >
                    <Text style={styles.tipButtonText}>Got it!</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeTipContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 320,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    tipButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tipButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
export default WelcomeTip