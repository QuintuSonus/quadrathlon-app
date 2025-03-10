import React, { createContext, useContext, useReducer, useEffect } from 'react';
import stateReducer from './StateReducer';
import StorageService from '../services/StorageService';

// Initial state structure
const initialState = {
  // Session configuration and state
  session: {
    players: ["David", "Manu", "Antoine", "Quentin"],
    plannedGames: 4,  // Default to 4 games
    currentGameIndex: 0,
    isComplete: false
  },
  
  // Array of all games in the session
  games: [],
  
  // Individual player scores (hidden until reveal)
  playerScores: {
    "David": 0,
    "Manu": 0,
    "Antoine": 0,
    "Quentin": 0
  },
  
  // UI state
  ui: {
    currentScreen: 'setup', // 'setup', 'game', 'scoring', 'results'
    activeScoreTools: [],
    animationSettings: {
      intensity: 'medium' // 'low', 'medium', 'high'
    },
    soundSettings: {
      volume: 0.7,
      isMuted: false
    }
  }
};

// Create context
const StateContext = createContext();

// State provider component
export const StateProvider = ({ children }) => {
  // Try to load saved state from storage
  const loadedState = StorageService.loadSession();
  
  // Use loaded state or initial state
  const [state, dispatch] = useReducer(stateReducer, loadedState || initialState);
  
  // Save state to storage whenever it changes
  useEffect(() => {
    StorageService.saveSession(state);
  }, [state]);
  
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Custom hook to use the state context
export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};

export default StateContext;
