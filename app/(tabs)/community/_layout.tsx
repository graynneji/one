import { Stack } from 'expo-router';
import React from 'react';

export default function CommunityLayout() {
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
                name="discussion-view"
                options={{
                    headerShown: false,
                    title: 'Discussion',
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 1000
                }}
            />
        </Stack>
    );
}