import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';

const messageSound = require('@/assets/sounds/740421__anthonyrox__message-notification-2.wav');

interface AudioContextType {
    playMessageSound: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
    const playerRef = useRef<AudioPlayer | null>(null);

    useEffect(() => {
        // Create player once when component mounts
        playerRef.current = createAudioPlayer(messageSound);

        // Cleanup when component unmounts
        return () => {
            if (playerRef.current) {
                playerRef.current.release();
                playerRef.current = null;
            }
        };
    }, []);

    const playMessageSound = async () => {
        try {
            if (playerRef.current) {
                // Reset to beginning if already playing
                await playerRef.current.seekTo(0);
                await playerRef.current.play();
            }
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    };

    return (
        <AudioContext.Provider value={{ playMessageSound }}>
            {children}
        </AudioContext.Provider>
    );
}
export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
}