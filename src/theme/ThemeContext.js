import { createContext, useContext, useEffect, useState } from "react";


const ThemeContext = createContext();


export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "base");

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("fontSize", fontSize);
        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        document.documentElement.classList.add(
            fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"
        );
    }, [fontSize]);

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    const changeFontSize = (size) => setFontSize(size);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, changeFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}