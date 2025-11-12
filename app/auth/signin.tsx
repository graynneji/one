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
    }, error: unknown | any
}


const SignIn = () => {
    const navigation = useNavigation();
    const router = useRouter()

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
    const { login, loading, logout } = useCheckAuth()
    const [biometricIcon, setBiometricIcon] = useState<keyof typeof Ionicons.glyphMap>('scan');
    const [biometricText, setBiometricText] = useState('Continue with Biometrics');
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    // const { loading: logOutLoading, logout } = useAuth()

    useEffect(() => {
        checkBiometricTypes();
    }, []);

    const checkBiometricTypes = async (): Promise<void> => {
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
            return
            // console.error('Error checking biometric types:', error);
        }
    };

    const handleBiometricAuth = async () => {
        try {
            // Check if biometric authentication is available
            const isAvailable = await LocalAuthentication.hasHardwareAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Biometric authentication is not available on this device');
                return;
            }

            // Check what types of biometrics are enrolled
            const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            // Check if biometrics are enrolled
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                Alert.alert('Error', 'No biometric data is enrolled on this device');
                return;
            }

            // Perform authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to continue',
                fallbackLabel: 'Use PIN/Password',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Authentication successful
                // Proceed with login logic
                const email = await SecureStore.getItemAsync('email');
                const password = await SecureStore.getItemAsync('password');

                if (!email || !password) {
                    // Credentials were cleared => force user to log in manually
                    Alert.alert('Please login manually');
                    return;
                }

                const { data }: LoginData = await login(email, password);

                if (data && data?.user?.user_metadata?.designation === "patient") {
                    router.push("/(tabs)/session/chat");
                } else {
                    Alert.alert('Provider account', 'kindly go to the therapist portal to signin')
                    await logout()
                    await AsyncStorage.removeItem("supabase.auth.token");
                }

                // }
            } else {
                // Authentication failed or cancelled
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
        // Clear error when user starts typing
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
        })
        try {
            if (!validationSchema.success) {
                Toast.show({
                    type: 'error',
                    text1: 'Validation Error',
                    text2: validationSchema.error.issues[0].message || "Invalid inputs"
                })
                return
            }

            const { data, error }: LoginData = await login(formData.email, formData.password);
            if (error) {
                Toast.show({
                    type: "error",
                    text1: "Login Failed",
                    text2: error.message || "Please try again"
                });
            }

            if (data?.user && data?.user?.user_metadata?.designation !== "patient") {

                Toast.show({
                    type: "error",
                    text1: "Login Failed",
                    text2: "Invalid therapist credentials. Please check your account type"
                });
                await logout()
                await AsyncStorage.removeItem("supabase.auth.token");
            }


            if (data?.user && data?.user?.user_metadata?.designation === "patient") {
                router.push("/(tabs)/session/chat");
            }

        } catch (err) {
            Toast.show({
                type: "error",
                text1: "Login Failed",
                text2: "We encountered some issues signing you in"
            });
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
                        // Handle password reset
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
        secureTextEntry = false,
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
                    // color={errors[field] ? '#ef4444' : '#9ca3af'}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    value={formData[field as keyof typeof formData]}
                    onChangeText={(value) => handleInputChange(field, value)}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={field === 'email' ? 'none' : 'words'}
                    autoCorrect={false}
                    placeholderTextColor={colors.placeholder}
                />
            </View>
            {/* {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )} */}
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
                    {/* <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>betterspace</Text>
                        <Text style={styles.logoSubtext}>Professional therapy platform</Text>
                    </View> */}

                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>

                        <Text style={styles.subtitle}>
                            Sign in to your TherapyPlus account
                        </Text>
                    </View>
                    <View style={styles.form}>
                        {renderInputField('Email Address', 'email', 'Enter your email address', 'mail-outline', false, 'email-address')}
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
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* <TouchableOpacity style={styles.googleSignInButton}>
                            <View style={styles.googleButtonContent}>
                                <Ionicons name="logo-google" size={20} color="#4285f4" style={styles.googleIcon} />
                                <Text style={styles.googleSignInButtonText}>
                                    Continue with Google
                                </Text>
                            </View>
                        </TouchableOpacity> */}

                        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                            <View style={styles.buttonContent}>
                                <Ionicons name={biometricIcon} size={20} color="#6366f1" style={styles.icon} />
                                <Text style={styles.buttonText}>
                                    {biometricText}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.createAccountContainer}>
                            <Text style={styles.createAccountText}>
                                <Text>Don&apos;t have an account?{' '}</Text>
                                <TouchableOpacity onPress={() => router.replace("auth/get-started")}>
                                    <Text style={styles.createAccountLink}>Create Account</Text>
                                </TouchableOpacity>
                            </Text>
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
        // flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 32,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#047857', // emerald-700
        marginBottom: 4,
    },
    logoSubtext: {
        color: colors.text, // gray-600
        fontSize: 16,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text, // gray-900
        marginBottom: 8,
    },
    subtitle: {
        color: colors.textSecondary, // gray-600
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
        color: colors.inputText, // gray-700
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
        borderColor: colors.inputBorder, // gray-200
    },
    inputWrapperError: {
        borderColor: '#ef4444', // red-500
    },
    inputIcon: {
        marginLeft: 16,
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 16,
        fontSize: 16,
        color: colors.inputText,
    },
    // errorText: {
    //     color: '#ef4444', // red-500
    //     fontSize: 14,
    //     marginTop: 4,
    // },
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
        borderColor: '#047857', // emerald-700
        backgroundColor: '#047857', // emerald-700
    },
    rememberMeText: {
        color: colors.textTertiary, // gray-600
        fontSize: 14,
    },
    forgotPasswordText: {
        color: '#047857', // emerald-700
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
        // backgroundColor: '#047857', 
    },
    signInButtonDisabled: {
        backgroundColor: '#d1d5db', // gray-300
    },
    signInButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    signInButtonTextEnabled: {
        color: 'white',
    },
    signInButtonTextDisabled: {
        color: '#6b7280', // gray-500
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider, // gray-200
    },
    dividerText: {
        color: colors.textSecondary, // gray-500
        fontSize: 14,
        marginHorizontal: 16,
    },
    // googleSignInButton: {
    //     borderWidth: 2,
    //     borderColor: '#e5e7eb', // gray-200
    //     borderRadius: 25,
    //     paddingVertical: 16,
    //     alignItems: 'center',
    //     backgroundColor: '#ffffff',
    //     marginBottom: 32,
    // },
    // googleButtonContent: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    // },
    // googleIcon: {
    //     marginRight: 12,
    // },
    // googleSignInButtonText: {
    //     color: '#374151', // gray-700
    //     fontSize: 16,
    //     fontWeight: '600',
    // },
    biometricButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        paddingVertical: 12,
        marginVertical: 8,
        marginBottom: 32,
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
    createAccountContainer: {
        alignItems: 'center',
    },
    createAccountText: {
        color: colors.textTertiary,
        fontSize: 16,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createAccountLink: {
        color: colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default SignIn;