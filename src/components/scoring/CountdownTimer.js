import React, { useState, useEffect, useRef } from 'react';
import AudioService from '../../services/AudioService';

const CountdownTimer = ({ onSaveScore, onValueChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(60000); // Default 1 minute (60000ms)
  const [initialTime, setInitialTime] = useState(60000);
  const lastRunningState = useRef(isRunning);
  const hasUpdatedRef = useRef(false);
  
  // Presets in milliseconds
  const presets = [
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '2m', value: 120000 },
    { label: '5m', value: 300000 }
  ];
  
  // Main timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      hasUpdatedRef.current = false; // Reset the update flag when starting
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 10;
          
          // Check for sound triggers
          if (newTime <= 30000 && prevTime > 30000) {
            AudioService.playCountdownSound(30);
          } else if (newTime <= 10000 && prevTime > 10000) {
            AudioService.playCountdownSound(10);
          } else if (newTime <= 5000 && prevTime > 5000) {
            AudioService.playCountdownSound(5);
          } else if (newTime <= 4000 && prevTime > 4000) {
            AudioService.playCountdownSound(4);
          } else if (newTime <= 3000 && prevTime > 3000) {
            AudioService.playCountdownSound(3);
          } else if (newTime <= 2000 && prevTime > 2000) {
            AudioService.playCountdownSound(2);
          } else if (newTime <= 1000 && prevTime > 1000) {
            AudioService.playCountdownSound(1);
          } else if (newTime <= 0) {
            AudioService.playCountdownSound(0);
            setIsRunning(false);
            
            // Update value when timer completes to zero
            if (onValueChange && !hasUpdatedRef.current) {
              onValueChange(0);
              hasUpdatedRef.current = true;
            }
          }
          
          return Math.max(0, newTime);
        });
      }, 10);
    } else {
      clearInterval(interval);
      
      // Only update once when transitioning from running to stopped (paused)
      if (lastRunningState.current && !hasUpdatedRef.current && time > 0 && time < initialTime && onValueChange) {
        onValueChange(time);
        hasUpdatedRef.current = true;
      }
    }
    
    // Store the current running state for the next render
    lastRunningState.current = isRunning;
    
    return () => clearInterval(interval);
  }, [isRunning, time, initialTime, onValueChange]);
  
  const handleStart = () => {
    if (time > 0) {
      setIsRunning(true);
    }
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setTime(initialTime);
    setIsRunning(false);
    hasUpdatedRef.current = false;
    if (onValueChange) {
      onValueChange(initialTime);
    }
  };
  
  const handlePresetSelect = (presetValue) => {
    setTime(presetValue);
    setInitialTime(presetValue);
    setIsRunning(false);
    hasUpdatedRef.current = false;
    if (onValueChange) {
      onValueChange(presetValue);
    }
  };
  
  const handleSave = () => {
    if (onSaveScore) {
      // Save the remaining time as the score
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
    <div className="scoring-tool countdown-timer">
      <div className="tool-header">
        <span className="tool-title">Countdown Timer</span>
      </div>
      
      <div className="preset-buttons">
        {presets.map(preset => (
          <button
            key={preset.label}
            className={`preset-button ${initialTime === preset.value ? 'active' : ''}`}
            onClick={() => handlePresetSelect(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="score-display">
        {formatTime()}
      </div>
      
      <div className="tool-controls">
        {!isRunning ? (
          <button className="btn" onClick={handleStart}>Start</button>
        ) : (
          <button className="btn" onClick={handlePause}>Pause</button>
        )}
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default CountdownTimer;