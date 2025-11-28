import ErrorBoundary from '@/components/ErrorBoundary';
import { Colors } from '@/constants/Colors';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider } from '@/context/AuthContext';
import { DarkLightModeContextProvider } from '@/context/DarkLightModeContext';
import { PatientIdProvider } from '@/context/patientIdContext';
import { PatientInfoProvider } from '@/context/patientInfoContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/utils/queryClient';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

// Custom Light Theme with Font Families
const CustomLightTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.primary,
  },
  fonts: {
    regular: {
      fontFamily: 'InterRegular',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'InterMedium',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'PoppinsSemiBold',
      fontWeight: '600'
    },
    heavy: {
      fontFamily: 'PoppinsBold',
      fontWeight: '700'
    }
  }
};

// Custom Dark Theme with Font Families
const CustomDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.primary,
  },
  fonts: {
    regular: {
      fontFamily: 'InterRegular',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'InterMedium',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'PoppinsSemiBold',
      fontWeight: '600'
    },
    heavy: {
      fontFamily: 'PoppinsBold',
      fontWeight: '700'
    }
  }
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    // Inter for body text (clean, readable, professional)
    'Inter-Regular': require('../assets/fonts/Inter/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter/Inter-SemiBold.ttf'),

    // Poppins for headers (warm, friendly, approachable)
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),

    // Dancing Script for logo (elegant, calming)
    'DancingScript-Regular': require('../assets/fonts/DancingScript/DancingScript-Regular.ttf'),
    'DancingScript-Medium': require('../assets/fonts/DancingScript/DancingScript-Medium.ttf'),
    'DancingScript-SemiBold': require('../assets/fonts/DancingScript/DancingScript-SemiBold.ttf'),
    'DancingScript-Bold': require('../assets/fonts/DancingScript/DancingScript-Bold.ttf'),

    // Keep SpaceMono if needed
    SpaceMono: require('../assets/fonts/SpaceMono/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);


  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // <DarkLightModeContextProvider>
    <AuthProvider>
      <AudioProvider>
        <PatientIdProvider>
          <PatientInfoProvider>
            <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
              <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                  <Stack screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationTypeForReplace: 'push',
                  }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </ErrorBoundary>
              </QueryClientProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Toast />
            </ThemeProvider>
          </PatientInfoProvider>
        </PatientIdProvider>
      </AudioProvider>
    </AuthProvider>
    // </DarkLightModeContextProvider>
  );
}


export default function RootLayout() {

  return (
    <DarkLightModeContextProvider>
      <RootLayoutInner />
    </DarkLightModeContextProvider>
  )
}