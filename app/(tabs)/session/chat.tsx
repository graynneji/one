
// import Avatar from '@/components/Avatar';
// import MessageStatusIcon from '@/components/MessageStatus';
// import TherapistBioModal from '@/components/TherapistBioModal';
// import WelcomeTip from '@/components/WelcomeTipModal';
// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useAllUnreadCount } from '@/hooks/useAllUnreadCount';
// import { useCrudCreate, useGetById, useMarkMessagesRead } from '@/hooks/useCrud';
// import { useMessage } from '@/hooks/useMessage';
// import { webRTCService } from '@/services/webRTCService';
// import { capitalizeFirstLetter, formatDate, formatDateTime, formatTime, isToday } from '@/utils';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   FlatList,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   useColorScheme,
//   View
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";
// // import { RTCView } from 'react-native-webrtc';

// const { width, height } = Dimensions.get('window');

// // ✅ Helper function to get stream URL
// function getStreamURL(stream: MediaStream | null): string | undefined {
//   if (!stream) return undefined;

//   // Try toURL() method (most common in react-native-webrtc)
//   if (typeof (stream as any).toURL === 'function') {
//     return (stream as any).toURL();
//   }

//   // Fallback to internal _URL property
//   return (stream as any)._URL;
// }

// interface ScheduleBubbleProps {
//   appointment: Record<string, any>
//   isSender: boolean;
// }

// interface ChatScreenProps {
//   navigation: {
//     navigate: (screen: string, params?: any) => void;
//     goBack: () => void;
//   },
//   therapist: {
//     name: string,
//     therapist_id: string,
//     authority: string,
//     license: string,
//     specialization: string,
//     summary: string
//     profile_picture: string;
//     years_of_experience: number;
//   },
//   senderId: string,
//   receiverId: string,
// }

// interface Patient {
//   [key: string]: any;
// }

// export interface UserResult {
//   user_id: string;
//   name: string;
//   therapist_id?: string;
//   therapist?: any;
//   patients?: Patient[];
//   [key: string]: any;
// }

// export interface UserQueryData {
//   data?: UserResult[];
//   [key: string]: any;
// }

// type Message = {
//   id: string;
//   created_at: string;
//   message: string;
//   sender_id: string
//   reciever_id: string
//   status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
// };

// export type sendMessage = {
//   message: string;
//   sender_id: string;
//   reciever_id: string;
//   appointment_id: number;
// }

// const ChatScreen = ({ navigation, therapist, senderId, receiverId }: ChatScreenProps) => {
//   const [messageText, setMessageText] = useState('');
//   const [showWelcomeTip, setShowWelcomeTip] = useState(true);
//   const [showTherapistBio, setShowTherapistBio] = useState(false);
//   const [isNewUser] = useState(false);
//   const { session } = useCheckAuth()
//   const { id, patientId, patientName, profile_picture } = useLocalSearchParams<{ id?: string; patientId: string, patientName: string, profile_picture: string }>()
//   const createMessageMutation = useCrudCreate<sendMessage>("messages")
//   const createCallSessionMutation = useCrudCreate("call_sessions")
//   const router = useRouter()
//   const listRef = useRef<FlatList<any>>(null);
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const styles = createStyles(colors);
//   const updateMessageReadMutation = useMarkMessagesRead("messages")

//   const options = {
//     or: `and(sender_id.eq.${senderId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${senderId})`,
//   }

//   const { messages, fetchOlder, hasMore } = useMessage(
//     {
//       table: "messages",
//       filters: {},
//       column: '*, appointment(*)',
//       options,
//       pageSize: 30,
//       senderId: senderId,
//       receiverId,
//     },
//   )

//   const { unreadAllCount } = useAllUnreadCount({
//     table: 'messages',
//     senderId: session?.user?.id ?? '',
//     enabled: !!session?.user?.id,
//   });

//   useFocusEffect(
//     useCallback(() => {
//       if (receiverId && senderId) {
//         updateMessageReadMutation.mutate({ senderId, receiverId });
//       }
//     }, [receiverId, senderId])
//   );

//   useFocusEffect(
//     useCallback(() => {
//       if (!session?.user) return;
//       const isTherapist = session.user.user_metadata?.designation === "therapist";
//       if (isTherapist && !patientId) {
//         router.replace("/index");
//         return;
//       }
//     }, [session, patientId])
//   );

//   const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

//   const allMessages = useMemo(() => {
//     if (!messages?.length && !optimisticMessages?.length) return [];
//     const realIds = new Set(messages?.map(m => m.id));
//     const validOptimistics = optimisticMessages.filter(
//       m => !realIds.has(m.id) && m.id.startsWith("temp-")
//     );
//     return [
//       ...(messages?.map(m => ({ ...m, status: m.status || "delivered" })) ?? []),
//       ...validOptimistics,
//     ];
//   }, [messages, optimisticMessages]);

//   const groupMessagesByDate = () => {
//     const groups: Record<string, Message[]> = {};
//     allMessages?.forEach((msg) => {
//       const date = msg.created_at
//         ? formatDate(msg.created_at)
//         : "Unknown Date";
//       if (!groups[date]) {
//         groups[date] = [];
//       }
//       groups[date].push(msg);
//     });
//     return groups;
//   };

//   const messageGroups = groupMessagesByDate();
//   const flatData = React.useMemo(() => {
//     const items: Array<{ type: "header"; date: string } | (Message & { type: "message"; date: string })> = [];
//     Object.entries(messageGroups).forEach(([date, msgs]) => {
//       items.push({ type: "header", date });
//       msgs.forEach((msg) => items.push({ ...msg, type: "message", date }));
//     });
//     return items;
//   }, [messageGroups]);

//   const sendMessage = () => {
//     if (messageText.trim()) {
//       const tempId = `temp-${Date.now()}`;
//       const optimisticMessage: Message = {
//         id: tempId,
//         message: messageText,
//         sender_id: senderId,
//         reciever_id: receiverId,
//         created_at: new Date().toISOString(),
//         status: 'sending'
//       };

//       setOptimisticMessages(prev => [...prev, optimisticMessage]);
//       const messageToSend = messageText;
//       setMessageText('');

//       createMessageMutation.mutateAsync({
//         message: messageToSend,
//         sender_id: senderId,
//         reciever_id: receiverId,
//       })
//         .then((response) => {
//           setOptimisticMessages(prev =>
//             prev.filter(msg => msg.id !== tempId)
//           );
//         })
//         .catch((error) => {
//           setOptimisticMessages(prev =>
//             prev.map(msg =>
//               msg.id === tempId
//                 ? { ...msg, status: 'failed' as const }
//                 : msg
//             )
//           );
//         });
//     }
//   };

//   const initiateCall = async (callType: 'audio' | 'video') => {
//     try {
//       const callSession = await createCallSessionMutation.mutateAsync({
//         caller_id: senderId,
//         callee_id: receiverId,
//         call_type: callType,
//         status: 'ringing'
//       });

//       if (callSession?.data?.[0]) {
//         // Use router.push instead of navigation.navigate
//         router.push({
//           pathname: '/(tabs)/session/call',
//           params: {
//             callSessionId: callSession.data[0].id,
//             isVideo: callType === 'video' ? 'true' : 'false',
//             isCaller: 'true',
//             otherUserId: receiverId,
//             otherUserName: therapist?.name || patientName
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error initiating call:', error);
//       Alert.alert('Error', 'Failed to initiate call');
//     }
//   };
//   const startAudioCall = () => {
//     Alert.alert(
//       'Start Audio Call',
//       `Would you like to start an audio call with ${therapist?.name || patientName}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Call', onPress: () => initiateCall('audio') },
//       ]
//     );
//   };

//   const startVideoCall = () => {
//     Alert.alert(
//       'Start Video Call',
//       `Would you like to start a video call with ${therapist?.name || patientName}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Call', onPress: () => initiateCall('video') },
//       ]
//     );
//   };

//   const ScheduleBubble = ({ appointment, isSender }: ScheduleBubbleProps) => (
//     <View style={[
//       styles.scheduleBubble,
//       isSender ? styles.senderSchedule : styles.receiverSchedule
//     ]}>
//       <View style={styles.scheduleHeader}>
//         <Ionicons name="calendar-outline" size={16} color="red" />
//         <Text style={styles.scheduleTitle}>Appointment</Text>
//       </View>

//       <View style={styles.scheduleDetails}>
//         <View style={styles.scheduleRow}>
//           <Text style={styles.scheduleLabel}>Time</Text>
//           <Text style={styles.scheduleValue}>{formatDateTime(appointment.time)}</Text>
//         </View>

//         {appointment.title && (
//           <View style={styles.scheduleRow}>
//             <Text style={styles.scheduleLabel}>Title</Text>
//             <Text style={styles.scheduleValue}>{appointment.title}</Text>
//           </View>
//         )}

//         {appointment.description && (
//           <View style={styles.scheduleRow}>
//             <Text style={styles.scheduleLabel}>Description</Text>
//             <Text style={styles.scheduleValue}>{appointment.description}</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         {!therapist && (
//           <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.unreadCount}>
//             <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
//             {<Text style={styles.unreadCountText}>{unreadAllCount ? unreadAllCount : null}</Text>}
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity
//           activeOpacity={0.7}
//           style={styles.therapistInfo}
//           onPress={() => setShowTherapistBio(true)}
//         >
//           <Avatar profile_picture={therapist?.profile_picture ? therapist?.profile_picture : profile_picture} />
//           <View style={{ marginLeft: 12 }}>
//             <Text style={styles.headerName}>
//               {therapist?.name ? capitalizeFirstLetter(therapist.name) || 'User' : capitalizeFirstLetter(patientName) || 'User'}
//             </Text>
//             <View style={styles.onlineStatus}>
//               <Text style={styles.onlineText}>
//                 {therapist?.name ? "Tap to view providers profile" : "Session Client"}
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>

//         <View style={styles.callButtons}>
//           <TouchableOpacity style={styles.callButton} onPress={startAudioCall}>
//             <Ionicons name="call-outline" size={24} color={colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.callButton} onPress={startVideoCall}>
//             <Ionicons name="videocam-outline" size={24} color={colors.primary} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <FlatList
//         ref={listRef}
//         data={[...flatData].reverse()}
//         keyExtractor={(item, index) =>
//           item.type === "header" ? `header-${item.date}-${index}` : `${item.id}`
//         }
//         renderItem={({ item }) => {
//           if (item.type === "header") {
//             return (
//               <View style={{ flexDirection: 'column' }}>
//                 <Text style={styles.date}>
//                   {isToday(item.date) ? "Today" : item.date}
//                 </Text>
//               </View>
//             );
//           }

//           const isSender = item.sender_id === senderId;
//           const isAppointment = item?.appointment?.id

//           return (
//             <View style={{ flexDirection: 'column-reverse' }}>
//               <View
//                 key={item.id}
//                 style={[
//                   styles.messageContainer,
//                   isSender ? styles.senderMessage : styles.receiverMessage,
//                 ]}
//               >
//                 {isAppointment ? (
//                   <View style={{ alignItems: isSender ? 'flex-end' : 'flex-start', flex: 1 }}>
//                     <ScheduleBubble
//                       appointment={item.appointment}
//                       isSender={isSender}
//                     />
//                     <Text
//                       style={[
//                         styles.timestamp,
//                         isSender ? styles.senderTimestamp : styles.receiverTimestamp,
//                         { marginTop: 4, marginRight: isSender ? 8 : 0, marginLeft: isSender ? 0 : 8 }
//                       ]}
//                     >
//                       {formatTime(item.created_at)}
//                     </Text>
//                     {isSender && <MessageStatusIcon status={item.status} />}
//                   </View>
//                 ) : (
//                   <>
//                     <View
//                       style={[
//                         styles.messageBubble,
//                         isSender ? styles.senderBubble : styles.receiverBubble,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.messageText,
//                           isSender ? styles.senderText : styles.receiverText,
//                         ]}
//                       >
//                         {item.message}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.timestamp,
//                           isSender ? styles.senderTimestamp : styles.receiverTimestamp,
//                         ]}
//                       >
//                         {formatTime(item.created_at)}
//                       </Text>
//                     </View>
//                     {isSender && <MessageStatusIcon status={item.status} />}
//                   </>
//                 )}
//               </View>
//             </View>
//           );
//         }}
//         inverted
//         style={styles.messagesContainer}
//         contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
//         keyboardShouldPersistTaps="handled"
//         onContentSizeChange={() => {
//           if (flatData.length > 0) {
//             listRef.current?.scrollToOffset({ offset: 0, animated: false });
//           }
//         }}
//         onLayout={() => {
//           if (flatData.length > 0) {
//             listRef.current?.scrollToOffset({ offset: 0, animated: false });
//           }
//         }}
//       />

//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? 'padding' : 'height'}
//         >
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.textInput}
//               value={messageText}
//               onChangeText={setMessageText}
//               placeholder="Type your message..."
//               multiline
//               maxLength={500}
//               placeholderTextColor={colors.placeholder}
//             />
//             <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//               <Ionicons name="send" size={20} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>

//       <WelcomeTip showWelcomeTip={showWelcomeTip} isNewUser={isNewUser} setShowWelcomeTip={setShowWelcomeTip} />
//       {showTherapistBio && therapist && (
//         <TherapistBioModal
//           showTherapistBio={showTherapistBio}
//           setShowTherapistBio={setShowTherapistBio}
//           therapist={therapist}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// // Call Screen Component with WebRTC
// interface CallScreenProps {
//   route: {
//     params?: {
//       isVideo?: boolean;
//       callSessionId?: string | number;
//       isCaller?: boolean;
//       otherUserId?: string;
//       otherUserName?: string;
//     }
//   };
//   navigation: {
//     goBack: () => void;
//     navigate: (screen: string, params?: any) => void;
//   };
// }

// const CallScreen = ({ route, navigation }: CallScreenProps) => {
//   const {
//     isVideo = false,
//     callSessionId,
//     isCaller = false,
//     otherUserId,
//     otherUserName = 'User'
//   } = route?.params || {};

//   const [isMuted, setIsMuted] = useState(false);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
//   const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const styles = createStyles(colors);
//   const { session } = useCheckAuth();
//   const signalSubscription = useRef<any>(null);

//   useEffect(() => {
//     initializeCall();
//     return () => {
//       cleanup();
//     };
//   }, []);

//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
//     if (callStatus === 'connected') {
//       interval = setInterval(() => {
//         setCallDuration(prev => prev + 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [callStatus]);

//   async function initializeCall() {
//     try {
//       if (!callSessionId) {
//         Alert.alert('Error', 'Invalid call session');
//         navigation.goBack();
//         return;
//       }

//       // 1. First, set up signaling listener
//       await setupSignalingListener();

//       // 2. Initialize WebRTC
//       await webRTCService.initializeWebRTC(isCaller, callSessionId);
//       webRTCService.setOtherUserId(otherUserId || '');

//       // 3. Get local media stream
//       const stream = await webRTCService.getLocalStream(isVideo ? 'video' : 'audio');
//       setLocalStream(stream);

//       // 4. Set up track handler
//       if (webRTCService.pc) {
//         webRTCService.pc.addEventListener('track', (event: any) => {
//           console.log('Remote stream received');
//           setRemoteStream(event.streams[0]);
//           setCallStatus('connected');
//         });
//       }

//       // 5. Create offer if caller (after signaling is ready)
//       if (isCaller) {
//         setCallStatus('ringing');
//         await new Promise(resolve => setTimeout(resolve, 100));
//         await webRTCService.createOffer();
//       } else {
//         setCallStatus('ringing');
//       }
//     } catch (error) {
//       console.error('Error initializing call:', error);
//       Alert.alert('Error', 'Failed to initialize call');
//       navigation.goBack();
//     }
//   }

//   const setupSignalingListener = () => {
//     const supabase = webRTCService.supabase;

//     signalSubscription.current = supabase
//       .channel(`call-${callSessionId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'webrtc_signaling',
//           filter: `call_session_id=eq.${callSessionId}`
//         },
//         async (payload: any) => {
//           const signal = payload.new;

//           if (signal.from_user_id === session?.user?.id) return;

//           try {
//             switch (signal.signal_type) {
//               case 'offer':
//                 await webRTCService.handleOffer(signal.signal_data);
//                 break;
//               case 'answer':
//                 await webRTCService.handleAnswer(signal.signal_data);
//                 setCallStatus('connected');
//                 break;
//               case 'ice-candidate':
//                 await webRTCService.handleICECandidate(signal.signal_data);
//                 break;
//             }
//           } catch (error) {
//             console.error('Error handling signal:', error);
//           }
//         }
//       )
//       .subscribe();
//   };

//   const cleanup = async () => {
//     if (signalSubscription.current) {
//       await signalSubscription.current.unsubscribe();
//     }
//     await webRTCService.cleanup();
//     setLocalStream(null);
//     setRemoteStream(null);
//   };

//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const endCall = async () => {
//     Alert.alert(
//       'End Call',
//       'Are you sure you want to end this call?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'End Call',
//           style: 'destructive',
//           onPress: async () => {
//             setCallStatus('ended');

//             if (callSessionId) {
//               await webRTCService.supabase
//                 .from('call_sessions')
//                 .update({
//                   status: 'ended',
//                   ended_at: new Date().toISOString(),
//                   duration: callDuration
//                 })
//                 .eq('id', callSessionId);
//             }

//             await cleanup();
//             navigation.goBack();
//           }
//         },
//       ]
//     );
//   };

//   const toggleMute = () => {
//     const newMutedState = webRTCService.toggleAudio();
//     setIsMuted(newMutedState);
//   };

//   const toggleVideo = async () => {
//     const newVideoState = webRTCService.toggleVideo();
//     setIsVideoEnabled(!newVideoState);
//   };

//   const switchToVideo = async () => {
//     try {
//       await webRTCService.switchMediaType('video');
//       const stream = await webRTCService.getLocalStream('video');
//       setLocalStream(stream);
//       setIsVideoEnabled(true);
//     } catch (error) {
//       console.error('Error switching to video:', error);
//       Alert.alert('Error', 'Failed to enable video');
//     }
//   };

//   const getStatusText = () => {
//     switch (callStatus) {
//       case 'connecting':
//         return 'Connecting...';
//       case 'ringing':
//         return isCaller ? 'Ringing...' : 'Incoming call...';
//       case 'connected':
//         return 'Connected';
//       case 'ended':
//         return 'Call ended';
//       default:
//         return '';
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.container, styles.callContainer]}>
//       {isVideoEnabled && remoteStream ? (
//         <View style={styles.videoContainer}>
//           {/* ✅ FIXED: Remote video with proper stream URL */}
//           {/* <RTCView
//             streamURL={getStreamURL(remoteStream)}
//             style={styles.mainVideoView}
//             objectFit="cover"
//           /> */}
//           <Text>Viiiideo</Text>

//           {/* ✅ FIXED: Local video with proper stream URL */}
//           {localStream && (
//             // <RTCView
//             //   streamURL={getStreamURL(localStream)}
//             //   style={styles.selfVideoView}
//             //   objectFit="cover"
//             //   mirror={true}
//             // />
//             <Text>Video</Text>
//           )}
//         </View>
//       ) : (
//         <View style={styles.audioCallContainer}>
//           <View style={styles.callAvatar}>
//             <Ionicons name="person" size={60} color="#fff" />
//           </View>
//           <Text style={styles.callName}>{otherUserName}</Text>
//           <Text style={styles.callStatus}>{getStatusText()}</Text>
//           {callStatus === 'connected' && (
//             <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
//           )}
//         </View>
//       )}

//       {/* Call Controls */}
//       <View style={styles.callControls}>
//         <TouchableOpacity
//           style={[styles.controlButton, isMuted && styles.activeControl]}
//           onPress={toggleMute}
//         >
//           <Ionicons
//             name={isMuted ? 'mic-off' : 'mic'}
//             size={24}
//             color={isMuted ? '#fff' : '#666'}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
//           onPress={() => setIsSpeakerOn(!isSpeakerOn)}
//         >
//           <MaterialIcons
//             name={isSpeakerOn ? 'volume-up' : 'volume-down'}
//             size={24}
//             color={isSpeakerOn ? '#fff' : '#666'}
//           />
//         </TouchableOpacity>

//         {!isVideo && callStatus === 'connected' && (
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={switchToVideo}
//           >
//             <Ionicons name="videocam" size={24} color="#666" />
//           </TouchableOpacity>
//         )}

//         {isVideo && (
//           <TouchableOpacity
//             style={[styles.controlButton, !isVideoEnabled && styles.activeControl]}
//             onPress={toggleVideo}
//           >
//             <Ionicons
//               name={isVideoEnabled ? 'videocam' : 'videocam-off'}
//               size={24}
//               color={isVideoEnabled ? '#666' : '#fff'}
//             />
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
//           <Ionicons name="call" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Main Chat Component
// const Chat = () => {
//   const [currentScreen, setCurrentScreen] = useState('chat');
//   const [routeParams, setRouteParams] = useState({});

//   const navigation = {
//     navigate: (screen: string, params: any = {}) => {
//       setCurrentScreen(screen.toLowerCase().replace('screen', ''));
//       setRouteParams(params);
//     },
//     goBack: () => setCurrentScreen('chat'),
//   };

//   const { session } = useCheckAuth()
//   const senderId = session?.user?.id!
//   const { patientId } = useLocalSearchParams<{ patientId?: string }>()

//   const staleTime = 1000 * 60 * 60 * 24
//   const gcTime = 1000 * 60 * 60 * 24
//   const refetchOnWindowFocus = false
//   const refetchOnReconnect = false
//   const refetchOnMount = false

//   const { data } = useGetById(
//     "user",
//     { user_id: senderId },
//     "therapist(name, therapist_id, authority, license, specialization, summary, years_of_experience, profile_picture)",
//     !!senderId,
//     {},
//     staleTime,
//     gcTime,
//     refetchOnWindowFocus,
//     refetchOnReconnect,
//     refetchOnMount
//   )

//   const therapist = data?.result[0]?.therapist;
//   const receiverId = therapist ? therapist?.therapist_id : patientId || ""

//   if (currentScreen === 'call') {
//     return <CallScreen route={{ params: routeParams }} navigation={navigation} />;
//   }

//   return <ChatScreen
//     navigation={navigation}
//     therapist={therapist}
//     senderId={senderId}
//     receiverId={receiverId}
//   />
// };

// const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
//   scheduleBubble: {
//     maxWidth: '85%',
//     borderRadius: 12,
//     padding: 12,
//     borderWidth: 1.5,
//     backgroundColor: colors.surface,
//   },
//   senderSchedule: {
//     backgroundColor: colors.surface,
//     borderColor: colors.primary,
//   },
//   receiverSchedule: {
//     backgroundColor: colors.background,
//     borderColor: colors.placeholder,
//   },
//   scheduleHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     gap: 5,
//     borderBottomColor: colors.divider,
//   },
//   scheduleTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: 'red',
//   },
//   scheduleDetails: {
//     marginBottom: 12,
//   },
//   scheduleRow: {
//     marginBottom: 8,
//   },
//   scheduleLabel: {
//     fontSize: 11,
//     color: colors.placeholder,
//     marginBottom: 2,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   scheduleValue: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     fontWeight: '500',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   unreadCount: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 1,
//   },
//   unreadCountText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.text,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: colors.background,
//   },
//   therapistInfo: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 16,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#3b82f6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12
//   },
//   avatarText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   headerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   avatarPlaceholder: {
//     backgroundColor: '#a3676086',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   onlineStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   onlineDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.primary,
//     marginRight: 4,
//   },
//   onlineText: {
//     fontSize: 12,
//     color: colors.primary,
//   },
//   callButtons: {
//     flexDirection: 'row',
//   },
//   callButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.headerBackground,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   messagesContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   date: {
//     textAlign: "center",
//     marginVertical: 30,
//     color: colors.text
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     marginVertical: 4,
//   },
//   senderMessage: {
//     justifyContent: 'flex-end',
//   },
//   receiverMessage: {
//     justifyContent: 'flex-start',
//   },
//   messageAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     marginRight: 8,
//   },
//   messageBubble: {
//     maxWidth: '75%',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   senderBubble: {
//     backgroundColor: colors.senderBubble,
//     borderBottomRightRadius: 4,
//   },
//   receiverBubble: {
//     backgroundColor: colors.receiverBubble,
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 20,
//   },
//   senderText: {
//     color: colors.senderText,
//   },
//   receiverText: {
//     color: colors.receiverText,
//   },
//   timestamp: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   senderTimestamp: {
//     color: colors.timestamp,
//     textAlign: 'right',
//   },
//   receiverTimestamp: {
//     color: colors.timestampReceiver,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   textInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: colors.inputBorder,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     maxHeight: 100,
//     fontSize: 16,
//     color: colors.inputText,
//     backgroundColor: colors.inputBackground
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   callContainer: {
//     backgroundColor: '#1a1a1a',
//   },
//   audioCallContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   callAvatar: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     marginBottom: 24,
//     backgroundColor: '#333',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   callName: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   callStatus: {
//     fontSize: 16,
//     color: '#4CAF50',
//     marginBottom: 16,
//   },
//   callDuration: {
//     fontSize: 18,
//     color: '#ccc',
//   },
//   videoContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   mainVideoView: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   videoPlaceholder: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//   },
//   videoName: {
//     fontSize: 20,
//     color: '#fff',
//     marginTop: 20,
//   },
//   selfVideoView: {
//     position: 'absolute',
//     top: 60,
//     right: 20,
//     width: 120,
//     height: 160,
//     backgroundColor: '#333',
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   selfVideoPlaceholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#444',
//   },
//   callControls: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   controlButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   activeControl: {
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   endCallButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#f44336',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 12,
//   },
// });

// export default Chat;

// Update your app/(tabs)/session/chat.tsx to this simpler version:

import ChatScreen from '@/components/ChatScreen';
import { useCheckAuth } from '@/context/AuthContext';
import { useGetById } from '@/hooks/useCrud';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

// Import your ChatScreen component (the main chat UI you already have)


const Chat = () => {
  const { session } = useCheckAuth();
  const senderId = session?.user?.id!;
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();

  const staleTime = 1000 * 60 * 60 * 24;
  const gcTime = 1000 * 60 * 60 * 24;
  const refetchOnWindowFocus = false;
  const refetchOnReconnect = false;
  const refetchOnMount = false;

  const { data } = useGetById(
    "user",
    { user_id: senderId },
    "therapist(name, therapist_id, authority, license, specialization, summary, years_of_experience, profile_picture)",
    !!senderId,
    {},
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchOnMount
  );

  const therapist = data?.result[0]?.therapist;
  const receiverId = therapist ? therapist?.therapist_id : patientId || "";

  return (

    <ChatScreen
      therapist={therapist}
      senderId={senderId}
      receiverId={receiverId}
    />
  );
};

export default Chat;