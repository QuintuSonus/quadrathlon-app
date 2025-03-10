import React from 'react';

const PlayerDisplay = ({ players, highlightedPlayer = null, selectedPlayers = [] }) => {
  // Generate a color based on player name (for visual distinction)
  const getPlayerColor = (name) => {
    const colors = {
      'David': '#4285F4',    // Blue
      'Manu': '#EA4335',     // Red
      'Antoine': '#FBBC05',  // Yellow
      'Quentin': '#34A853'   // Green
    };
    
    return colors[name] || '#888888';
  };

  return (
    <div className="player-display">
      {players.map(player => (
        <div 
          key={player}
          className={`player-card ${
            highlightedPlayer === player ? 'highlighted' : ''
          } ${selectedPlayers.includes(player) ? 'selected' : ''}`}
          style={{ 
            '--player-color': getPlayerColor(player),
            animation: highlightedPlayer === player ? 'pulse 1s infinite' : 'none'
          }}
        >
          <span className="player-indicator" style={{ backgroundColor: getPlayerColor(player) }}></span>
          <span className="player-name">{player}</span>
        </div>
      ))}
    </div>
  );
};

export default PlayerDisplay;
