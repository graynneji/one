import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorMessageProps {
    errorMessage: string | React.ReactNode;
    fn: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMessage, fn }) => {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage || "Failed loading..."}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fn}>
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    errorContainer: {
        alignItems: 'center',
        padding: 20,
        // minHeight: 700,
        justifyContent: 'center',
    },
    errorText: {
        color: '#ff4444',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    retryText: {
        color: '#fff',
    },
})
export default ErrorMessage