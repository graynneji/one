const audioSource = require('@/assets/sounds/740421__anthonyrox__message-notification-2.wav');
import SkeletonLoader from '@/components/SkeletonLoader';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
// import { notificationService } from '@/services/notificationService';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NavigationProp } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { SplashScreen, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,

  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";



// useEffect(() => {
//   // Subscribe to network state changes
//   const unsubscribe = NetInfo.addEventListener(state => {
//     if (!state.isConnected) {
//       Toast.show({
//         type: 'warning',
//         text1: 'No Internet Connection',
//         text2: 'Please check your network settings',
//         autoHide: false,
//       });
//     } else {
//       // Optionally hide the toast when connection is restored
//       Toast.hide();
//     }
//   });

//   // Cleanup subscription on unmount
//   return () => {
//     unsubscribe();
//   };
// }, []);

// SplashScreen.preventAutoHideAsync();
const WelcomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const router = useRouter()
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tapCount, setTapCount] = useState(0);

  const player = useAudioPlayer(audioSource);

  const handleSecretTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setTimeout(() => {
          router.replace("/auth/therapist-signin");
        }, 50);
      }
      return newCount;
    });
  };

  const { session, loading } = useCheckAuth()
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      // Add a small delay for Android to ensure storage is ready
      // if (Platform.OS === 'android') {
      //   await new Promise(resolve => setTimeout(resolve, 100));
      // }

      if (session?.user) {
        if (session.user.user_metadata?.designation === "therapist") {
          router.replace('/(tabs)/session');
        } else if (session.user.user_metadata?.designation === "patient") {
          router.replace('/(tabs)/session/chat');
        }
      } else {
        // Only hide splash after we confirm no session
        SplashScreen.hideAsync();
      }
    };

    checkAuth();
  }, [loading, session]);


  // useEffect(() => {
  //   // Initialize notifications when app starts
  //   const initNotifications = async () => {
  //     await notificationService.initialize();
  //     const token = notificationService.getPushToken();

  //     // Save token to your backend/database
  //     if (token) {
  //       // await savePushTokenToDatabase(token);
  //       console.log('Push token:', token);
  //     }
  //   };

  //   initNotifications();
  // }, []);

  const handleGetStarted = () => router.replace('/auth/get-started');
  const handleSignIn = () => router.replace('/auth/signin');
  if (loading) return <SkeletonLoader variant={session?.user?.user_metadata?.designation === "therapist" ? "contacts" : "chats"} />;



  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/therapy.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Dark overlay */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>

            {/* Content */}
            <View style={styles.content}>
              {/* Main heading */}
              <Text style={styles.heading}>
                Welcome to TherapyPlus!
              </Text>

              {/* Description */}
              <Text style={styles.description}>
                A Therapy+ for you to better your mental health,
                we&apos;re committed to helping you connect, thrive, and
                make a difference.
              </Text>

              {/* Privacy notice */}
              <Text style={styles.privacyText}>
                I agree that therapy+ may use my responses to personalize
                my experience and other purposes as described in the Privacy
                Policy.
              </Text>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {/* Get Started Button */}
                <TouchableOpacity
                  onPress={handleGetStarted}
                  style={styles.getStartedButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.getStartedButtonText}>
                    Get started
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSignIn}
                  style={styles.signInButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInButtonText}>
                    Sign in
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.6} onPress={handleSecretTap}>
                  <Text style={styles.provider}>I am a therapyPlus provider</Text>
                </TouchableOpacity>
                {/* {tapCount > 0 && tapCount < 5 && (
                  <Text style={styles.hintText}>
                    {5 - tapCount} more taps to unlock provider access
                  </Text>
                )} */}
              </View>

              {/* Bottom indicator */}
              {/* <View style={styles.indicatorContainer}>
                <View style={styles.indicator} />
              </View> */}
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heading: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 42,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 48,
  },
  privacyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: '#1D9BF0', // green-600
    paddingVertical: 16,
    borderRadius: 25,
  },
  getStartedButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 25,
  },
  signInButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  provider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)', // subtle fade
    textAlign: 'center',
    marginTop: 6,
  },
  hintText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center'
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  indicator: {
    width: 32,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default WelcomeScreen;

// const audioSource = require('@/assets/sounds/740421__anthonyrox__message-notification-2.wav');
// import SkeletonLoader from '@/components/SkeletonLoader';
// import { Colors } from '@/constants/Colors';
// import { useCheckAuth } from '@/context/AuthContext';
// import { useGetById } from '@/hooks/useCrud';
// import { notificationService } from '@/services/notificationService';
// import { NavigationProp } from '@react-navigation/native';
// import { useAudioPlayer } from 'expo-audio';
// import { SplashScreen, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import React, { useEffect, useState } from 'react';
// import {
//   ImageBackground,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   View
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";

// SplashScreen.preventAutoHideAsync();

// const WelcomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const [tapCount, setTapCount] = useState(0);
//   const player = useAudioPlayer(audioSource);

//   const handleSecretTap = () => {
//     setTapCount((prev) => {
//       const newCount = prev + 1;
//       if (newCount >= 5) {
//         setTimeout(() => {
//           router.replace("/auth/therapist-signin");
//         }, 50);
//       }
//       return newCount;
//     });
//   };

//   const { session, loading } = useCheckAuth();
//   const isTherapist = session?.user?.user_metadata?.designation === "therapist";

//   // Only fetch therapist data for patients
//   const { data: userData, isLoading: userDataLoading } = useGetById(
//     "user",
//     { user_id: session?.user?.id },
//     "therapist(therapist_id, name, profile_picture)",
//     !!session?.user?.id && !isTherapist, // Only fetch for patients
//     {},
//     1000 * 60 * 60 * 24,
//     1000 * 60 * 60 * 24,
//     false,
//     false,
//     false
//   );

//   useEffect(() => {
//     // Wait for all loading to complete
//     if (loading || (session?.user && !isTherapist && userDataLoading)) {
//       return;
//     }

//     const navigateUser = async () => {
//       if (!session?.user) {
//         await SplashScreen.hideAsync();
//         return;
//       }

//       // Add small delay for iOS navigation stack
//       await new Promise(resolve =>
//         setTimeout(resolve, Platform.OS === 'ios' ? 150 : 50)
//       );

//       if (isTherapist) {
//         // Therapist: go to session list
//         router.replace('/(tabs)/session');
//       } else {
//         // Patient: navigate to chat with therapist
//         const therapist = userData?.result?.[0]?.therapist;

//         if (therapist?.therapist_id) {
//           router.replace({
//             pathname: '/(tabs)/session/chat',
//             params: {
//               id: therapist.therapist_id,
//               patientId: '', // Empty for patients
//               patientName: therapist.name || 'Therapist',
//               profile_picture: therapist.profile_picture || ''
//             }
//           });
//         } else {
//           // No therapist assigned yet, go to session screen
//           router.replace('/(tabs)/session');
//         }
//       }

//       await SplashScreen.hideAsync();
//     };

//     navigateUser();
//   }, [loading, session, isTherapist, userDataLoading, userData]);


//   //might change or add to the old index.tsx
//   useEffect(() => {
//     // Initialize notifications when app starts
//     const initNotifications = async () => {
//       await notificationService.initialize();
//       const token = notificationService.getPushToken();

//       // Save token to your backend/database
//       if (token) {
//         // await savePushTokenToDatabase(token);
//         console.log('Push token:', token);
//       }
//     };

//     initNotifications();
//   }, []);

//   const handleGetStarted = () => router.replace('/auth/get-started');
//   const handleSignIn = () => router.replace('/auth/signin');

//   if (loading || (session?.user && !isTherapist && userDataLoading)) {
//     return <SkeletonLoader />;
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

//       {/* Background Image */}
//       <ImageBackground
//         source={require('../assets/images/therapy.png')}
//         style={styles.container}
//         resizeMode="cover"
//       >
//         {/* Dark overlay */}
//         <View style={styles.overlay}>
//           <SafeAreaView style={styles.safeArea}>
//             {/* Content */}
//             <View style={styles.content}>
//               {/* Main heading */}
//               <Text style={styles.heading}>
//                 Welcome to TherapyPlus!
//               </Text>

//               {/* Description */}
//               <Text style={styles.description}>
//                 A Therapy+ for you to better your mental health,
//                 we&apos;re committed to helping you connect, thrive, and
//                 make a difference.
//               </Text>

//               {/* Privacy notice */}
//               <Text style={styles.privacyText}>
//                 I agree that therapy+ may use my responses to personalize
//                 my experience and other purposes as described in the Privacy
//                 Policy.
//               </Text>

//               {/* Buttons */}
//               <View style={styles.buttonContainer}>
//                 {/* Get Started Button */}
//                 <TouchableOpacity
//                   onPress={handleGetStarted}
//                   style={styles.getStartedButton}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.getStartedButtonText}>
//                     Get started
//                   </Text>
//                 </TouchableOpacity>

//                 {/* Sign In Button */}
//                 <TouchableOpacity
//                   onPress={handleSignIn}
//                   style={styles.signInButton}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.signInButtonText}>
//                     Sign in
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity activeOpacity={0.6} onPress={handleSecretTap}>
//                   <Text style={styles.provider}>I am a therapyPlus provider</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </SafeAreaView>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     minHeight: '100%',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     paddingHorizontal: 24,
//     paddingBottom: 32,
//   },
//   heading: {
//     color: 'white',
//     fontSize: 36,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     lineHeight: 42,
//   },
//   description: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 48,
//   },
//   privacyText: {
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontSize: 12,
//     lineHeight: 18,
//     marginBottom: 32,
//   },
//   buttonContainer: {
//     gap: 12,
//   },
//   getStartedButton: {
//     backgroundColor: '#1D9BF0',
//     paddingVertical: 16,
//     borderRadius: 25,
//   },
//   getStartedButtonText: {
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   signInButton: {
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     paddingVertical: 16,
//     borderRadius: 25,
//   },
//   signInButtonText: {
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: '500',
//   },
//   provider: {
//     fontSize: 12,
//     color: 'rgba(255, 255, 255, 0.5)',
//     textAlign: 'center',
//     marginTop: 6,
//   },
// });

// export default WelcomeScreen;