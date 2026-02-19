import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: true,
  activeGroup: null,
  notifications: [],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { ...state, theme: newTheme };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_GROUP':
      return { ...state, activeGroup: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setActiveGroup = useCallback((group) => dispatch({ type: 'SET_ACTIVE_GROUP', payload: group }), []);

  return (
    <AppContext.Provider value={{ ...state, toggleTheme, toggleSidebar, setActiveGroup }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
