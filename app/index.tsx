const audioSource = require('@/assets/sounds/message.wav');
import SkeletonLoader from '@/components/SkeletonLoader';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { notificationService } from '@/services/notificationService';
import NetInfo from '@react-native-community/netinfo';
import { NavigationProp } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { SplashScreen, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

async function requestPermissions() {
  if (Platform.OS === 'android') {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    } catch (err) {
      console.warn('Permission request failed:', err);
    }
  }
}

const WelcomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tapCount, setTapCount] = useState(0);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Call all hooks at top level - BEFORE any conditional returns
  const player = useAudioPlayer(audioSource);
  const { session, loading } = useCheckAuth();

  // Network state listener - INSIDE component
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      if (!state.isConnected) {
        Toast.show({
          type: 'warning',
          text1: 'No Internet Connection',
          text2: 'Please check your network settings',
          autoHide: false,
        });
      } else {
        Toast.hide();
      }
    });

    // Check initial connection state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Handle auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (session?.user) {
        if (session.user.user_metadata?.designation === "therapist") {
          router.replace('/(tabs)/session');
        } else if (session.user.user_metadata?.designation === "patient") {
          router.replace('/(tabs)/session/chat');
        }
      } else {
        SplashScreen.hideAsync().catch(err => console.warn('SplashScreen error:', err));
      }
    };

    checkAuth();
  }, [loading, session]);

  // Initialize notifications
  useEffect(() => {
    if (session?.user?.id) {
      try {
        notificationService.initialize(session?.user?.id);
      } catch (err) {
        console.warn('Notification initialization failed:', err);
      }
    }
  }, [session?.user?.id]);

  const handleSecretTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 0) {
        setTimeout(() => {
          router.replace("/auth/therapist-signin");
        }, 50);
      }
      return newCount;
    });
  };

  const handleGetStarted = () => router.replace('/auth/get-started');
  const handleSignIn = () => router.replace('/auth/signin');

  // Now conditional returns are AFTER all hooks
  if (loading) {
    return <SkeletonLoader variant={session?.user?.user_metadata?.designation === "therapist" ? "contacts" : "chats"} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ImageBackground
        source={require('../assets/images/therapy.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <Text style={styles.heading}>
                Welcome to TherapyPlus!
              </Text>

              <Text style={styles.description}>
                A Therapyplus for you to better your mental health,
                we&apos;re committed to helping you connect, thrive, and
                make a difference.
              </Text>

              <Text style={styles.privacyText}>
                I agree that therapy+ may use my responses to personalize
                my experience and other purposes as described in the Privacy
                Policy.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleGetStarted}
                  style={styles.getStartedButton}
                  activeOpacity={0.8}
                  disabled={!isConnected}
                >
                  <Text style={styles.getStartedButtonText}>
                    Get started
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSignIn}
                  style={styles.signInButton}
                  activeOpacity={0.8}
                  disabled={!isConnected}
                >
                  <Text style={styles.signInButtonText}>
                    Sign in
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.6} onPress={handleSecretTap}>
                  <Text style={styles.provider}>I am a Therapyplus provider</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#1D9BF0',
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
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default WelcomeScreen;