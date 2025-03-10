import React, { useState } from 'react';
import { Button } from './UIComponents';

const PlayerCustomizationModal = ({ 
  player, 
  currentColor, 
  currentTitle, 
  currentIcon, 
  onSave, 
  onClose 
}) => {
  // Initialize state with current values
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedTitle, setSelectedTitle] = useState(currentTitle);
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  
  // Color options
  const colorOptions = [
    { name: 'Blue', value: '#4CC9F0' },
    { name: 'Pink', value: '#F72585' },
    { name: 'Purple', value: '#7209B7' },
    { name: 'Orange', value: '#FF9E00' },
    { name: 'Green', value: '#38B000' },
    { name: 'Red', value: '#D00000' },
    { name: 'Teal', value: '#23CE6B' },
    { name: 'Yellow', value: '#FFD60A' },
    { name: 'Cyan', value: '#72EFDD' },
    { name: 'Magenta', value: '#FF5CAD' },
    { name: 'Lime', value: '#AACC00' },
    { name: 'Indigo', value: '#4361EE' },
    { name: 'Amber', value: '#FB8500' }
  ];
  
  // Title options
  const titleOptions = [
    'The Strategist',
    'The Challenger',
    'The Tactician',
    'The Specialist',
    'The Champion',
    'The Prodigy',
    'The Maverick',
    'The Legend',
    'The Mastermind',
    'The Speedster',
    'The Underdog',
    'The Veteran',
    'The Wildcard',
    'The Sniper',
    'The Comeback Kid'
  ];
  
  // Icon options (emojis)
  const iconOptions = [
    '🧠', '🔥', '🌟', '🎯', '🏆', 
    '⚡', '🎮', '🎲', '🃏', '🦊', 
    '🦁', '🐉', '🚀', '⚔️', '🛡️', 
    '🧙', '🤖', '👻', '🦸', '🏅'
  ];
  
  // Handle save
  const handleSave = () => {
    onSave({
      player,
      color: selectedColor,
      title: selectedTitle,
      icon: selectedIcon
    });
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customize {player}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {/* Player Preview */}
          <div 
            className="player-preview" 
            style={{ '--player-color': selectedColor }}
          >
            <div className="preview-avatar">
              <span className="preview-icon">{selectedIcon}</span>
            </div>
            <div className="preview-details">
              <div className="preview-name">{player}</div>
              <div className="preview-title">{selectedTitle}</div>
            </div>
          </div>
          
          {/* Color Selection */}
          <div className="customization-section">
            <h3>Choose Color</h3>
            <div className="color-options">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                ></button>
              ))}
            </div>
          </div>
          
          {/* Title Selection */}
          <div className="customization-section">
            <h3>Choose Title</h3>
            <div className="title-options">
              {titleOptions.map(title => (
                <button
                  key={title}
                  className={`title-option ${selectedTitle === title ? 'selected' : ''}`}
                  onClick={() => setSelectedTitle(title)}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
          
          {/* Icon Selection */}
          <div className="customization-section">
            <h3>Choose Icon</h3>
            <div className="icon-options">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} primary>Save Customization</Button>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: var(--space-md);
        }
        
        .customization-modal {
          background-color: white;
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: modalEnter 0.3s ease;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: var(--space-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
          border-radius: 50%;
          height: 36px;
          width: 36px;
        }
        
        .close-button:hover {
          background-color: var(--bg-color);
          color: var(--text-primary);
        }
        
        .modal-content {
          padding: var(--space-lg);
          overflow-y: auto;
          flex: 1;
        }
        
        .modal-footer {
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          background-color: var(--bg-color);
        }
        
        .player-preview {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-bottom: var(--space-lg);
          border-left: 5px solid var(--player-color);
        }
        
        .preview-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--player-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .preview-details {
          display: flex;
          flex-direction: column;
        }
        
        .preview-name {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-primary);
        }
        
        .preview-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .customization-section {
          margin-bottom: var(--space-lg);
        }
        
        .customization-section h3 {
          margin-bottom: var(--space-sm);
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .color-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }
        
        .color-option {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        
        .color-option:hover {
          transform: scale(1.1);
        }
        
        .color-option.selected {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--border-color);
        }
        
        .title-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }
        
        .title-option {
          padding: var(--space-xs) var(--space-sm);
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
          font-size: 0.875rem;
        }
        
        .title-option:hover {
          background-color: var(--border-color);
        }
        
        .title-option.selected {
          background-color: var(--primary-light);
          border-color: var(--primary-color);
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .icon-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }
        
        .icon-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          background-color: var(--bg-color);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .icon-option:hover {
          background-color: var(--border-color);
          transform: scale(1.1);
        }
        
        .icon-option.selected {
          background-color: var(--primary-light);
          border-color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }
        
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @media (max-width: 500px) {
          .customization-modal {
            max-height: 95vh;
          }
          
          .modal-content {
            padding: var(--space-md);
          }
          
          .title-option {
            font-size: 0.75rem;
          }
          
          .color-option {
            width: 30px;
            height: 30px;
          }
          
          .icon-option {
            width: 36px;
            height: 36px;
          }
          
          .modal-footer {
            flex-direction: column;
          }
          
          .modal-footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerCustomizationModal;
