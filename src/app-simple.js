import React, { useState } from 'react';
import './styles/index.css';

const App = () => {
  const [screen, setScreen] = useState('setup');
  const [gameCount, setGameCount] = useState(4);
  const [currentGame, setCurrentGame] = useState('');
  const [gameType, setGameType] = useState('individual');
  const [gameCreated, setGameCreated] = useState(false);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const players = ["David", "Manu", "Antoine", "Quentin"];
  
  // Simulated game creation
  const createGame = () => {
    setGameCreated(true);
    setPlayerOrder([]);
  };
  
  // Simulated player selection
  const randomizePlayer = () => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    setSelectedPlayer(players[0]);
    
    // Simulate cycling through players
    let counter = 0;
    const interval = setInterval(() => {
      setSelectedPlayer(players[counter % players.length]);
      counter++;
    }, 150);
    
    // Stop after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      
      const remainingPlayers = players.filter(p => !playerOrder.includes(p));
      const selected = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
      
      setSelectedPlayer(selected);
      setPlayerOrder([...playerOrder, selected]);
      setIsSelecting(false);
    }, 2000);
  };
  
  // Get player color (for visual distinction)
  const getPlayerColor = (name) => {
    const colors = {
      'David': '#4285F4',
      'Manu': '#EA4335',
      'Antoine': '#FBBC05',
      'Quentin': '#34A853'
    };
    
    return colors[name] || '#888888';
  };
  
  // Render setup screen
  const renderSetupScreen = () => (
    <div className="setup-screen">
      <h1 className="app-title">Quadrathlon Gaming Night</h1>
      
      <div className="setup-section">
        <h3>Players</h3>
        <div className="player-display">
          {players.map(player => (
            <div 
              key={player}
              className="player-card"
              style={{ '--player-color': getPlayerColor(player) }}
            >
              <span className="player-indicator" style={{ backgroundColor: getPlayerColor(player) }}></span>
              <span className="player-name">{player}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="setup-section">
        <h3>Number of Games</h3>
        <div className="game-count-selector">
          <div className="selector-options">
            {[4, 8, 12, 16, 20].map(count => (
              <button
                key={count}
                className={`selector-option ${gameCount === count ? 'selected' : ''}`}
                onClick={() => setGameCount(count)}
              >
                {count} Games
              </button>
            ))}
          </div>
          <p className="selector-description">
            Choose how many games you want to play in this Quadrathlon session.
          </p>
        </div>
      </div>
      
      <button 
        className="btn btn-primary btn-large"
        onClick={() => setScreen('game')}
      >
        Start Quadrathlon
      </button>
    </div>
  );
  
  // Render game setup
  const renderGameSetup = () => (
    <div className="game-setup">
      <h2>Game Setup</h2>
      
      <div className="form-group">
        <label htmlFor="game-name">Game Name</label>
        <input
          id="game-name"
          type="text"
          value={currentGame || `Game 1`}
          onChange={(e) => setCurrentGame(e.target.value)}
          placeholder="Enter game name"
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label>Game Type</label>
        <div className="game-type-selector">
          {[
            { id: 'individual', name: 'Individual', description: 'Each player competes individually.', icon: '👤' },
            { id: 'cooperative', name: 'Cooperative', description: 'Players form two 2v2 teams.', icon: '👥' },
            { id: 'tournament', name: '1v1 Tournament', description: 'Players compete in a 1v1 bracket tournament.', icon: '🏆' },
            { id: '2v2', name: '2v2', description: 'Two teams compete against each other.', icon: '⚔️' }
          ].map(type => (
            <div
              key={type.id}
              className={`type-card ${gameType === type.id ? 'selected' : ''}`}
              onClick={() => setGameType(type.id)}
            >
              <div className="type-icon">{type.icon}</div>
              <h3 className="type-name">{type.name}</h3>
              <p className="type-description">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="btn btn-primary"
        onClick={createGame}
      >
        Start Game
      </button>
    </div>
  );
  
  // Render individual game
  const renderIndividualGame = () => (
    <div className="individual-game">
      <h1>{currentGame || "Game 1"}</h1>
      
      <div className="player-selection">
        <h2>Player Selection</h2>
        
        <div className="player-display">
          {players.map(player => (
            <div 
              key={player}
              className={`player-card ${
                selectedPlayer === player ? 'highlighted' : ''
              } ${playerOrder.includes(player) ? 'selected' : ''}`}
              style={{ 
                '--player-color': getPlayerColor(player),
                animation: selectedPlayer === player ? 'pulse 1s infinite' : 'none'
              }}
            >
              <span className="player-indicator" style={{ backgroundColor: getPlayerColor(player) }}></span>
              <span className="player-name">{player}</span>
            </div>
          ))}
        </div>
        
        <div className="selection-status">
          <span className="status-text">
            {playerOrder.length} of {players.length} players selected
          </span>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={randomizePlayer}
          disabled={isSelecting || playerOrder.length === players.length}
        >
          {isSelecting ? 'Selecting...' : 'Randomize Player'}
        </button>
      </div>
    </div>
  );
  
  // Render the current screen
  const renderScreen = () => {
    if (screen === 'setup') {
      return renderSetupScreen();
    } else if (screen === 'game') {
      return (
        <div className="game-screen">
          <div className="game-progress">
            <span className="progress-text">
              Game 1 of {gameCount}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(1 / gameCount) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {!gameCreated ? renderGameSetup() : renderIndividualGame()}
        </div>
      );
    }
  };
  
  return (
    <div className="app-container">
      <header className="navigation-bar">
        <div className="nav-logo">Quadrathlon</div>
        <div className="nav-links">
          <span style={{ cursor: 'pointer' }} onClick={() => setScreen('setup')}>Home</span>
        </div>
      </header>
      <main className="main-content">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
