import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,

    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

const VerifyScreen: React.FC = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const router = useRouter();
    const navigation = useNavigation();
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const { verifyOtp, resendOtp } = useCheckAuth()
    const { email } = useLocalSearchParams<{ email?: string }>()

    useEffect(() => {
        let interval: NodeJS.Timeout | null | number = null;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    useEffect(() => {
        // Focus on first input when component mounts
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        // Only allow numbers
        if (text && !/^\d+$/.test(text)) return;

        const newCode = [...code];

        // Handle paste
        if (text.length > 1) {
            const pastedCode = text.slice(0, 6).split('');
            pastedCode.forEach((char, i) => {
                if (index + i < 6) {
                    newCode[index + i] = char;
                }
            });
            setCode(newCode);

            // Focus on the next empty input or last input
            const nextIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[nextIndex]?.focus();
        } else {
            // Handle single character input
            newCode[index] = text;
            setCode(newCode);

            // Move to next input if current is filled
            if (text && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            Alert.alert('Error', 'Please enter all 6 digits');
            return;
        }
        console.log(email)
        setIsLoading(true);
        try {
            if (email) {
                const { error } = await verifyOtp(email, verificationCode)
                if (error) {
                    throw new Error("Invalid or expired token ")
                }
            }
            Toast.show({
                type: 'success',
                text1: 'Your account has been verified!'
            })
            router.replace('/auth/signin');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Invalid verification code. Please try again.'
            })
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            // TODO: Add your resend code API call here
            if (email) {
                await resendOtp(email)
                Alert.alert('Success', 'Verification code has been resent to your email');
                // Restart timer
                setTimer(60);
                setCanResend(false);

            }
        } catch (error) {
            Alert.alert('Error', 'Failed to resend code. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name="mail-outline"
                                    size={40}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.title}>Verify Your Email</Text>
                            <Text style={styles.subtitle}>
                                We've sent a 6-digit verification code to your email address. Please enter it below.
                            </Text>
                        </View>

                        <View style={styles.codeContainer}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputRefs.current[index] = ref;
                                    }}
                                    style={[
                                        styles.codeInput,
                                        digit ? styles.codeInputFilled : styles.codeInputEmpty
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    textContentType="oneTimeCode"
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                isLoading ? styles.verifyButtonDisabled : styles.verifyButtonEnabled
                            ]}
                            onPress={handleVerify}
                            disabled={isLoading}
                        >
                            <Text style={[
                                styles.verifyButtonText,
                                isLoading ? styles.verifyButtonTextDisabled : styles.verifyButtonTextEnabled
                            ]}>
                                {isLoading ? 'Verifying...' : 'Verify Account'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            {/* <Text style={styles.resendText}>
                                Didn't receive the code?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleResendCode}>
                                <Text style={styles.resendLink}>Resend Code</Text>
                            </TouchableOpacity> */}
                            {canResend ? (
                                <>
                                    <Text style={styles.resendText}>Didn't receive the code? </Text>
                                    <TouchableOpacity onPress={handleResendCode}>
                                        <Text style={styles.resendLink}>Resend Code</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text style={styles.resendText}>
                                    Resend in {timer}s
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color={colors.primary}
                                style={styles.backIcon}
                            />
                            <Text style={styles.backText}>Back to Sign Up</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        color: colors.textTertiary,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingHorizontal: 8,
    },
    codeInput: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: colors.inputBackground,
    },
    codeInputEmpty: {
        borderColor: colors.inputBorder,
        color: colors.inputText,
    },
    codeInputFilled: {
        borderColor: colors.primary,
        color: colors.primary,
    },
    verifyButton: {
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    verifyButtonEnabled: {
        backgroundColor: colors.primary,
    },
    verifyButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    verifyButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    verifyButtonTextEnabled: {
        color: 'white',
    },
    verifyButtonTextDisabled: {
        color: '#6b7280',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    resendText: {
        color: colors.textTertiary,
        fontSize: 16,
    },
    resendLink: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    backIcon: {
        marginRight: 8,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default VerifyScreen;