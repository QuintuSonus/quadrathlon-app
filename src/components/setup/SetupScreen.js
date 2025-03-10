import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import GameCountSelector from './GameCountSelector';
import PlayerDisplay from './PlayerDisplay';
import StorageService from '../../services/StorageService';
import { Button, Card, SectionHeading, Alert } from '../core/UIComponents';

const SetupScreen = () => {
  const { state, dispatch } = useAppState();
  const [selectedGameCount, setSelectedGameCount] = useState(4);
  const [hasExistingSession, setHasExistingSession] = useState(StorageService.isSessionAvailable());
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animation
    setShowAnimation(true);
  }, []);
  
  // Handle game count selection
  const handleGameCountChange = (count) => {
    setSelectedGameCount(count);
  };
  
  // Start a new session
  const handleStartNew = () => {
    dispatch({
      type: ACTION_TYPES.CREATE_SESSION,
      payload: {
        plannedGames: selectedGameCount
      }
    });
  };
  
  // Continue existing session
  const handleContinue = () => {
    dispatch({
      type: ACTION_TYPES.CHANGE_SCREEN,
      payload: {
        screen: 'game'
      }
    });
  };
  
  // Clear existing session
  const handleClearSession = () => {
    StorageService.clearSession();
    setHasExistingSession(false);
    window.location.reload(); // Reload to reset the state to initial values
  };
  
  return (
    <div className={`setup-screen ${showAnimation ? 'animate-in' : ''}`}>
      <h1 className="app-title">Quadrathlon Gaming Night</h1>
      
      {hasExistingSession ? (
        <Card 
          className="session-card existing-session" 
          title="Existing Session Found"
          subtitle="You have an ongoing gaming session. Would you like to continue or start a new one?"
          footer={
            <div className="button-group">
              <Button onClick={handleContinue} primary>
                <span className="btn-icon">▶️</span>
                Continue Session
              </Button>
              <Button onClick={handleClearSession} danger>
                <span className="btn-icon">🗑️</span>
                Clear & Start New
              </Button>
            </div>
          }
        >
          <div className="session-info">
            <div className="info-row">
              <span className="info-label">Games Played</span>
              <span className="info-value">{state.games.length}/{state.session.plannedGames}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Leader</span>
              <span className="info-value">{getCurrentLeader()}</span>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="intro-content">
            <p className="intro-text">
              Welcome to Quadrathlon! Compete across multiple games to determine the ultimate champion.
              Configure your gaming session below to get started.
            </p>
          </div>
          
          <Card className="setup-section">
            <SectionHeading>Players</SectionHeading>
            <PlayerDisplay players={state.session.players} />
          </Card>
          
          <Card className="setup-section">
            <SectionHeading>Number of Games</SectionHeading>
            <GameCountSelector 
              options={[4, 8, 12, 16, 20]} 
              selected={selectedGameCount}
              onChange={handleGameCountChange}
            />
          </Card>
          
          <div className="start-action">
            <Button onClick={handleStartNew} primary large>
              <span className="btn-icon">🎮</span>
              Start Quadrathlon
            </Button>
          </div>
        </>
      )}
      
      <style jsx>{`
        .setup-screen {
          max-width: 800px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .setup-screen.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .intro-content {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        
        .intro-text {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 680px;
          margin: 0 auto;
        }
        
        .session-card {
          animation: pulse 2s infinite;
        }
        
        .session-info {
          background-color: var(--bg-color);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          margin: var(--space-md) 0;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .info-value {
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .start-action {
          margin-top: var(--space-xl);
          text-align: center;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
          }
        }
      `}</style>
    </div>
  );
  
  // Helper function to determine current leader
  function getCurrentLeader() {
    if (!state.playerScores || Object.keys(state.playerScores).length === 0) {
      return "No games played yet";
    }
    
    // Find the player with the highest score
    const sortedPlayers = Object.entries(state.playerScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    
    if (sortedPlayers.length === 0) return "No games played yet";
    
    const [leader, leaderScore] = sortedPlayers[0];
    
    return `${leader} (${leaderScore.toLocaleString()} pts)`;
  }
};

export default SetupScreen;