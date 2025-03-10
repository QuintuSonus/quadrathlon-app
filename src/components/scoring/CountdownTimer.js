import React, { useState, useEffect, useRef } from 'react';
import AudioService from '../../services/AudioService';

const CountdownTimer = ({ onSaveScore, onValueChange, sessionDuration, onDurationChange }) => {
  const componentIdRef = useRef(`countdown-${Date.now().toString().slice(-6)}`);
  const firstRenderRef = useRef(true);
  const [time, setTime] = useState(sessionDuration || 60000);
  const [initialTime, setInitialTime] = useState(sessionDuration || 60000); // Original value for resets
  const [isRunning, setIsRunning] = useState(false);
  const lastRunningState = useRef(isRunning);
  const hasUpdatedRef = useRef(false);
  const lastSessionDurationRef = useRef(sessionDuration);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update time when sessionDuration changes - but only if it ACTUALLY changes
  useEffect(() => {
    // Check if sessionDuration actually changed from last render
    const durationChanged = sessionDuration !== lastSessionDurationRef.current;
    
    // Store the current value for the next comparison
    lastSessionDurationRef.current = sessionDuration;
    
    // If it's the first render or if the duration actually changed and we're not running
    if (firstRenderRef.current) {
      // Always set on first render
      firstRenderRef.current = false;
      if (sessionDuration) {
        setTime(sessionDuration);
        setInitialTime(sessionDuration);
      }
    } else if (durationChanged && !isRunning && sessionDuration !== undefined) {
      // Only update if the sessionDuration actually changed AND we're not running
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
    <div className={`scoring-tool countdown-timer ${isMobile ? 'mobile-countdown' : ''}`}>
      <div className="tool-header">
        <span className="tool-title">Countdown Timer</span>
      </div>
      
      <div className={`preset-buttons ${isMobile ? 'mobile-presets' : ''}`}>
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
      
      <div className={`timer-display ${isRunning ? 'running' : ''}`}>
        <div className="score-display">
          {formatTime()}
        </div>
      </div>
      
      <div className={`fine-adjustment ${isMobile ? 'mobile-adjustment' : ''}`}>
        <button 
          className="btn adjust-btn" 
          onClick={handleDecreaseTime}
          disabled={isRunning}
        >
          -30s
        </button>
        <button 
          className="btn adjust-btn" 
          onClick={handleIncreaseTime}
          disabled={isRunning}
        >
          +30s
        </button>
      </div>
      
      <div className={`tool-controls ${isMobile ? 'mobile-controls' : ''}`}>
        {!isRunning ? (
          <button className={`btn ${isMobile ? 'btn-large' : ''}`} onClick={handleStart}>Start</button>
        ) : (
          <button className={`btn ${isMobile ? 'btn-large' : ''}`} onClick={handlePause}>Pause</button>
        )}
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
      
      <style jsx>{`
        .mobile-countdown {
          padding: 15px;
        }
        
        .mobile-presets {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        
        .mobile-presets .preset-button {
          padding: 10px 8px;
          min-height: 44px; /* Better touch target */
          font-size: 1rem;
        }
        
        .timer-display {
          border: 2px solid #eee;
          border-radius: 8px;
          margin: 15px 0;
          padding: 10px 0;
          background-color: #f9f9f9;
          transition: all 0.3s ease;
        }
        
        .timer-display.running {
          border-color: var(--primary-color);
          background-color: rgba(46, 125, 247, 0.05);
        }
        
        .mobile-adjustment {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 15px 0;
        }
        
        .mobile-adjustment .adjust-btn {
          min-height: 44px;
          font-size: 1rem;
        }
        
        .mobile-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
        }
        
        .mobile-controls .btn {
          min-height: 44px;
          font-size: 1rem;
        }
        
        .btn-large {
          grid-column: span 2;
        }
      `}</style>
    </div>
  );
};

export default CountdownTimer;