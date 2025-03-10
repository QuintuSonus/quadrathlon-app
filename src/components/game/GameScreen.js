import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import GameTypeSelector from './GameTypeSelector';
import IndividualGame from './IndividualGame';
import CooperativeGame from './CooperativeGame';
import TournamentGame from './TournamentGame';
import TeamGame from './TeamGame';
import GameHistoryList from './GameHistoryList';
import { Button, Card, SectionHeading, ProgressBar } from '../core/UIComponents';

const GameScreen = () => {
  const { state, dispatch } = useAppState();
  const [gameName, setGameName] = useState('');
  const [gameCreated, setGameCreated] = useState(false);
  
  // Get the current game index
  const currentGameIndex = state.session.currentGameIndex;
  
  // Check if it's time to create a new game
  useEffect(() => {
    if (
      state.games.length <= currentGameIndex && 
      currentGameIndex < state.session.plannedGames
    ) {
      // New game needs to be created - reset state
      setGameCreated(false);
      setGameName(`Game ${currentGameIndex + 1}`);
    } else if (state.games.length > currentGameIndex) {
      // If revisiting an existing game
      const currentGame = state.games[currentGameIndex];
      setGameName(currentGame.name);
      setGameCreated(true);
    }
  }, [state.games, currentGameIndex, state.session.plannedGames]);
  
  // Handle game name input change
  const handleNameChange = (e) => {
    setGameName(e.target.value);
  };
  
  // Create a new game when type is selected
  const handleTypeSelect = (type) => {
    const gameId = Date.now().toString();
    
    dispatch({
      type: ACTION_TYPES.CREATE_GAME,
      payload: {
        id: gameId,
        name: gameName,
        type: type
      }
    });
    
    setGameCreated(true);
  };
  
  // Go back to game setup (cancel current game creation)
  const handleBackToSetup = () => {
    // If we have a game at this index, we should update it rather than creating a new one
    setGameCreated(false);
    
    // Get the current game ID if it exists
    const currentGame = state.games[currentGameIndex];
    if (currentGame) {
      // Remove this game from state so we can recreate it with the correct type
      dispatch({
        type: ACTION_TYPES.DELETE_GAME,
        payload: {
          id: currentGame.id
        }
      });
    }
  };
  
  // Render game component based on type
  const renderGameComponent = () => {
    const currentGame = state.games[currentGameIndex];
    
    if (!currentGame) return null;
    
    switch (currentGame.type) {
      case 'individual':
        return <IndividualGame game={currentGame} />;
      case 'cooperative':
        return <CooperativeGame game={currentGame} />;
      case 'tournament':
        return <TournamentGame game={currentGame} />;
      case '2v2':
        return <TeamGame game={currentGame} />;
      default:
        return <IndividualGame game={currentGame} />;
    }
  };
  
  // Render game setup form
  const renderGameSetup = () => (
    <Card className="game-setup-card">
      <SectionHeading>Game Setup</SectionHeading>
      
      <div className="form-group">
        <label htmlFor="game-name">Game Name</label>
        <input
          id="game-name"
          type="text"
          value={gameName}
          onChange={handleNameChange}
          placeholder="Enter game name"
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label>Game Type - Click to select and start</label>
        <GameTypeSelector
          selected=""
          onChange={handleTypeSelect}
        />
      </div>
    </Card>
  );
  
  // Render game progress indicator
  const renderProgressIndicator = () => {
    const totalGames = state.session.plannedGames;
    const currentGame = currentGameIndex + 1;
    
    return (
      <div className="game-progress">
        <ProgressBar 
          value={currentGame}
          max={totalGames}
          showLabel={true}
          label={`Game ${currentGame} of ${totalGames}`}
        />
      </div>
    );
  };
  
  return (
    <div className="game-screen">
      {renderProgressIndicator()}
      
      {!gameCreated ? (
        renderGameSetup()
      ) : (
        <>
          <div className="game-header">
            <Button 
              onClick={handleBackToSetup} 
              className="back-button"
              style={{ marginBottom: '15px' }}
            >
              &larr; Back to Game Setup
            </Button>
            {renderGameComponent()}
          </div>
        </>
      )}
      
      {state.games.length > 0 && (
        <Card className="game-history-section">
          <SectionHeading>Game History</SectionHeading>
          <GameHistoryList
            games={state.games}
            currentGameIndex={currentGameIndex}
          />
        </Card>
      )}
      
      <style jsx>{`
        .game-screen {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .game-progress {
          margin-bottom: var(--space-lg);
        }
        
        .game-setup-card {
          margin-bottom: var(--space-xl);
        }
        
        .form-group {
          margin-bottom: var(--space-lg);
        }
        
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          color: var(--text-primary);
          font-weight: 500;
        }
        
        .input-field {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: var(--transition-fast);
        }
        
        .input-field:focus {
          border-color: var(--primary-color);
          outline: none;
          box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
        }
        
        .game-header {
          margin-bottom: var(--space-lg);
        }
        
        .game-history-section {
          margin-top: var(--space-xl);
        }
        
        @media (max-width: 768px) {
          .game-screen {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GameScreen;