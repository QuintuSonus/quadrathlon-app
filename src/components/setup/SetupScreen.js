import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import GameCountSelector from './GameCountSelector';
import PlayerDisplay from './PlayerDisplay';
import Button from '../core/Button';
import StorageService from '../../services/StorageService';

const SetupScreen = () => {
  const { state, dispatch } = useAppState();
  const [selectedGameCount, setSelectedGameCount] = useState(4);
  const [hasExistingSession, setHasExistingSession] = useState(StorageService.isSessionAvailable());
  
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
    <div className="setup-screen">
      <h1 className="app-title">Quadrathlon Gaming Night</h1>
      
      {hasExistingSession ? (
        <div className="existing-session">
          <h2>You have an existing gaming session</h2>
          <div className="button-group">
            <Button onClick={handleContinue} primary>
              Continue Session
            </Button>
            <Button onClick={handleClearSession}>
              Clear & Start New
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2>New Gaming Session</h2>
          
          <div className="setup-section">
            <h3>Players</h3>
            <PlayerDisplay players={state.session.players} />
          </div>
          
          <div className="setup-section">
            <h3>Number of Games</h3>
            <GameCountSelector 
              options={[4, 8, 12, 16, 20]} 
              selected={selectedGameCount}
              onChange={handleGameCountChange}
            />
          </div>
          
          <Button onClick={handleStartNew} primary large>
            Start Quadrathlon
          </Button>
        </>
      )}
    </div>
  );
};

export default SetupScreen;
