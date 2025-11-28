import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { loginSchema } from '@/lib/validationSchema';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface LoginData {
    data: {
        user: User | null;
    }
}

const TherapistSignIn = () => {
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [key, setKey] = useState(0);
    const { login, loading, logout } = useCheckAuth();
    const [biometricIcon, setBiometricIcon] = useState<keyof typeof Ionicons.glyphMap>('scan');
    const [biometricText, setBiometricText] = useState('Continue with Biometrics');
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    useEffect(() => {
        checkBiometricTypes();
    }, []);

    const checkBiometricTypes = async () => {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometricIcon('scan');
                setBiometricText('Continue with Face ID');
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometricIcon('finger-print');
                setBiometricText('Continue with Fingerprint');
            } else {
                setBiometricIcon('scan');
                setBiometricText('Continue with Biometrics');
            }
        } catch (error) {
            return null;
        }
    };

    const handleBiometricAuth = async () => {
        try {
            const isAvailable = await LocalAuthentication.hasHardwareAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Biometric authentication is not available on this device');
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                Alert.alert('Error', 'No biometric data is enrolled on this device');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to continue',
                fallbackLabel: 'Use PIN/Password',
                disableDeviceFallback: false,
            });

            if (result.success) {
                const email = await SecureStore.getItemAsync('therapist_email');
                const password = await SecureStore.getItemAsync('therapist_password');

                if (!email || !password) {
                    Alert.alert('Please login manually');
                    return;
                }

                const { data }: LoginData = await login(email, password);

                if (data && data?.user?.user_metadata?.designation === "therapist") {
                    router.push("/(tabs)/session");
                } else {
                    Alert.alert('Provider account', 'kindly go to the therapist portal to signin')
                    await logout()
                    await AsyncStorage.removeItem("supabase.auth.token");
                }
            } else {
                Alert.alert('Failed', 'Biometric authentication failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred during biometric authentication');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSignIn = async () => {
        Keyboard.dismiss();
        const validationSchema = loginSchema.safeParse({
            email: formData.email,
            password: formData.password
        });
        try {

            if (!validationSchema.success) {
                Toast.show({
                    type: 'error',
                    text1: 'Validation Error',
                    text2: validationSchema.error.issues[0].message
                })
                throw new Error(validationSchema.error.issues[0].message);
            }

            const { data }: LoginData = await login(formData.email, formData.password);

            if (data) {
                if (data?.user?.user_metadata?.designation === "therapist") {
                    router.push("/(tabs)/session");
                    if (rememberMe) {
                        await SecureStore.setItemAsync('therapist_email', formData.email);
                        await SecureStore.setItemAsync('therapist_password', formData.password);
                    }
                } else {
                    Alert.alert('Error', 'Invalid therapist credentials. Please check your account type.');
                    await logout()
                    await AsyncStorage.removeItem("supabase.auth.token");
                }
            } else {
                Alert.alert('Error', 'Invalid therapist credentials.')
            }

        } catch (err) {
            Alert.alert('Failed', 'We encountered some issues signing you in')
            return
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Forgot Password',
            'Enter your email address and we\'ll send you a link to reset your password.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Send Reset Link',
                    onPress: () => {
                        Alert.alert('Success', 'Password reset link sent to your email!');
                    }
                }
            ]
        );
    };

    const renderInputField = (
        label: string,
        field: string,
        placeholder: string,
        iconName: keyof typeof Ionicons.glyphMap,
        isPassword: boolean = false,
        keyboardType: 'default' | 'email-address' = 'default'
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[
                styles.inputWrapper,
                errors[field] ? styles.inputWrapperError : styles.inputWrapperDefault
            ]}>
                <Ionicons
                    name={iconName}
                    size={20}
                    color={colors.placeholder}
                    style={styles.inputIcon}
                />
                <TextInput
                    key={isPassword ? key : undefined}
                    style={styles.textInput}
                    placeholder={placeholder}
                    value={formData[field as keyof typeof formData]}
                    onChangeText={(value) => handleInputChange(field, value)}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={colors.placeholder}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => {
                            setShowPassword(!showPassword);
                            setKey(prev => prev + 1);
                        }}
                        style={styles.passwordToggle}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.placeholder}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.badgeContainer}>
                            <View style={styles.badge}>
                                <Ionicons name="medical" size={20} color="#047857" />
                                <Text style={styles.badgeText}>THERAPIST PORTAL</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to your professional account
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {renderInputField('Professional Email', 'email', 'Enter your work email', 'mail-outline', false, 'email-address')}
                        {renderInputField('Password', 'password', 'Enter your password', 'lock-closed-outline', true)}

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.rememberMeContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    rememberMe ? styles.checkboxChecked : styles.checkboxUnchecked
                                ]}>
                                    {rememberMe && (
                                        <Ionicons name="checkmark" size={14} color="white" />
                                    )}
                                </View>
                                <Text style={styles.rememberMeText}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.signInButton,
                                loading ? styles.signInButtonDisabled : styles.signInButtonEnabled
                            ]}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            <Text style={[
                                styles.signInButtonText,
                                loading ? styles.signInButtonTextDisabled : styles.signInButtonTextEnabled
                            ]}>
                                {loading ? 'Signing In...' : 'Sign In to Portal'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                            <View style={styles.buttonContent}>
                                <Ionicons name={biometricIcon} size={20} color="#047857" style={styles.icon} />
                                <Text style={styles.buttonText}>
                                    {biometricText}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                            <Text style={styles.infoText}>
                                This is a secure portal for licensed therapists only.
                            </Text>
                        </View>

                        <View style={styles.switchContainer}>
                            <View style={styles.switchText}>
                                <Text style={styles.patientLoginText}>Looking for patient login?{' '}</Text>
                                <TouchableOpacity onPress={() => router.replace("auth/signin")}>
                                    <Text style={styles.switchLink}>Switch to Patient Portal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
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
        justifyContent: 'center',
        paddingVertical: 32,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    badgeContainer: {
        marginBottom: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    badgeText: {
        color: '#047857',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.inputText,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: colors.inputBackground,
    },
    inputWrapperDefault: {
        borderColor: colors.inputBorder,
    },
    inputWrapperError: {
        borderColor: '#ef4444',
    },
    inputIcon: {
        marginLeft: 16,
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 8,
        fontSize: 16,
        color: colors.inputText,
    },
    passwordToggle: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnchecked: {
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
    },
    checkboxChecked: {
        borderColor: '#047857',
        backgroundColor: '#047857',
    },
    rememberMeText: {
        color: colors.textTertiary,
        fontSize: 14,
    },
    forgotPasswordText: {
        color: '#047857',
        fontSize: 14,
        fontWeight: '600',
    },
    signInButton: {
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    signInButtonEnabled: {
        backgroundColor: colors.primary,
    },
    signInButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    signInButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    signInButtonTextEnabled: {
        color: 'white',
    },
    signInButtonTextDisabled: {
        color: '#6b7280',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    dividerText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginHorizontal: 16,
    },
    biometricButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        paddingVertical: 12,
        marginVertical: 8,
        marginBottom: 24,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: colors.textTertiary,
        fontSize: 16,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        gap: 8,
    },
    infoText: {
        flex: 1,
        color: '#047857',
        fontSize: 12,
        lineHeight: 20,
    },
    switchContainer: {
        alignItems: 'center',
    },
    switchText: {
        color: colors.textTertiary,
        fontSize: 16,
        gap: 4,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    patientLoginText: {
        color: colors.textTertiary
    },
    switchLink: {
        color: colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default TherapistSignIn;