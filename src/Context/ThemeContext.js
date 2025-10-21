import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(true);

  const theme = darkTheme
    ? {
        mode: 'dark',
        background: '#000',
        accent: '#FFA500',
        text: '#FFF',
      }
    : {
        mode: 'light',
        background: '#FFF',
        accent: '#001F54',
        text: '#FF0000',
      };

  const toggleTheme = () => setDarkTheme(!darkTheme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeColors = () => useContext(ThemeContext);
