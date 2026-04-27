import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const lightTheme = {
    background: '#ffffff',
    cardBackground: '#f8f9fa',
    text: '#2d3436',
    secondaryText: '#636e72',
    accent: '#8da696',
    border: '#dfe6e9',
    icon: '#2d3436',
    authBackground: '#f1f2f6'
};

export const darkTheme = {
    background: '#121212',
    cardBackground: '#1e1e1e',
    text: '#ffffff',
    secondaryText: '#b2bec3',
    accent: '#8da696',
    border: '#2d3436',
    icon: '#ffffff',
    authBackground: '#0a0a0a'
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true); // Default dark

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem('@dark_mode');
            if (saved !== null) {
                setIsDark(JSON.parse(saved));
            }
        } catch (e) { }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        try {
            await AsyncStorage.setItem('@dark_mode', JSON.stringify(newTheme));
        } catch (e) { }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
