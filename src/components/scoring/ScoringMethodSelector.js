import React from 'react';

const ScoringMethodSelector = ({ selected = [], onChange }) => {
  const scoringMethods = [
    { id: 'stopwatch', name: 'Stopwatch', icon: '⏱️' },
    { id: 'countdown', name: 'Countdown Timer', icon: '⏲️' },
    { id: 'counter', name: 'Counter', icon: '🔢' },
    { id: 'manual', name: 'Manual Input', icon: '✏️' }
  ];
  
  const handleToggle = (methodId) => {
    if (selected.includes(methodId)) {
      // Remove from selection
      onChange(selected.filter(id => id !== methodId));
    } else {
      // Add to selection
      onChange([...selected, methodId]);
    }
  };
  
  return (
    <div className="scoring-method-selector">
      <div className="method-options">
        {scoringMethods.map(method => (
          <div
            key={method.id}
            className={`method-option ${selected.includes(method.id) ? 'selected' : ''}`}
            onClick={() => handleToggle(method.id)}
          >
            <span className="method-icon">{method.icon}</span>
            <span className="method-name">{method.name}</span>
          </div>
        ))}
      </div>
      <p className="selector-description">
        Select one or more scoring methods to use for this game.
      </p>
    </div>
  );
};

export default ScoringMethodSelector;
