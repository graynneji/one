// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { webRTCService } from '@/services/webRTCService';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import type { RealtimeChannel } from '@supabase/supabase-js';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//     Alert,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import type { MediaStream } from 'react-native-webrtc';
// import { RTCView } from 'react-native-webrtc';

// export default function CallScreen() {
//     const router = useRouter();
//     const params = useLocalSearchParams<{
//         isVideo?: string;
//         callSessionId?: string;
//         isCaller?: string;
//         otherUserId?: string;
//         otherUserName?: string;
//     }>();
//     console.log(params, "params")

//     const isVideo = params.isVideo === 'true';
//     const callSessionId = params.callSessionId;
//     const isCaller = params.isCaller === 'true';
//     const otherUserId = params.otherUserId;
//     const otherUserName = params.otherUserName || 'User';

//     const [isMuted, setIsMuted] = useState(false);
//     const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//     const [callDuration, setCallDuration] = useState(0);
//     const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
//     const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
//     const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//     const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];
//     const { session } = useCheckAuth();
//     const signalSubscription = useRef<RealtimeChannel | null>(null);
//     const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//     const remoteStreamCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

//     useEffect(() => {
//         console.log('CallScreen mounted with params:', params);
//         initializeCall();

//         return () => {
//             cleanup();
//         };
//     }, []);

//     useEffect(() => {
//         if (callStatus === 'connected') {
//             callTimerRef.current = setInterval(() => {
//                 setCallDuration(prev => prev + 1);
//             }, 1000);
//         } else {
//             if (callTimerRef.current) {
//                 clearInterval(callTimerRef.current);
//                 callTimerRef.current = null;
//             }
//         }

//         return () => {
//             if (callTimerRef.current) {
//                 clearInterval(callTimerRef.current);
//             }
//         };
//     }, [callStatus]);

//     // Poll for remote stream updates
//     useEffect(() => {
//         remoteStreamCheckInterval.current = setInterval(() => {
//             const currentRemoteStream = webRTCService.getRemoteStream();
//             if (currentRemoteStream && currentRemoteStream !== remoteStream) {
//                 console.log('Remote stream detected in polling');
//                 setRemoteStream(currentRemoteStream);
//                 setCallStatus('connected');
//             }
//         }, 500);

//         return () => {
//             if (remoteStreamCheckInterval.current) {
//                 clearInterval(remoteStreamCheckInterval.current);
//             }
//         };
//     }, [remoteStream]);

//     async function setupSignalingListener() {
//         try {
//             if (!callSessionId || !session?.user?.id) {
//                 console.error('Missing callSessionId or user session');
//                 return;
//             }

//             console.log('Setting up signaling listener for session:', callSessionId);

//             // Subscribe to webrtc_signaling changes for this call session
//             const channel = webRTCService.supabase
//                 .channel(`call-${callSessionId}`)
//                 .on(
//                     'postgres_changes',
//                     {
//                         event: 'INSERT',
//                         schema: 'public',
//                         table: 'webrtc_signaling',
//                         filter: `call_session_id=eq.${callSessionId}`,
//                     },
//                     async (payload: any) => {
//                         console.log('Received signal:', payload.new);
//                         const signal = payload.new;

//                         // Ignore signals sent by this user
//                         if (signal.from_user_id === session.user.id) {
//                             console.log('Ignoring own signal');
//                             return;
//                         }

//                         // Handle different signal types
//                         try {
//                             switch (signal.signal_type) {
//                                 case 'offer':
//                                     console.log('Handling offer...');
//                                     await webRTCService.handleOffer(signal.signal_data);
//                                     break;
//                                 case 'answer':
//                                     console.log('Handling answer...');
//                                     await webRTCService.handleAnswer(signal.signal_data);
//                                     break;
//                                 case 'ice-candidate':
//                                     console.log('Handling ICE candidate...');
//                                     await webRTCService.handleICECandidate(signal.signal_data);
//                                     break;
//                                 default:
//                                     console.log('Unknown signal type:', signal.signal_type);
//                             }
//                         } catch (error) {
//                             console.error('Error handling signal:', error);
//                         }
//                     }
//                 )
//                 .subscribe((status) => {
//                     console.log('Signaling channel status:', status);
//                 });

//             signalSubscription.current = channel;
//         } catch (error) {
//             console.error('Error setting up signaling listener:', error);
//         }
//     }

//     async function initializeCall() {
//         try {
//             console.log('Initializing call...', callSessionId);
//             if (!callSessionId) {
//                 Alert.alert('Error', 'Invalid call session');
//                 router.back();
//                 return;
//             }

//             if (!session?.user?.id) {
//                 Alert.alert('Error', 'User not authenticated');
//                 router.back();
//                 return;
//             }

//             setCallStatus('connecting');

//             // Initialize WebRTC
//             await webRTCService.initializeWebRTC(isCaller, callSessionId);
//             webRTCService.setOtherUserId(otherUserId || '');

//             // Set up signaling listener BEFORE getting media stream
//             await setupSignalingListener();

//             // Get local media stream
//             console.log('Getting local stream...');
//             const stream = await webRTCService.getLocalStream(isVideo ? 'video' : 'audio');
//             setLocalStream(stream);
//             console.log('Local stream obtained:', stream.id);

//             // Monitor connection state
//             webRTCService.onConnectionStateChange((state) => {
//                 console.log('Connection state changed:', state);
//                 if (state === 'connected') {
//                     setCallStatus('connected');
//                     // Double-check for remote stream
//                     const currentRemoteStream = webRTCService.getRemoteStream();
//                     if (currentRemoteStream) {
//                         setRemoteStream(currentRemoteStream);
//                     }
//                 } else if (state === 'failed' || state === 'disconnected') {
//                     Alert.alert('Connection Lost', 'The call has been disconnected.');
//                     endCallDirectly();
//                 }
//             });

//             if (isCaller) {
//                 console.log('Creating offer as caller...');
//                 setCallStatus('ringing');
//                 // Small delay to ensure everything is set up
//                 await new Promise(resolve => setTimeout(resolve, 500));
//                 await webRTCService.createOffer();
//             } else {
//                 console.log('Waiting for offer as callee...');
//                 setCallStatus('ringing');
//             }
//         } catch (error) {
//             console.error('Error initializing call:', error);
//             Alert.alert('Error', `Failed to initialize call: ${error instanceof Error ? error.message : 'Unknown error'}`);
//             router.back();
//         }
//     }

//     const cleanup = async () => {
//         console.log('Cleaning up call...');

//         // Clear timer
//         if (callTimerRef.current) {
//             clearInterval(callTimerRef.current);
//             callTimerRef.current = null;
//         }

//         // Clear remote stream check interval
//         if (remoteStreamCheckInterval.current) {
//             clearInterval(remoteStreamCheckInterval.current);
//             remoteStreamCheckInterval.current = null;
//         }

//         // Unsubscribe from signaling
//         if (signalSubscription.current) {
//             await signalSubscription.current.unsubscribe();
//             signalSubscription.current = null;
//         }

//         // Clean up WebRTC
//         await webRTCService.cleanup();

//         setLocalStream(null);
//         setRemoteStream(null);
//     };

//     const formatDuration = (seconds: number) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     };

//     const endCallDirectly = async () => {
//         setCallStatus('ended');

//         if (callSessionId) {
//             try {
//                 await webRTCService.supabase
//                     .from('call_sessions')
//                     .update({
//                         status: 'ended',
//                         ended_at: new Date().toISOString(),
//                         duration: callDuration
//                     })
//                     .eq('id', callSessionId);
//             } catch (error) {
//                 console.error('Error updating call session:', error);
//             }
//         }

//         await cleanup();
//         router.back();
//     };

//     const endCall = async () => {
//         Alert.alert(
//             'End Call',
//             'Are you sure you want to end this call?',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'End Call',
//                     style: 'destructive',
//                     onPress: endCallDirectly
//                 },
//             ]
//         );
//     };

//     const toggleMute = () => {
//         const newMutedState = webRTCService.toggleAudio();
//         setIsMuted(newMutedState);
//         console.log('Mute toggled:', newMutedState);
//     };

//     const toggleVideo = async () => {
//         const newVideoState = webRTCService.toggleVideo();
//         setIsVideoEnabled(newVideoState);
//         console.log('Video toggled:', newVideoState);
//     };

//     const switchToVideo = async () => {
//         try {
//             console.log('Switching to video...');
//             await webRTCService.switchMediaType('video');
//             const stream = await webRTCService.getLocalStream('video');
//             setLocalStream(stream);
//             setIsVideoEnabled(true);
//         } catch (error) {
//             console.error('Error switching to video:', error);
//             Alert.alert('Error', 'Failed to enable video');
//         }
//     };

//     const getStatusText = () => {
//         switch (callStatus) {
//             case 'connecting':
//                 return 'Connecting...';
//             case 'ringing':
//                 return isCaller ? 'Ringing...' : 'Incoming call...';
//             case 'connected':
//                 return 'Connected';
//             case 'ended':
//                 return 'Call ended';
//             default:
//                 return '';
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
//             {isVideoEnabled && (remoteStream || localStream) ? (
//                 <View style={styles.videoContainer}>
//                     {/* Remote Video View - Full Screen */}
//                     {remoteStream ? (
//                         <RTCView
//                             streamURL={remoteStream.toURL()}
//                             style={styles.mainVideoView}
//                             objectFit="cover"
//                             mirror={false}
//                         />
//                     ) : (
//                         <View style={[styles.mainVideoView, styles.placeholderView]}>
//                             <Ionicons name="person" size={80} color="#666" />
//                             <Text style={styles.placeholderText}>Waiting for {otherUserName}...</Text>
//                         </View>
//                     )}

//                     {/* Local Video View - Small Picture-in-Picture */}
//                     {localStream && (
//                         <View style={styles.selfVideoView}>
//                             <RTCView
//                                 streamURL={localStream.toURL()}
//                                 style={styles.selfVideo}
//                                 objectFit="cover"
//                                 mirror={true}
//                                 zOrder={1}
//                             />
//                         </View>
//                     )}

//                     {/* Call Duration Overlay for Video Calls */}
//                     {callStatus === 'connected' && (
//                         <View style={styles.videoDurationOverlay}>
//                             <Text style={styles.videoDuration}>{formatDuration(callDuration)}</Text>
//                         </View>
//                     )}
//                 </View>
//             ) : (
//                 <View style={styles.audioCallContainer}>
//                     <View style={styles.callAvatar}>
//                         <Ionicons name="person" size={60} color="#fff" />
//                     </View>
//                     <Text style={styles.callName}>{otherUserName}</Text>
//                     <Text style={styles.callStatus}>{getStatusText()}</Text>
//                     {callStatus === 'connected' && (
//                         <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
//                     )}
//                     <Text style={styles.debugText}>
//                         Video: {isVideo ? 'Yes' : 'No'} | Caller: {isCaller ? 'Yes' : 'No'}
//                     </Text>
//                 </View>
//             )}

//             {/* Call Controls */}
//             <View style={styles.callControls}>
//                 <TouchableOpacity
//                     style={[styles.controlButton, isMuted && styles.activeControl]}
//                     onPress={toggleMute}
//                 >
//                     <Ionicons
//                         name={isMuted ? 'mic-off' : 'mic'}
//                         size={24}
//                         color={isMuted ? '#fff' : '#666'}
//                     />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
//                     onPress={() => setIsSpeakerOn(!isSpeakerOn)}
//                 >
//                     <MaterialIcons
//                         name={isSpeakerOn ? 'volume-up' : 'volume-down'}
//                         size={24}
//                         color={isSpeakerOn ? '#fff' : '#666'}
//                     />
//                 </TouchableOpacity>

//                 {!isVideo && callStatus === 'connected' && (
//                     <TouchableOpacity
//                         style={styles.controlButton}
//                         onPress={switchToVideo}
//                     >
//                         <Ionicons name="videocam" size={24} color="#666" />
//                     </TouchableOpacity>
//                 )}

//                 {isVideo && (
//                     <TouchableOpacity
//                         style={[styles.controlButton, !isVideoEnabled && styles.activeControl]}
//                         onPress={toggleVideo}
//                     >
//                         <Ionicons
//                             name={isVideoEnabled ? 'videocam' : 'videocam-off'}
//                             size={24}
//                             color={isVideoEnabled ? '#666' : '#fff'}
//                         />
//                     </TouchableOpacity>
//                 )}

//                 <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
//                     <Ionicons name="call" size={24} color="#fff" />
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#1a1a1a',
//     },
//     audioCallContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     callAvatar: {
//         width: 150,
//         height: 150,
//         borderRadius: 75,
//         marginBottom: 24,
//         backgroundColor: '#333',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     callName: {
//         fontSize: 24,
//         fontWeight: '600',
//         color: '#fff',
//         marginBottom: 8,
//     },
//     callStatus: {
//         fontSize: 16,
//         color: '#4CAF50',
//         marginBottom: 16,
//     },
//     callDuration: {
//         fontSize: 18,
//         color: '#ccc',
//         marginBottom: 8,
//     },
//     debugText: {
//         fontSize: 12,
//         color: '#999',
//         marginTop: 16,
//     },
//     videoContainer: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     mainVideoView: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     placeholderView: {
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     placeholderText: {
//         color: '#666',
//         fontSize: 16,
//         marginTop: 16,
//     },
//     selfVideoView: {
//         position: 'absolute',
//         top: 60,
//         right: 20,
//         width: 120,
//         height: 160,
//         backgroundColor: '#333',
//         borderRadius: 12,
//         overflow: 'hidden',
//         borderWidth: 2,
//         borderColor: 'rgba(255, 255, 255, 0.3)',
//     },
//     selfVideo: {
//         width: '100%',
//         height: '100%',
//     },
//     videoDurationOverlay: {
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         backgroundColor: 'rgba(0, 0, 0, 0.6)',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 8,
//     },
//     videoDuration: {
//         color: '#fff',
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     callControls: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingVertical: 40,
//         paddingHorizontal: 20,
//         backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     },
//     controlButton: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: 'rgba(255, 255, 255, 0.2)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginHorizontal: 12,
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.1)',
//     },
//     activeControl: {
//         backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     },
//     endCallButton: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: '#f44336',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginHorizontal: 12,
//     },
// });

import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { webRTCService } from '@/services/webRTCService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MediaStream } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';

const { width, height } = Dimensions.get('window');

export default function CallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        isVideo?: string;
        callSessionId?: string;
        isCaller?: string;
        otherUserId?: string;
        otherUserName?: string;
    }>();

    const isVideo = params.isVideo === 'true';
    const callSessionId = params.callSessionId;
    const isCaller = params.isCaller === 'true';
    const otherUserId = params.otherUserId;
    const otherUserName = params.otherUserName || 'User';

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(isVideo);
    const [callDuration, setCallDuration] = useState(0);
    const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
    const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const colorScheme = useColorScheme();
    const { session } = useCheckAuth();
    const signalSubscription = useRef<RealtimeChannel | null>(null);
    const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const remoteStreamCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor('transparent');
            StatusBar.setTranslucent(true);
        }
        initializeCall();

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Slide up animation
        Animated.spring(slideUpAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }).start();

        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (callStatus === 'ringing' || callStatus === 'connecting') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [callStatus]);

    useEffect(() => {
        if (callStatus === 'connected') {
            callTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
                callTimerRef.current = null;
            }
        }

        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [callStatus]);

    useEffect(() => {
        remoteStreamCheckInterval.current = setInterval(() => {
            const currentRemoteStream = webRTCService.getRemoteStream();
            if (currentRemoteStream && currentRemoteStream !== remoteStream) {
                console.log('Remote stream detected');
                setRemoteStream(currentRemoteStream);
                setCallStatus('connected');
            }
        }, 500);

        return () => {
            if (remoteStreamCheckInterval.current) {
                clearInterval(remoteStreamCheckInterval.current);
            }
        };
    }, [remoteStream]);

    async function setupSignalingListener() {
        try {
            if (!callSessionId || !session?.user?.id) {
                console.error('Missing callSessionId or user session');
                return;
            }

            const channel = webRTCService.supabase
                .channel(`call-${callSessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'webrtc_signaling',
                        filter: `call_session_id=eq.${callSessionId}`,
                    },
                    async (payload: any) => {
                        const signal = payload.new;
                        if (signal.from_user_id === session.user.id) return;

                        try {
                            switch (signal.signal_type) {
                                case 'offer':
                                    await webRTCService.handleOffer(signal.signal_data);
                                    break;
                                case 'answer':
                                    await webRTCService.handleAnswer(signal.signal_data);
                                    break;
                                case 'ice-candidate':
                                    await webRTCService.handleICECandidate(signal.signal_data);
                                    break;
                            }
                        } catch (error) {
                            console.error('Error handling signal:', error);
                        }
                    }
                )
                .subscribe();

            signalSubscription.current = channel;
        } catch (error) {
            console.error('Error setting up signaling listener:', error);
        }
    }

    async function initializeCall() {
        try {
            if (!callSessionId || !session?.user?.id) {
                Alert.alert('Error', 'Invalid call session');
                router.back();
                return;
            }

            setCallStatus('connecting');
            await webRTCService.initializeWebRTC(isCaller, callSessionId);
            webRTCService.setOtherUserId(otherUserId || '');
            await setupSignalingListener();

            const stream = await webRTCService.getLocalStream(isVideo ? 'video' : 'audio');
            setLocalStream(stream);

            webRTCService.onConnectionStateChange((state) => {
                if (state === 'connected') {
                    setCallStatus('connected');
                    const currentRemoteStream = webRTCService.getRemoteStream();
                    if (currentRemoteStream) {
                        setRemoteStream(currentRemoteStream);
                    }
                } else if (state === 'failed' || state === 'disconnected') {
                    Alert.alert('Connection Lost', 'The call has been disconnected.');
                    endCallDirectly();
                }
            });

            if (isCaller) {
                setCallStatus('ringing');
                await new Promise(resolve => setTimeout(resolve, 500));
                await webRTCService.createOffer();
            } else {
                setCallStatus('ringing');
            }
        } catch (error) {
            console.error('Error initializing call:', error);
            Alert.alert('Error', 'Failed to initialize call');
            router.back();
        }
    }

    const cleanup = async () => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        if (remoteStreamCheckInterval.current) clearInterval(remoteStreamCheckInterval.current);
        if (signalSubscription.current) await signalSubscription.current.unsubscribe();
        await webRTCService.cleanup();
        setLocalStream(null);
        setRemoteStream(null);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const endCallDirectly = async () => {
        setCallStatus('ended');
        if (callSessionId) {
            try {
                await webRTCService.supabase
                    .from('call_sessions')
                    .update({
                        status: 'ended',
                        ended_at: new Date().toISOString(),
                        duration: callDuration
                    })
                    .eq('id', callSessionId);
            } catch (error) {
                console.error('Error updating call session:', error);
            }
        }
        await cleanup();
        router.back();
    };

    const endCall = async () => {
        Alert.alert(
            'End Call',
            'Are you sure you want to end this call?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Call', style: 'destructive', onPress: endCallDirectly },
            ]
        );
    };

    const toggleMute = () => {
        const newMutedState = webRTCService.toggleAudio();
        setIsMuted(newMutedState);
    };

    const toggleVideo = async () => {
        const newVideoState = webRTCService.toggleVideo();
        setIsVideoEnabled(newVideoState);
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // Implement actual speaker toggle with WebRTC
    };

    const switchToVideo = async () => {
        try {
            await webRTCService.switchMediaType('video');
            const stream = await webRTCService.getLocalStream('video');
            setLocalStream(stream);
            setIsVideoEnabled(true);
        } catch (error) {
            console.error('Error switching to video:', error);
            Alert.alert('Error', 'Failed to enable video');
        }
    };

    const getStatusText = () => {
        switch (callStatus) {
            case 'connecting':
                return 'Connecting...';
            case 'ringing':
                return isCaller ? 'Ringing...' : 'Incoming call...';
            case 'connected':
                return formatDuration(callDuration);
            case 'ended':
                return 'Call ended';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (callStatus) {
            case 'connected':
                return '#00D856';
            case 'ringing':
                return '#0088FF';
            default:
                return '#8E8E93';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {isVideoEnabled && (remoteStream || localStream) ? (
                // VIDEO CALL UI
                <View style={styles.videoContainer}>
                    {/* Remote Video - Full Screen */}
                    {remoteStream ? (
                        <RTCView
                            streamURL={remoteStream.toURL()}
                            style={styles.remoteVideo}
                            objectFit="cover"
                            mirror={false}
                        />
                    ) : (
                        <LinearGradient
                            colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
                            style={styles.placeholderContainer}
                        >
                            <Animated.View style={[styles.placeholderAvatar, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.placeholderInitial}>
                                    {otherUserName.charAt(0).toUpperCase()}
                                </Text>
                            </Animated.View>
                            <Text style={styles.placeholderName}>{otherUserName}</Text>
                            <Text style={styles.placeholderStatus}>{getStatusText()}</Text>
                        </LinearGradient>
                    )}

                    {/* Local Video - Picture in Picture */}
                    {localStream && (
                        <Animated.View
                            style={[
                                styles.localVideoContainer,
                                { transform: [{ translateY: slideUpAnim }] }
                            ]}
                        >
                            <RTCView
                                streamURL={localStream.toURL()}
                                style={styles.localVideo}
                                objectFit="cover"
                                mirror={true}
                            />
                            {!isVideoEnabled && (
                                <View style={styles.videoOffOverlay}>
                                    <Ionicons name="videocam-off" size={24} color="#fff" />
                                </View>
                            )}
                        </Animated.View>
                    )}

                    {/* Top Info Bar */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)', 'transparent']}
                        style={styles.topBar}
                    >
                        <SafeAreaView edges={['top']}>
                            <View style={styles.topBarContent}>
                                <View style={styles.statusContainer}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                                    <Text style={styles.statusText}>{getStatusText()}</Text>
                                </View>
                                <Text style={styles.callerName}>{otherUserName}</Text>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>
                </View>
            ) : (
                // AUDIO CALL UI
                <LinearGradient
                    colors={['#0A0A0A', '#1a1a1a', '#2d2d2d']}
                    style={styles.audioContainer}
                >
                    <SafeAreaView style={styles.audioContent} edges={['top']}>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Animated.View
                                style={[
                                    styles.audioAvatar,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}
                            >
                                <LinearGradient
                                    colors={['#0088FF', '#00D4FF']}
                                    style={styles.avatarGradient}
                                >
                                    <Text style={styles.avatarText}>
                                        {otherUserName.charAt(0).toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>

                            <Text style={styles.audioCallerName}>{otherUserName}</Text>

                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                                <Text style={styles.audioStatusText}>{getStatusText()}</Text>
                            </View>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>
            )}

            {/* Bottom Controls */}
            <LinearGradient
                colors={isVideoEnabled ? ['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)'] : ['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.controlsContainer}
            >
                <SafeAreaView edges={['bottom']}>
                    <Animated.View
                        style={[
                            styles.controls,
                            { transform: [{ translateY: slideUpAnim }] }
                        ]}
                    >
                        {/* Speaker Button */}
                        <TouchableOpacity
                            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                            onPress={toggleSpeaker}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name={isSpeakerOn ? 'volume-up' : 'volume-down'}
                                size={28}
                                color={isSpeakerOn ? '#0088FF' : '#fff'}
                            />
                            <Text style={[styles.controlLabel, isSpeakerOn && styles.controlLabelActive]}>
                                Speaker
                            </Text>
                        </TouchableOpacity>

                        {/* Video Button */}
                        {isVideo && (
                            <TouchableOpacity
                                style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
                                onPress={toggleVideo}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isVideoEnabled ? 'videocam' : 'videocam-off'}
                                    size={28}
                                    color={!isVideoEnabled ? '#fff' : '#fff'}
                                />
                                <Text style={[styles.controlLabel, !isVideoEnabled && styles.controlLabelActive]}>
                                    Video
                                </Text>
                            </TouchableOpacity>
                        )}

                        {!isVideo && callStatus === 'connected' && (
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={switchToVideo}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="videocam" size={28} color="#fff" />
                                <Text style={styles.controlLabel}>Video</Text>
                            </TouchableOpacity>
                        )}

                        {/* Mute Button */}
                        <TouchableOpacity
                            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                            onPress={toggleMute}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isMuted ? 'mic-off' : 'mic'}
                                size={28}
                                color={isMuted ? '#fff' : '#fff'}
                            />
                            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
                                {isMuted ? 'Unmute' : 'Mute'}
                            </Text>
                        </TouchableOpacity>

                        {/* End Call Button */}
                        <TouchableOpacity
                            style={styles.endCallButton}
                            onPress={endCall}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FF3B30', '#FF1744']}
                                style={styles.endCallGradient}
                            >
                                <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderAvatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#0088FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#0088FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    placeholderInitial: {
        fontSize: 56,
        fontWeight: '600',
        color: '#fff',
    },
    placeholderName: {
        fontSize: 28,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    placeholderStatus: {
        fontSize: 16,
        color: '#B8B8B8',
    },
    localVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        width: 100,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    localVideo: {
        flex: 1,
    },
    videoOffOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
    },
    topBarContent: {
        alignItems: 'center',
        paddingTop: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    callerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    audioContainer: {
        flex: 1,
    },
    audioContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 200,
    },
    audioAvatar: {
        marginBottom: 32,
    },
    avatarGradient: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0088FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 15,
    },
    avatarText: {
        fontSize: 64,
        fontWeight: '700',
        color: '#fff',
    },
    audioCallerName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        // backdropFilter: 'blur(10px)',
    },
    audioStatusText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.15)',
        // backdropFilter: 'blur(10px)',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    controlLabel: {
        color: '#fff',
        fontSize: 11,
        marginTop: 6,
        fontWeight: '600',
    },
    controlLabelActive: {
        color: '#0088FF',
    },
    endCallButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    endCallGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});