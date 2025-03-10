import React, { useState, useEffect, useRef } from 'react';

const StopwatchTool = ({ onSaveScore, onValueChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const lastRunningState = useRef(isRunning);
  const hasUpdatedRef = useRef(false);
  
  // Handle the timer running
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      hasUpdatedRef.current = false; // Reset the update flag when starting
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
      
      // Only update once when transitioning from running to stopped
      if (lastRunningState.current && !hasUpdatedRef.current && time > 0 && onValueChange) {
        onValueChange(time);
        hasUpdatedRef.current = true;
      }
    }
    
    // Store the current running state for the next render
    lastRunningState.current = isRunning;
    
    return () => clearInterval(interval);
  }, [isRunning, time, onValueChange]);
  
  const handleStart = () => {
    setIsRunning(true);
  };
  
  const handleStop = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    hasUpdatedRef.current = false;
    if (onValueChange) {
      onValueChange(0);
    }
  };
  
  const handleSave = () => {
    if (onSaveScore) {
      onSaveScore(time);
    }
    
    // Also update the value on manual save
    if (onValueChange) {
      onValueChange(time);
      hasUpdatedRef.current = true;
    }
  };
  
  // Format time as minutes:seconds.milliseconds
  const formatTime = () => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="scoring-tool stopwatch-tool">
      <div className="tool-header">
        <span className="tool-title">Stopwatch</span>
      </div>
      
      <div className="score-display">
        {formatTime()}
      </div>
      
      <div className="tool-controls">
        {!isRunning ? (
          <button className="btn" onClick={handleStart}>Start</button>
        ) : (
          <button className="btn" onClick={handleStop}>Stop</button>
        )}
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default StopwatchTool;