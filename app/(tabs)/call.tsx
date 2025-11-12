// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { webRTCService } from '@/services/webRTCService';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

// const CallScreen = () => {
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
//     const signalSubscription = useRef<any>(null);

//     useEffect(() => {
//         console.log('CallScreen mounted with params:', params);
//         initializeCall();
//         return () => {
//             cleanup();
//         };
//     }, []);

//     useEffect(() => {
//         let interval: ReturnType<typeof setInterval>;
//         if (callStatus === 'connected') {
//             interval = setInterval(() => {
//                 setCallDuration(prev => prev + 1);
//             }, 1000);
//         }
//         return () => clearInterval(interval);
//     }, [callStatus]);

//     async function initializeCall() {
//         try {
//             console.log('Initializing call...');
//             if (!callSessionId) {
//                 Alert.alert('Error', 'Invalid call session');
//                 router.back();
//                 return;
//             }

//             setCallStatus('ringing');

//             // Simulate call connection for testing
//             setTimeout(() => {
//                 setCallStatus('connected');
//                 console.log('Call connected');
//             }, 2000);

//             // TODO: Uncomment when WebRTC is available
//             /////////////////////////
//             await setupSignalingListener();
//             await webRTCService.initializeWebRTC(isCaller, callSessionId);
//             webRTCService.setOtherUserId(otherUserId || '');
//             const stream = await webRTCService.getLocalStream(isVideo ? 'video' : 'audio');
//             setLocalStream(stream);

//             if (webRTCService.pc) {
//               webRTCService.pc.addEventListener('track', (event: any) => {
//                 console.log('Remote stream received');
//                 setRemoteStream(event.streams[0]);
//                 setCallStatus('connected');
//               });
//             }

//             if (isCaller) {
//               setCallStatus('ringing');
//               await new Promise(resolve => setTimeout(resolve, 100));
//               await webRTCService.createOffer();
//             } else {
//               setCallStatus('ringing');
//             }
//             ////////////////
//         } catch (error) {
//             console.error('Error initializing call:', error);
//             Alert.alert('Error', 'Failed to initialize call');
//             router.back();
//         }
//     }

//     const cleanup = async () => {
//         console.log('Cleaning up call...');
//         if (signalSubscription.current) {
//             await signalSubscription.current.unsubscribe();
//         }
//         // await webRTCService.cleanup();
//         setLocalStream(null);
//         setRemoteStream(null);
//     };

//     const formatDuration = (seconds: number) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
//                     onPress: async () => {
//                         setCallStatus('ended');

//                         // TODO: Update call session in database

//                         if (callSessionId) {
//                           await webRTCService.supabase
//                             .from('call_sessions')
//                             .update({
//                               status: 'ended',
//                               ended_at: new Date().toISOString(),
//                               duration: callDuration
//                             })
//                             .eq('id', callSessionId);
//                         }


//                         await cleanup();
//                         router.back();
//                     }
//                 },
//             ]
//         );
//     };

//     const toggleMute = () => {
//         const newMutedState = webRTCService.toggleAudio();
//         setIsMuted(!isMuted);
//         console.log('Mute toggled:', !isMuted);
//     };

//     const toggleVideo = async () => {
//         const newVideoState = webRTCService.toggleVideo();
//         setIsVideoEnabled(!isVideoEnabled);
//         console.log('Video toggled:', !isVideoEnabled);
//     };

//     const switchToVideo = async () => {
//         try {
//             setIsVideoEnabled(true);
//             console.log('Switching to video...');
//             await webRTCService.switchMediaType('video');
//             const stream = await webRTCService.getLocalStream('video');
//             setLocalStream(stream);
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
//             {isVideoEnabled && remoteStream ? (
//                 <View style={styles.videoContainer}>
//                     <View style={[styles.mainVideoView, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
//                         <Text style={{ color: '#fff', fontSize: 18 }}>Remote Video (WebRTC Required)</Text>
//                     </View>

//                     {localStream && (
//                         <View style={[styles.selfVideoView, { justifyContent: 'center', alignItems: 'center' }]}>
//                             <Text style={{ color: '#fff', fontSize: 12 }}>Local Video</Text>
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
// };

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
//     selfVideoView: {
//         position: 'absolute',
//         top: 60,
//         right: 20,
//         width: 120,
//         height: 160,
//         backgroundColor: '#333',
//         borderRadius: 12,
//         overflow: 'hidden',
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

// export default CallScreen;

import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { webRTCService } from '@/services/webRTCService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import RTCView for rendering video streams
// import { RTCView } from 'react-native-webrtc';

const CallScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{
        isVideo?: string;
        callSessionId?: string;
        isCaller?: string;
        otherUserId?: string;
        otherUserName?: string;
    }>();
    console.log(params, "params")

    const isVideo = params.isVideo === 'true';
    const callSessionId = params.callSessionId;
    const isCaller = params.isCaller === 'true';
    const otherUserId = params.otherUserId;
    const otherUserName = params.otherUserName || 'User';

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
    const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { session } = useCheckAuth();
    const signalSubscription = useRef<RealtimeChannel | null>(null);
    const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        console.log('CallScreen mounted with params:', params);
        initializeCall();

        return () => {
            cleanup();
        };
    }, []);

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

    async function setupSignalingListener() {
        try {
            if (!callSessionId || !session?.user?.id) {
                console.error('Missing callSessionId or user session');
                return;
            }

            console.log('Setting up signaling listener for session:', callSessionId);

            // Subscribe to webrtc_signaling changes for this call session
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
                        console.log('Received signal:', payload.new);
                        const signal = payload.new;

                        // Ignore signals sent by this user
                        if (signal.from_user_id === session.user.id) {
                            console.log('Ignoring own signal');
                            return;
                        }

                        // Handle different signal types
                        try {
                            switch (signal.signal_type) {
                                case 'offer':
                                    console.log('Handling offer...');
                                    await webRTCService.handleOffer(signal.signal_data);
                                    break;
                                case 'answer':
                                    console.log('Handling answer...');
                                    await webRTCService.handleAnswer(signal.signal_data);
                                    break;
                                case 'ice-candidate':
                                    console.log('Handling ICE candidate...');
                                    await webRTCService.handleICECandidate(signal.signal_data);
                                    break;
                                default:
                                    console.log('Unknown signal type:', signal.signal_type);
                            }
                        } catch (error) {
                            console.error('Error handling signal:', error);
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Signaling channel status:', status);
                });

            signalSubscription.current = channel;
        } catch (error) {
            console.error('Error setting up signaling listener:', error);
        }
    }

    async function initializeCall() {
        try {
            console.log('Initializing call...');
            if (!callSessionId) {
                Alert.alert('Error', 'Invalid call session');
                router.back();
                return;
            }

            if (!session?.user?.id) {
                Alert.alert('Error', 'User not authenticated');
                router.back();
                return;
            }

            setCallStatus('connecting');

            // Initialize WebRTC
            await webRTCService.initializeWebRTC(isCaller, callSessionId);
            webRTCService.setOtherUserId(otherUserId || '');

            // Set up signaling listener BEFORE getting media stream
            await setupSignalingListener();

            // Get local media stream
            console.log('Getting local stream...');
            const stream = await webRTCService.getLocalStream(isVideo ? 'video' : 'audio');
            setLocalStream(stream);
            console.log('Local stream obtained:', stream.id);

            // Set up remote stream handler
            if (webRTCService.pc) {
                webRTCService.pc.addEventListener('track', (event: RTCTrackEvent) => {
                    console.log('Remote track received:', event.track.kind);
                    if (event.streams && event.streams[0]) {
                        console.log('Setting remote stream:', event.streams[0].id);
                        setRemoteStream(event.streams[0]);
                        setCallStatus('connected');
                    }
                });

                // Monitor connection state
                webRTCService.onConnectionStateChange((state) => {
                    console.log('Connection state changed:', state);
                    if (state === 'connected') {
                        setCallStatus('connected');
                    } else if (state === 'failed' || state === 'disconnected') {
                        Alert.alert('Connection Lost', 'The call has been disconnected.');
                        endCallDirectly();
                    }
                });
            }

            if (isCaller) {
                console.log('Creating offer as caller...');
                setCallStatus('ringing');
                // Small delay to ensure everything is set up
                await new Promise(resolve => setTimeout(resolve, 500));
                await webRTCService.createOffer();
            } else {
                console.log('Waiting for offer as callee...');
                setCallStatus('ringing');
            }
        } catch (error) {
            console.error('Error initializing call:', error);
            Alert.alert('Error', `Failed to initialize call: ${error instanceof Error ? error.message : 'Unknown error'}`);
            router.back();
        }
    }

    const cleanup = async () => {
        console.log('Cleaning up call...');

        // Clear timer
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }

        // Unsubscribe from signaling
        if (signalSubscription.current) {
            await signalSubscription.current.unsubscribe();
            signalSubscription.current = null;
        }

        // Clean up WebRTC
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
                {
                    text: 'End Call',
                    style: 'destructive',
                    onPress: endCallDirectly
                },
            ]
        );
    };

    const toggleMute = () => {
        const newMutedState = webRTCService.toggleAudio();
        setIsMuted(newMutedState);
        console.log('Mute toggled:', newMutedState);
    };

    const toggleVideo = async () => {
        const newVideoState = webRTCService.toggleVideo();
        setIsVideoEnabled(newVideoState);
        console.log('Video toggled:', newVideoState);
    };

    const switchToVideo = async () => {
        try {
            console.log('Switching to video...');
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
                return 'Connected';
            case 'ended':
                return 'Call ended';
            default:
                return '';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            {isVideoEnabled && (remoteStream || localStream) ? (
                <View style={styles.videoContainer}>
                    {/* Remote Video View - Full Screen */}
                    {remoteStream ? (
                        // <RTCView
                        //     streamURL={(remoteStream as any).toURL()}
                        //     style={styles.mainVideoView}
                        //     objectFit="cover"
                        //     mirror={false}
                        // />
                        <Text>Remote video</Text>
                    ) : (
                        <View style={[styles.mainVideoView, styles.placeholderView]}>
                            <Ionicons name="person" size={80} color="#666" />
                            <Text style={styles.placeholderText}>Waiting for {otherUserName}...</Text>
                        </View>
                    )}

                    {/* Local Video View - Small Picture-in-Picture */}
                    {localStream && (
                        <View style={styles.selfVideoView}>
                            <Text>Local video</Text>
                            {/* <RTCView
                                streamURL={(localStream as any).toURL()}
                                style={styles.selfVideo}
                                objectFit="cover"
                                mirror={true}
                                zOrder={1}
                            /> */}
                        </View>
                    )}

                    {/* Call Duration Overlay for Video Calls */}
                    {callStatus === 'connected' && (
                        <View style={styles.videoDurationOverlay}>
                            <Text style={styles.videoDuration}>{formatDuration(callDuration)}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.audioCallContainer}>
                    <View style={styles.callAvatar}>
                        <Ionicons name="person" size={60} color="#fff" />
                    </View>
                    <Text style={styles.callName}>{otherUserName}</Text>
                    <Text style={styles.callStatus}>{getStatusText()}</Text>
                    {callStatus === 'connected' && (
                        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
                    )}
                    <Text style={styles.debugText}>
                        Video: {isVideo ? 'Yes' : 'No'} | Caller: {isCaller ? 'Yes' : 'No'}
                    </Text>
                </View>
            )}

            {/* Call Controls */}
            <View style={styles.callControls}>
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.activeControl]}
                    onPress={toggleMute}
                >
                    <Ionicons
                        name={isMuted ? 'mic-off' : 'mic'}
                        size={24}
                        color={isMuted ? '#fff' : '#666'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
                    onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                    <MaterialIcons
                        name={isSpeakerOn ? 'volume-up' : 'volume-down'}
                        size={24}
                        color={isSpeakerOn ? '#fff' : '#666'}
                    />
                </TouchableOpacity>

                {!isVideo && callStatus === 'connected' && (
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={switchToVideo}
                    >
                        <Ionicons name="videocam" size={24} color="#666" />
                    </TouchableOpacity>
                )}

                {isVideo && (
                    <TouchableOpacity
                        style={[styles.controlButton, !isVideoEnabled && styles.activeControl]}
                        onPress={toggleVideo}
                    >
                        <Ionicons
                            name={isVideoEnabled ? 'videocam' : 'videocam-off'}
                            size={24}
                            color={isVideoEnabled ? '#666' : '#fff'}
                        />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                    <Ionicons name="call" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    audioCallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callAvatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 24,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    callStatus: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 16,
    },
    callDuration: {
        fontSize: 18,
        color: '#ccc',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#999',
        marginTop: 16,
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainVideoView: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholderView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
        marginTop: 16,
    },
    selfVideoView: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 120,
        height: 160,
        backgroundColor: '#333',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selfVideo: {
        width: '100%',
        height: '100%',
    },
    videoDurationOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    videoDuration: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    callControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeControl: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    endCallButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f44336',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
    },
});

export default CallScreen;