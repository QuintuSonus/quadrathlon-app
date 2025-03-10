import React, { useState, useEffect, useRef } from 'react';
import AudioService from '../../services/AudioService';

const CountdownTimer = ({ onSaveScore, onValueChange, sessionDuration, onDurationChange }) => {
  const firstRenderRef = useRef(true);
  const [time, setTime] = useState(sessionDuration || 60000);
  const [initialTime, setInitialTime] = useState(sessionDuration || 60000); // Original value for resets
  const [isRunning, setIsRunning] = useState(false);
  const lastRunningState = useRef(isRunning);
  const hasUpdatedRef = useRef(false);
  
  // Update time when sessionDuration changes - but only on certain conditions
  useEffect(() => {
    if (firstRenderRef.current) {
      // Always set on first render
      firstRenderRef.current = false;
      if (sessionDuration) {
        setTime(sessionDuration);
        setInitialTime(sessionDuration);
      }
    } else if (!isRunning && sessionDuration !== undefined) {
      // If not running and sessionDuration changes, update both time and initialTime
      setTime(sessionDuration);
      setInitialTime(sessionDuration);
    }
  }, [sessionDuration, isRunning]);
  
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
    // Reset to the original initialTime value, not the current time
    setTime(initialTime);
    setIsRunning(false);
    hasUpdatedRef.current = false;
    
    if (onValueChange) {
      onValueChange(initialTime);
    }
  };
  
  const handlePresetSelect = (presetValue) => {
    setTime(presetValue);
    setInitialTime(presetValue); // Update initialTime for resets
    setIsRunning(false);
    hasUpdatedRef.current = false;
    
    // Inform parent component about the new duration
    if (onDurationChange) {
      onDurationChange(presetValue);
    }
    
    if (onValueChange) {
      onValueChange(presetValue);
    }
  };
  
  // Functions for time adjustment
  const handleIncreaseTime = () => {
    const newTime = time + 30000; // Add 30 seconds
    setTime(newTime);
    setInitialTime(newTime); // Update initialTime for resets
    
    // Inform parent component about the new duration
    if (onDurationChange) {
      onDurationChange(newTime);
    }
    
    if (onValueChange && !isRunning) {
      onValueChange(newTime);
    }
  };
  
  const handleDecreaseTime = () => {
    // Ensure we don't go below 5 seconds
    const newTime = Math.max(5000, time - 30000); // Subtract 30 seconds
    setTime(newTime);
    setInitialTime(newTime); // Update initialTime for resets
    
    // Inform parent component about the new duration
    if (onDurationChange) {
      onDurationChange(newTime);
    }
    
    if (onValueChange && !isRunning) {
      onValueChange(newTime);
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
      
      <div className="fine-adjustment">
        <button 
          className="btn adjust-btn" 
          onClick={handleDecreaseTime}
          disabled={isRunning}
        >
          -30s
        </button>
        <div className="score-display">
          {formatTime()}
        </div>
        <button 
          className="btn adjust-btn" 
          onClick={handleIncreaseTime}
          disabled={isRunning}
        >
          +30s
        </button>
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
      
      <style jsx>{`
        .fine-adjustment {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin: 15px 0;
        }
        
        .adjust-btn {
          font-size: 0.9rem;
          padding: 5px 10px;
          background-color: #f0f0f0;
        }
        
        .adjust-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CountdownTimer;