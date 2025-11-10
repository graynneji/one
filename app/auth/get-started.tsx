import CreateAccount from "@/components/CreateAccount";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GetStarted = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const navigation = useNavigation()
    const router = useRouter()
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);
    const [currentScreen, setCurrentScreen] = useState('questionnaire');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const questions = [
        {
            id: 'q1',
            title: "What is your gender identity?",
            subtitle:
                "Help your therapist tailor a more customized and supportive approach to your needs.",
            options: ["Man", "Woman"],

        },
        {
            id: 'q2',
            title: "What is your relationship status?",
            subtitle: "Relationship status can affect your well-being.",
            options: [
                "Single",
                "Married",
                "Divorced",
                "Widowed",
                "Other",
                "Prefer not to say",
            ],

        },
        {
            id: 'q3',
            title: "How would you rate your current physical health?",
            subtitle:
                "Help your therapist understand your needs better and create a more effective plan.",
            options: ["Good", "Fair", "Poor"],

        },
        {
            id: 'q4',
            title: "Are you on any medication?",
            subtitle:
                "Medication can play a significant role in mental health treatment.",
            options: ["No", "Yes"],

        },
        {
            id: 'q5',
            title: "Have you been in therapy before?",
            subtitle:
                "We create a personalized plan and guide you through after signing up.",
            options: ["No", "Yes"],

        },
        {
            id: 'q6',
            title: "Why do you want to work on your mental health?",
            subtitle:
                "This helps us match you with a therapist who aligns with your goals.",
            options: [
                "I feel depressed",
                "I have anxious thoughts",
                "I am grieving",
                "I lost the purpose of life",
                "I struggle to have healthy relationships",
                "I am having a tough time",
                "I have low self esteem",
                "I have experienced trauma",
                "I want to improve all areas of my life",
                "Just exploring",
                "Other",
            ],

        },
        {
            id: 'q7',
            title: "What best describes your current work situation?",
            subtitle:
                "Help us understand your daily life and provide more tailored support.",
            options: [
                "Employed full-time",
                "Employed part-time",
                "Self-employed",
                "Unemployed",
                "Student",
                "Retired",
                "Other",
            ],

        },
        {
            id: 'q8',
            title: "How did you get to know about TherapyPlus?",
            subtitle: "Helps us improve outreach and support.",
            options: [
                "Google search",
                "Facebook",
                "Youtube",
                "X (formerly twitter)",
                "Instagram",
                "Other",
            ],

        },
    ];

    const handleAnswerSelect = (questionId: string, question: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [question]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Complete questionnaire
            setCurrentScreen('complete');
        }
    };

    // const RenderStartScreen: React.FC = () => (
    //     <SafeAreaView style={styles.startContainer}>
    //         <StatusBar barStyle="light-content" backgroundColor="#065f46" />
    //         <View style={styles.startContent}>
    //             <Text style={styles.startTitle}>
    //                 betterspace
    //             </Text>
    //             <Text style={styles.startSubtitle}>
    //                 Professional therapy platform for licensed therapists
    //             </Text>

    //             <TouchableOpacity
    //                 style={styles.startGetStartedButton}
    //                 onPress={() => setCurrentScreen('questionnaire')}
    //             >
    //                 <Text style={styles.startGetStartedButtonText}>
    //                     Get Started
    //                 </Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity style={styles.startSignInButton}>
    //                 <Text style={styles.startSignInButtonText}>
    //                     I already have an account
    //                 </Text>
    //             </TouchableOpacity>
    //         </View>
    //     </SafeAreaView>
    // );

    const RenderQuestionnaireScreen: React.FC = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        const hasAnswer = answers[currentQuestion.title];

        return (
            <SafeAreaView style={styles.questionnaireContainer}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                        </Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                <ScrollView style={styles.questionnaireScrollView}>
                    <View style={styles.questionHeader}>
                        <Text style={styles.questionTitle}>
                            {currentQuestion.title}
                        </Text>
                        <Text style={styles.questionSubtitle}>
                            {currentQuestion.subtitle}
                        </Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        {currentQuestion.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    answers[currentQuestion.title] === option
                                        ? styles.optionButtonSelected
                                        : styles.optionButtonDefault
                                ]}
                                onPress={() => handleAnswerSelect(currentQuestion.id, currentQuestion?.title, option)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    answers[currentQuestion.title] === option
                                        ? styles.optionTextSelected
                                        : styles.optionTextDefault
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNavigation}>
                    <View style={styles.bottomNavigationContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                if (currentQuestionIndex > 0) {
                                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                                } else {
                                    setCurrentScreen('onboarding');
                                }
                                // router.replace("/auth/verify-email-screen")
                            }}
                        >
                            <Text style={styles.backButtonText}>
                                Back
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                hasAnswer ? styles.nextButtonEnabled : styles.nextButtonDisabled
                            ]}
                            disabled={!hasAnswer}
                            onPress={handleNext}
                        >
                            <Text style={[
                                styles.nextButtonText,
                                hasAnswer ? styles.nextButtonTextEnabled : styles.nextButtonTextDisabled
                            ]}>
                                {isLastQuestion ? 'Complete' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    };

    const RenderCompleteScreen: React.FC = () => (
        <SafeAreaView style={styles.completeContainer}>
            <View style={styles.completeContent}>
                <View style={styles.completeIcon}>
                    <Text style={styles.completeIconText}><Ionicons name="checkmark-outline" size={30} /></Text>
                    {/* <Text style={styles.completeIconText}>✓</Text> */}
                </View>

                <Text style={styles.completeTitle}>
                    Setup Complete!
                </Text>

                <Text style={styles.completeDescription}>
                    Thank you for completing your profile. You&apos;re now ready to start using TherapyPlus.
                </Text>

                <TouchableOpacity
                    style={styles.completeGetStartedButton}
                    onPress={() => setCurrentScreen('createAccount')}
                >
                    <Text style={styles.completeGetStartedButtonText}>
                        Create Account
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    // Main render logic
    switch (currentScreen) {
        // case 'start':
        //     return <RenderStartScreen />;
        // case 'onboarding':
        //     return renderOnboardingScreen();
        case 'questionnaire':
            return <RenderQuestionnaireScreen />;
        case 'complete':
            return <RenderCompleteScreen />;
        case 'createAccount':
            return <CreateAccount answers={answers} />
        default:
            return <RenderQuestionnaireScreen />;
    }
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    // Start Screen Styles
    startContainer: {
        flex: 1,
        backgroundColor: '#065f46', // emerald-800
    },
    startContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    startTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    startSubtitle: {
        color: '#a7f3d0', // emerald-200
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 48,
    },
    startGetStartedButton: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 48,
        paddingVertical: 16,
        marginBottom: 24,
    },
    startGetStartedButtonText: {
        color: '#065f46', // emerald-800
        fontWeight: '600',
        fontSize: 18,
    },
    startSignInButton: {
        marginBottom: 16,
    },
    startSignInButtonText: {
        color: '#a7f3d0', // emerald-200
        fontSize: 16,
        textDecorationLine: 'underline',
    },

    // Questionnaire Screen Styles
    questionnaireContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressText: {
        color: colors.textTertiary, // gray-600
        fontSize: 14,
    },
    progressPercentage: {
        color: colors.primary, // emerald-700
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBackground: {
        width: '100%',
        backgroundColor: colors.item, // gray-200
        borderRadius: 4,
        height: 8,
    },
    progressBarFill: {
        backgroundColor: colors.primary, // emerald-700
        height: 8,
        borderRadius: 4,
    },
    questionnaireScrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    questionHeader: {
        marginBottom: 32,
    },
    questionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text, // gray-900
        marginBottom: 16,
    },
    questionSubtitle: {
        color: colors.textTertiary, // gray-600
        fontSize: 18,
        lineHeight: 28,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    optionButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    optionButtonSelected: {
        borderColor: colors.primary, // emerald-700
        backgroundColor: colors.item, // emerald-50
    },
    optionButtonDefault: {
        borderColor: colors.inputBorder, // gray-200
        backgroundColor: colors.surface,
    },
    optionText: {
        fontSize: 16,
    },
    optionTextSelected: {
        color: colors.primary, // emerald-700
        fontWeight: '600',
    },
    optionTextDefault: {
        color: colors.textTertiary, // gray-700
    },
    bottomNavigation: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border, // gray-200
    },
    bottomNavigationContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: colors.text, // gray-600
        fontSize: 16,
    },
    nextButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    nextButtonEnabled: {
        backgroundColor: colors.primary, // emerald-700
    },
    nextButtonDisabled: {
        backgroundColor: colors.textTertiary, // gray-300
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButtonTextEnabled: {
        color: 'white',
    },
    nextButtonTextDisabled: {
        color: colors.textSecondary, // gray-500
    },

    // Complete Screen Styles
    completeContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    completeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    completeIcon: {
        width: 50,
        height: 50,
        backgroundColor: colors.primary, // emerald-700
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    completeIconText: {
        color: 'white',
        fontSize: 24,
    },
    completeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text, // gray-900
        marginBottom: 16,
        textAlign: 'center',
    },
    completeDescription: {
        color: colors.textTertiary, // gray-600
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 32,
    },
    completeGetStartedButton: {
        backgroundColor: colors.primary, // emerald-700
        borderRadius: 25,
        paddingHorizontal: 48,
        paddingVertical: 16,
    },
    completeGetStartedButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 18,
    },
});

export default GetStarted;