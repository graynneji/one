import Avatar from '@/components/Avatar';
import MessageStatusIcon from '@/components/MessageStatus';
import TherapistBioModal from '@/components/TherapistBioModal';
import WelcomeTip from '@/components/WelcomeTipModal';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCrudCreate, useMarkMessagesRead } from '@/hooks/useCrud';
import { useMessage } from '@/hooks/useMessage';
import { useTotalUnreadCount } from '@/hooks/useMsg';
import { sendMessage } from '@/types';
import { capitalizeFirstLetter, formatDate, formatDateTime, formatTime, isToday } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
// import { RTCView } from 'react-native-webrtc';

const { width, height } = Dimensions.get('window');

// ✅ Helper function to get stream URL
function getStreamURL(stream: MediaStream | null): string | undefined {
    if (!stream) return undefined;

    // Try toURL() method (most common in react-native-webrtc)
    if (typeof (stream as any).toURL === 'function') {
        return (stream as any).toURL();
    }

    // Fallback to internal _URL property
    return (stream as any)._URL;
}

interface ScheduleBubbleProps {
    appointment: Record<string, any>
    isSender: boolean;
}

interface ChatScreenProps {
    // navigation: {
    //     navigate: (screen: string, params?: any) => void;
    //     goBack: () => void;
    // },
    therapist: {
        name: string,
        therapist_id: string,
        authority: string,
        license: string,
        specialization: string,
        summary: string
        profile_picture: string;
        years_of_experience: number;
    },
    senderId: string,
    receiverId: string,
}

interface Patient {
    [key: string]: any;
}

export interface UserResult {
    user_id: string;
    name: string;
    therapist_id?: string;
    therapist?: any;
    patients?: Patient[];
    [key: string]: any;
}

export interface UserQueryData {
    data?: UserResult[];
    [key: string]: any;
}

type Message = {
    id: string;
    created_at: string;
    message: string;
    sender_id: string
    reciever_id: string
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
};



const ChatScreen = ({ therapist, senderId, receiverId }: ChatScreenProps) => {
    const [messageText, setMessageText] = useState('');
    const [showWelcomeTip, setShowWelcomeTip] = useState(true);
    const [showTherapistBio, setShowTherapistBio] = useState(false);
    const [isNewUser] = useState(false);
    const { session } = useCheckAuth()
    const { id, patientId, patientName, profile_picture } = useLocalSearchParams<{ id?: string; patientId: string, patientName: string, profile_picture: string }>()
    const createMessageMutation = useCrudCreate<sendMessage>("messages")
    const createCallSessionMutation = useCrudCreate("call_sessions")
    const router = useRouter()
    const listRef = useRef<FlatList<any>>(null);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);
    const updateMessageReadMutation = useMarkMessagesRead("messages")

    const options = {
        or: `and(sender_id.eq.${senderId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${senderId})`,
    }

    const { messages, fetchOlder, hasMore } = useMessage(
        {
            table: "messages",
            filters: {},
            column: '*, appointment(*)',
            options,
            pageSize: 30,
            senderId: senderId,
            receiverId,
        },
    )

    const { totalUnreadCount } = useTotalUnreadCount({
        table: 'messages',
        senderId: session?.user?.id ?? '',
        enabled: !!session?.user?.id,
    });

    useFocusEffect(
        useCallback(() => {
            if (receiverId && senderId) {
                updateMessageReadMutation.mutate({ senderId, receiverId });
            }
        }, [receiverId, senderId])
    );

    useFocusEffect(
        useCallback(() => {
            if (!session?.user) return;
            const isTherapist = session.user.user_metadata?.designation === "therapist";
            if (isTherapist && !patientId) {
                router.replace("/index");
                return;
            }
        }, [session, patientId])
    );

    const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (messages?.length > 0 && optimisticMessages.length > 0) {
            const realMessageIds = new Set(messages.map(m => m.id));
            const hasMatchingReal = optimisticMessages.some(opt => {
                // Check if any real message has the same content and sender
                return messages.some(real =>
                    real.message === opt.message &&
                    real.sender_id === opt.sender_id &&
                    Math.abs(new Date(real.created_at).getTime() - new Date(opt.created_at).getTime()) < 5000
                );
            });

            if (hasMatchingReal) {
                // Clear optimistic messages when real ones arrive
                setTimeout(() => {
                    setOptimisticMessages(prev =>
                        prev.filter(opt => !realMessageIds.has(opt.id))
                    );
                }, 300);
            }
        }
    }, [messages]);

    useEffect(() => {
        return () => {
            setOptimisticMessages([]);
        };
    }, []);



    const allMessages = useMemo(() => {
        if (!messages?.length && !optimisticMessages?.length) return [];

        // Create a map of real message IDs for faster lookup
        const realMessageMap = new Map(messages?.map(m => [m.id, m]));

        // Filter out optimistic messages that have been confirmed
        const pendingOptimistics = optimisticMessages.filter(
            m => m.id.startsWith("temp-") && !realMessageMap.has(m.id)
        );

        // Combine real messages with their status and pending optimistic messages
        return [
            ...(messages?.map(m => ({
                ...m,
                status: m.status || "delivered"
            })) ?? []),
            ...pendingOptimistics,
        ].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [messages, optimisticMessages]);

    const groupMessagesByDate = () => {
        const groups: Record<string, Message[]> = {};
        allMessages?.forEach((msg) => {
            const date = msg.created_at
                ? formatDate(msg.created_at)
                : "Unknown Date";
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate();
    const flatData = React.useMemo(() => {
        const items: Array<{ type: "header"; date: string } | (Message & { type: "message"; date: string })> = [];
        Object.entries(messageGroups).forEach(([date, msgs]) => {
            items.push({ type: "header", date });
            msgs.forEach((msg) => items.push({ ...msg, type: "message", date }));
        });
        return items;
    }, [messageGroups]);

    // const sendMessage = () => {
    //     if (messageText.trim()) {
    //         const tempId = `temp-${Date.now()}`;
    //         const optimisticMessage: Message = {
    //             id: tempId,
    //             message: messageText,
    //             sender_id: senderId,
    //             reciever_id: receiverId,
    //             created_at: new Date().toISOString(),
    //             status: 'sending'
    //         };

    //         setOptimisticMessages(prev => [...prev, optimisticMessage]);
    //         const messageToSend = messageText;
    //         setMessageText('');

    //         createMessageMutation.mutateAsync({
    //             message: messageToSend,
    //             sender_id: senderId,
    //             reciever_id: receiverId,
    //         })
    //             .then((response) => {
    //                 setOptimisticMessages(prev =>
    //                     prev.filter(msg => msg.id !== tempId)
    //                 );
    //             })
    //             .catch((error) => {
    //                 setOptimisticMessages(prev =>
    //                     prev.map(msg =>
    //                         msg.id === tempId
    //                             ? { ...msg, status: 'failed' as const }
    //                             : msg
    //                     )
    //                 );
    //             });
    //     }
    // };

    const sendMessage = async () => {
        if (!messageText.trim()) return;

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const messageToSend = messageText.trim();

        const optimisticMessage: Message = {
            id: tempId,
            message: messageToSend,
            sender_id: senderId,
            reciever_id: receiverId,
            created_at: new Date().toISOString(),
            status: 'sending'
        };

        // Add optimistic message immediately
        setOptimisticMessages(prev => [...prev, optimisticMessage]);

        // Clear input immediately for better UX
        setMessageText('');

        try {
            const response = await createMessageMutation.mutateAsync({
                message: messageToSend,
                sender_id: senderId,
                reciever_id: receiverId,
            });

            // Update status to sent before removing
            setOptimisticMessages(prev =>
                prev.map(msg =>
                    msg.id === tempId
                        ? { ...msg, status: 'sent' as const }
                        : msg
                )
            );

            // Remove optimistic message after a short delay to ensure real message arrives
            setTimeout(() => {
                setOptimisticMessages(prev =>
                    prev.filter(msg => msg.id !== tempId)
                );
            }, 500);

        } catch (error) {
            console.error('Failed to send message:', error);

            // Mark message as failed
            setOptimisticMessages(prev =>
                prev.map(msg =>
                    msg.id === tempId
                        ? { ...msg, status: 'failed' as const }
                        : msg
                )
            );

            // Optionally: show retry option
            Alert.alert(
                'Message Failed',
                'Failed to send message. Tap to retry.',
                [
                    {
                        text: 'Dismiss',
                        onPress: () => {
                            // Remove failed message after user dismisses
                            setOptimisticMessages(prev =>
                                prev.filter(msg => msg.id !== tempId)
                            );
                        },
                        style: 'cancel'
                    },
                    {
                        text: 'Retry',
                        onPress: () => {
                            // Remove failed message and resend
                            setOptimisticMessages(prev =>
                                prev.filter(msg => msg.id !== tempId)
                            );
                            setMessageText(messageToSend);
                        }
                    }
                ]
            );
        }
    };

    const initiateCall = async (callType: 'audio' | 'video') => {
        console.log('=== INITIATING CALL ===');
        console.log('Call Type:', callType);
        console.log('Sender ID:', senderId);
        console.log('Receiver ID:', receiverId);
        try {
            const callSession = await createCallSessionMutation.mutateAsync({
                caller_id: senderId,
                callee_id: receiverId,
                call_type: callType,
                status: 'ringing'
            });

            console.log(callSession, '=== CALL SESSION CREATED ===');

            if (callSession) {
                // Use router.push instead of navigation.navigate
                router.push({
                    pathname: '/call',
                    params: {
                        callSessionId: callSession?.data[0]?.id,
                        isVideo: callType === 'video' ? 'true' : 'false',
                        isCaller: 'true',
                        otherUserId: receiverId,
                        otherUserName: therapist?.name || patientName
                    }
                });
            }
        } catch (error) {
            console.error('Error initiating call:', error);
            Alert.alert('Error', 'Failed to initiate call');
        }
    };
    const startAudioCall = () => {
        Alert.alert(
            'Start Audio Call',
            `Would you like to start an audio call with ${therapist?.name || patientName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => initiateCall('audio') },
            ]
        );
    };

    const startVideoCall = () => {
        Alert.alert(
            'Start Video Call',
            `Would you like to start a video call with ${therapist?.name || patientName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => initiateCall('video') },
            ]
        );
    };

    const ScheduleBubble = ({ appointment, isSender }: ScheduleBubbleProps) => (
        <View style={[
            styles.scheduleBubble,
            isSender ? styles.senderSchedule : styles.receiverSchedule
        ]}>
            <View style={styles.scheduleHeader}>
                <Ionicons name="calendar-outline" size={16} color="red" />
                <Text style={styles.scheduleTitle}>Appointment</Text>
            </View>

            <View style={styles.scheduleDetails}>
                <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>Time</Text>
                    <Text style={styles.scheduleValue}>{formatDateTime(appointment.time)}</Text>
                </View>

                {appointment.title && (
                    <View style={styles.scheduleRow}>
                        <Text style={styles.scheduleLabel}>Title</Text>
                        <Text style={styles.scheduleValue}>{appointment.title}</Text>
                    </View>
                )}

                {appointment.description && (
                    <View style={styles.scheduleRow}>
                        <Text style={styles.scheduleLabel}>Description</Text>
                        <Text style={styles.scheduleValue}>{appointment.description}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                {!therapist && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.unreadCount}>
                        <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
                        {<Text style={styles.unreadCountText}>{totalUnreadCount ? totalUnreadCount : null}</Text>}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.therapistInfo}
                    onPress={() => setShowTherapistBio(true)}
                >
                    <Avatar profile_picture={therapist?.profile_picture ? therapist?.profile_picture : profile_picture} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.headerName}>
                            {therapist?.name ? capitalizeFirstLetter(therapist.name) || 'User' : capitalizeFirstLetter(patientName) || 'User'}
                        </Text>
                        <View style={styles.onlineStatus}>
                            <Text style={styles.onlineText}>
                                {therapist?.name ? "Tap to view providers profile" : "Session Client"}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.callButtons}>
                    <TouchableOpacity style={styles.callButton} onPress={startAudioCall}>
                        <Ionicons name="call-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton} onPress={startVideoCall}>
                        <Ionicons name="videocam-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={listRef}
                data={[...flatData].reverse()}
                keyExtractor={(item, index) =>
                    item.type === "header" ? `header-${item.date}-${index}` : `${item.id}`
                }
                renderItem={({ item }) => {
                    if (item.type === "header") {
                        return (
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.date}>
                                    {isToday(item.date) ? "Today" : item.date}
                                </Text>
                            </View>
                        );
                    }

                    const isSender = item.sender_id === senderId;
                    const isAppointment = item?.appointment?.id

                    return (
                        <View style={{ flexDirection: 'column-reverse' }}>
                            <View
                                key={item.id}
                                style={[
                                    styles.messageContainer,
                                    isSender ? styles.senderMessage : styles.receiverMessage,
                                ]}
                            >
                                {isAppointment ? (
                                    <View style={{ alignItems: isSender ? 'flex-end' : 'flex-start', flex: 1 }}>
                                        <ScheduleBubble
                                            appointment={item.appointment}
                                            isSender={isSender}
                                        />
                                        <Text
                                            style={[
                                                styles.timestamp,
                                                isSender ? styles.senderTimestamp : styles.receiverTimestamp,
                                                { marginTop: 4, marginRight: isSender ? 8 : 0, marginLeft: isSender ? 0 : 8 }
                                            ]}
                                        >
                                            {formatTime(item.created_at)}
                                        </Text>
                                        {isSender && <MessageStatusIcon status={item.status} />}
                                    </View>
                                ) : (
                                    <>
                                        <View
                                            style={[
                                                styles.messageBubble,
                                                isSender ? styles.senderBubble : styles.receiverBubble,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.messageText,
                                                    isSender ? styles.senderText : styles.receiverText,
                                                ]}
                                            >
                                                {item.message}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.timestamp,
                                                    isSender ? styles.senderTimestamp : styles.receiverTimestamp,
                                                ]}
                                            >
                                                {formatTime(item.created_at)}
                                            </Text>
                                        </View>
                                        {isSender && <MessageStatusIcon status={item.status} />}
                                    </>
                                )}
                            </View>
                        </View>
                    );
                }}
                inverted
                style={styles.messagesContainer}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => {
                    if (flatData.length > 0) {
                        listRef.current?.scrollToOffset({ offset: 0, animated: false });
                    }
                }}
                onLayout={() => {
                    if (flatData.length > 0) {
                        listRef.current?.scrollToOffset({ offset: 0, animated: false });
                    }
                }}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                // style={{ flex: 1 }}
                // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={messageText}
                            onChangeText={setMessageText}
                            placeholder="Type your message..."
                            multiline
                            maxLength={500}
                            placeholderTextColor={colors.placeholder}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            <WelcomeTip showWelcomeTip={showWelcomeTip} isNewUser={isNewUser} setShowWelcomeTip={setShowWelcomeTip} />
            {showTherapistBio && therapist && (
                <TherapistBioModal
                    showTherapistBio={showTherapistBio}
                    setShowTherapistBio={setShowTherapistBio}
                    therapist={therapist}
                />
            )}
        </SafeAreaView>
    );
};
const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    scheduleBubble: {
        maxWidth: '85%',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1.5,
        backgroundColor: colors.surface,
    },
    senderSchedule: {
        backgroundColor: colors.surface,
        borderColor: colors.primary,
    },
    receiverSchedule: {
        backgroundColor: colors.background,
        borderColor: colors.placeholder,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        gap: 5,
        borderBottomColor: colors.divider,
    },
    scheduleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: 'red',
    },
    scheduleDetails: {
        marginBottom: 12,
    },
    scheduleRow: {
        marginBottom: 8,
    },
    scheduleLabel: {
        fontSize: 11,
        color: colors.placeholder,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scheduleValue: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    unreadCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
    },
    unreadCountText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.background,
    },
    therapistInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    avatarText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: '#a3676086',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginRight: 4,
    },
    onlineText: {
        fontSize: 12,
        color: colors.primary,
    },
    callButtons: {
        flexDirection: 'row',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.headerBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    date: {
        textAlign: "center",
        marginVertical: 30,
        color: colors.text
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    senderMessage: {
        justifyContent: 'flex-end',
    },
    receiverMessage: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    senderBubble: {
        backgroundColor: colors.senderBubble,
        borderBottomRightRadius: 4,
    },
    receiverBubble: {
        backgroundColor: colors.receiverBubble,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    senderText: {
        color: colors.senderText,
    },
    receiverText: {
        color: colors.receiverText,
    },
    timestamp: {
        fontSize: 12,
        marginTop: 4,
    },
    senderTimestamp: {
        color: colors.timestamp,
        textAlign: 'right',
    },
    receiverTimestamp: {
        color: colors.timestampReceiver,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        color: colors.inputText,
        backgroundColor: colors.inputBackground
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});

export default ChatScreen;


// import Avatar from '@/components/Avatar';
// import MessageStatusIcon from '@/components/MessageStatus';
// import TherapistBioModal from '@/components/TherapistBioModal';
// import WelcomeTip from '@/components/WelcomeTipModal';
// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useCrudCreate, useMarkMessagesRead } from '@/hooks/useCrud';
// import { useMessage } from '@/hooks/useMessage';
// import { useTotalUnreadCount } from '@/hooks/useMsg';
// import { sendMessage as SendMessageType } from '@/types';
// import { capitalizeFirstLetter, formatDate, formatDateTime, formatTime, isToday } from '@/utils';
// import { Ionicons } from '@expo/vector-icons';
// import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useCallback, useMemo, useOptimistic, useRef, useState, useTransition } from 'react';
// import {
//     Alert,
//     Dimensions,
//     FlatList,
//     Keyboard,
//     KeyboardAvoidingView,
//     Platform,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     TouchableWithoutFeedback,
//     View
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";

// const { width, height } = Dimensions.get('window');

// // ==================== TYPES ====================
// type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// type Message = {
//     id: string;
//     created_at: string;
//     message: string;
//     sender_id: string;
//     reciever_id: string;
//     status?: MessageStatus;
//     appointment?: any;
// };

// interface ScheduleBubbleProps {
//     appointment: Record<string, any>;
//     isSender: boolean;
// }

// interface ChatScreenProps {
//     therapist: {
//         name: string;
//         therapist_id: string;
//         authority: string;
//         license: string;
//         specialization: string;
//         summary: string;
//         profile_picture: string;
//         years_of_experience: number;
//     };
//     senderId: string;
//     receiverId: string;
// }

// interface Patient {
//     [key: string]: any;
// }

// export interface UserResult {
//     user_id: string;
//     name: string;
//     therapist_id?: string;
//     therapist?: any;
//     patients?: Patient[];
//     [key: string]: any;
// }

// export interface UserQueryData {
//     data?: UserResult[];
//     [key: string]: any;
// }

// // ==================== MAIN COMPONENT ====================
// const ChatScreen = ({ therapist, senderId, receiverId }: ChatScreenProps) => {
//     const [messageText, setMessageText] = useState('');
//     const [showWelcomeTip, setShowWelcomeTip] = useState(true);
//     const [showTherapistBio, setShowTherapistBio] = useState(false);
//     const [isNewUser] = useState(false);
//     const { session } = useCheckAuth();
//     const { id, patientId, patientName, profile_picture } = useLocalSearchParams<{
//         id?: string;
//         patientId: string;
//         patientName: string;
//         profile_picture: string;
//     }>();
//     const createMessageMutation = useCrudCreate<SendMessageType>("messages");
//     const createCallSessionMutation = useCrudCreate("call_sessions");
//     const router = useRouter();
//     const listRef = useRef<FlatList<any>>(null);
//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];
//     const styles = createStyles(colors);
//     const updateMessageReadMutation = useMarkMessagesRead("messages");

//     // useTransition for optimistic updates
//     const [isPending, startTransition] = useTransition();

//     const options = {
//         or: `and(sender_id.eq.${senderId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${senderId})`,
//     };

//     const { messages, fetchOlder, hasMore } = useMessage({
//         table: "messages",
//         filters: {},
//         column: '*, appointment(*)',
//         options,
//         pageSize: 30,
//         senderId: senderId,
//         receiverId,
//     });

//     const { totalUnreadCount } = useTotalUnreadCount({
//         table: 'messages',
//         senderId: session?.user?.id ?? '',
//         enabled: !!session?.user?.id,
//     });

//     // ==================== useOptimistic HOOK ====================
//     // Normalize and sort server messages by created_at (ascending order)
//     const normalizedMessages = useMemo(() => {
//         const sorted = (messages?.map(m => ({
//             ...m,
//             status: m.status || 'delivered' as MessageStatus
//         })) ?? []).sort((a, b) =>
//             new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//         );
//         return sorted;
//     }, [messages]);

//     const [optimisticMessages, addOptimisticMessage] = useOptimistic(
//         normalizedMessages,
//         (state: Message[], newMessage: Message) => {
//             // Add new optimistic message and sort by timestamp
//             const updated = [...state, newMessage];
//             return updated.sort((a, b) =>
//                 new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//             );
//         }
//     );

//     // ==================== FOCUS EFFECTS ====================
//     useFocusEffect(
//         useCallback(() => {
//             if (receiverId && senderId) {
//                 updateMessageReadMutation.mutate({ senderId, receiverId });
//             }
//         }, [receiverId, senderId])
//     );

//     useFocusEffect(
//         useCallback(() => {
//             if (!session?.user) return;
//             const isTherapist = session.user.user_metadata?.designation === "therapist";
//             if (isTherapist && !patientId) {
//                 router.replace("/index");
//                 return;
//             }
//         }, [session, patientId])
//     );

//     // ==================== MESSAGE GROUPING ====================
//     const groupMessagesByDate = useCallback(() => {
//         const groups: Record<string, Message[]> = {};
//         optimisticMessages?.forEach((msg) => {
//             const date = msg.created_at ? formatDate(msg.created_at) : "Unknown Date";
//             if (!groups[date]) {
//                 groups[date] = [];
//             }
//             groups[date].push(msg);
//         });
//         return groups;
//     }, [optimisticMessages]);

//     const messageGroups = groupMessagesByDate();

//     const flatData = useMemo(() => {
//         const items: Array<
//             { type: "header"; date: string } |
//             (Message & { type: "message"; date: string })
//         > = [];
//         Object.entries(messageGroups).forEach(([date, msgs]) => {
//             items.push({ type: "header", date });
//             msgs.forEach((msg) => items.push({ ...msg, type: "message", date }));
//         });
//         return items;
//     }, [messageGroups]);

//     // ==================== SEND MESSAGE FUNCTION ====================
//     const sendMessage = async () => {
//         if (!messageText.trim()) return;

//         // Create optimistic message with unique ID
//         const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//         const optimisticMessage: Message = {
//             id: tempId,
//             message: messageText,
//             sender_id: senderId,
//             reciever_id: receiverId,
//             created_at: new Date().toISOString(),
//             status: 'sending',
//         };

//         // Store message text and clear input immediately
//         const messageToSend = messageText;
//         setMessageText('');

//         // Wrap optimistic update in startTransition
//         startTransition(() => {
//             addOptimisticMessage(optimisticMessage);
//         });

//         try {
//             // Send message to server
//             await createMessageMutation.mutateAsync({
//                 message: messageToSend,
//                 sender_id: senderId,
//                 reciever_id: receiverId,
//             });

//             // Success! The real message from server will automatically replace the optimistic one
//         } catch (error) {
//             console.error('Failed to send message:', error);

//             // Update the optimistic message to failed status
//             startTransition(() => {
//                 addOptimisticMessage({
//                     ...optimisticMessage,
//                     status: 'failed',
//                 });
//             });

//             Alert.alert(
//                 'Failed to send',
//                 'Message could not be sent. Tap to retry.',
//                 [
//                     { text: 'Cancel', style: 'cancel' },
//                     {
//                         text: 'Retry',
//                         onPress: () => retryMessage(optimisticMessage)
//                     }
//                 ]
//             );
//         }
//     };

//     // ==================== RETRY MESSAGE FUNCTION ====================
//     const retryMessage = async (failedMessage: Message) => {
//         // Update to sending status
//         startTransition(() => {
//             addOptimisticMessage({
//                 ...failedMessage,
//                 status: 'sending',
//             });
//         });

//         try {
//             await createMessageMutation.mutateAsync({
//                 message: failedMessage.message,
//                 sender_id: failedMessage.sender_id,
//                 reciever_id: failedMessage.reciever_id,
//             });

//             // Success - server message will replace optimistic one
//         } catch (error) {
//             console.error('Retry failed:', error);

//             // Mark as failed again
//             startTransition(() => {
//                 addOptimisticMessage({
//                     ...failedMessage,
//                     status: 'failed',
//                 });
//             });

//             Alert.alert('Error', 'Failed to send message. Please try again.');
//         }
//     };

//     // ==================== HANDLE FAILED MESSAGE TAP ====================
//     const handleFailedMessageTap = useCallback((message: Message) => {
//         if (message.status === 'failed') {
//             Alert.alert(
//                 'Message Failed',
//                 'Would you like to retry sending this message?',
//                 [
//                     { text: 'Cancel', style: 'cancel' },
//                     { text: 'Retry', onPress: () => retryMessage(message) }
//                 ]
//             );
//         }
//     }, []);

//     // ==================== CALL FUNCTIONS ====================
//     const initiateCall = async (callType: 'audio' | 'video') => {
//         console.log('=== INITIATING CALL ===');
//         console.log('Call Type:', callType);
//         console.log('Sender ID:', senderId);
//         console.log('Receiver ID:', receiverId);
//         try {
//             const callSession = await createCallSessionMutation.mutateAsync({
//                 caller_id: senderId,
//                 callee_id: receiverId,
//                 call_type: callType,
//                 status: 'ringing'
//             });
//             if (callSession) {
//                 router.push({
//                     pathname: '/call',
//                     params: {
//                         callSessionId: callSession?.data[0]?.id,
//                         isVideo: callType === 'video' ? 'true' : 'false',
//                         isCaller: 'true',
//                         otherUserId: receiverId,
//                         otherUserName: therapist?.name || patientName
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error('Error initiating call:', error);
//             Alert.alert('Error', 'Failed to initiate call');
//         }
//     };

//     const startAudioCall = () => {
//         Alert.alert(
//             'Start Audio Call',
//             `Would you like to start an audio call with ${therapist?.name || patientName}?`,
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 { text: 'Call', onPress: () => initiateCall('audio') },
//             ]
//         );
//     };

//     const startVideoCall = () => {
//         Alert.alert(
//             'Start Video Call',
//             `Would you like to start a video call with ${therapist?.name || patientName}?`,
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 { text: 'Call', onPress: () => initiateCall('video') },
//             ]
//         );
//     };

//     // ==================== SCHEDULE BUBBLE COMPONENT ====================
//     const ScheduleBubble = ({ appointment, isSender }: ScheduleBubbleProps) => (
//         <View style={[
//             styles.scheduleBubble,
//             isSender ? styles.senderSchedule : styles.receiverSchedule
//         ]}>
//             <View style={styles.scheduleHeader}>
//                 <Ionicons name="calendar-outline" size={16} color="red" />
//                 <Text style={styles.scheduleTitle}>Appointment</Text>
//             </View>

//             <View style={styles.scheduleDetails}>
//                 <View style={styles.scheduleRow}>
//                     <Text style={styles.scheduleLabel}>Time</Text>
//                     <Text style={styles.scheduleValue}>{formatDateTime(appointment.time)}</Text>
//                 </View>

//                 {appointment.title && (
//                     <View style={styles.scheduleRow}>
//                         <Text style={styles.scheduleLabel}>Title</Text>
//                         <Text style={styles.scheduleValue}>{appointment.title}</Text>
//                     </View>
//                 )}

//                 {appointment.description && (
//                     <View style={styles.scheduleRow}>
//                         <Text style={styles.scheduleLabel}>Description</Text>
//                         <Text style={styles.scheduleValue}>{appointment.description}</Text>
//                     </View>
//                 )}
//             </View>
//         </View>
//     );

//     // ==================== RENDER ====================
//     return (
//         <SafeAreaView style={styles.container} edges={['top']}>
//             <View style={styles.header}>
//                 {!therapist && (
//                     <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.unreadCount}>
//                         <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
//                         {<Text style={styles.unreadCountText}>{totalUnreadCount ? totalUnreadCount : null}</Text>}
//                     </TouchableOpacity>
//                 )}

//                 <TouchableOpacity
//                     activeOpacity={0.7}
//                     style={styles.therapistInfo}
//                     onPress={() => setShowTherapistBio(true)}
//                 >
//                     <Avatar profile_picture={therapist?.profile_picture ? therapist?.profile_picture : profile_picture} />
//                     <View style={{ marginLeft: 12 }}>
//                         <Text style={styles.headerName}>
//                             {therapist?.name ? capitalizeFirstLetter(therapist.name) || 'User' : capitalizeFirstLetter(patientName) || 'User'}
//                         </Text>
//                         <View style={styles.onlineStatus}>
//                             <Text style={styles.onlineText}>
//                                 {therapist?.name ? "Tap to view providers profile" : "Session Client"}
//                             </Text>
//                         </View>
//                     </View>
//                 </TouchableOpacity>

//                 <View style={styles.callButtons}>
//                     <TouchableOpacity style={styles.callButton} onPress={startAudioCall}>
//                         <Ionicons name="call-outline" size={24} color={colors.primary} />
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.callButton} onPress={startVideoCall}>
//                         <Ionicons name="videocam-outline" size={24} color={colors.primary} />
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <FlatList
//                 ref={listRef}
//                 data={[...flatData].reverse()}
//                 keyExtractor={(item, index) =>
//                     item.type === "header" ? `header-${item.date}-${index}` : `${item.id}`
//                 }
//                 renderItem={({ item }) => {
//                     if (item.type === "header") {
//                         return (
//                             <View style={{ flexDirection: 'column' }}>
//                                 <Text style={styles.date}>
//                                     {isToday(item.date) ? "Today" : item.date}
//                                 </Text>
//                             </View>
//                         );
//                     }

//                     const isSender = item.sender_id === senderId;
//                     const isAppointment = item?.appointment?.id;
//                     const isFailed = item.status === 'failed';

//                     return (
//                         <View style={{ flexDirection: 'column-reverse' }}>
//                             <TouchableOpacity
//                                 key={item.id}
//                                 activeOpacity={isFailed ? 0.7 : 1}
//                                 onPress={() => isFailed && handleFailedMessageTap(item)}
//                                 style={[
//                                     styles.messageContainer,
//                                     isSender ? styles.senderMessage : styles.receiverMessage,
//                                 ]}
//                             >
//                                 {isAppointment ? (
//                                     <View style={{ alignItems: isSender ? 'flex-end' : 'flex-start', flex: 1 }}>
//                                         <ScheduleBubble
//                                             appointment={item.appointment}
//                                             isSender={isSender}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.timestamp,
//                                                 isSender ? styles.senderTimestamp : styles.receiverTimestamp,
//                                                 { marginTop: 4, marginRight: isSender ? 8 : 0, marginLeft: isSender ? 0 : 8 }
//                                             ]}
//                                         >
//                                             {formatTime(item.created_at)}
//                                         </Text>
//                                         {isSender && <MessageStatusIcon status={item.status} />}
//                                     </View>
//                                 ) : (
//                                     <>
//                                         <View
//                                             style={[
//                                                 styles.messageBubble,
//                                                 isSender ? styles.senderBubble : styles.receiverBubble,
//                                                 isFailed && styles.failedBubble,
//                                             ]}
//                                         >
//                                             <Text
//                                                 style={[
//                                                     styles.messageText,
//                                                     isSender ? styles.senderText : styles.receiverText,
//                                                 ]}
//                                             >
//                                                 {item.message}
//                                             </Text>
//                                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                                                 <Text
//                                                     style={[
//                                                         styles.timestamp,
//                                                         isSender ? styles.senderTimestamp : styles.receiverTimestamp,
//                                                     ]}
//                                                 >
//                                                     {formatTime(item.created_at)}
//                                                 </Text>
//                                                 {isFailed && (
//                                                     <Text style={styles.failedText}>• Tap to retry</Text>
//                                                 )}
//                                             </View>
//                                         </View>
//                                         {isSender && <MessageStatusIcon status={item.status} />}
//                                     </>
//                                 )}
//                             </TouchableOpacity>
//                         </View>
//                     );
//                 }}
//                 inverted
//                 style={styles.messagesContainer}
//                 contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
//                 keyboardShouldPersistTaps="handled"
//                 onContentSizeChange={() => {
//                     if (flatData.length > 0) {
//                         listRef.current?.scrollToOffset({ offset: 0, animated: true });
//                     }
//                 }}
//                 onLayout={() => {
//                     if (flatData.length > 0) {
//                         listRef.current?.scrollToOffset({ offset: 0, animated: false });
//                     }
//                 }}
//             />

//             <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                 <KeyboardAvoidingView
//                     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 >
//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             style={styles.textInput}
//                             value={messageText}
//                             onChangeText={setMessageText}
//                             placeholder="Type your message..."
//                             multiline
//                             maxLength={500}
//                             placeholderTextColor={colors.placeholder}
//                         />
//                         <TouchableOpacity
//                             style={[styles.sendButton, isPending && styles.sendButtonDisabled]}
//                             onPress={sendMessage}
//                             disabled={isPending}
//                         >
//                             <Ionicons name="send" size={20} color="#fff" />
//                         </TouchableOpacity>
//                     </View>
//                 </KeyboardAvoidingView>
//             </TouchableWithoutFeedback>

//             <WelcomeTip showWelcomeTip={showWelcomeTip} isNewUser={isNewUser} setShowWelcomeTip={setShowWelcomeTip} />
//             {showTherapistBio && therapist && (
//                 <TherapistBioModal
//                     showTherapistBio={showTherapistBio}
//                     setShowTherapistBio={setShowTherapistBio}
//                     therapist={therapist}
//                 />
//             )}
//         </SafeAreaView>
//     );
// };

// // ==================== STYLES ====================
// const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
//     scheduleBubble: {
//         maxWidth: '85%',
//         borderRadius: 12,
//         padding: 12,
//         borderWidth: 1.5,
//         backgroundColor: colors.surface,
//     },
//     senderSchedule: {
//         backgroundColor: colors.surface,
//         borderColor: colors.primary,
//     },
//     receiverSchedule: {
//         backgroundColor: colors.background,
//         borderColor: colors.placeholder,
//     },
//     scheduleHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//         paddingBottom: 8,
//         borderBottomWidth: 1,
//         gap: 5,
//         borderBottomColor: colors.divider,
//     },
//     scheduleTitle: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: 'red',
//     },
//     scheduleDetails: {
//         marginBottom: 12,
//     },
//     scheduleRow: {
//         marginBottom: 8,
//     },
//     scheduleLabel: {
//         fontSize: 11,
//         color: colors.placeholder,
//         marginBottom: 2,
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     scheduleValue: {
//         fontSize: 14,
//         color: colors.textSecondary,
//         fontWeight: '500',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: colors.background,
//     },
//     unreadCount: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 1,
//     },
//     unreadCountText: {
//         fontSize: 16,
//         fontWeight: '500',
//         color: colors.text,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         backgroundColor: colors.background,
//     },
//     therapistInfo: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginLeft: 16,
//     },
//     avatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#3b82f6',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 12
//     },
//     avatarText: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     headerAvatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 12,
//     },
//     avatarPlaceholder: {
//         backgroundColor: '#a3676086',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     headerName: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: colors.text,
//     },
//     onlineStatus: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 2,
//     },
//     onlineDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: colors.primary,
//         marginRight: 4,
//     },
//     onlineText: {
//         fontSize: 12,
//         color: colors.primary,
//     },
//     callButtons: {
//         flexDirection: 'row',
//     },
//     callButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: colors.headerBackground,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginLeft: 8,
//     },
//     messagesContainer: {
//         flex: 1,
//         paddingHorizontal: 16,
//     },
//     date: {
//         textAlign: "center",
//         marginVertical: 30,
//         color: colors.text
//     },
//     messageContainer: {
//         flexDirection: 'row',
//         marginVertical: 4,
//     },
//     senderMessage: {
//         justifyContent: 'flex-end',
//     },
//     receiverMessage: {
//         justifyContent: 'flex-start',
//     },
//     messageAvatar: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         marginRight: 8,
//     },
//     messageBubble: {
//         maxWidth: '75%',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         borderRadius: 20,
//     },
//     senderBubble: {
//         backgroundColor: colors.senderBubble,
//         borderBottomRightRadius: 4,
//     },
//     receiverBubble: {
//         backgroundColor: colors.receiverBubble,
//         borderBottomLeftRadius: 4,
//     },
//     failedBubble: {
//         borderWidth: 1,
//         borderColor: '#ef4444',
//         opacity: 0.7,
//     },
//     messageText: {
//         fontSize: 16,
//         lineHeight: 20,
//     },
//     senderText: {
//         color: colors.senderText,
//     },
//     receiverText: {
//         color: colors.receiverText,
//     },
//     timestamp: {
//         fontSize: 12,
//         marginTop: 4,
//     },
//     senderTimestamp: {
//         color: colors.timestamp,
//         textAlign: 'right',
//     },
//     receiverTimestamp: {
//         color: colors.timestampReceiver,
//     },
//     failedText: {
//         fontSize: 11,
//         color: '#ef4444',
//         fontWeight: '500',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-end',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//     },
//     textInput: {
//         flex: 1,
//         borderWidth: 1,
//         borderColor: colors.inputBorder,
//         borderRadius: 20,
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         maxHeight: 100,
//         fontSize: 16,
//         color: colors.inputText,
//         backgroundColor: colors.inputBackground
//     },
//     sendButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: colors.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginLeft: 8,
//     },
//     sendButtonDisabled: {
//         opacity: 0.5,
//     },
// });

// export default ChatScreen;
