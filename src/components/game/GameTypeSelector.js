import React from 'react';

const GameTypeSelector = ({ selected, onChange }) => {
  const gameTypes = [
    {
      id: 'individual',
      name: 'Individual',
      description: 'Each player competes individually.',
      icon: '👤'
    },
    {
      id: 'cooperative',
      name: 'Cooperative',
      description: 'Players form two 2v2 teams.',
      icon: '👥'
    },
    {
      id: 'tournament',
      name: '1v1 Tournament',
      description: 'Players compete in a 1v1 bracket tournament.',
      icon: '🏆'
    },
    {
      id: '2v2',
      name: '2v2',
      description: 'Two teams compete against each other.',
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
          <h3 className="type-name">{type.name}</h3>
          <p className="type-description">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

export default GameTypeSelector;
