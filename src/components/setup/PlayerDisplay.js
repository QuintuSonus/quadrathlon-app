import React, { useState, useContext } from 'react';
import PlayerCustomizationModal from '../core/PlayerCustomizationModal';

// Create a context for player customizations
export const PlayerCustomizationContext = React.createContext({
  customizations: {},
  updateCustomization: () => {}
});

// Hook to use player customizations
export const usePlayerCustomization = () => useContext(PlayerCustomizationContext);

// Provider component for player customizations
export const PlayerCustomizationProvider = ({ children }) => {
  // Try to load saved customizations from localStorage
  const loadSavedCustomizations = () => {
    try {
      const saved = localStorage.getItem('playerCustomizations');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load saved customizations', e);
      return {};
    }
  };

  const [customizations, setCustomizations] = useState(loadSavedCustomizations());

  // Update customization for a player
  const updateCustomization = (playerData) => {
    const { player, color, title, icon } = playerData;
    
    const newCustomizations = {
      ...customizations,
      [player]: { color, title, icon }
    };
    
    setCustomizations(newCustomizations);
    
    // Save to localStorage
    try {
      localStorage.setItem('playerCustomizations', JSON.stringify(newCustomizations));
    } catch (e) {
      console.error('Failed to save customizations', e);
    }
  };

  return (
    <PlayerCustomizationContext.Provider value={{ customizations, updateCustomization }}>
      {children}
    </PlayerCustomizationContext.Provider>
  );
};

const PlayerDisplay = ({ players, highlightedPlayer = null, selectedPlayers = [] }) => {
  const [modalPlayer, setModalPlayer] = useState(null);
  const { customizations, updateCustomization } = usePlayerCustomization();
  
  // Default player details if no customization exists
  const defaultPlayerDetails = {
    'David': {
      color: 'var(--player1-color)',
      title: 'The Strategist',
      icon: '🧠'
    },
    'Manu': {
      color: 'var(--player2-color)',
      title: 'The Challenger',
      icon: '🔥'
    },
    'Antoine': {
      color: 'var(--player3-color)',
      title: 'The Tactician',
      icon: '🌟'
    },
    'Quentin': {
      color: 'var(--player4-color)',
      title: 'The Specialist',
      icon: '🎯'
    }
  };

  // Get player details (from customizations or defaults)
  const getPlayerDetails = (player) => {
    const customized = customizations[player];
    const defaultDetails = defaultPlayerDetails[player] || {
      color: 'var(--primary-color)',
      title: 'Player',
      icon: '👤'
    };
    
    return customized || defaultDetails;
  };
  
  // Handle opening the customization modal
  const openCustomization = (player) => {
    setModalPlayer(player);
  };
  
  // Handle closing the modal
  const closeModal = () => {
    setModalPlayer(null);
  };
  
  // Handle saving customization
  const saveCustomization = (data) => {
    updateCustomization(data);
  };

  return (
    <div className="player-display">
      {players.map(player => {
        const details = getPlayerDetails(player);
        
        return (
          <div 
            key={player}
            className={`player-card ${
              highlightedPlayer === player ? 'highlighted' : ''
            } ${selectedPlayers.includes(player) ? 'selected' : ''}`}
            style={{ 
              '--player-color': details.color,
              animation: highlightedPlayer === player ? 'pulse 1.5s infinite' : 'none'
            }}
            onClick={() => openCustomization(player)}
          >
            <div className="player-content">
              <div className="player-avatar">
                <span className="player-emoji">{details.icon}</span>
              </div>
              <div className="player-info">
                <span className="player-name">{player}</span>
                <span className="player-title">{details.title}</span>
              </div>
            </div>
            
            {(highlightedPlayer === player || selectedPlayers.includes(player)) && (
              <div className="player-status">
                {highlightedPlayer === player && <span className="status-highlighted">Current</span>}
                {selectedPlayers.includes(player) && <span className="status-selected">Selected</span>}
              </div>
            )}
            
            <div className="customize-hint">Click to customize</div>
          </div>
        );
      })}
      
      {/* Customization Modal */}
      {modalPlayer && (
        <PlayerCustomizationModal 
          player={modalPlayer}
          currentColor={getPlayerDetails(modalPlayer).color}
          currentTitle={getPlayerDetails(modalPlayer).title}
          currentIcon={getPlayerDetails(modalPlayer).icon}
          onSave={saveCustomization}
          onClose={closeModal}
        />
      )}
      
      <style jsx>{`
        .player-display {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-md);
          margin: var(--space-lg) 0;
        }
        
        .player-card {
          position: relative;
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          background-color: white;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          transition: var(--transition-normal);
          border: 2px solid transparent;
          overflow: hidden;
          cursor: pointer;
        }
        
        .player-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: var(--player-color, var(--primary-color));
          transition: var(--transition-normal);
        }
        
        .player-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .player-card.highlighted {
          box-shadow: 0 0 0 2px var(--player-color, var(--primary-color)), var(--shadow-lg);
          border-color: var(--player-color, var(--primary-color));
          animation: pulse 1.5s infinite;
        }
        
        .player-card.selected {
          border-color: var(--player-color, var(--primary-color));
          background-color: rgba(var(--player-color-rgb, 67, 97, 238), 0.05);
        }
        
        .player-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        
        .player-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--player-color, var(--primary-color));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        
        .player-emoji {
          font-size: 1.5rem;
        }
        
        .player-info {
          display: flex;
          flex-direction: column;
        }
        
        .player-name {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-primary);
        }
        
        .player-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .player-status {
          display: flex;
          margin-top: var(--space-sm);
          gap: var(--space-xs);
        }
        
        .status-highlighted,
        .status-selected {
          font-size: 0.75rem;
          padding: var(--space-2xs) var(--space-xs);
          border-radius: var(--radius-full);
          font-weight: 600;
        }
        
        .status-highlighted {
          background-color: var(--player-color, var(--primary-color));
          color: white;
        }
        
        .status-selected {
          background-color: rgba(var(--player-color-rgb, 67, 97, 238), 0.2);
          color: var(--player-color, var(--primary-color));
          border: 1px solid var(--player-color, var(--primary-color));
        }
        
        .customize-hint {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 0.75rem;
          padding: var(--space-xs);
          text-align: center;
          transform: translateY(100%);
          transition: var(--transition-normal);
        }
        
        .player-card:hover .customize-hint {
          transform: translateY(0);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--player-color-rgb, 67, 97, 238), 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(var(--player-color-rgb, 67, 97, 238), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--player-color-rgb, 67, 97, 238), 0);
          }
        }
        
        @media (max-width: 768px) {
          .player-display {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
          
          .player-card {
            padding: var(--space-md);
          }
          
          .player-avatar {
            width: 36px;
            height: 36px;
          }
          
          .player-emoji {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerDisplay;