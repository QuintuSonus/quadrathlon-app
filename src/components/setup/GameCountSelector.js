import React from 'react';

const GameCountSelector = ({ options, selected, onChange }) => {
  return (
    <div className="game-count-selector">
      <div className="selector-options">
        {options.map(count => (
          <button
            key={count}
            className={`selector-option ${selected === count ? 'selected' : ''}`}
            onClick={() => onChange(count)}
          >
            <div className="option-inner">
              <span className="option-icon">{getGameIcon(count)}</span>
              <span className="option-text">{count} Games</span>
            </div>
          </button>
        ))}
      </div>
      <div className="selection-details">
        <div className="detail-description">
          <p className="selector-description">
            Choose how many games you want to play in this Quadrathlon session.
          </p>
        </div>
        <div className="session-length">
          <div className="length-indicator">
            <span className="length-label">Session Length</span>
            <div className="length-bar">
              <div 
                className="length-fill" 
                style={{ width: `${(selected / Math.max(...options)) * 100}%` }}
              ></div>
            </div>
            <span className="length-estimate">
              {getSessionLengthEstimate(selected)}
            </span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .game-count-selector {
          margin-bottom: var(--space-xl);
          margin-top: var(--space-md);
        }
        
        .selector-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        .selector-option {
          background-color: var(--bg-color);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
          cursor: pointer;
          transition: var(--transition-normal);
          overflow: hidden;
          position: relative;
          height: 100%;
          width: 100%;
        }
        
        .selector-option:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }
        
        .selector-option.selected {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        
        .option-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xs) var(--space-md);
          text-align: center;
          transition: var(--transition-normal);
        }
        
        .selector-option.selected .option-inner {
          color: white;
        }
        
        .option-icon {
          font-size: 1.5rem;
          margin-bottom: var(--space-xs);
        }
        
        .option-text {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .selection-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
          margin-top: var(--space-md);
          align-items: center;
        }
        
        .selector-description {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          margin: 0;
        }
        
        .session-length {
          background-color: var(--bg-color);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }
        
        .length-indicator {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .length-label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .length-bar {
          height: 8px;
          background-color: var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .length-fill {
          height: 100%;
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }
        
        .length-estimate {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: right;
          margin-top: var(--space-2xs);
        }
        
        @media (max-width: 768px) {
          .selection-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
  
  // Helper function to get an icon based on the game count
  function getGameIcon(count) {
    if (count <= 4) return '🎲';
    if (count <= 8) return '🎯';
    if (count <= 12) return '🎮';
    if (count <= 16) return '🏆';
    return '🔥';
  }
  
  // Helper function to estimate session length
  function getSessionLengthEstimate(count) {
    // Rough estimate: each game takes about 10 minutes on average
    const totalMinutes = count * 10;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `Approx. ${totalMinutes} minutes`;
    } else if (minutes === 0) {
      return `Approx. ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `Approx. ${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    }
  }
};

export default GameCountSelector;