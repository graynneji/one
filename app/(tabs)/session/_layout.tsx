import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationTypeForReplace: 'push',
                animationDuration: 1000,
            }}
        >
            <Stack.Screen name="index" options={{
                animation: 'slide_from_right',
                animationDuration: 1000
            }} />
            <Stack.Screen
                name="chat"
                options={{
                    headerShown: false,
                    title: 'Chat',
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 1000
                }}
            />
            <Stack.Screen
                name="patients-info"
                options={{
                    headerShown: false,
                    title: 'Info',
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 1000
                }}
            />
            <Stack.Screen
                name="patients-notes"
                options={{
                    headerShown: false,
                    title: 'Notes',
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 1000
                }}
            />
        </Stack>
    );
}