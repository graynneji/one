// context/DarkLightModeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    colorScheme: ColorScheme;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const DarkLightModeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export function DarkLightModeContextProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    // Load saved theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Determine actual color scheme based on theme mode
    const colorScheme: ColorScheme =
        themeMode === 'system'
            ? systemColorScheme ?? 'light'
            : themeMode;

    const isDark = colorScheme === 'dark';

    return (
        <DarkLightModeContext.Provider value={{ themeMode, colorScheme, setThemeMode, isDark }}>
            {children}
        </DarkLightModeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(DarkLightModeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a DarkLightModeContextProvider');
    }
    return context;
}

// Updated useColorScheme hook that uses DarkLightModeContext
export function useColorScheme() {
    const { colorScheme } = useTheme();
    return colorScheme;
}