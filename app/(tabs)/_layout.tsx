import { HapticTab } from '@/components/HapticTab';
import { IncomingCallModalFixed } from '@/components/IncomingCallModal';
import { Colors } from '@/constants/Colors';
import { useCheckAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useIncomingCallListener } from '@/hooks/useIncomeCallerListener';
import { useTotalUnreadCount } from '@/hooks/useMsg';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { session } = useCheckAuth();


  const { totalUnreadCount } = useTotalUnreadCount({
    table: 'messages',
    senderId: session?.user?.id ?? '',
    enabled: !!session?.user?.id,
  })

  const {
    incomingCall,
    isCallModalVisible,
    handleAnswerCall,
    handleRejectCall,
  } = useIncomingCallListener();


  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          lazy: true,
          tabBarActiveTintColor: colors.text,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
            position: 'relative',
            // paddingVertical: Platform.OS === 'ios' ? 0 : 8,
            // Fix: Use insets.bottom for iOS, but don't add extra padding on Android
            paddingBottom: Platform.OS === 'ios' ? 0 : 8,
            // Alternative: Use insets.bottom only if it's significant
            // paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            height: Platform.OS === 'android'
              ? 60 + insets.bottom // Fixed height for Android
              : 40 + insets.bottom, // Dynamic height for iOS with notch
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}>
        <Tabs.Screen
          name="session"
          options={{
            title: 'Session',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
              />
            ),

            tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,

          }}

        />
        <Tabs.Screen
          name="appointment"
          options={{
            title: 'Appointment',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? "calendar" : "calendar-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? "people" : "people-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? "grid" : "grid-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="call"
          options={{
            headerShown: false,
            title: 'CallScreen',
            href: null
          }}
        />
      </Tabs>

      {/* Global Incoming Call Modal */}
      <IncomingCallModalFixed
        visible={isCallModalVisible}
        callerName={incomingCall?.caller_name || 'Unknown Caller'}
        callType={incomingCall?.call_type || 'audio'}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
      />
    </>
  );
}