import React, { useState } from 'react';

const ManualScoreInput = ({ onSaveScore, onValueChange }) => {
  const [score, setScore] = useState('');
  
  const handleScoreChange = (e) => {
    // Allow only numeric input
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setScore(value);
  };
  
  const handleKeyDown = (e) => {
    // Update on Enter key
    if (e.key === 'Enter' && score !== '' && onValueChange) {
      onValueChange(parseFloat(score));
    }
  };
  
  const handleBlur = () => {
    // Update on input field blur (focus lost)
    if (score !== '' && onValueChange) {
      onValueChange(parseFloat(score));
    }
  };
  
  const handleSave = () => {
    if (score !== '') {
      // Update parent on explicit save
      if (onValueChange) {
        onValueChange(parseFloat(score));
      }
      
      if (onSaveScore) {
        onSaveScore(parseFloat(score));
      }
    }
  };
  
  const handleReset = () => {
    setScore('');
    if (onValueChange) {
      onValueChange(0);
    }
  };
  
  return (
    <div className="scoring-tool manual-score-tool">
      <div className="tool-header">
        <span className="tool-title">Manual Score</span>
      </div>
      
      <div className="score-input">
        <input
          type="text"
          value={score}
          onChange={handleScoreChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter score"
          className="input-field"
        />
      </div>
      
      <div className="tool-controls">
        <button className="btn" onClick={handleReset}>Clear</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default ManualScoreInput;