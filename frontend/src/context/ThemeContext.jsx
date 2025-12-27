import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const themes = {
    default: {
        name: 'Zomato Red',
        colors: {
            primary: '#ef4f5f',
            primaryHover: '#d03f4f',
            primaryLight: '#fff0f1',
            textOnPrimary: '#ffffff'
        }
    },
    ocean: {
        name: 'Ocean Blue',
        colors: {
            primary: '#0077b6',
            primaryHover: '#023e8a',
            primaryLight: '#caf0f8',
            textOnPrimary: '#ffffff'
        }
    },
    forest: {
        name: 'Forest Green',
        colors: {
            primary: '#2a9d8f',
            primaryHover: '#21867a',
            primaryLight: '#e9f5f4',
            textOnPrimary: '#ffffff'
        }
    },
    royal: {
        name: 'Royal Purple',
        colors: {
            primary: '#7209b7',
            primaryHover: '#560bad',
            primaryLight: '#f3e5f5',
            textOnPrimary: '#ffffff'
        }
    },
    amber: {
        name: 'Amber Gold',
        colors: {
            primary: '#f59e0b',
            primaryHover: '#d97706',
            primaryLight: '#fffbeb',
            textOnPrimary: '#ffffff'
        }
    }
};

export const ThemeProvider = ({ children }) => {
    // Load saved theme or default
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'default';
    });

    useEffect(() => {
        const theme = themes[currentTheme] || themes.default;

        // Apply CSS variables to root
        document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
        document.documentElement.style.setProperty('--primary-hover', theme.colors.primaryHover);
        document.documentElement.style.setProperty('--primary-light', theme.colors.primaryLight);
        document.documentElement.style.setProperty('--text-on-primary', theme.colors.textOnPrimary);

        // Persist selection
        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    const changeTheme = (themeKey) => {
        if (themes[themeKey]) {
            setCurrentTheme(themeKey);
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
