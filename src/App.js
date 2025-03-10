import React, { useEffect } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import SetupScreen from './components/setup/SetupScreen';
import GameScreen from './components/game/GameScreen';
import ScoringScreen from './components/scoring/ScoringScreen';
import SessionCompleteScreen from './components/results/SessionCompleteScreen';
import FinalStandingsReveal from './components/results/FinalStandingsReveal';
import NavigationBar from './components/core/NavigationBar';
import audioService from './services/AudioService';
import './styles/index.css';

// Main app content component
const AppContent = () => {
  const { state } = useAppState();
  
  // Preload audio when the app first loads
  useEffect(() => {
    audioService.preloadSounds();
  }, []);
  
  // Render different screens based on the current UI state
  const renderCurrentScreen = () => {
    switch (state.ui.currentScreen) {
      case 'setup':
        return <SetupScreen />;
      case 'game':
        return <GameScreen />;
      case 'scoring':
        return <ScoringScreen />;
      case 'results':
        return state.session.isComplete ? <FinalStandingsReveal /> : <SessionCompleteScreen />;
      default:
        return <SetupScreen />;
    }
  };
  
  return (
    <div className="app-container">
      <NavigationBar />
      <main className="main-content">
        {renderCurrentScreen()}
      </main>
    </div>
  );
};

// Main App component with state provider
const App = () => {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
};

export default App;
