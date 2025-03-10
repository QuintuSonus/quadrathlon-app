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
            {count} Games
          </button>
        ))}
      </div>
      <p className="selector-description">
        Choose how many games you want to play in this Quadrathlon session.
      </p>
    </div>
  );
};

export default GameCountSelector;
