import React from 'react';

const GameTypeSelector = ({ selected, onChange }) => {
  const gameTypes = [
    {
      id: 'individual',
      name: 'Individual',
      icon: '👤'
    },
    {
      id: 'cooperative',
      name: 'Cooperative',
      icon: '👥'
    },
    {
      id: 'tournament',
      name: '1v1 Tournament',
      icon: '🏆'
    },
    {
      id: '2v2',
      name: '2v2',
      icon: '⚔️'
    }
  ];

  return (
    <div className="game-type-selector">
      {gameTypes.map(type => (
        <div
          key={type.id}
          className={`type-card ${selected === type.id ? 'selected' : ''}`}
          onClick={() => onChange(type.id)}
        >
          <div className="type-icon">{type.icon}</div>
          <div className="type-name">{type.name}</div>
        </div>
      ))}
      
      <style jsx>{`
        .game-type-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
          margin: var(--space-md) 0;
        }
        
        .type-card {
          background-color: white;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          cursor: pointer;
          transition: var(--transition-normal);
          text-align: center;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }
        
        .type-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }
        
        .type-card.selected {
          border-color: var(--primary-color);
          background-color: rgba(var(--primary-color-rgb), 0.05);
          box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
        }
        
        .type-icon {
          font-size: 1.75rem;
          margin-bottom: var(--space-xs);
        }
        
        .type-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        /* Make sure all options fit on even small screens */
        @media (max-width: 350px) {
          .game-type-selector {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-sm);
          }
          
          .type-card {
            padding: var(--space-sm);
          }
          
          .type-icon {
            font-size: 1.5rem;
          }
          
          .type-name {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GameTypeSelector;