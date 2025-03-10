import React, { useState } from 'react';

const CounterTool = ({ onSaveScore, onValueChange }) => {
  const [count, setCount] = useState(0);
  
  const handleIncrement = () => {
    setCount(prevCount => {
      const newCount = prevCount + 1;
      // Update parent on explicit increment
      if (onValueChange) {
        onValueChange(newCount);
      }
      return newCount;
    });
  };
  
  const handleDecrement = () => {
    setCount(prevCount => {
      const newCount = Math.max(0, prevCount - 1);
      // Update parent on explicit decrement
      if (onValueChange) {
        onValueChange(newCount);
      }
      return newCount;
    });
  };
  
  const handleReset = () => {
    setCount(0);
    if (onValueChange) {
      onValueChange(0);
    }
  };
  
  const handleSave = () => {
    if (onSaveScore) {
      onSaveScore(count);
    }
  };
  
  return (
    <div className="scoring-tool counter-tool">
      <div className="tool-header">
        <span className="tool-title">Counter</span>
      </div>
      
      <div className="score-display">
        {count}
      </div>
      
      <div className="tool-controls">
        <button className="btn btn-large" onClick={handleDecrement}>-</button>
        <button className="btn btn-large" onClick={handleIncrement}>+</button>
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default CounterTool;