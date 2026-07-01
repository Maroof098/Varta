import {
    createContext,
    useEffect,
    useState,
} from "react";

export const ThemeContext =
    createContext();

export function ThemeProvider({
    children,
}) {
    const [darkMode, setDarkMode] =
        useState(() => {
            const saved =
                localStorage.getItem(
                    "theme"
                );
            return saved
                ? JSON.parse(saved)
                : true;
        });

    useEffect(() => {
        localStorage.setItem(
            "theme",
            JSON.stringify(darkMode)
        );
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider
            value={{
                darkMode,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}