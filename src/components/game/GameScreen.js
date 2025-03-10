import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ACTION_TYPES } from '../../context/StateReducer';
import GameTypeSelector from './GameTypeSelector';
import IndividualGame from './IndividualGame';
import CooperativeGame from './CooperativeGame';
import TournamentGame from './TournamentGame';
import TeamGame from './TeamGame';
import GameHistoryList from './GameHistoryList';
import Button from '../core/Button';

const GameScreen = () => {
  const { state, dispatch } = useAppState();
  const [gameName, setGameName] = useState('');
  const [gameType, setGameType] = useState('individual');
  const [gameCreated, setGameCreated] = useState(false);
  
  // Get the current game index
  const currentGameIndex = state.session.currentGameIndex;
  
  // Check if it's time to create a new game
  useEffect(() => {
    if (
      state.games.length <= currentGameIndex && 
      currentGameIndex < state.session.plannedGames
    ) {
      setGameCreated(false);
      setGameName(`Game ${currentGameIndex + 1}`);
      setGameType('individual');
    } else if (state.games.length > currentGameIndex) {
      // If revisiting an existing game
      const currentGame = state.games[currentGameIndex];
      setGameName(currentGame.name);
      setGameType(currentGame.type);
      setGameCreated(true);
    }
  }, [state.games, currentGameIndex, state.session.plannedGames]);
  
  // Handle game name input change
  const handleNameChange = (e) => {
    setGameName(e.target.value);
  };
  
  // Handle game type selection
  const handleTypeChange = (type) => {
    setGameType(type);
  };
  
  // Create a new game
  const handleCreateGame = () => {
    const gameId = Date.now().toString();
    
    dispatch({
      type: ACTION_TYPES.CREATE_GAME,
      payload: {
        id: gameId,
        name: gameName,
        type: gameType
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
    <div className="game-setup">
      <h2>Game Setup</h2>
      
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
        <label>Game Type</label>
        <GameTypeSelector
          selected={gameType}
          onChange={handleTypeChange}
        />
      </div>
      
      <div className="game-setup-actions">
        <Button onClick={handleCreateGame} primary>
          Start Game
        </Button>
      </div>
    </div>
  );
  
  // Render game progress indicator
  const renderProgressIndicator = () => {
    const totalGames = state.session.plannedGames;
    const currentGame = currentGameIndex + 1;
    
    return (
      <div className="game-progress">
        <span className="progress-text">
          Game {currentGame} of {totalGames}
        </span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentGame / totalGames) * 100}%` }}
          ></div>
        </div>
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
        <div className="game-history-section">
          <h3>Game History</h3>
          <GameHistoryList
            games={state.games}
            currentGameIndex={currentGameIndex}
          />
        </div>
      )}
    </div>
  );
};

export default GameScreen;